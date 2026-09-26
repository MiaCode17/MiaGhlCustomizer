/*
 * Login page: when GHL's login screen is on the page, links the stylesheet
 * built by the Login Page Builder (/api/v1/runtime/login-css/<companyId>).
 * Standalone: needs no JSON config, the stylesheet endpoint resolves everything.
 */
(function (C) {
  if (!C) return;

  C.register('login', {
    standalone: true,
    apply: function () {
      var href = C.apiBase + '/api/v1/runtime/login-css/' + encodeURIComponent(C.companyId);
      C.watch('login', function () {
        if (C.isLoginPage()) {
          C.stylesheet('login', href);
        } else {
          C.removeMarked('login');
        }
      });
    },
  });
})(window.__mgcCustomizer);
