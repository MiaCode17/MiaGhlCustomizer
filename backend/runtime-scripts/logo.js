/*
 * Logo: swaps GHL's agency logo for the campaign logo resolved for this
 * location's group. The original src is kept on the element so teardown (e.g.
 * switching to a location in a different group) restores it.
 * Config: { name, logoUrl }.
 */
(function (C) {
  if (!C) return;

  var ORIGINAL = 'data-mgc-logo-original';

  C.register('logo', {
    apply: function (cfg) {
      var src = C.safeUrl(cfg.logoUrl);
      if (!src) return;

      C.watch('logo', function () {
        C.qsa(C.sel.logo).forEach(function (img) {
          if (!img.hasAttribute(ORIGINAL)) img.setAttribute(ORIGINAL, img.getAttribute('src') || '');
          if (img.getAttribute('src') !== src) {
            img.removeAttribute('srcset');
            img.setAttribute('src', src);
            img.setAttribute('alt', cfg.name || img.getAttribute('alt') || '');
          }
        });
      });

      return function () {
        C.qsa('[' + ORIGINAL + ']').forEach(function (img) {
          img.setAttribute('src', img.getAttribute(ORIGINAL));
          img.removeAttribute(ORIGINAL);
        });
      };
    },
  });
})(window.__mgcCustomizer);
