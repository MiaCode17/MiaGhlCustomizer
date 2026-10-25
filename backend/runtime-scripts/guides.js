/*
 * Guides: guided tours of GHL pages.
 *
 * A "Guide" button appears on pages that have a tour (in the header next to GHL's own buttons,
 * or in a corner); starting it dims the page and walks the viewer through the tour's steps,
 * highlighting each element with a spotlight and explaining it in a card (text, an image or a
 * video, an optional button). A tour can also start by itself the first time someone opens its
 * page (once per browser, until the tour is edited).
 *
 * Robustness: a step whose element can't be found (GHL changed its markup, or it isn't on screen)
 * is shown as a centered card instead of failing, a step may click something first to open the
 * menu its element lives in, and the spotlight follows the element if the layout moves.
 *
 * Config: { button: {text, icon, placement, backgroundColor, textColor, borderRadius, size, shadow},
 *   tours: [{ id, name, pages, autoStart, version, permissions, steps: [{ title, content, selector,
 *   clickSelector, placement, mediaType, mediaUrl, ctaLabel, ctaUrl }] }] }.
 */
(function (C) {
  if (!C) return;

  var Z = 2147483100;
  var FIND_TIMEOUT_MS = 1500;
  var AUTO_START_DELAY_MS = 1200;
  var SIZES = { small: { h: 28, font: 12, icon: 14 }, medium: { h: 34, font: 13, icon: 16 }, large: { h: 42, font: 15, icon: 18 } };

  /* ---------------------------------------------------------------- helpers */

  function visibleRect(el) {
    if (!el || !el.getBoundingClientRect) return null;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 ? r : null;
  }

  function queryAll(selector) {
    try {
      return Array.prototype.slice.call(document.querySelectorAll(selector));
    } catch (e) {
      return []; // an invalid selector must never break the page
    }
  }

  /** The first visible element matching the selector, or the first match at all. */
  function find(selector) {
    var all = queryAll(selector);
    for (var i = 0; i < all.length; i++) if (visibleRect(all[i])) return all[i];
    return all[0] || null;
  }

  function isValidSelector(selector) {
    try {
      document.querySelector(selector);
      return true;
    } catch (e) {
      return false;
    }
  }

  function waitForElement(selector, ms) {
    return new Promise(function (resolve) {
      // A selector the browser rejects will never match, so there is nothing to wait for.
      if (!isValidSelector(selector)) return resolve(null);
      var started = Date.now();
      (function tick() {
        var el = find(selector);
        if (el && visibleRect(el)) return resolve(el);
        if (Date.now() - started >= ms) return resolve(el || null);
        setTimeout(tick, 100);
      })();
    });
  }

  function seenKey(tour) {
    return 'mgc:' + C.companyId + ':tour:' + tour.id;
  }
  function hasSeen(tour) {
    try {
      return window.localStorage.getItem(seenKey(tour)) === String(tour.version);
    } catch (e) {
      return false;
    }
  }
  function markSeen(tour) {
    try {
      window.localStorage.setItem(seenKey(tour), String(tour.version));
    } catch (e) {
      /* storage blocked: it may auto-start again next time */
    }
  }

  function matchesPage(tour, path) {
    if (!tour.pages || tour.pages.length === 0) return true;
    return tour.pages.some(function (p) {
      return p && path.indexOf(p) >= 0;
    });
  }

  /** An embeddable address for a video link, or null when it should just be a link. */
  function videoEmbed(url) {
    var u = String(url || '');
    var yt = /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/.exec(u);
    if (yt) return { kind: 'iframe', src: 'https://www.youtube.com/embed/' + yt[1] + '?rel=0' };
    var vimeo = /vimeo\.com\/(?:video\/)?(\d+)/.exec(u);
    if (vimeo) return { kind: 'iframe', src: 'https://player.vimeo.com/video/' + vimeo[1] };
    if (/\.(mp4|webm|ogg)(\?|#|$)/i.test(u)) return { kind: 'file', src: u };
    return null;
  }

  function mediaEl(step) {
    var safe = C.safeUrl(step.mediaUrl);
    if (step.mediaType === 'none' || !safe) return null;
    var frame = { width: '100%', 'border-radius': '8px', background: '#f3f4f6', 'margin-bottom': '10px', display: 'block' };
    if (step.mediaType === 'image') {
      return C.h('img', { attrs: { src: safe, alt: step.title || '' }, style: Object.assign({}, frame, { 'max-height': '200px', 'object-fit': 'contain' }) });
    }
    var embed = videoEmbed(safe);
    if (embed && embed.kind === 'iframe') {
      return C.h('iframe', { attrs: { src: embed.src, title: step.title || 'Video', allow: 'fullscreen; picture-in-picture', allowfullscreen: true }, style: Object.assign({}, frame, { height: '190px', border: '0' }) });
    }
    if (embed && embed.kind === 'file') {
      return C.h('video', { attrs: { src: embed.src, controls: true, playsinline: true }, style: Object.assign({}, frame, { 'max-height': '200px' }) });
    }
    return C.h('a', { text: 'Watch the video', attrs: { href: safe, target: '_blank', rel: 'noopener' }, style: { display: 'block', 'margin-bottom': '10px', color: '#4f46e5', 'font-weight': '600' } });
  }

  /* ------------------------------------------------------------- the tour */

  function runTour(tour, onClose) {
    var index = 0;
    var token = 0;
    var current = null; // the element the current step points at
    var timer = null;
    var closed = false;

    var spot = C.h('div', {
      style: { position: 'fixed', 'z-index': String(Z), 'pointer-events': 'none', 'border-radius': '8px', 'box-shadow': '0 0 0 9999px rgba(15,23,42,.58)', transition: 'all .2s ease', display: 'none' },
    });
    var dim = C.h('div', { style: { position: 'fixed', inset: '0', 'z-index': String(Z - 1), background: 'rgba(15,23,42,.58)', display: 'none' } });
    // A transparent layer keeps stray clicks from reaching the page while the tour is running.
    var blocker = C.h('div', { style: { position: 'fixed', inset: '0', 'z-index': String(Z - 1) } });
    var card = C.h('div', {
      attrs: { role: 'dialog', 'aria-label': tour.name, 'aria-live': 'polite' },
      style: { position: 'fixed', 'z-index': String(Z + 1), width: 'min(380px, 92vw)', 'max-height': '90vh', overflow: 'auto', background: '#fff', color: '#111827', 'border-radius': '14px', 'box-shadow': '0 20px 50px rgba(0,0,0,.35)', padding: '16px', 'box-sizing': 'border-box', font: '14px/1.5 system-ui, -apple-system, sans-serif', visibility: 'hidden' },
    });
    var root = C.mark(C.h('div', { attrs: { 'data-mgc-tour': tour.id } }, [blocker, dim, spot, card]), 'guides-tour');
    document.body.appendChild(root);
    // Opening a tour counts as having seen it, so one that starts by itself is not repeated
    // every visit even if the viewer leaves partway through.
    markSeen(tour);

    function close(done) {
      if (closed) return;
      closed = true;
      token++;
      clearInterval(timer);
      document.removeEventListener('keydown', onKey, true);
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
      if (root.parentNode) root.parentNode.removeChild(root);
      markSeen(tour);
      if (onClose) onClose(!!done);
    }

    function place(rect, placement) {
      var vw = window.innerWidth || 1024;
      var vh = window.innerHeight || 768;
      var m = 12;
      var gap = 14;
      var cw = card.offsetWidth || 380;
      var ch = card.offsetHeight || 200;
      var left;
      var top;
      if (!rect || placement === 'center') {
        left = (vw - cw) / 2;
        top = (vh - ch) / 2;
      } else {
        var space = { bottom: vh - rect.bottom, top: rect.top, right: vw - rect.right, left: rect.left };
        var side = placement;
        if (side === 'auto') {
          if (space.bottom >= ch + gap) side = 'bottom';
          else if (space.top >= ch + gap) side = 'top';
          else if (space.right >= cw + gap) side = 'right';
          else if (space.left >= cw + gap) side = 'left';
          else side = ['bottom', 'top', 'right', 'left'].sort(function (a, b) { return space[b] - space[a]; })[0];
        }
        if (side === 'bottom') { top = rect.bottom + gap; left = rect.left + rect.width / 2 - cw / 2; }
        else if (side === 'top') { top = rect.top - gap - ch; left = rect.left + rect.width / 2 - cw / 2; }
        else if (side === 'right') { left = rect.right + gap; top = rect.top + rect.height / 2 - ch / 2; }
        else { left = rect.left - gap - cw; top = rect.top + rect.height / 2 - ch / 2; }
      }
      card.style.left = Math.round(Math.max(m, Math.min(left, vw - cw - m))) + 'px';
      card.style.top = Math.round(Math.max(m, Math.min(top, vh - ch - m))) + 'px';
    }

    function reposition() {
      if (closed) return;
      var step = tour.steps[index];
      var rect = current ? visibleRect(current) : null;
      if (rect) {
        spot.style.display = 'block';
        dim.style.display = 'none';
        spot.style.left = rect.left - 6 + 'px';
        spot.style.top = rect.top - 6 + 'px';
        spot.style.width = rect.width + 12 + 'px';
        spot.style.height = rect.height + 12 + 'px';
      } else {
        spot.style.display = 'none';
        dim.style.display = 'block';
      }
      place(rect, step.placement || 'auto');
    }

    function button(label, primary, onClick) {
      return C.h('button', {
        text: label,
        className: 'mgc-btn',
        attrs: { type: 'button' },
        style: { padding: '7px 14px', 'border-radius': '8px', border: primary ? '0' : '1px solid #d1d5db', background: primary ? '#4f46e5' : '#fff', color: primary ? '#fff' : '#374151', 'font-weight': '600', 'font-size': '13px' },
        on: { click: onClick },
      });
    }

    function render(step, found) {
      var last = index === tour.steps.length - 1;
      card.textContent = '';
      card.appendChild(
        C.h('div', { style: { display: 'flex', 'justify-content': 'space-between', 'align-items': 'center', 'margin-bottom': '8px', 'font-size': '12px', color: '#6b7280' } }, [
          C.h('span', { text: 'Step ' + (index + 1) + ' of ' + tour.steps.length }),
          C.h('button', { text: '✕', attrs: { type: 'button', 'aria-label': 'Close tour' }, style: { border: '0', background: 'transparent', cursor: 'pointer', 'font-size': '15px', color: '#6b7280' }, on: { click: function () { close(false); } } }),
        ]),
      );
      var media = mediaEl(step);
      if (media) card.appendChild(media);
      if (step.title) card.appendChild(C.h('div', { text: step.title, style: { 'font-size': '16px', 'font-weight': '700', 'margin-bottom': '4px' } }));
      if (step.content) card.appendChild(C.h('div', { text: step.content, style: { 'white-space': 'pre-wrap', color: '#374151', 'margin-bottom': '12px' } }));
      if (step.selector && !found) {
        card.appendChild(C.h('div', { text: 'This part of the page is not on screen right now.', style: { 'font-size': '12px', color: '#9ca3af', 'margin-bottom': '10px' } }));
      }
      var ctaUrl = C.safeUrl(step.ctaUrl);
      if (step.ctaLabel && ctaUrl) {
        card.appendChild(
          C.h('div', { style: { 'margin-bottom': '12px' } }, [
            C.h('button', { text: step.ctaLabel, className: 'mgc-btn', attrs: { type: 'button' }, style: { padding: '8px 14px', 'border-radius': '8px', border: '1px solid #4f46e5', background: '#eef2ff', color: '#4f46e5', 'font-weight': '600', 'font-size': '13px' }, on: { click: function () { C.open(ctaUrl, null, step.ctaLabel); } } }),
          ]),
        );
      }
      var dots = C.h('div', { style: { display: 'flex', gap: '5px', 'align-items': 'center' } });
      tour.steps.forEach(function (_s, i) {
        dots.appendChild(C.h('span', { style: { width: '7px', height: '7px', 'border-radius': '50%', background: i === index ? '#4f46e5' : '#d1d5db', display: 'inline-block' } }));
      });
      var nav = C.h('div', { style: { display: 'flex', gap: '8px' } });
      if (index > 0) nav.appendChild(button('Back', false, function () { go(index - 1); }));
      nav.appendChild(button(last ? 'Done' : 'Next', true, function () { if (last) close(true); else go(index + 1); }));
      card.appendChild(C.h('div', { style: { display: 'flex', 'justify-content': 'space-between', 'align-items': 'center', gap: '10px' } }, [dots, nav]));
    }

    function go(next) {
      var mine = ++token;
      index = Math.max(0, Math.min(next, tour.steps.length - 1));
      var step = tour.steps[index];
      card.style.visibility = 'hidden';
      var ready = Promise.resolve();
      if (step.clickSelector) {
        ready = waitForElement(step.clickSelector, FIND_TIMEOUT_MS).then(function (el) {
          if (el && el.click && mine === token) el.click();
        });
      }
      ready
        .then(function () {
          return step.selector ? waitForElement(step.selector, FIND_TIMEOUT_MS) : null;
        })
        .then(function (el) {
          if (mine !== token || closed) return;
          current = el && visibleRect(el) ? el : null;
          if (current && current.scrollIntoView) current.scrollIntoView({ block: 'center', inline: 'nearest' });
          render(step, !!current);
          card.style.visibility = 'visible';
          reposition();
          // Scrolling may still be settling: measure again once it has.
          setTimeout(function () { if (mine === token) reposition(); }, 250);
        });
    }

    function onKey(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        close(false);
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        e.preventDefault();
        if (index < tour.steps.length - 1) go(index + 1);
        else if (e.key === 'Enter') close(true);
      } else if (e.key === 'ArrowLeft' && index > 0) {
        e.preventDefault();
        go(index - 1);
      }
    }
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    // The layout can shift under the spotlight (menus opening, content loading).
    timer = setInterval(reposition, 400);

    go(0);
    return { close: close };
  }

  /* ----------------------------------------------------------- the button */

  function guideButton(cfg, onClick) {
    var b = cfg.button;
    var size = SIZES[b.size] || SIZES.medium;
    var icon = C.icon(b.icon, size.icon);
    var placement = b.placement;
    var style = {
      height: size.h + 'px',
      padding: '0 14px',
      'font-size': size.font + 'px',
      'font-weight': '600',
      background: b.backgroundColor,
      color: b.textColor,
      border: '0',
      'border-radius': b.borderRadius + 'px',
      'box-shadow': C.shadow(b.shadow),
      'white-space': 'nowrap',
    };
    if (placement !== 'header') {
      style.position = 'fixed';
      style['z-index'] = '2147482650';
      var corner = { 'bottom-right': { bottom: '90px', right: '20px' }, 'bottom-left': { bottom: '90px', left: '20px' }, 'top-right': { top: '76px', right: '20px' }, 'top-left': { top: '76px', left: '20px' } }[placement];
      Object.assign(style, corner);
    } else {
      style.margin = '0 8px';
    }
    return C.mark(
      C.h('button', { className: 'mgc-btn', attrs: { type: 'button', 'data-mgc-guide-button': '' }, style: style, on: { click: onClick } }, [icon, C.h('span', { text: b.text })]),
      'guides',
    );
  }

  C.register('guides', {
    apply: function (cfg) {
      var running = null;
      var autoStartedFor = '';

      function available() {
        var path = C.path();
        return (cfg.tours || []).filter(function (t) {
          return matchesPage(t, path) && C.allowedFor(t.permissions);
        });
      }

      function start(tour) {
        if (running) running.close(false);
        C.removeMarked('popover');
        running = runTour(tour, function () {
          running = null;
        });
      }

      function onButton(e) {
        var tours = available();
        if (tours.length === 0) return;
        if (tours.length === 1) return start(tours[0]);
        C.popover(
          e.currentTarget,
          tours.map(function (t) {
            return { label: t.name, onClick: function () { start(t); } };
          }),
        );
      }

      C.watch('guides', function () {
        var existing = document.querySelector('[data-mgc-guide-button]');
        var tours = available();
        if (C.isLoginPage() || tours.length === 0) {
          if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
          return;
        }

        if (!existing) {
          var btn = guideButton(cfg, onButton);
          if (cfg.button.placement === 'header') {
            var anchor = C.qs(C.sel.headerAnchor);
            var host = anchor ? anchor.parentNode : C.qs(C.sel.headerControls);
            if (!host) return;
            if (anchor) host.insertBefore(btn, anchor);
            else host.insertBefore(btn, host.firstChild);
          } else {
            document.body.appendChild(btn);
          }
        }

        // First visit: start the first matching tour that wants to, once per page visit.
        var path = C.path();
        if (!running && autoStartedFor !== path) {
          var auto = tours.filter(function (t) { return t.autoStart === 'first-visit' && !hasSeen(t); })[0];
          if (auto) {
            autoStartedFor = path;
            setTimeout(function () {
              if (!running && C.path() === path && !document.querySelector('[data-mgc="modal"], [data-mgc="drawer"]')) start(auto);
            }, AUTO_START_DELAY_MS);
          }
        }
      });

      var offRoute = C.onRoute(function () {
        if (running) running.close(false);
      });

      return function () {
        offRoute();
        if (running) running.close(false);
        C.removeMarked('guides');
      };
    },
  });
})(window.__mgcCustomizer);
