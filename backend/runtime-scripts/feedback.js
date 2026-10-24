/*
 * Feedback: collects ratings and cancellation reasons from people using GHL.
 *
 *  - Rating button: a small tab on the edge of the screen (or a corner pill, or a header
 *    button) that opens a card asking for a rating (stars, 1-10 or faces) and an optional
 *    comment. After sending, the button hides for the configured cooldown. It can be made
 *    draggable; it then snaps to the nearest screen edge and remembers its place.
 *  - Cancellation reasons: when someone presses Cancel on GHL's billing page, a "Before you go"
 *    card asks why (a checklist plus a comment) first. Skipping goes ahead with the cancellation
 *    (unless reasons are required); closing the card stops it. A failure to record the answer
 *    never traps the customer: the cancellation proceeds regardless.
 *
 * Answers are sent with the viewer's GHL session so the server can confirm the sender belongs to
 * the location. Both parts need a sub-account context; outside one nothing is shown or intercepted.
 *
 * Config: { rating: { enabled, ratingType, buttonText, icon, placement, backgroundColor, textColor,
 *   title, commentMode, commentPlaceholder, thanksMessage, cooldownHours, draggable },
 *   askAfterChat, cancel: null | { required, title, message, reasons, commentPlaceholder } }.
 */
(function (C) {
  if (!C) return;

  var THANKS_MS = 2400;
  var DEFAULT_ERROR = 'Something went wrong. Please try again.';
  var EDGES = ['right', 'bottom', 'left', 'top'];
  var TAB_RADIUS = { right: '10px 0 0 10px', left: '0 10px 10px 0', top: '0 0 10px 10px', bottom: '10px 10px 0 0' };

  function loadJson(key) {
    try {
      return JSON.parse(window.localStorage.getItem(key) || 'null');
    } catch (e) {
      return null;
    }
  }
  function saveItem(key, value) {
    try {
      window.localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    } catch (e) {
      /* storage blocked */
    }
  }

  /** POSTs an answer as the signed-in user. Rejects with an Error carrying a readable message. */
  function postFeedback(body) {
    var token = C.getCookie('m_a');
    if (!token || !C.locationId) return Promise.reject(new Error(DEFAULT_ERROR));
    var user = C.user() || {};
    var payload = Object.assign({ name: user.name || '', email: user.email || '', userId: user.id || '' }, body);
    return fetch(
      C.apiBase +
        '/api/v1/runtime/feedback?company_id=' +
        encodeURIComponent(C.companyId) +
        '&locationId=' +
        encodeURIComponent(C.locationId) +
        (C.planId ? '&planId=' + encodeURIComponent(C.planId) : ''),
      { method: 'POST', headers: { 'content-type': 'application/json', 'x-ghl-token': token }, credentials: 'omit', body: JSON.stringify(payload) },
    ).then(function (res) {
      if (res.ok) return null;
      return res.json().then(
        function (data) {
          var detail = data && data.details && Object.keys(data.details).map(function (k) { return (data.details[k] || [])[0]; }).filter(Boolean)[0];
          throw new Error(detail || (data && data.error) || DEFAULT_ERROR);
        },
        function () {
          throw new Error(DEFAULT_ERROR);
        },
      );
    });
  }

  function textArea(placeholder) {
    return C.h('textarea', {
      attrs: { rows: '3', maxlength: '2000', placeholder: placeholder || '' },
      style: { width: '100%', 'box-sizing': 'border-box', resize: 'vertical', border: '1px solid #d1d5db', 'border-radius': '10px', padding: '9px 11px', font: '14px/1.4 system-ui, sans-serif', outline: 'none' },
    });
  }

  function primaryButton(label, onClick, color) {
    return C.h('button', { text: label, className: 'mgc-btn', attrs: { type: 'button' }, style: { padding: '9px 18px', 'border-radius': '10px', border: '0', background: color || '#4f46e5', color: '#fff', 'font-weight': '600', 'font-size': '14px' }, on: { click: onClick } });
  }

  function secondaryButton(label, onClick) {
    return C.h('button', { text: label, className: 'mgc-btn', attrs: { type: 'button' }, style: { padding: '9px 16px', 'border-radius': '10px', border: '1px solid #d1d5db', background: '#fff', color: '#374151', 'font-weight': '600', 'font-size': '14px' }, on: { click: onClick } });
  }

  function cardShell(children) {
    return C.h(
      'div',
      {
        attrs: { role: 'dialog' },
        style: { width: 'min(420px, 92vw)', 'max-height': '90vh', overflow: 'auto', background: '#fff', color: '#111827', 'border-radius': '16px', padding: '22px', 'box-shadow': '0 24px 60px rgba(0,0,0,.35)', 'box-sizing': 'border-box', font: '14px/1.45 system-ui, -apple-system, sans-serif' },
        on: { click: function (e) { e.stopPropagation(); } },
      },
      children,
    );
  }

  C.register('feedback', {
    apply: function (cfg) {
      var rating = cfg.rating || { enabled: false };
      var cancel = cfg.cancel || null;
      var lastKey = 'mgc:' + C.companyId + ':fb:last';
      var posKey = 'mgc:' + C.companyId + ':fbpos';
      var cleanups = [];
      var stopped = false;

      /* --------------------------------------------------- rating popup */

      function closePopup() {
        C.removeMarked('feedback-popup');
      }

      function openRatingPopup(afterSend) {
        closePopup();
        var type = rating.ratingType || 'stars';
        var chosen = 0;
        var commentMode = rating.commentMode || 'optional';
        var comment = commentMode === 'off' ? null : textArea(rating.commentPlaceholder);
        var error = C.h('div', { style: { color: '#b91c1c', 'font-size': '13px', 'min-height': '18px', margin: '8px 0 0' } });
        var submit = primaryButton('Send feedback', send, rating.backgroundColor);
        var widget = C.ratingWidget(type, function (n) {
          chosen = n;
          refresh();
        }, rating.backgroundColor);
        var body = C.h('div', {}, [
          C.h('div', { style: { display: 'flex', 'justify-content': 'space-between', 'align-items': 'flex-start', gap: '10px', 'margin-bottom': '14px' } }, [
            C.h('div', { text: rating.title, style: { 'font-size': '17px', 'font-weight': '700' } }),
            C.h('button', { text: '✕', attrs: { type: 'button', 'aria-label': 'Close' }, style: { border: '0', background: 'transparent', cursor: 'pointer', 'font-size': '16px', color: '#6b7280' }, on: { click: closePopup } }),
          ]),
          C.h('div', { style: { margin: '6px 0 14px' } }, [widget.el]),
          comment,
          error,
          C.h('div', { style: { display: 'flex', 'justify-content': 'flex-end', gap: '8px', 'margin-top': '14px' } }, [secondaryButton('Cancel', closePopup), submit]),
        ]);
        var card = cardShell([body]);

        function refresh() {
          var needsComment = commentMode === 'required' && comment && !comment.value.trim();
          submit.disabled = chosen === 0 || !!needsComment;
          submit.style.opacity = submit.disabled ? '.5' : '1';
          submit.style.cursor = submit.disabled ? 'not-allowed' : 'pointer';
        }
        if (comment) comment.addEventListener('input', refresh);

        function send() {
          if (submit.disabled) return;
          submit.disabled = true;
          error.textContent = '';
          postFeedback({ kind: 'rating', rating: chosen, comment: comment ? comment.value.trim() : '' })
            .then(function () {
              saveItem(lastKey, String(Date.now()));
              card.textContent = '';
              card.appendChild(
                C.h('div', { style: { 'text-align': 'center', padding: '14px 4px' } }, [
                  C.h('div', { text: '✓', style: { 'font-size': '34px', color: '#16a34a', 'margin-bottom': '6px' } }),
                  C.h('div', { text: rating.thanksMessage || 'Thank you for your feedback!', style: { 'font-size': '16px', 'font-weight': '600' } }),
                ]),
              );
              setTimeout(closePopup, THANKS_MS);
              if (afterSend) afterSend();
            })
            .catch(function (err) {
              error.textContent = (err && err.message) || DEFAULT_ERROR;
              refresh();
            });
        }
        refresh();

        var overlay = C.mark(C.h('div', { className: 'mgc-overlay', on: { click: closePopup } }, [card]), 'feedback-popup');
        document.body.appendChild(overlay);
        function onKey(e) {
          if (e.key === 'Escape') {
            document.removeEventListener('keydown', onKey);
            closePopup();
          }
        }
        document.addEventListener('keydown', onKey);
      }

      /* -------------------------------------------------- rating button */

      function cooling() {
        var hours = rating.cooldownHours || 0;
        if (hours <= 0) return false;
        var last = Number.parseInt(safeGet(lastKey), 10);
        return Number.isFinite(last) && Date.now() - last < hours * 3600 * 1000;
      }
      function safeGet(key) {
        try {
          return window.localStorage.getItem(key) || '';
        } catch (e) {
          return '';
        }
      }

      // Where the tab sits: an edge and a position along it, or a fixed corner.
      var spot = null;
      function initialSpot() {
        var saved = rating.draggable ? loadJson(posKey) : null;
        if (saved && EDGES.indexOf(saved.edge) >= 0 && typeof saved.pct === 'number') return { mode: 'edge', edge: saved.edge, pct: saved.pct };
        if (rating.placement === 'right' || rating.placement === 'left') return { mode: 'edge', edge: rating.placement, pct: 50 };
        return { mode: 'corner', side: rating.placement === 'bottom-left' ? 'left' : 'right' };
      }

      function applyPlacement(el) {
        el.style.left = el.style.right = el.style.top = el.style.bottom = 'auto';
        el.style.transform = 'none';
        if (spot.mode === 'corner') {
          var chat = C.layout && C.layout.chatBubble;
          el.style.bottom = (chat && chat.side === spot.side ? chat.top + 12 : 20) + 'px';
          el.style[spot.side] = '20px';
        } else if (spot.edge === 'left' || spot.edge === 'right') {
          el.style[spot.edge] = '0';
          el.style.top = spot.pct + '%';
          el.style.transform = 'translateY(-50%)';
        } else {
          el.style[spot.edge] = '0';
          el.style.left = spot.pct + '%';
          el.style.transform = 'translateX(-50%)';
        }
      }

      function buildButton() {
        var inHeader = rating.placement === 'header';
        var edge = spot && spot.mode === 'edge' ? spot.edge : null;
        var vertical = edge === 'left' || edge === 'right';
        var icon = C.icon(rating.icon, 16);
        var label = C.h('span', { text: rating.buttonText, style: vertical ? { 'writing-mode': 'vertical-rl', 'white-space': 'nowrap' } : { 'white-space': 'nowrap' } });
        var style = {
          display: 'flex',
          'flex-direction': vertical ? 'column' : 'row',
          'align-items': 'center',
          gap: '6px',
          padding: vertical ? '12px 8px' : '0 14px',
          height: vertical ? 'auto' : '34px',
          background: rating.backgroundColor,
          color: rating.textColor,
          border: '0',
          'font-weight': '600',
          'font-size': '13px',
          'border-radius': inHeader ? '999px' : edge ? TAB_RADIUS[edge] : '999px',
          'box-shadow': inHeader ? 'none' : '0 6px 16px rgba(0,0,0,.2)',
        };
        if (inHeader) style.margin = '0 8px';
        else style.position = 'fixed';
        if (!inHeader) style['z-index'] = '2147482650';
        var btn = C.mark(
          C.h('button', { className: 'mgc-btn', attrs: { type: 'button', 'data-mgc-fb-btn': '', 'aria-label': rating.buttonText }, style: style, on: { click: function () { openRatingPopup(function () { if (cooling()) removeButton(); }); } } }, [icon, label]),
          'feedback',
        );
        if (!inHeader) applyPlacement(btn);
        return btn;
      }

      function removeButton() {
        var el = document.querySelector('[data-mgc-fb-btn]');
        if (el && el.parentNode) el.parentNode.removeChild(el);
      }

      function ensureButton() {
        var existing = document.querySelector('[data-mgc-fb-btn]');
        if (C.isLoginPage() || !C.locationId || cooling()) {
          if (existing) removeButton();
          return;
        }
        if (existing) return;
        if (!spot) spot = initialSpot();
        var btn = buildButton();
        if (rating.placement === 'header') {
          var anchor = C.qs(C.sel.headerAnchor);
          var host = anchor ? anchor.parentNode : C.qs(C.sel.headerControls);
          if (!host) return;
          host.insertBefore(btn, anchor || host.firstChild);
          return;
        }
        document.body.appendChild(btn);
        if (rating.draggable) {
          cleanups.push(
            C.makeDraggable(btn, function (rect) {
              var vw = window.innerWidth || 1;
              var vh = window.innerHeight || 1;
              var cx = rect.left + rect.width / 2;
              var cy = rect.top + rect.height / 2;
              var d = { left: cx, right: vw - cx, top: cy, bottom: vh - cy };
              var edge = EDGES.reduce(function (best, e) { return d[e] < d[best] ? e : best; }, 'right');
              var pct = edge === 'left' || edge === 'right' ? (cy / vh) * 100 : (cx / vw) * 100;
              spot = { mode: 'edge', edge: edge, pct: Math.round(Math.min(95, Math.max(5, pct))) };
              saveItem(posKey, { edge: spot.edge, pct: spot.pct });
              // Rebuilt, because the label turns vertical or horizontal with the edge.
              removeButton();
              ensureButton();
            }),
          );
        }
      }

      if (rating.enabled) C.watch('feedback', ensureButton);

      /* ---------------------------------------------- cancellation popup */

      var bypass = false;

      function openCancelPopup(btn) {
        var modalContainer = btn.closest('.n-modal-container') || btn.closest('.n-modal') || null;
        // The native dialog keeps a focus trap that steals focus back from our inputs; inert switches it off.
        if (modalContainer) modalContainer.setAttribute('inert', '');
        btn.disabled = true;

        function finish(proceed) {
          closePopup();
          if (modalContainer) modalContainer.removeAttribute('inert');
          btn.disabled = false;
          if (proceed) {
            bypass = true;
            btn.click();
          }
        }

        var reasons = (cancel.reasons || []).slice();
        var boxes = reasons.map(function (reason) {
          var box = C.h('input', { attrs: { type: 'checkbox' }, style: { width: '16px', height: '16px' } });
          return { reason: reason, box: box };
        });
        var comment = textArea(cancel.commentPlaceholder);
        comment.style.marginTop = '8px';
        var error = C.h('div', { style: { color: '#b91c1c', 'font-size': '13px', 'min-height': '18px', 'margin-top': '8px' } });
        var submit = primaryButton('Submit & continue', send);

        function send() {
          var chosen = boxes.filter(function (b) { return b.box.checked; }).map(function (b) { return b.reason; });
          var text = comment.value.trim();
          if (cancel.required && chosen.length === 0 && !text) {
            error.textContent = 'Please tell us why you are cancelling.';
            return;
          }
          submit.disabled = true;
          // Whatever happens when recording the answer, the customer still gets to cancel.
          postFeedback({ kind: 'cancellation', reasons: chosen, comment: text }).catch(function () {}).then(function () {
            finish(true);
          });
        }

        var list = C.h('div', { style: { margin: '12px 0 4px' } });
        boxes.forEach(function (b) {
          list.appendChild(C.h('label', { style: { display: 'flex', 'align-items': 'center', gap: '8px', 'margin-bottom': '8px', cursor: 'pointer', color: '#374151' } }, [b.box, b.reason]));
        });

        var actions = C.h('div', { style: { display: 'flex', gap: '8px', 'margin-top': '14px' } }, [submit]);
        if (!cancel.required) actions.appendChild(secondaryButton('Skip', function () { finish(true); }));

        var card = cardShell([
          C.h('div', { style: { display: 'flex', 'justify-content': 'space-between', 'align-items': 'flex-start', gap: '10px' } }, [
            C.h('div', { text: cancel.title, style: { 'font-size': '17px', 'font-weight': '700' } }),
            // Closing aborts the cancellation entirely: the original click is never replayed.
            C.h('button', { text: '✕', attrs: { type: 'button', 'aria-label': 'Close' }, style: { border: '0', background: 'transparent', cursor: 'pointer', 'font-size': '18px', color: '#6b7280' }, on: { click: function () { finish(false); } } }),
          ]),
          cancel.message ? C.h('div', { text: cancel.message, style: { color: '#6b7280', 'margin-top': '4px' } }) : null,
          list,
          comment,
          error,
          actions,
        ]);
        var overlay = C.mark(C.h('div', { className: 'mgc-overlay', style: { 'z-index': '2147483500' } }, [card]), 'feedback-popup');
        document.body.appendChild(overlay);
        setTimeout(function () { comment.focus(); }, 0);
      }

      function onDocumentClick(e) {
        if (!cancel || stopped) return;
        if (window.location.pathname.indexOf('company-billing') === -1) return;
        var btn = e.target && e.target.closest ? e.target.closest('#cancel') : null;
        if (!btn) return;
        if (bypass) {
          bypass = false;
          return;
        }
        // Without a location or a session the answer could not be recorded, so don't get in the way.
        if (!C.locationId || !C.getCookie('m_a')) return;
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        openCancelPopup(btn);
      }
      if (cancel) document.addEventListener('click', onDocumentClick, true);

      return function () {
        stopped = true;
        document.removeEventListener('click', onDocumentClick, true);
        cleanups.forEach(function (fn) { fn(); });
        closePopup();
        removeButton();
      };
    },
  });
})(window.__mgcCustomizer);
