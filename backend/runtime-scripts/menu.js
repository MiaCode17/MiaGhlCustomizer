/*
 * Menu editor: edits GHL's own left sidebar.
 *  - renamed / hidden: native items are matched by their visible label
 *    (case-insensitive). The original label is remembered on the element so
 *    renames are idempotent across re-renders and reversible on teardown.
 *  - navTree: custom pages appended to the sidebar; items with a parentId are
 *    shown indented under their parent, ordered by `order`.
 *  - settingsMenuItems: extra links added while on GHL's Settings pages.
 *  - toolCategories: a "Tools" sidebar entry opening a flyout of grouped links.
 * Config: { renamed, hidden, settingsMenuItems, navTree, toolCategories }.
 */
(function (C) {
  if (!C) return;

  var ORIGINAL = 'data-mgc-menu-original';
  var HIDDEN = 'data-mgc-menu-hidden';

  function norm(s) {
    return String(s || '').trim().toLowerCase();
  }

  function editNativeItems(renames, hidden) {
    C.qsa(C.sel.sidebarLink).forEach(function (link) {
      if (link.closest('[data-mgc]')) return;
      var labelEl = C.qs(C.sel.sidebarLinkLabel, link);
      if (!labelEl) return;

      if (!labelEl.hasAttribute(ORIGINAL)) labelEl.setAttribute(ORIGINAL, labelEl.textContent.trim());
      var original = labelEl.getAttribute(ORIGINAL);
      var key = norm(original);

      var next = renames[key] || original;
      if (labelEl.textContent.trim() !== next) labelEl.textContent = next;

      var shouldHide = hidden[key] || hidden[norm(next)];
      if (shouldHide && !link.hasAttribute(HIDDEN)) {
        link.setAttribute(HIDDEN, link.style.display || '');
        link.style.display = 'none';
      } else if (!shouldHide && link.hasAttribute(HIDDEN)) {
        link.style.display = link.getAttribute(HIDDEN);
        link.removeAttribute(HIDDEN);
      }
    });
  }

  function restoreNativeItems() {
    C.qsa('[' + ORIGINAL + ']').forEach(function (el) {
      el.textContent = el.getAttribute(ORIGINAL);
      el.removeAttribute(ORIGINAL);
    });
    C.qsa('[' + HIDDEN + ']').forEach(function (el) {
      el.style.display = el.getAttribute(HIDDEN);
      el.removeAttribute(HIDDEN);
    });
  }

  /** Flattens the nav tree into render order: roots by order, each followed by its children. */
  function flattenTree(items) {
    var byOrder = function (a, b) {
      return (a.order || 0) - (b.order || 0);
    };
    var ids = {};
    items.forEach(function (i) {
      ids[i.id] = true;
    });
    var roots = items.filter(function (i) {
      return !i.parentId || !ids[i.parentId];
    });
    var out = [];
    roots.sort(byOrder).forEach(function (root) {
      out.push({ item: root, indent: false });
      items
        .filter(function (i) {
          return i.parentId === root.id;
        })
        .sort(byOrder)
        .forEach(function (child) {
          out.push({ item: child, indent: true });
        });
    });
    return out;
  }

  function toolsFlyout(categories, anchor) {
    C.removeMarked('menu-flyout');
    var rect = anchor.getBoundingClientRect();
    var panel = C.h('div', {
      attrs: { role: 'dialog', 'aria-label': 'Tools' },
      style: {
        position: 'fixed',
        top: Math.max(8, rect.top - 8) + 'px',
        left: rect.right + 8 + 'px',
        'z-index': '2147482700',
        background: '#fff',
        color: '#111827',
        'border-radius': '14px',
        'box-shadow': '0 16px 40px rgba(0,0,0,.22)',
        padding: '14px',
        display: 'grid',
        'grid-template-columns': 'repeat(' + Math.min(3, categories.length) + ', minmax(170px, 1fr))',
        gap: '16px',
        'max-height': '80vh',
        overflow: 'auto',
        font: '14px/1.4 system-ui, -apple-system, sans-serif',
        animation: 'mgc-fade-in .15s ease',
      },
    });
    categories.forEach(function (cat) {
      var col = C.h('div', {}, [
        C.h('div', {
          text: cat.name,
          style: { 'font-size': '11px', 'font-weight': '700', 'letter-spacing': '.06em', 'text-transform': 'uppercase', color: '#6b7280', margin: '2px 8px 6px' },
        }),
      ]);
      cat.tools.forEach(function (tool) {
        col.appendChild(
          C.h('a', {
            text: tool.label,
            attrs: { href: C.safeUrl(tool.url) || '#', target: '_blank', rel: 'noopener' },
            style: { display: 'block', padding: '7px 8px', 'border-radius': '8px', color: '#111827', 'text-decoration': 'none' },
            on: {
              mouseenter: function (e) {
                e.currentTarget.style.background = '#f3f4f6';
              },
              mouseleave: function (e) {
                e.currentTarget.style.background = '';
              },
            },
          }),
        );
      });
      panel.appendChild(col);
    });
    document.body.appendChild(C.mark(panel, 'menu-flyout'));

    setTimeout(function () {
      document.addEventListener('click', function dismiss(e) {
        if (!panel.contains(e.target)) {
          C.removeMarked('menu-flyout');
          document.removeEventListener('click', dismiss);
        }
      });
    }, 0);
  }

  function buildLinks(cfg, onSettings) {
    var links = [];
    if (onSettings) {
      (cfg.settingsMenuItems || []).forEach(function (item) {
        links.push(C.navLink({ label: item.name, href: item.link }));
      });
      return links;
    }

    flattenTree(cfg.navTree || []).forEach(function (entry) {
      var item = entry.item;
      links.push(
        C.navLink({
          label: item.label,
          href: item.url,
          indent: entry.indent,
          onClick: item.url
            ? function () {
                C.open(item.url, null, item.label);
              }
            : function () {},
        }),
      );
    });

    if ((cfg.toolCategories || []).length) {
      var tools = C.navLink({
        label: 'Tools',
        icon: '🧰',
        onClick: function () {
          toolsFlyout(cfg.toolCategories, tools);
        },
      });
      links.push(tools);
    }
    return links;
  }

  C.register('menu', {
    apply: function (cfg) {
      var renames = {};
      (cfg.renamed || []).forEach(function (r) {
        if (r.originalLabel && r.newLabel) renames[norm(r.originalLabel)] = r.newLabel;
      });
      var hidden = {};
      (cfg.hidden || []).forEach(function (label) {
        hidden[norm(label)] = true;
      });

      var renderedFor = null;

      C.watch('menu', function () {
        editNativeItems(renames, hidden);

        var nav = C.qs(C.sel.sidebarNav);
        if (!nav) return;
        var onSettings = /\/settings(\/|$)/.test(C.path());
        var mode = onSettings ? 'settings' : 'main';
        var present = nav.querySelector('[data-mgc="menu"]');
        var expected = onSettings ? (cfg.settingsMenuItems || []).length : (cfg.navTree || []).length + ((cfg.toolCategories || []).length ? 1 : 0);
        if (renderedFor === mode && (present || expected === 0)) return;

        C.removeMarked('menu');
        C.removeMarked('menu-flyout');
        buildLinks(cfg, onSettings).forEach(function (link) {
          nav.appendChild(C.mark(link, 'menu'));
        });
        renderedFor = mode;
      });

      return function () {
        restoreNativeItems();
        C.removeMarked('menu-flyout');
      };
    },
  });
})(window.__mgcCustomizer);
