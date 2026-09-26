/*
 * Theme: injects the server-built theme stylesheet (color rules, gradients,
 * fonts, radius/shadow, sidebar styling) as one <style> tag, plus any Google
 * Fonts the theme uses. Config: { css, fontUrls }.
 */
(function (C) {
  if (!C) return;

  C.register('theme', {
    apply: function (cfg) {
      (cfg.fontUrls || []).forEach(function (href, i) {
        C.stylesheet('theme', href, 'theme-font-' + i);
      });
      C.style('theme', cfg.css || '');
    },
  });
})(window.__mgcCustomizer);
