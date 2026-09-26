/*
 * Chat bubble: a floating bottom-right launcher that opens a branded support
 * panel (header, welcome message, quick actions). Net-new UI appended to
 * document.body. Also opens on the "help" event (see misc.js help tooltip).
 * Config: { title, subtitle, gradientFrom, gradientTo, welcomeMessage,
 *           quickActions: [{label,url}] }.
 */
(function (C) {
  if (!C) return;

  function panel(cfg, close) {
    var gradient = 'linear-gradient(135deg,' + cfg.gradientFrom + ',' + cfg.gradientTo + ')';
    var body = C.h('div', { style: { padding: '16px', display: 'flex', 'flex-direction': 'column', gap: '12px', overflow: 'auto', flex: '1' } }, [
      cfg.welcomeMessage
        ? C.h('div', {
            text: cfg.welcomeMessage,
            style: {
              background: '#f3f4f6',
              color: '#111827',
              padding: '10px 12px',
              'border-radius': '4px 14px 14px 14px',
              'white-space': 'pre-line',
              'max-width': '85%',
            },
          })
        : null,
    ]);

    (cfg.quickActions || []).forEach(function (action) {
      body.appendChild(
        C.h('a', {
          text: action.label,
          attrs: { href: C.safeUrl(action.url) || '#', target: '_blank', rel: 'noopener' },
          style: {
            display: 'block',
            padding: '10px 12px',
            border: '1px solid #e5e7eb',
            'border-radius': '10px',
            color: cfg.gradientFrom,
            'font-weight': '600',
            'text-decoration': 'none',
          },
        }),
      );
    });

    return C.h(
      'div',
      {
        attrs: { role: 'dialog', 'aria-label': cfg.title, 'data-mgc-chat-panel': '' },
        style: {
          position: 'fixed',
          right: '20px',
          bottom: '90px',
          width: 'min(360px, calc(100vw - 40px))',
          height: 'min(520px, calc(100vh - 130px))',
          background: '#fff',
          'border-radius': '16px',
          overflow: 'hidden',
          display: 'flex',
          'flex-direction': 'column',
          'box-shadow': '0 20px 50px rgba(0,0,0,.25)',
          'z-index': '2147482800',
          font: '14px/1.45 system-ui, -apple-system, sans-serif',
          animation: 'mgc-fade-in .18s ease',
        },
      },
      [
        C.h('div', { style: { background: gradient, color: '#fff', padding: '16px 18px', display: 'flex', 'align-items': 'flex-start', gap: '12px' } }, [
          C.h('div', { style: { flex: '1' } }, [
            C.h('div', { text: cfg.title, style: { 'font-size': '16px', 'font-weight': '700' } }),
            cfg.subtitle ? C.h('div', { text: cfg.subtitle, style: { opacity: '.85', 'margin-top': '2px' } }) : null,
          ]),
          C.h('button', {
            text: '✕',
            attrs: { type: 'button', 'aria-label': 'Close' },
            style: { border: '0', background: 'transparent', color: '#fff', cursor: 'pointer', 'font-size': '15px' },
            on: { click: close },
          }),
        ]),
        body,
      ],
    );
  }

  C.register('chat-bubble', {
    apply: function (cfg) {
      var gradient = 'linear-gradient(135deg,' + cfg.gradientFrom + ',' + cfg.gradientTo + ')';
      var root = null;

      function isOpen() {
        return !!(root && root.querySelector('[data-mgc-chat-panel]'));
      }
      function close() {
        var p = root && root.querySelector('[data-mgc-chat-panel]');
        if (p) p.parentNode.removeChild(p);
      }
      function open() {
        if (!root || isOpen()) return;
        root.appendChild(panel(cfg, close));
      }

      C.watch('chat-bubble', function () {
        var existing = document.querySelector('[data-mgc="chat-bubble"]');
        if (C.isLoginPage()) {
          if (existing) existing.parentNode.removeChild(existing);
          root = null;
          return;
        }
        if (existing) return;

        root = C.mark(C.h('div'), 'chat-bubble');
        root.appendChild(
          C.h('button', {
            text: '💬',
            attrs: { type: 'button', 'aria-label': cfg.title || 'Chat' },
            className: 'mgc-btn',
            style: {
              position: 'fixed',
              right: '20px',
              bottom: '20px',
              width: '56px',
              height: '56px',
              'border-radius': '999px',
              border: '0',
              background: gradient,
              color: '#fff',
              'font-size': '24px',
              'box-shadow': '0 10px 24px rgba(0,0,0,.25)',
              'z-index': '2147482800',
            },
            on: {
              click: function () {
                if (isOpen()) close();
                else open();
              },
            },
          }),
        );
        document.body.appendChild(root);
      });

      return C.on('help', open);
    },
  });
})(window.__mgcCustomizer);
