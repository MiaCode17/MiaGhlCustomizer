/*
 * Buttons: injects the Button Builder's buttons into their GHL page surface
 * (header, dashboard, contact record, opportunities, custom-object records).
 * Each surface pairs a route pattern with a container selector; the button row
 * is re-injected whenever GHL re-renders the container and removed when the
 * route no longer matches.
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
      row.appendChild(
        C.button(item, null, function () {
          C.open(item.targetUrl, null, item.label);
        }),
      );
    });
    return C.mark(row, 'buttons');
  }

  C.register('buttons', {
    apply: function (cfg) {
      var surfaces = cfg.surfaces || {};

      C.watch('buttons', function () {
        var path = C.path();
        Object.keys(surfaces).forEach(function (surface) {
          var spec = SURFACES[surface];
          var items = surfaces[surface] || [];
          var existing = document.querySelector('[data-mgc-surface="' + surface + '"]');
          var routeOk = !spec || !spec.route || spec.route.test(path);

          if (!spec || !routeOk || items.length === 0) {
            if (existing) existing.parentNode.removeChild(existing);
            return;
          }

          var container = C.qs(C.sel[spec.container]);
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
