/*
 * Dynamic links: custom menu links appended to GHL's left sidebar. Links
 * targeted at a specific role are shown only when the viewer's role is known
 * (window.__customizerUserRole, set by an SSO handshake) and matches; with an
 * unknown role only "all" links are shown.
 * Config: { items: [{ id, title, url, icon, openMode, roleTarget }] }.
 */
(function (C) {
  if (!C) return;

  function visibleFor(item, role) {
    if (item.roleTarget === 'all') return true;
    if (!role) return false;
    if (item.roleTarget === 'admin') return role === 'admin' || role === 'owner';
    return role === item.roleTarget;
  }

  C.register('dynamic-links', {
    apply: function (cfg) {
      var items = cfg.items || [];

      C.watch('dynamic-links', function () {
        var nav = C.qs(C.sel.sidebarNav);
        if (!nav) return;
        // Leave the settings sidebar (same container in GHL v2) to the menu feature.
        var onSettings = /\/settings(\/|$)/.test(C.path());
        var role = C.userRole();
        var wanted = onSettings
          ? []
          : items.filter(function (item) {
              return visibleFor(item, role);
            });

        var current = C.qsa('[data-mgc="dynamic-links"]', nav);
        var inSync =
          current.length === wanted.length &&
          current.every(function (el, i) {
            return el.getAttribute('data-mgc-link') === wanted[i].id;
          });
        if (inSync) return;

        C.removeMarked('dynamic-links');
        wanted.forEach(function (item) {
          var link = C.navLink({
            label: item.title,
            icon: item.icon,
            href: item.url,
            onClick: function () {
              C.open(item.url, item.openMode, item.title);
            },
          });
          link.setAttribute('data-mgc-link', item.id);
          nav.appendChild(C.mark(link, 'dynamic-links'));
        });
      });
    },
  });
})(window.__mgcCustomizer);
