/*
 * Membership: a button at the start of GHL's top-right header controls that
 * opens the agency's membership / client-portal page, for the sub-accounts the
 * agency enabled it for (the server only sends this config to those locations).
 * The URL may contain placeholders such as {{location.id}} and {{user.email}}
 * (see C.resolveUrl).
 * Config: { buttonLabel, url, openMode, icon, backgroundColor, textColor }.
 */
(function (C) {
  if (!C) return;

  C.register('membership', {
    apply: function (cfg) {
      function build() {
        return C.button(
          {
            label: cfg.buttonLabel,
            icon: cfg.icon,
            style: 'primary',
            size: 'middle',
            backgroundColor: cfg.backgroundColor,
            textColor: cfg.textColor,
            borderColor: cfg.backgroundColor,
            borderRadius: 8,
          },
          'membership',
          function () {
            C.open(cfg.url, cfg.openMode, cfg.buttonLabel);
          },
        );
      }

      C.watch('membership', function () {
        var existing = document.querySelector('[data-mgc="membership"]');
        if (C.isLoginPage()) {
          if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
          return;
        }
        var host = C.qs(C.sel.headerControls);
        if (!host) return;
        if (existing && host.contains(existing)) return;
        if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
        host.insertBefore(build(), host.firstChild);
      });
    },
  });
})(window.__mgcCustomizer);
