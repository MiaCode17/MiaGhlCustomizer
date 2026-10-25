/*
 * Buttons: injects the Button Builder's buttons into their GHL page surface
 * (header, dashboard, contact record, opportunities, custom-object records).
 * Each surface pairs a route pattern with a container selector; the button row
 * is re-injected whenever GHL re-renders the container and removed when the
 * route no longer matches.
 *
 * Per button: only viewers whose role is allowed see it (permissions); it opens
 * its URL as a pop-up, drawer, new tab or in the same tab, with {{placeholders}}
 * resolved and optionally the contact's details / custom fields appended; and a
 * button with menu items becomes a dropdown whose entries each open their own URL.
 * Config: { surfaces: { [surface]: Button[] } }.
 */
(function (C) {
  if (!C) return;

  var SURFACES = {
    header: { route: null, container: 'headerControls', prepend: true },
    dashboard: { route: /\/dashboard(\/|$)/, container: 'dashboardToolbar' },
    contact: { route: /\/contacts\/detail\//, container: 'contactToolbar' },
    opportunity: { route: /\/opportunities(\/|$)/, container: 'opportunityToolbar' },
    'record-detail': { route: /\/(custom-)?objects\/[^/]+\/[^/]+/, container: 'recordToolbar' },
    'record-tab': { route: /\/(custom-)?objects\/[^/]+\/[^/]+/, container: 'recordTabs' },
  };

  function openEntry(entry, title) {
    C.open(entry.url || entry.targetUrl, entry.openMode, title, {
      sendContact: entry.sendContact,
      sendCustomFields: entry.sendCustomFields,
    });
  }

  function buildButton(item) {
    var isDropdown = Array.isArray(item.menuItems) && item.menuItems.length > 0;
    var cfg = isDropdown && !item.iconOnly ? Object.assign({}, item, { label: item.label + ' ▾' }) : item;
    var btn = C.button(cfg, null, function () {
      if (!isDropdown) {
        openEntry(item, item.label);
        return;
      }
      C.popover(
        btn,
        item.menuItems.map(function (m) {
          return {
            label: m.label,
            onClick: function () {
              openEntry(m, m.label);
            },
          };
        }),
      );
    });
    return btn;
  }

  function renderRow(surface, items) {
    var row = C.h('div', {
      attrs: { 'data-mgc-surface': surface },
      style: {
        display: 'flex',
        'flex-wrap': 'wrap',
        'align-items': 'center',
        gap: '8px',
        margin: surface === 'header' ? '0 8px' : '8px 0',
      },
    });
    items.forEach(function (item) {
      row.appendChild(buildButton(item));
    });
    return C.mark(row, 'buttons');
  }

  /** The container a surface's row goes in: an item-supplied selector wins over the default. */
  function containerFor(spec, items) {
    for (var i = 0; i < items.length; i++) {
      var custom = items[i].placementSelector;
      if (custom) {
        var el = C.qs(custom);
        if (el) return el;
      }
    }
    return C.qs(C.sel[spec.container]);
  }

  C.register('buttons', {
    apply: function (cfg) {
      var surfaces = cfg.surfaces || {};

      C.watch('buttons', function () {
        var path = C.path();
        Object.keys(surfaces).forEach(function (surface) {
          var spec = SURFACES[surface];
          if (!spec) return;
          var items = (surfaces[surface] || []).filter(function (item) {
            return C.allowedFor(item.permissions);
          });
          var existing = document.querySelector('[data-mgc-surface="' + surface + '"]');
          var routeOk = !spec.route || spec.route.test(path);

          if (!routeOk || items.length === 0) {
            if (existing) existing.parentNode.removeChild(existing);
            return;
          }

          var container = containerFor(spec, items);
          if (!container) return;
          if (existing && container.contains(existing)) return;
          if (existing) existing.parentNode.removeChild(existing);

          var row = renderRow(surface, items);
          if (spec.prepend) container.insertBefore(row, container.firstChild);
          else container.appendChild(row);
        });
      });
    },
  });
})(window.__mgcCustomizer);
