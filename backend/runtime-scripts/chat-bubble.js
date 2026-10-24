/*
 * Chat bubble: a floating launcher that opens a branded support window.
 *
 *  - Chat tab: a welcome message with quick replies / quick links, then a live conversation
 *    with your team. The first message opens a ticket (needs the viewer's GHL session, which
 *    the server verifies); the ticket's secret key is kept in this browser so the chat survives
 *    page loads. Replies arrive by polling (fast while the window is open, slow otherwise),
 *    with a typing indicator, an unread badge on the launcher, and an "End chat" action.
 *  - Extra tabs show any page (help center, bookings, ...) inside the window.
 *  - Without live chat (or outside a sub-account) the window is a link launcher: welcome
 *    message, quick links and the extra tabs.
 *  - The launcher can be dragged; it snaps to the left or right edge and remembers its place.
 *
 * Config: see runtime resolve (title, subtitle, logoUrl, status*, agentName, welcomeMessage,
 * successMessage, errorMessage, inputPlaceholder, chatEnabled, quickReplies, quickActions,
 * navTabs, hide*, colors, bubble*, side, offsets, draggable, window sizes).
 */
(function (C) {
  if (!C) return;

  var POLL_OPEN_MS = 3000;
  var POLL_CLOSED_MS = 15000;
  var POLL_ENDED_MS = 60000;
  var POLL_MAX_BACKOFF_MS = 60000;
  var DRAG_THRESHOLD = 6;
  var DEFAULT_ERROR = 'Sorry, something went wrong. Please try again.';

  var CSS = [
    '@keyframes mgc-typing{0%,60%,100%{transform:translateY(0);opacity:.35}30%{transform:translateY(-4px);opacity:1}}',
    '.mgc-typing span{display:inline-block;width:6px;height:6px;margin:0 2px;border-radius:50%;background:#9ca3af;animation:mgc-typing 1.2s infinite}',
    '.mgc-typing span:nth-child(2){animation-delay:.15s}.mgc-typing span:nth-child(3){animation-delay:.3s}',
  ].join('\n');

  function loadJson(key) {
    try {
      return JSON.parse(window.localStorage.getItem(key) || 'null');
    } catch (e) {
      return null;
    }
  }
  function saveJson(key, value) {
    try {
      if (value === null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* storage blocked: the chat just won't survive a reload */
    }
  }

  C.register('chat-bubble', {
    apply: function (cfg) {
      var locationId = C.locationId || '';
      var chatOn = cfg.chatEnabled !== false && !!locationId;
      var storeKey = 'mgc:' + C.companyId + ':chat:' + locationId;
      var posKey = 'mgc:' + C.companyId + ':chatpos';
      var size = Math.min(96, Math.max(40, cfg.bubbleSize || 60));
      var headerBg = cfg.headerBgColor || 'linear-gradient(135deg,' + cfg.gradientFrom + ',' + cfg.gradientTo + ')';
      var gradient = 'linear-gradient(135deg,' + cfg.gradientFrom + ',' + cfg.gradientTo + ')';

      var ui = { panel: null, launcher: null, badge: null, messagesEl: null, inputEl: null, footerEl: null, bodyEl: null, tabsEl: null, statusEl: null };
      var state = {
        open: false,
        tab: 0,
        stopped: false,
        sending: false,
        confirmEnd: false,
        unread: 0,
        messages: [],
        ticketId: null,
        key: null,
        status: 'none', // none | open | closed
        closedBy: null,
        agentTyping: false,
        since: 0,
        failures: 0,
        pollTimer: null,
        localSeq: 0,
        draft: '',
      };
      var tabs = [];
      if (chatOn) tabs.push({ kind: 'chat', label: 'Chat', icon: 'chat' });
      else tabs.push({ kind: 'home', label: 'Home', icon: 'home' });
      (cfg.navTabs || []).forEach(function (t) {
        tabs.push({ kind: 'page', label: t.label, url: t.url, icon: t.icon });
      });

      var pos = loadJson(posKey);
      if (!pos || (pos.side !== 'left' && pos.side !== 'right') || typeof pos.bottom !== 'number') {
        pos = { side: cfg.side === 'left' ? 'left' : 'right', bottom: cfg.bottomOffset };
      }

      /* ------------------------------------------------------------ API */

      function endpoint(path) {
        return (
          C.apiBase +
          '/api/v1/runtime/chat' +
          path +
          (path.indexOf('?') >= 0 ? '&' : '?') +
          'company_id=' +
          encodeURIComponent(C.companyId) +
          '&locationId=' +
          encodeURIComponent(locationId) +
          (C.planId ? '&planId=' + encodeURIComponent(C.planId) : '')
        );
      }

      function api(method, path, body, headers) {
        var h = Object.assign({}, headers || {});
        if (body) h['content-type'] = 'application/json';
        return fetch(endpoint(path), {
          method: method,
          headers: h,
          credentials: 'omit',
          body: body ? JSON.stringify(body) : undefined,
        }).then(function (res) {
          if (res.status === 204) return null;
          return res.json().then(
            function (data) {
              if (!res.ok) {
                var err = new Error((data && data.error) || 'Request failed');
                err.status = res.status;
                throw err;
              }
              return data;
            },
            function () {
              if (!res.ok) {
                var e = new Error('Request failed');
                e.status = res.status;
                throw e;
              }
              return null;
            },
          );
        });
      }

      function chatHeaders() {
        return { 'x-chat-key': state.key || '' };
      }

      /* ----------------------------------------------------- messages */

      function addLocal(sender, text, extra) {
        state.localSeq += 1;
        var m = Object.assign({ id: 'local-' + state.localSeq, sender: sender, text: text, authorName: '', at: Date.now(), local: true }, extra || {});
        state.messages.push(m);
        return m;
      }

      function removeMessage(m) {
        state.messages = state.messages.filter(function (x) {
          return x !== m;
        });
      }

      function persist() {
        if (state.ticketId) saveJson(storeKey, { ticketId: state.ticketId, key: state.key });
        else saveJson(storeKey, null);
      }

      /** Merges what the server returned; returns how many new agent messages arrived. */
      function mergeServer(data) {
        var newAgent = 0;
        (data.messages || []).forEach(function (m) {
          if (state.messages.some(function (x) { return x.id === m.id; })) return;
          if (m.sender === 'visitor') {
            // Our own message may still be shown as "sending": replace it rather than duplicate.
            var pending = state.messages.filter(function (x) { return x.pending && x.text === m.text; })[0];
            if (pending) removeMessage(pending);
          }
          state.messages.push(m);
          if (m.sender === 'agent') newAgent += 1;
          if (m.at > state.since) state.since = m.at;
        });
        state.messages.sort(function (a, b) {
          return a.at - b.at;
        });
        if (data.ticket) {
          state.status = data.ticket.status;
          state.closedBy = data.ticket.closedBy;
          state.agentTyping = !!data.ticket.agentTyping && data.ticket.status === 'open';
        }
        return newAgent;
      }

      /* ------------------------------------------------------- polling */

      function nextDelay() {
        if (state.status === 'closed') return POLL_ENDED_MS;
        var base = state.open && tabs[state.tab] && tabs[state.tab].kind === 'chat' ? POLL_OPEN_MS : POLL_CLOSED_MS;
        return Math.min(POLL_MAX_BACKOFF_MS, base * Math.pow(2, state.failures));
      }

      function schedulePoll(delay) {
        clearTimeout(state.pollTimer);
        if (state.stopped || !state.ticketId) return;
        state.pollTimer = setTimeout(poll, delay == null ? nextDelay() : delay);
      }

      function poll() {
        if (state.stopped || !state.ticketId) return;
        if (document.hidden) return schedulePoll();
        api('GET', '/tickets/' + encodeURIComponent(state.ticketId) + '?since=' + state.since, null, chatHeaders())
          .then(function (data) {
            if (state.stopped) return;
            state.failures = 0;
            var arrived = mergeServer(data);
            var watching = state.open && tabs[state.tab] && tabs[state.tab].kind === 'chat';
            if (arrived > 0 && !watching) state.unread += arrived;
            renderAll();
          })
          .catch(function (err) {
            if (state.stopped) return;
            if (err.status === 404) {
              // The chat no longer exists on the server (deleted): start fresh.
              resetChat();
              return;
            }
            state.failures += 1;
          })
          .then(function () {
            schedulePoll();
          });
      }

      function resetChat() {
        clearTimeout(state.pollTimer);
        state.ticketId = null;
        state.key = null;
        state.status = 'none';
        state.closedBy = null;
        state.agentTyping = false;
        state.messages = [];
        state.since = 0;
        state.failures = 0;
        state.confirmEnd = false;
        persist();
        renderAll();
      }

      /* -------------------------------------------------------- actions */

      function send(rawText) {
        var text = String(rawText || '').trim();
        if (!text || state.sending || !chatOn || state.status === 'closed') return;
        var pending = addLocal('visitor', text, { pending: true });
        state.sending = true;
        renderAll();

        var request;
        if (state.ticketId) {
          request = api('POST', '/tickets/' + encodeURIComponent(state.ticketId) + '/messages', { text: text }, chatHeaders()).then(function (res) {
            return { message: res.message, created: false };
          });
        } else {
          var token = C.getCookie('m_a');
          if (!token) {
            request = Promise.reject(new Error(cfg.errorMessage || DEFAULT_ERROR));
          } else {
            var user = C.user() || {};
            request = api('POST', '/tickets', { text: text, name: user.name || '', email: user.email || '', userId: user.id || '' }, { 'x-ghl-token': token }).then(function (res) {
              state.ticketId = res.ticketId;
              state.key = res.key;
              state.status = 'open';
              persist();
              return { message: res.message, created: true };
            });
          }
        }

        request
          .then(function (res) {
            removeMessage(pending);
            if (!state.messages.some(function (x) { return x.id === res.message.id; })) state.messages.push(res.message);
            if (res.message.at > state.since) state.since = res.message.at;
            if (res.created && cfg.successMessage) addLocal('system', cfg.successMessage);
            state.failures = 0;
            schedulePoll(1500);
          })
          .catch(function (err) {
            removeMessage(pending);
            state.draft = text;
            if (err && err.status === 409) {
              state.status = 'closed';
              addLocal('system', 'This chat has ended.');
            } else if (err && err.status === 404 && state.ticketId) {
              resetChat();
              addLocal('system', cfg.errorMessage || DEFAULT_ERROR, { error: true });
            } else {
              addLocal('system', cfg.errorMessage || (err && err.status === 429 ? err.message : DEFAULT_ERROR), { error: true });
            }
          })
          .then(function () {
            state.sending = false;
            renderAll();
            if (ui.inputEl && state.draft) {
              ui.inputEl.value = state.draft;
              state.draft = '';
            }
          });
      }

      function endChat() {
        state.confirmEnd = false;
        if (!state.ticketId) return renderAll();
        api('POST', '/tickets/' + encodeURIComponent(state.ticketId) + '/close', null, chatHeaders())
          .then(function () {
            state.status = 'closed';
            state.closedBy = 'visitor';
            return api('GET', '/tickets/' + encodeURIComponent(state.ticketId) + '?since=' + state.since, null, chatHeaders());
          })
          .then(function (data) {
            mergeServer(data);
          })
          .catch(function () {
            addLocal('system', cfg.errorMessage || DEFAULT_ERROR, { error: true });
          })
          .then(function () {
            schedulePoll();
            renderAll();
          });
      }

      /* ------------------------------------------------------ rendering */

      function bubble(message) {
        var mine = message.sender === 'visitor';
        var system = message.sender === 'system';
        if (system) {
          return C.h('div', {
            text: message.text,
            style: {
              'align-self': 'center',
              'text-align': 'center',
              'max-width': '90%',
              'font-size': '12px',
              color: message.error ? '#b91c1c' : '#6b7280',
              padding: '2px 8px',
            },
          });
        }
        var children = [];
        if (!mine && message.authorName) {
          children.push(C.h('div', { text: message.authorName, style: { 'font-size': '11px', 'font-weight': '600', opacity: '.65', 'margin-bottom': '2px' } }));
        }
        children.push(C.h('div', { text: message.text, style: { 'white-space': 'pre-wrap', 'word-break': 'break-word' } }));
        return C.h(
          'div',
          {
            attrs: { 'data-mgc-msg': message.sender },
            style: {
              'align-self': mine ? 'flex-end' : 'flex-start',
              'max-width': '82%',
              padding: '8px 12px',
              background: mine ? cfg.visitorBubbleBg : cfg.agentBubbleBg,
              color: mine ? cfg.visitorBubbleText : cfg.agentBubbleText,
              'border-radius': mine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              opacity: message.pending ? '.6' : '1',
              'font-size': '14px',
              'line-height': '1.4',
            },
          },
          children,
        );
      }

      function chip(label, onClick, filled) {
        return C.h('button', {
          text: label,
          className: 'mgc-btn',
          attrs: { type: 'button' },
          style: {
            padding: '6px 12px',
            'border-radius': '999px',
            border: '1px solid ' + cfg.visitorBubbleBg,
            background: filled ? cfg.visitorBubbleBg : '#fff',
            color: filled ? cfg.visitorBubbleText : cfg.visitorBubbleBg,
            'font-size': '13px',
          },
          on: { click: onClick },
        });
      }

      function renderMessages() {
        var el = ui.messagesEl;
        if (!el) return;
        var nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        el.textContent = '';
        var tab = tabs[state.tab];
        var started = state.messages.some(function (m) { return m.sender === 'visitor'; });

        if (cfg.welcomeMessage) {
          el.appendChild(
            bubble({ sender: 'agent', text: cfg.welcomeMessage, authorName: cfg.agentName }),
          );
        }
        if (tab.kind === 'chat' && !started && state.status !== 'closed' && (cfg.quickReplies || []).length) {
          var chips = C.h('div', { style: { display: 'flex', 'flex-wrap': 'wrap', gap: '6px' } });
          cfg.quickReplies.forEach(function (label) {
            chips.appendChild(chip(label, function () { send(label); }, true));
          });
          el.appendChild(chips);
        }
        if (!started && (cfg.quickActions || []).length) {
          var links = C.h('div', { style: { display: 'flex', 'flex-direction': 'column', gap: '6px' } });
          cfg.quickActions.forEach(function (action) {
            links.appendChild(
              C.h('a', {
                text: action.label,
                attrs: { href: C.safeUrl(action.url) || '#', target: '_blank', rel: 'noopener' },
                style: { display: 'block', padding: '10px 12px', border: '1px solid #e5e7eb', 'border-radius': '10px', color: cfg.visitorBubbleBg, 'font-weight': '600', 'text-decoration': 'none', 'font-size': '14px' },
              }),
            );
          });
          el.appendChild(links);
        }
        if (tab.kind === 'chat') {
          state.messages.forEach(function (m) {
            el.appendChild(bubble(m));
          });
          if (state.agentTyping) {
            el.appendChild(
              C.h('div', { className: 'mgc-typing', attrs: { 'aria-label': cfg.agentName + ' is typing' }, style: { 'align-self': 'flex-start', background: cfg.agentBubbleBg, padding: '10px 12px', 'border-radius': '14px 14px 14px 4px' } }, [
                C.h('span'),
                C.h('span'),
                C.h('span'),
              ]),
            );
          }
          if (state.status === 'closed') {
            el.appendChild(
              C.h('div', { style: { 'align-self': 'center', 'text-align': 'center', margin: '8px 0' } }, [
                C.h('div', { text: state.closedBy === 'agent' ? 'This chat was closed by our team.' : 'This chat has ended.', style: { 'font-size': '12px', color: '#6b7280', 'margin-bottom': '8px' } }),
                chip('Start a new chat', resetChat, true),
              ]),
            );
          }
        }
        if (nearBottom || state.sending) el.scrollTop = el.scrollHeight;
      }

      function renderFooter() {
        var f = ui.footerEl;
        if (!f) return;
        var tab = tabs[state.tab];
        var show = tab.kind === 'chat' && !cfg.hideInput && state.status !== 'closed';
        f.style.display = show ? 'flex' : 'none';
        if (ui.confirmBar) ui.confirmBar.style.display = state.confirmEnd && tab.kind === 'chat' ? 'flex' : 'none';
        if (ui.inputEl) {
          ui.inputEl.disabled = state.sending;
          ui.inputEl.setAttribute('placeholder', cfg.inputPlaceholder || 'Type your message…');
        }
        if (ui.sendBtn) ui.sendBtn.style.display = cfg.hideSendButton ? 'none' : '';
      }

      function renderStatus() {
        if (ui.endBtn) ui.endBtn.style.display = state.ticketId && state.status === 'open' && tabs[state.tab].kind === 'chat' ? '' : 'none';
        if (ui.statusEl) ui.statusEl.style.display = cfg.showStatus && cfg.statusText ? 'flex' : 'none';
      }

      function renderTabs() {
        var bar = ui.tabsEl;
        if (!bar) return;
        bar.textContent = '';
        if (cfg.hideNavTabs || tabs.length < 2) {
          bar.style.display = 'none';
          return;
        }
        bar.style.display = 'flex';
        tabs.forEach(function (tab, i) {
          var active = i === state.tab;
          var label = C.h('span', { text: tab.label });
          var icon = tab.icon ? C.icon(tab.icon, 14) : null;
          var btn = C.h(
            'button',
            {
              attrs: { type: 'button', role: 'tab', 'aria-selected': active ? 'true' : 'false' },
              style: {
                flex: '1',
                display: 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                gap: '6px',
                padding: '9px 6px',
                border: '0',
                'border-radius': '8px',
                cursor: 'pointer',
                font: '600 13px/1.2 system-ui, sans-serif',
                background: active ? cfg.navTabActiveBgColor : 'transparent',
                color: active ? cfg.navTabActiveColor : cfg.navTabInactiveColor,
              },
              on: {
                click: function () {
                  selectTab(i);
                },
              },
            },
            [icon, label],
          );
          if (i === 0 && tab.kind === 'chat' && state.unread > 0 && !active) {
            btn.appendChild(C.h('span', { text: String(state.unread), style: { background: '#ef4444', color: '#fff', 'border-radius': '999px', 'font-size': '10px', padding: '1px 5px' } }));
          }
          bar.appendChild(btn);
        });
      }

      function renderBadge() {
        if (!ui.badge) return;
        var n = state.open ? 0 : state.unread;
        ui.badge.style.display = n > 0 ? 'flex' : 'none';
        ui.badge.textContent = n > 9 ? '9+' : String(n);
      }

      function renderBody() {
        var tab = tabs[state.tab];
        if (!ui.bodyEl) return;
        ui.messagesEl.style.display = tab.kind === 'page' ? 'none' : 'flex';
        ui.pageEl.style.display = tab.kind === 'page' ? 'block' : 'none';
      }

      function renderAll() {
        if (state.stopped) return;
        renderBadge();
        if (!ui.panel) return;
        renderTabs();
        renderBody();
        renderMessages();
        renderFooter();
        renderStatus();
      }

      function selectTab(i) {
        state.tab = i;
        var tab = tabs[i];
        if (tab.kind === 'chat') {
          state.unread = 0;
          schedulePoll(500);
        } else if (tab.kind === 'page') {
          ui.pageEl.textContent = '';
          C.resolveUrl(tab.url).then(function (resolved) {
            var safe = C.safeUrl(resolved);
            if (!safe || tabs[state.tab] !== tab) return;
            ui.pageEl.textContent = '';
            ui.pageEl.appendChild(
              C.h('iframe', { attrs: { src: safe, title: tab.label, allow: 'clipboard-write; fullscreen' }, style: { border: '0', width: '100%', height: '100%', background: '#fff' } }),
            );
          });
        }
        renderAll();
        if (tab.kind === 'chat' && ui.inputEl) ui.inputEl.focus();
      }

      /* ---------------------------------------------------------- panel */

      function placePanel() {
        var p = ui.panel;
        if (!p) return;
        var vw = window.innerWidth || 1024;
        var vh = window.innerHeight || 768;
        var width = Math.min(cfg.windowWidth || 380, vw - 24);
        var height = Math.min(cfg.windowHeight || 560, vh - 24);
        var bottom = Math.max(12, Math.min(pos.bottom + size + 12, vh - height - 12));
        p.style.width = width + 'px';
        p.style.height = height + 'px';
        p.style.bottom = bottom + 'px';
        p.style.left = p.style.right = 'auto';
        p.style[pos.side] = Math.max(12, cfg.sideOffset || 20) + 'px';
      }

      function buildPanel() {
        var logo = cfg.logoUrl
          ? C.h('img', { attrs: { src: C.safeUrl(cfg.logoUrl), alt: '' }, style: { width: '38px', height: '38px', 'border-radius': '50%', 'object-fit': 'cover', 'flex-shrink': '0', background: 'rgba(255,255,255,.2)' } })
          : null;

        ui.statusEl = C.h('div', { style: { display: 'flex', 'align-items': 'center', gap: '6px', 'font-size': '12px', color: cfg.headerSubtitleColor, 'margin-top': '2px' } }, [
          C.h('span', { style: { width: '8px', height: '8px', 'border-radius': '50%', background: cfg.statusColor, display: 'inline-block' } }),
          C.h('span', { text: cfg.statusText }),
        ]);
        ui.endBtn = C.h('button', {
          text: 'End chat',
          attrs: { type: 'button' },
          style: { border: '1px solid rgba(255,255,255,.5)', background: 'transparent', color: cfg.headerTitleColor, 'border-radius': '999px', padding: '3px 10px', 'font-size': '12px', cursor: 'pointer', display: 'none' },
          on: {
            click: function () {
              state.confirmEnd = true;
              renderAll();
            },
          },
        });

        var header = C.h(
          'div',
          { style: { background: headerBg, color: cfg.headerTitleColor, padding: '14px 16px', display: 'flex', 'align-items': 'center', gap: '10px', 'flex-shrink': '0' } },
          [
            logo,
            C.h('div', { style: { flex: '1', 'min-width': '0' } }, [
              C.h('div', { text: cfg.title, style: { 'font-size': '16px', 'font-weight': '700', color: cfg.headerTitleColor, overflow: 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap' } }),
              cfg.subtitle ? C.h('div', { text: cfg.subtitle, style: { 'font-size': '12.5px', color: cfg.headerSubtitleColor } }) : null,
              ui.statusEl,
            ]),
            ui.endBtn,
            C.h('button', { text: '✕', attrs: { type: 'button', 'aria-label': 'Close chat' }, style: { border: '0', background: 'transparent', color: cfg.headerTitleColor, 'font-size': '16px', cursor: 'pointer' }, on: { click: closePanel } }),
          ],
        );

        ui.tabsEl = C.h('div', { attrs: { role: 'tablist' }, style: { display: 'none', gap: '4px', padding: '6px', background: cfg.navBarBgColor, 'border-bottom': '1px solid ' + cfg.navBarBorderColor, 'flex-shrink': '0' } });
        ui.messagesEl = C.h('div', { style: { flex: '1', 'overflow-y': 'auto', padding: '14px', display: 'flex', 'flex-direction': 'column', gap: '10px', background: '#fff' } });
        ui.pageEl = C.h('div', { style: { flex: '1', display: 'none', background: '#fff', 'min-height': '0' } });
        ui.bodyEl = C.h('div', { style: { flex: '1', display: 'flex', 'flex-direction': 'column', 'min-height': '0' } }, [ui.messagesEl, ui.pageEl]);

        ui.inputEl = C.h('textarea', {
          attrs: { rows: '1', maxlength: '2000', 'aria-label': 'Message' },
          style: { flex: '1', resize: 'none', border: '1px solid #d1d5db', 'border-radius': '10px', padding: '9px 11px', font: '14px/1.4 system-ui, sans-serif', 'max-height': '96px', outline: 'none', 'box-sizing': 'border-box' },
          on: {
            keydown: function (e) {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitInput();
              }
            },
            input: function () {
              ui.inputEl.style.height = 'auto';
              ui.inputEl.style.height = Math.min(96, ui.inputEl.scrollHeight) + 'px';
            },
          },
        });
        ui.sendBtn = C.h('button', {
          text: 'Send',
          className: 'mgc-btn',
          attrs: { type: 'button' },
          style: { border: '0', 'border-radius': '10px', padding: '0 14px', background: cfg.visitorBubbleBg, color: cfg.visitorBubbleText, 'font-weight': '600' },
          on: { click: submitInput },
        });
        ui.footerEl = C.h('div', { style: { display: 'none', gap: '8px', padding: '10px', 'border-top': '1px solid #e5e7eb', 'align-items': 'flex-end', 'flex-shrink': '0', background: '#fff' } }, [ui.inputEl, ui.sendBtn]);

        ui.confirmBar = C.h(
          'div',
          { style: { display: 'none', gap: '8px', 'align-items': 'center', 'justify-content': 'space-between', padding: '8px 12px', background: '#fef2f2', 'border-top': '1px solid #fecaca', 'font-size': '13px', color: '#7f1d1d', 'flex-shrink': '0' } },
          [
            C.h('span', { text: 'End this chat?' }),
            C.h('span', {}, [
              C.h('button', { text: 'Yes, end it', attrs: { type: 'button' }, style: { border: '0', background: '#b91c1c', color: '#fff', 'border-radius': '8px', padding: '4px 10px', cursor: 'pointer', 'margin-right': '6px' }, on: { click: endChat } }),
              C.h('button', { text: 'Keep chatting', attrs: { type: 'button' }, style: { border: '1px solid #d1d5db', background: '#fff', 'border-radius': '8px', padding: '4px 10px', cursor: 'pointer' }, on: { click: function () { state.confirmEnd = false; renderAll(); } } }),
            ]),
          ],
        );

        var panel = C.h(
          'div',
          {
            attrs: { role: 'dialog', 'aria-label': cfg.title, 'data-mgc-chat-panel': '' },
            style: {
              position: 'fixed',
              display: 'flex',
              'flex-direction': 'column',
              background: '#fff',
              'border-radius': '16px',
              overflow: 'hidden',
              'box-shadow': '0 20px 50px rgba(0,0,0,.28)',
              'z-index': '2147482800',
              font: '14px/1.45 system-ui, -apple-system, sans-serif',
              color: '#111827',
              animation: 'mgc-fade-in .18s ease',
            },
          },
          [header, ui.tabsEl, ui.bodyEl, ui.confirmBar, ui.footerEl],
        );
        return C.mark(panel, 'chat-bubble');
      }

      function submitInput() {
        var text = ui.inputEl.value;
        if (!text.trim()) return;
        ui.inputEl.value = '';
        ui.inputEl.style.height = 'auto';
        send(text);
      }

      function openPanel() {
        if (state.open) return;
        state.open = true;
        ui.panel = buildPanel();
        document.body.appendChild(ui.panel);
        placePanel();
        selectTab(tabs[state.tab] ? state.tab : 0);
        if (tabs[state.tab].kind === 'chat') state.unread = 0;
        renderAll();
        schedulePoll(500);
        if (tabs[state.tab].kind === 'chat' && ui.inputEl) ui.inputEl.focus();
      }

      function closePanel() {
        state.open = false;
        if (ui.panel && ui.panel.parentNode) ui.panel.parentNode.removeChild(ui.panel);
        ui.panel = null;
        ui.messagesEl = ui.inputEl = ui.footerEl = ui.bodyEl = ui.tabsEl = ui.pageEl = ui.statusEl = ui.endBtn = ui.sendBtn = ui.confirmBar = null;
        renderBadge();
        schedulePoll();
      }

      function togglePanel() {
        if (state.open) closePanel();
        else openPanel();
      }

      /* ------------------------------------------------------- launcher */

      function placeLauncher() {
        var el = ui.launcher;
        if (!el) return;
        el.style.left = el.style.right = 'auto';
        el.style.top = 'auto';
        el.style.transform = 'none';
        el.style[pos.side] = Math.max(0, cfg.sideOffset != null ? cfg.sideOffset : 20) + 'px';
        el.style.bottom = pos.bottom + 'px';
        // Other features (the help tooltip) sit clear of the launcher using this.
        C.layout = C.layout || {};
        C.layout.chatBubble = { side: pos.side, top: pos.bottom + size };
      }

      function makeDraggable(el) {
        var start = null;
        var moved = false;
        var suppress = false;
        el.addEventListener(
          'click',
          function (e) {
            if (suppress) {
              e.stopImmediatePropagation();
              e.preventDefault();
            }
          },
          true,
        );
        el.addEventListener('pointerdown', function (e) {
          if (e.button !== 0) return;
          var r = el.getBoundingClientRect();
          start = { x: e.clientX, y: e.clientY, left: r.left, top: r.top };
          moved = false;
          try {
            if (el.setPointerCapture) el.setPointerCapture(e.pointerId);
          } catch (err) {
            /* optional */
          }
        });
        el.addEventListener('pointermove', function (e) {
          if (!start) return;
          var dx = e.clientX - start.x;
          var dy = e.clientY - start.y;
          if (!moved && Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD) return;
          moved = true;
          el.style.right = 'auto';
          el.style.bottom = 'auto';
          el.style.left = start.left + dx + 'px';
          el.style.top = start.top + dy + 'px';
        });
        function finish() {
          if (!start) return;
          var was = moved;
          start = null;
          moved = false;
          if (!was) return;
          suppress = true;
          setTimeout(function () {
            suppress = false;
          }, 0);
          var r = el.getBoundingClientRect();
          var vw = window.innerWidth || 1;
          var vh = window.innerHeight || 1;
          var side = r.left + r.width / 2 < vw / 2 ? 'left' : 'right';
          var bottom = Math.round(Math.min(vh - size - 8, Math.max(8, vh - r.bottom)));
          pos = { side: side, bottom: bottom };
          saveJson(posKey, pos);
          placeLauncher();
          if (state.open) placePanel();
        }
        el.addEventListener('pointerup', finish);
        el.addEventListener('pointercancel', finish);
      }

      function buildLauncher() {
        var iconEl = C.icon(cfg.bubbleIcon || 'chat', Math.round(size * 0.46)) || C.h('span', { text: '💬', style: { 'font-size': Math.round(size * 0.46) + 'px' } });
        ui.badge = C.h('span', {
          style: { position: 'absolute', top: '-4px', right: '-4px', 'min-width': '20px', height: '20px', padding: '0 5px', 'box-sizing': 'border-box', 'border-radius': '999px', background: '#ef4444', color: '#fff', font: '700 11px/20px system-ui, sans-serif', 'text-align': 'center', display: 'none', 'align-items': 'center', 'justify-content': 'center' },
          attrs: { 'aria-label': 'Unread messages' },
        });
        var btn = C.h(
          'button',
          {
            className: 'mgc-btn',
            attrs: { type: 'button', 'aria-label': cfg.title || 'Chat', 'aria-haspopup': 'dialog' },
            style: {
              position: 'fixed',
              width: size + 'px',
              height: size + 'px',
              'border-radius': '999px',
              border: '0',
              padding: '0',
              background: gradient,
              color: cfg.bubbleTextColor,
              'box-shadow': '0 10px 24px rgba(0,0,0,.25)',
              'z-index': '2147482800',
            },
            on: { click: togglePanel },
          },
          [iconEl, ui.badge],
        );
        ui.launcher = C.mark(btn, 'chat-bubble');
        placeLauncher();
        if (cfg.draggable !== false) makeDraggable(btn);
        document.body.appendChild(btn);
      }

      /* ---------------------------------------------------------- start */

      C.style('chat-bubble', CSS);

      var saved = chatOn ? loadJson(storeKey) : null;
      if (saved && saved.ticketId && saved.key) {
        state.ticketId = saved.ticketId;
        state.key = saved.key;
        state.status = 'open';
        // Restore the conversation, then keep polling for replies.
        api('GET', '/tickets/' + encodeURIComponent(state.ticketId) + '?since=0', null, chatHeaders())
          .then(function (data) {
            if (state.stopped) return;
            mergeServer(data);
            renderAll();
            schedulePoll();
          })
          .catch(function (err) {
            if (state.stopped) return;
            if (err.status === 404) resetChat();
            else schedulePoll();
          });
      }

      C.watch('chat-bubble', function () {
        var existing = document.querySelector('button[data-mgc="chat-bubble"]');
        if (C.isLoginPage()) {
          if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
          ui.launcher = null;
          return;
        }
        if (!existing) buildLauncher();
        else if (!ui.launcher) ui.launcher = existing;
      });

      var offHelp = C.on('help', openPanel);
      var onKey = function (e) {
        if (e.key === 'Escape' && state.open) closePanel();
      };
      document.addEventListener('keydown', onKey);
      var onResize = function () {
        if (ui.launcher) placeLauncher();
        if (state.open) placePanel();
      };
      window.addEventListener('resize', onResize);

      return function () {
        state.stopped = true;
        clearTimeout(state.pollTimer);
        offHelp();
        document.removeEventListener('keydown', onKey);
        window.removeEventListener('resize', onResize);
        if (C.layout) delete C.layout.chatBubble;
      };
    },
  });
})(window.__mgcCustomizer);
