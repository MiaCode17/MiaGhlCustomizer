/*
 * Banners: announcement bars pinned to the top or bottom of the portal,
 * appended to document.body. Each can be dismissed for the rest of the browser
 * session; editing a banner (new version) shows it again.
 * Config: { items: [{ id, name, type, position, content, version }] }.
 */
(function (C) {
  if (!C) return;

  var PALETTE = {
    info: { bg: '#eff6ff', fg: '#1e3a8a', border: '#bfdbfe' },
    warning: { bg: '#fffbeb', fg: '#78350f', border: '#fde68a' },
    success: { bg: '#ecfdf5', fg: '#064e3b', border: '#a7f3d0' },
    promo: { bg: 'linear-gradient(90deg,#4f46e5,#9333ea)', fg: '#ffffff', border: 'transparent' },
  };

  function bar(item) {
    var colors = PALETTE[item.type] || PALETTE.info;
    var key = item.id + ':' + item.version;
    var el = C.h(
      'div',
      {
        attrs: { role: 'status', 'data-mgc-banner': item.id },
        style: {
          display: 'flex',
          'align-items': 'center',
          gap: '12px',
          padding: '10px 16px',
          background: colors.bg,
          color: colors.fg,
          'border-bottom': item.position === 'top' ? '1px solid ' + colors.border : '',
          'border-top': item.position === 'bottom' ? '1px solid ' + colors.border : '',
          font: '500 14px/1.45 system-ui, -apple-system, sans-serif',
          'pointer-events': 'auto',
        },
      },
      [
        C.h('div', { text: item.content, style: { flex: '1', 'white-space': 'pre-line' } }),
        C.h('button', {
          text: '✕',
          attrs: { type: 'button', 'aria-label': 'Dismiss' },
          style: { border: '0', background: 'transparent', color: 'inherit', cursor: 'pointer', 'font-size': '14px', opacity: '.75' },
          on: {
            click: function () {
              C.dismiss('banner:' + key);
              if (el.parentNode) el.parentNode.removeChild(el);
            },
          },
        }),
      ],
    );
    return el;
  }

  function stack(position) {
    var existing = document.querySelector('[data-mgc-banner-stack="' + position + '"]');
    if (existing) return existing;
    var el = C.h('div', {
      attrs: { 'data-mgc-banner-stack': position },
      style: {
        position: 'fixed',
        left: '0',
        right: '0',
        top: position === 'top' ? '0' : '',
        bottom: position === 'bottom' ? '0' : '',
        'z-index': '2147482400',
        'pointer-events': 'none',
      },
    });
    document.body.appendChild(C.mark(el, 'banners'));
    return el;
  }

  C.register('banners', {
    apply: function (cfg) {
      var items = cfg.items || [];

      C.watch('banners', function () {
        if (C.isLoginPage()) {
          C.removeMarked('banners');
          return;
        }
        items.forEach(function (item) {
          if (C.dismissed('banner:' + item.id + ':' + item.version)) return;
          if (document.querySelector('[data-mgc-banner="' + item.id + '"]')) return;
          stack(item.position === 'bottom' ? 'bottom' : 'top').appendChild(bar(item));
        });
      });
    },
  });
})(window.__mgcCustomizer);
