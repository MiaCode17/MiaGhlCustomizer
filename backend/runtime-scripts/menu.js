/*
 * Menu editor: edits GHL's own left sidebar and page tab bars.
 *  - renamed / hidden / hiddenByRole / moved: native items are matched by their
 *    visible label (case-insensitive). The original label, icon and position are
 *    remembered so changes are idempotent across re-renders and reversible on teardown.
 *    A rename may also swap the icon (emoji or image URL); hiddenByRole hides an item
 *    only from the listed kinds of user; moved places an item before/after another.
 *  - navTree: custom pages appended to the sidebar. Items with a parentId are shown
 *    indented under their parent (an item without a URL collapses/expands its children),
 *    ordered by `order`, and only shown to the roles in their permissions.
 *  - settingsMenuItems: extra links and section dividers added on GHL's Settings pages.
 *  - toolCategories: a "Tools" sidebar entry opening a flyout of grouped links.
 *  - extendedTabs: extra tabs in the sub-navigation bar of Opportunities, Marketing,
 *    Sites, Conversations, Calendars, Contacts (or a custom page). Opening one shows its
 *    URL in the page's content area instead of the native view; any native tab (or a
 *    route change) brings the native view back.
 * Config: { renamed, hidden, hiddenByRole, moved, settingsMenuItems, navTree,
 *           toolCategories, extendedTabs }.
 */
