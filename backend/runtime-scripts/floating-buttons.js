/*
 * Floating buttons: net-new UI appended to document.body (not GHL's DOM).
 * "right" buttons stack in a column on the right edge, "bottom" buttons sit in
 * a row at the bottom-left. A button with sub-items opens a small menu of links.
 * Config: { items: [{ position, label, icon, backgroundColor, textColor,
 *           borderRadius, shadow, animation, subItems: [{label,url}] }] }.
 */
(function (C) {
  if (!C) return;

  function menu(item, anchor, position) {
    C.removeMarked('floating-buttons-menu');
    var rect = anchor.getBoundingClientRect();
    var style = {
      position: 'fixed',
      'z-index': '2147482600',
      background: '#fff',
      'border-radius': '12px',
      'box-shadow': '0 12px 32px rgba(0,0,0,.2)',
      padding: '6px',
      'min-width': '200px',
      font: '14px/1.4 system-ui, -apple-system, sans-serif',
      animation: 'mgc-fade-in .15s ease',
    };
    if (position === 'right') {
      style.top = rect.top + 'px';
      style.right = window.innerWidth - rect.left + 8 + 'px';
    } else {
      style.bottom = window.innerHeight - rect.top + 8 + 'px';
      style.left = rect.left + 'px';
    }

    var list = C.mark(C.h('div', { style: style, attrs: { role: 'menu' } }), 'floating-buttons-menu');
    item.subItems.forEach(function (sub) {
      list.appendChild(
        C.h('a', {
          text: sub.label,
          attrs: { role: 'menuitem', href: C.safeUrl(sub.url) || '#', target: '_blank', rel: 'noopener' },
          style: { display: 'block', padding: '8px 12px', 'border-radius': '8px', color: '#111827', 'text-decoration': 'none' },
          on: {
            mouseenter: function (e) {
              e.currentTarget.style.background = '#f3f4f6';
            },
            mouseleave: function (e) {
              e.currentTarget.style.background = '';
            },
            click: function () {
              C.removeMarked('floating-buttons-menu');
            },
          },
        }),
      );
    });
    document.body.appendChild(list);

    setTimeout(function () {
      document.addEventListener('click', function dismiss(e) {
        if (!list.contains(e.target)) {
          C.removeMarked('floating-buttons-menu');
          document.removeEventListener('click', dismiss);
        }
      });
    }, 0);
  }

  function dock(position, items) {
    var style =
      position === 'right'
        ? { top: '90px', right: '16px', 'flex-direction': 'column', 'align-items': 'flex-end' }
        : { bottom: '16px', left: '16px', 'flex-direction': 'row', 'align-items': 'center' };
    var el = C.h('div', {
      attrs: { 'data-mgc-dock': position },
      style: Object.assign({ position: 'fixed', 'z-index': '2147482500', display: 'flex', gap: '8px' }, style),
    });

    items.forEach(function (item) {
      var btn = C.button(
        {
          label: item.label,
          icon: item.icon,
          style: 'primary',
          size: 'middle',
          backgroundColor: item.backgroundColor,
          textColor: item.textColor,
          borderColor: item.backgroundColor,
          borderWidth: 0,
          borderRadius: item.borderRadius,
          shadow: item.shadow,
          animation: item.animation,
        },
        null,
        function (e) {
          e.stopPropagation();
          if (item.subItems.length === 1) C.open(item.subItems[0].url, 'new-tab');
          else if (item.subItems.length > 1) menu(item, btn, position);
        },
      );
      el.appendChild(btn);
    });
    return C.mark(el, 'floating-buttons');
  }

  C.register('floating-buttons', {
    apply: function (cfg) {
      var byPosition = { right: [], bottom: [] };
      (cfg.items || []).forEach(function (item) {
        (byPosition[item.position] || byPosition.right).push(item);
      });

      C.watch('floating-buttons', function () {
        Object.keys(byPosition).forEach(function (position) {
          var items = byPosition[position];
          if (!items.length || C.isLoginPage()) {
            C.qsa('[data-mgc-dock="' + position + '"]').forEach(function (n) {
              n.parentNode.removeChild(n);
            });
            return;
          }
          var el = document.querySelector('[data-mgc-dock="' + position + '"]');
          if (!el) {
            el = dock(position, items);
            document.body.appendChild(el);
          }
          // Leave room for the Book-a-Call pill when both sit bottom-left.
          if (position === 'bottom') {
            var bottom = C.active['book-a-call'] ? '72px' : '16px';
            if (el.style.bottom !== bottom) el.style.bottom = bottom;
          }
        });
      });

      return function () {
        C.removeMarked('floating-buttons-menu');
      };
    },
  });
})(window.__mgcCustomizer);
