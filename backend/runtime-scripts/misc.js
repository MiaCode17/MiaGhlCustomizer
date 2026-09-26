/*
 * Misc settings:
 *  - Help tooltip: a corner pill that opens the chat bubble (via the "help"
 *    event). Without an active chat bubble a click just dismisses it for the session.
 *  - Add-on banner: a message + CTA placed at the top of the portal, at the
 *    bottom of the sidebar, or above the dashboard content. It shows on the
 *    dashboard only unless "show on other pages" is on.
 * Config: { tooltip: {enabled,buttonText,placement},
 *           addonBanner: {enabled,placement,showOnOtherPages,message,ctaUrl} }.
 */
(function (C) {
  if (!C) return;

  var CORNERS = {
    'bottom-right': { bottom: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' },
    'top-right': { top: '76px', right: '20px' },
    'top-left': { top: '76px', left: '20px' },
  };

  function tooltip(cfg) {
    var pos = Object.assign({}, CORNERS[cfg.placement] || CORNERS['bottom-right']);
    // Sit above the chat launcher / Book-a-Call pill when sharing their corner.
    if (cfg.placement === 'bottom-right' && C.active['chat-bubble']) pos.bottom = '88px';
    if (cfg.placement === 'bottom-left' && C.active['book-a-call']) pos.bottom = '68px';

    var btn = C.h('button', {
      text: '❔ ' + cfg.buttonText,
      className: 'mgc-btn',
      attrs: { type: 'button', 'data-mgc-tooltip': '' },
      style: Object.assign(
        {
          position: 'fixed',
          'z-index': '2147482700',
          height: '36px',
          padding: '0 14px',
          border: '0',
          'border-radius': '999px',
          background: '#111827',
          color: '#fff',
          'box-shadow': '0 8px 20px rgba(0,0,0,.25)',
          font: '600 13px/1 system-ui, -apple-system, sans-serif',
        },
        pos,
      ),
      on: {
        click: function () {
          if (C.hasListeners('help')) {
            C.emit('help');
          } else {
            C.dismiss('tooltip');
            if (btn.parentNode) btn.parentNode.removeChild(btn);
          }
        },
      },
    });
    return C.mark(btn, 'misc');
  }

  function addonBanner(cfg, compact) {
    var cta = C.safeUrl(cfg.ctaUrl);
    return C.mark(
      C.h(
        'div',
        {
          attrs: { 'data-mgc-addon': '' },
          style: {
            display: 'flex',
            'flex-direction': compact ? 'column' : 'row',
            'align-items': compact ? 'stretch' : 'center',
            gap: '10px',
            padding: compact ? '12px' : '10px 16px',
            margin: compact ? '12px 8px' : '0',
            'border-radius': compact ? '12px' : '0',
            background: 'linear-gradient(90deg,#0f172a,#312e81)',
            color: '#fff',
            font: '500 13px/1.45 system-ui, -apple-system, sans-serif',
          },
        },
        [
          C.h('div', { text: cfg.message, style: { flex: '1', 'white-space': 'pre-line' } }),
          cta
            ? C.h('a', {
                text: 'Learn more →',
                attrs: { href: cta, target: '_blank', rel: 'noopener' },
                style: { color: '#c7d2fe', 'font-weight': '700', 'text-decoration': 'none', 'white-space': 'nowrap' },
              })
            : null,
        ],
      ),
      'misc',
    );
  }

  C.register('misc', {
    apply: function (cfg) {
      C.watch('misc', function () {
        var login = C.isLoginPage();

        var tip = document.querySelector('[data-mgc-tooltip]');
        var wantTip = cfg.tooltip.enabled && !login && !C.dismissed('tooltip');
        if (wantTip && !tip) document.body.appendChild(tooltip(cfg.tooltip));
        if (!wantTip && tip) tip.parentNode.removeChild(tip);

        var banner = cfg.addonBanner;
        var existing = document.querySelector('[data-mgc-addon]');
        var onDashboard = /\/dashboard(\/|$)/.test(C.path());
        var wantBanner = banner.enabled && banner.message && !login && (onDashboard || banner.showOnOtherPages);
        if (!wantBanner) {
          if (existing) existing.parentNode.removeChild(existing);
          return;
        }

        var host =
          banner.placement === 'sidebar'
            ? C.qs(C.sel.sidebarNav)
            : banner.placement === 'dashboard'
              ? C.qs(C.sel.pageContent)
              : document.body;
        if (!host) return;
        if (existing && host.contains(existing)) return;
        if (existing) existing.parentNode.removeChild(existing);

        var el = addonBanner(banner, banner.placement === 'sidebar');
        if (banner.placement === 'top') {
          el.style.position = 'fixed';
          el.style.top = '0';
          el.style.left = '0';
          el.style.right = '0';
          el.style.zIndex = '2147482400';
          document.body.appendChild(el);
        } else if (banner.placement === 'dashboard') {
          host.insertBefore(el, host.firstChild);
        } else {
          host.appendChild(el);
        }
      });
    },
  });
})(window.__mgcCustomizer);