(function (C) {
  if (!C) return;

  var ORIGINAL = 'data-mgc-menu-original';
  var HIDDEN = 'data-mgc-menu-hidden';
  var ICON_SRC = 'data-mgc-menu-icon-src';
  var ICON_HIDDEN = 'data-mgc-menu-icon-hidden';
  var TAB_HIDDEN = 'data-mgc-tab-hidden';

  function norm(s) {
    return String(s || '').trim().toLowerCase();
  }

  function modeOf(item) {
    return item.openMode && item.openMode !== 'auto' ? item.openMode : null;
  }

  /* ----------------------------------------------------- native sidebar items */

  var origOrders = []; // { parent, order } — a list's native child order, for teardown

  function applyIcon(link, icon) {
    var img = link.querySelector('img');
    if (!img) return;
    var existing = link.querySelector('[data-mgc="menu-icon"]');
    if (C.isImageUrl(icon)) {
      if (existing) existing.parentNode.removeChild(existing);
      if (img.hasAttribute(ICON_HIDDEN)) {
        img.style.display = img.getAttribute(ICON_HIDDEN);
        img.removeAttribute(ICON_HIDDEN);
      }
      if (!img.hasAttribute(ICON_SRC)) img.setAttribute(ICON_SRC, img.getAttribute('src') || '');
      var safe = C.safeUrl(icon);
      if (safe && img.getAttribute('src') !== safe) {
        img.removeAttribute('srcset');
        img.setAttribute('src', safe);
      }
      return;
    }
    // An emoji / text icon replaces the image.
    if (!img.hasAttribute(ICON_HIDDEN)) {
      img.setAttribute(ICON_HIDDEN, img.style.display || '');
      img.style.display = 'none';
    }
    if (!existing) {
      existing = C.mark(
        C.h('span', { style: { display: 'inline-flex', width: '20px', 'justify-content': 'center', 'font-size': '16px', 'line-height': '1' } }),
        'menu-icon',
      );
      img.parentNode.insertBefore(existing, img);
    }
    if (existing.textContent !== icon) existing.textContent = icon;
  }

  function restoreIcon(link) {
    var img = link.querySelector('img');
    var injected = link.querySelector('[data-mgc="menu-icon"]');
    if (injected && injected.parentNode) injected.parentNode.removeChild(injected);
    if (!img) return;
    if (img.hasAttribute(ICON_SRC)) {
      img.setAttribute('src', img.getAttribute(ICON_SRC));
      img.removeAttribute(ICON_SRC);
    }
    if (img.hasAttribute(ICON_HIDDEN)) {
      img.style.display = img.getAttribute(ICON_HIDDEN);
      img.removeAttribute(ICON_HIDDEN);
    }
  }

  function editNativeItems(renames, hidden, hiddenByRole) {
    var roleKey = C.roleKey();
    var nodes = {};
    C.qsa(C.sel.sidebarLink).forEach(function (link) {
      if (link.closest('[data-mgc]')) return;
      var labelEl = C.qs(C.sel.sidebarLinkLabel, link);
      if (!labelEl) return;

      if (!labelEl.hasAttribute(ORIGINAL)) labelEl.setAttribute(ORIGINAL, labelEl.textContent.trim());
      var original = labelEl.getAttribute(ORIGINAL);
      var key = norm(original);

      var rename = renames[key];
      var next = (rename && rename.newLabel) || original;
      if (labelEl.textContent.trim() !== next) labelEl.textContent = next;
      nodes[key] = link;
      nodes[norm(next)] = link;

      if (rename && rename.icon) applyIcon(link, rename.icon);
      else if (link.querySelector('[data-mgc="menu-icon"]') || link.querySelector('[' + ICON_SRC + ']')) restoreIcon(link);

      var restricted = hiddenByRole[key] || hiddenByRole[norm(next)];
      var shouldHide =
        hidden[key] || hidden[norm(next)] || (restricted && roleKey && restricted.indexOf(roleKey) >= 0);
      if (shouldHide && !link.hasAttribute(HIDDEN)) {
        link.setAttribute(HIDDEN, link.style.display || '');
        link.style.display = 'none';
      } else if (!shouldHide && link.hasAttribute(HIDDEN)) {
        link.style.display = link.getAttribute(HIDDEN);
        link.removeAttribute(HIDDEN);
      }
    });
    return nodes;
  }

  var lastMoveSig = '';

  /** The child order of every list the moves touch, used to tell whether GHL re-rendered it. */
  function orderSignature(links) {
    var parents = [];
    links.forEach(function (link) {
      if (link.parentNode && parents.indexOf(link.parentNode) < 0) parents.push(link.parentNode);
    });
    return parents
      .map(function (p) {
        return Array.prototype.map
          .call(p.children, function (el) {
            return el.id || el.textContent.trim().slice(0, 24);
          })
          .join(',');
      })
      .join('|');
  }

  /**
   * Applies the moves in order, once. Moves can depend on each other (one may target an
   * item another displaces), so they are not re-run every tick: the resulting order is
   * remembered and the moves run again only when GHL re-renders the list and changes it.
   */
  /** Snapshots a list's native child order the first time we touch it. */
  function rememberOrder(parent) {
    if (
      origOrders.some(function (o) {
        return o.parent === parent;
      })
    ) {
      return;
    }
    origOrders.push({ parent: parent, order: Array.prototype.slice.call(parent.children) });
  }

  function applyMoves(list, nodes) {
    var involved = [];
    list.forEach(function (move) {
      var link = nodes[norm(move.label)];
      var target = nodes[norm(move.target)];
      if (link && target && link !== target) {
        [link, target].forEach(function (el) {
          if (involved.indexOf(el) < 0) involved.push(el);
        });
      }
    });
    if (!involved.length || orderSignature(involved) === lastMoveSig) return;

    list.forEach(function (move) {
      var link = nodes[norm(move.label)];
      var target = nodes[norm(move.target)];
      if (!link || !target || link === target || !target.parentNode) return;
      var inPlace =
        move.position === 'before' ? link.nextElementSibling === target : link.previousElementSibling === target;
      if (inPlace) return;
      rememberOrder(link.parentNode);
      rememberOrder(target.parentNode);
      target.parentNode.insertBefore(link, move.position === 'before' ? target : target.nextSibling);
    });
    lastMoveSig = orderSignature(involved);
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
    C.qsa('[data-mgc="menu-icon"]').forEach(function (el) {
      var link = el.closest('a');
      if (link) restoreIcon(link);
      else if (el.parentNode) el.parentNode.removeChild(el);
    });
    C.qsa('[' + ICON_SRC + '], [' + ICON_HIDDEN + ']').forEach(function (img) {
      restoreIcon(img.parentNode);
    });
    origOrders.forEach(function (o) {
      var present = o.order.filter(function (el) {
        return el.parentNode === o.parent;
      });
      for (var i = 1; i < present.length; i++) {
        o.parent.insertBefore(present[i], present[i - 1].nextSibling);
      }
    });
    origOrders = [];
    lastMoveSig = '';
  }

  /* --------------------------------------------------------- custom sidebar items */

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

  /** A section heading styled like GHL's own sidebar dividers. */
  function dividerEl(name) {
    return C.h('div', { className: 'divider' }, [
      C.h(
        'p',
        {
          className: 'w-full text-left border-b border-solid my-3',
          style: { 'line-height': '0.1em', 'font-size': '10px', margin: '12px 12px' },
        },
        [C.h('span', { className: 'uppercase pr-3 default-bg-color', text: name })],
      ),
    ]);
  }

  function buildMainLinks(cfg) {
    var links = [];
    var visible = (cfg.navTree || []).filter(function (item) {
      return C.allowedFor(item.permissions);
    });
    var entries = flattenTree(visible);
    var hasChildren = {};
    entries.forEach(function (e) {
      if (e.item.parentId) hasChildren[e.item.parentId] = true;
    });

    entries.forEach(function (entry) {
      var item = entry.item;
      var isGroup = !item.url && hasChildren[item.id];
      var collapsed = false;
      var link = C.navLink({
        label: isGroup ? item.label + ' ▾' : item.label,
        icon: item.icon,
        href: item.url,
        indent: entry.indent,
        onClick: isGroup
          ? function () {
              collapsed = !collapsed;
              link.firstChild && (link.lastChild.textContent = item.label + (collapsed ? ' ▸' : ' ▾'));
              links.forEach(function (other) {
                if (other.getAttribute('data-mgc-parent') === item.id) other.style.display = collapsed ? 'none' : '';
              });
            }
          : item.url
            ? function () {
                C.open(item.url, modeOf(item), item.label);
              }
            : function () {},
      });
      if (entry.indent) link.setAttribute('data-mgc-parent', item.parentId);
      links.push(link);
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

  function buildSettingsLinks(cfg) {
    return (cfg.settingsMenuItems || []).map(function (item) {
      if (item.type === 'divider') return dividerEl(item.name);
      return C.navLink({
        label: item.name,
        href: item.link,
        onClick: function () {
          C.open(item.link, modeOf(item), item.name);
        },
      });
    });
  }

  /* -------------------------------------------------------------- extended tabs */

  // Reference tab ids and content containers are the ones GHL renders (verified).
  var TAB_PAGES = {
    opportunities: { test: /opportunities|bulk-actions/, reference: '#tb_bulk-actions', container: '.hl-wrapper-container' },
    marketing: { test: /marketing/, reference: '#tb_email-templates', container: '.hl-wrapper-container' },
    sites: { test: /funnels-websites/, reference: '#tb_qr-codes', container: '.hl-wrapper-container' },
    conversations: { test: /conversations/, reference: '#tb_conversations-templates', container: '.hl_conversations--wrap' },
    calendars: { test: /calendars/, reference: '#tb_calendars-tab', container: '.hl-wrapper-container' },
    contacts: { test: /contacts/, reference: '#tb_contacts-settings-top', container: '.hl-wrapper-container' },
  };

  function tabSpec(tab) {
    if (tab.page === 'custom') {
      var needle = String(tab.routeContains || '');
      return {
        test: { test: function (path) { return !!needle && path.indexOf(needle) >= 0; } },
        reference: tab.referenceSelector,
        container: tab.containerSelector,
      };
    }
    return TAB_PAGES[tab.page] || null;
  }

  var ACTIVE_CLASSES = ['router-link-exact-active', 'router-link-active', 'active'];

  function createExtendedTabs(tabs) {
    var openTabId = null;

    function closeFrame() {
      C.removeMarked('menu-tab-frame');
      C.qsa('[' + TAB_HIDDEN + ']').forEach(function (el) {
        el.style.display = el.getAttribute(TAB_HIDDEN);
        el.removeAttribute(TAB_HIDDEN);
      });
      C.qsa('[data-mgc-tab]').forEach(function (el) {
        ACTIVE_CLASSES.forEach(function (c) {
          el.classList.remove(c);
        });
      });
      openTabId = null;
    }

    function openFrame(tab, el, spec) {
      var container = C.qs(spec.container) || C.qs('.hl-wrapper-container');
      if (!container) {
        C.open(tab.url, 'modal', tab.label);
        return;
      }
      closeFrame();
      Array.prototype.slice.call(container.children).forEach(function (child) {
        if (child.hasAttribute('data-mgc')) return;
        child.setAttribute(TAB_HIDDEN, child.style.display || '');
        child.style.display = 'none';
      });
      var frame = C.h('iframe', {
        attrs: { title: tab.label, allow: 'clipboard-write; fullscreen' },
        style: { border: '0', width: '100%', height: 'calc(100vh - 130px)', display: 'block', background: '#fff' },
      });
      C.mark(frame, 'menu-tab-frame');
      container.appendChild(frame);
      C.resolveUrl(tab.url).then(function (resolved) {
        var safe = C.safeUrl(resolved);
        if (safe) frame.setAttribute('src', safe);
      });
      ACTIVE_CLASSES.forEach(function (c) {
        el.classList.add(c);
      });
      openTabId = tab.id;
    }

    function sync() {
      var path = C.path();
      var bySpecAnchor = {};
      tabs.forEach(function (tab) {
        var spec = tabSpec(tab);
        var existing = document.querySelector('[data-mgc-tab="' + tab.id + '"]');
        var show = !!spec && spec.test.test(path) && C.allowedFor(tab.permissions);
        if (!show) {
          if (existing) {
            if (openTabId === tab.id) closeFrame();
            existing.parentNode.removeChild(existing);
          }
          return;
        }
        var reference = C.qs(spec.reference);
        if (!reference || !reference.parentNode) return;
        // Keep several tabs for the same reference in configured order.
        var anchor = bySpecAnchor[spec.reference] || reference;
        if (existing && existing.parentNode === anchor.parentNode && existing.previousSibling === anchor) {
          bySpecAnchor[spec.reference] = existing;
          return;
        }
        if (existing) existing.parentNode.removeChild(existing);

        var el = C.h('div', { text: tab.label, attrs: { 'data-mgc-tab': tab.id, role: 'tab' }, style: { cursor: 'pointer' } });
        el.className = reference.className;
        ['cursor-pointer', 'relative', 'px-2'].concat(ACTIVE_CLASSES).forEach(function (c) {
          el.classList.remove(c);
        });
        el.classList.add('cursor-pointer', 'relative', 'px-2');
        C.mark(el, 'menu');
        el.addEventListener('click', function (e) {
          e.preventDefault();
          if (openTabId === tab.id) closeFrame();
          else openFrame(tab, el, spec);
        });
        anchor.parentNode.insertBefore(el, anchor.nextSibling);
        bySpecAnchor[spec.reference] = el;
      });
    }

    // Clicking any native tab brings the native view back.
    function onDocClick(e) {
      if (!openTabId) return;
      var target = e.target;
      if (target.closest && target.closest('[data-mgc-tab]')) return;
      if (target.closest && target.closest('.topmenu-nav, .topmenu-navitem, [id^="tb_"]')) closeFrame();
    }
    document.addEventListener('click', onDocClick, true);
    var offRoute = C.onRoute(closeFrame);

    return {
      sync: sync,
      destroy: function () {
        document.removeEventListener('click', onDocClick, true);
        offRoute();
        closeFrame();
        C.qsa('[data-mgc-tab]').forEach(function (el) {
          if (el.parentNode) el.parentNode.removeChild(el);
        });
      },
    };
  }

  /* ------------------------------------------------------------------ feature */

  C.register('menu', {
    apply: function (cfg) {
      var renames = {};
      (cfg.renamed || []).forEach(function (r) {
        if (r.originalLabel && (r.newLabel || r.icon)) renames[norm(r.originalLabel)] = r;
      });
      var hidden = {};
      (cfg.hidden || []).forEach(function (label) {
        hidden[norm(label)] = true;
      });
      var hiddenByRole = {};
      (cfg.hiddenByRole || []).forEach(function (h) {
        hiddenByRole[norm(h.label)] = h.roleKeys || [];
      });

      var tabs = createExtendedTabs(cfg.extendedTabs || []);
      var renderedFor = null;

      C.watch('menu', function () {
        var nodes = editNativeItems(renames, hidden, hiddenByRole);
        applyMoves(cfg.moved || [], nodes);
        tabs.sync();

        var nav = C.qs(C.sel.sidebarNav);
        if (!nav) return;
        var onSettings = /\/settings(\/|$)/.test(C.path());
        var mode = onSettings ? 'settings' : 'main';
        var present = nav.querySelector('[data-mgc="menu-nav"]');
        var expected = onSettings
          ? (cfg.settingsMenuItems || []).length
          : (cfg.navTree || []).length + ((cfg.toolCategories || []).length ? 1 : 0);
        if (renderedFor === mode && (present || expected === 0)) return;

        C.removeMarked('menu-nav');
        C.removeMarked('menu-flyout');
        var links = onSettings ? buildSettingsLinks(cfg) : buildMainLinks(cfg);
        // Settings items go in front of the Billing entry when GHL shows one.
        var anchor = onSettings ? C.qs(C.sel.sidebarBilling) : null;
        links.forEach(function (link) {
          C.mark(link, 'menu-nav');
          if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(link, anchor);
          else nav.appendChild(link);
        });
        renderedFor = mode;
      });

      return function () {
        tabs.destroy();
        restoreNativeItems();
        C.removeMarked('menu-nav');
        C.removeMarked('menu-flyout');
      };
    },
  });
})(window.__mgcCustomizer);
