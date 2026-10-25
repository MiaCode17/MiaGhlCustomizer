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

      // GHL's .agency-logo is either an <img> (src) or an <svg> wrapping an <image> (href).
      function target(el) {
        if (el.tagName === 'IMG') return { node: el, attr: 'src' };
        var image = el.querySelector && el.querySelector('image');
        if (image) return { node: image, attr: image.hasAttribute('href') ? 'href' : 'xlink:href' };
        var img = el.querySelector && el.querySelector('img');
        return img ? { node: img, attr: 'src' } : null;
      }

      C.watch('logo', function () {
        C.qsa(C.sel.logo).forEach(function (el) {
          var t = target(el);
          if (!t) return;
          var node = t.node;
          if (!node.hasAttribute(ORIGINAL)) node.setAttribute(ORIGINAL, node.getAttribute(t.attr) || '');
          if (node.getAttribute(t.attr) !== src) {
            if (t.attr === 'src') {
              node.removeAttribute('srcset');
              node.setAttribute('alt', cfg.name || node.getAttribute('alt') || '');
            } else {
              node.setAttribute('xlink:href', src);
            }
            node.setAttribute(t.attr, src);
          }
        });
      });

      return function () {
        C.qsa('[' + ORIGINAL + ']').forEach(function (node) {
          var original = node.getAttribute(ORIGINAL);
          var attr = node.tagName === 'IMG' ? 'src' : node.hasAttribute('href') ? 'href' : 'xlink:href';
          node.setAttribute(attr, original);
          if (attr !== 'src') node.setAttribute('xlink:href', original);
          node.removeAttribute(ORIGINAL);
        });
      };
    },
  });
})(window.__mgcCustomizer);
