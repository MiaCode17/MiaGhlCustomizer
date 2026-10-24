/*
 * Unread badge: a count of unread conversations on GHL's "Conversations"
 * sidebar link. The count comes from /api/v1/runtime/unread-count (the server
 * asks GHL and caches the answer), so this only polls that endpoint: at most
 * once per interval, never while the tab is hidden, backing off after errors
 * and re-checking slowly while the feature is switched off server-side.
 * Config: { badgeColor, pollSeconds }.
 */
(function (C) {
  if (!C) return;

  var MAX_BACKOFF_MS = 10 * 60 * 1000;
  var DISABLED_RECHECK_MS = 10 * 60 * 1000;

  C.register('unread-badge', {
    apply: function (cfg) {
      var baseMs = Math.max(30, cfg.pollSeconds || 60) * 1000;
      var state = { count: null, nextAt: 0, backoff: baseMs, fetching: false, stopped: false };
      var locationId = C.locationId;

      function url() {
        return (
          C.apiBase +
          '/api/v1/runtime/unread-count?company_id=' +
          encodeURIComponent(C.companyId) +
          '&locationId=' +
          encodeURIComponent(locationId) +
          (C.planId ? '&planId=' + encodeURIComponent(C.planId) : '')
        );
      }

      function poll() {
        state.fetching = true;
        fetch(url(), { credentials: 'omit' })
          .then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
          })
          .then(function (body) {
            if (state.stopped) return;
            if (!body || body.enabled === false) {
              state.count = null;
              state.nextAt = Date.now() + DISABLED_RECHECK_MS;
              return;
            }
            if (typeof body.count !== 'number') throw new Error('no count');
            state.count = body.count;
            state.backoff = baseMs;
            state.nextAt = Date.now() + baseMs;
          })
          .catch(function () {
            if (state.stopped) return;
            state.nextAt = Date.now() + state.backoff;
            state.backoff = Math.min(state.backoff * 2, MAX_BACKOFF_MS);
          })
          .then(function () {
            state.fetching = false;
            if (!state.stopped) render();
          });
      }

      function render() {
        var link = C.qs(C.sel.conversationsLink);
        var badge = document.querySelector('[data-mgc="unread-badge"]');
        var show = typeof state.count === 'number' && state.count > 0;
        if (!show) {
          if (badge) badge.style.display = 'none';
          return;
        }
        if (!link) return;
        // GHL re-renders its sidebar and drops our badge: attach a fresh one.
        if (!badge || !link.contains(badge)) {
          if (badge && badge.parentNode) badge.parentNode.removeChild(badge);
          badge = C.mark(
            C.h('span', {
              attrs: { 'aria-label': 'Unread conversations' },
              style: {
                display: 'inline-flex',
                'align-items': 'center',
                'justify-content': 'center',
                'min-width': '18px',
                height: '18px',
                padding: '0 5px',
                'margin-left': 'auto',
                'border-radius': '9px',
                background: cfg.badgeColor || '#2563eb',
                color: '#fff',
                'font-size': '11px',
                'font-weight': '600',
                'line-height': '18px',
                'flex-shrink': '0',
              },
            }),
            'unread-badge',
          );
          if (window.getComputedStyle(link).display.indexOf('flex') === -1) {
            link.style.setProperty('display', 'flex');
            link.style.setProperty('align-items', 'center');
          }
          link.appendChild(badge);
        }
        var text = state.count > 99 ? '99+' : String(state.count);
        if (badge.textContent !== text) badge.textContent = text;
        if (badge.style.display === 'none') badge.style.display = 'inline-flex';
      }

      C.watch(
        'unread-badge',
        function () {
          if (C.isLoginPage() || !locationId) return;
          if (!state.fetching && !document.hidden && Date.now() >= state.nextAt) poll();
          render();
        },
        2000,
      );

      return function () {
        state.stopped = true;
      };
    },
  });
})(window.__mgcCustomizer);
