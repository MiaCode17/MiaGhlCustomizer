/*
 * Loader: shows the agency's loading indicator during GHL's in-app route
 * transitions. It appears on every SPA navigation and hides once the DOM has
 * been quiet for a moment and GHL's own loading indicators are gone (capped so
 * it can never get stuck).
 * Config: { loaderType: 'spinner'|'dots'|'bar'|'custom-image', customImageUrl }.
 */
(function (C) {
  if (!C) return;

  var MIN_VISIBLE_MS = 300;
  var QUIET_MS = 350;
  var MAX_VISIBLE_MS = 5000;

  var CSS = [
    '@keyframes mgc-spin{to{transform:rotate(360deg)}}',
    '@keyframes mgc-dot{0%,80%,100%{transform:scale(.4);opacity:.4}40%{transform:scale(1);opacity:1}}',
    '@keyframes mgc-bar{0%{left:-35%;right:100%}60%{left:100%;right:-90%}100%{left:100%;right:-90%}}',
    '.mgc-loader-veil{position:fixed;inset:0;z-index:2147482900;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.55);backdrop-filter:blur(2px)}',
    '.mgc-loader-spinner{width:44px;height:44px;border-radius:50%;border:4px solid rgba(79,70,229,.2);border-top-color:#4f46e5;animation:mgc-spin .8s linear infinite}',
    '.mgc-loader-dots{display:flex;gap:8px}.mgc-loader-dots span{width:12px;height:12px;border-radius:50%;background:#4f46e5;animation:mgc-dot 1.2s infinite ease-in-out both}',
    '.mgc-loader-dots span:nth-child(1){animation-delay:-.32s}.mgc-loader-dots span:nth-child(2){animation-delay:-.16s}',
    '.mgc-loader-bar{position:fixed;top:0;left:0;right:0;height:3px;z-index:2147482900;overflow:hidden;background:rgba(79,70,229,.15)}',
    '.mgc-loader-bar::before{content:"";position:absolute;top:0;bottom:0;background:#4f46e5;animation:mgc-bar 1.4s cubic-bezier(.65,.815,.735,.395) infinite}',
  ].join('\n');

  function build(cfg) {
    if (cfg.loaderType === 'bar') return C.h('div', { className: 'mgc-loader-bar' });
    var inner;
    if (cfg.loaderType === 'dots') {
      inner = C.h('div', { className: 'mgc-loader-dots' }, [C.h('span'), C.h('span'), C.h('span')]);
    } else if (cfg.loaderType === 'custom-image') {
      inner = C.h('img', { attrs: { src: C.safeUrl(cfg.customImageUrl), alt: 'Loading' }, style: { 'max-width': '160px', 'max-height': '160px' } });
    } else {
      inner = C.h('div', { className: 'mgc-loader-spinner' });
    }
    return C.h('div', { className: 'mgc-loader-veil' }, [inner]);
  }

  C.register('loader', {
    apply: function (cfg) {
      C.style('loader', CSS);
      var el = null;
      var shownAt = 0;
      var lastMutation = 0;
      var poll = null;
      var observer = null;

      function hide() {
        if (poll) clearInterval(poll);
        if (observer) observer.disconnect();
        poll = null;
        observer = null;
        if (el && el.parentNode) el.parentNode.removeChild(el);
        el = null;
      }

      function show() {
        hide();
        el = C.mark(build(cfg), 'loader');
        document.body.appendChild(el);
        shownAt = lastMutation = Date.now();
        observer = new MutationObserver(function (records) {
          // Ignore our own node so the loader doesn't keep itself alive.
          for (var i = 0; i < records.length; i++) {
            if (!el || !el.contains(records[i].target)) {
              lastMutation = Date.now();
              return;
            }
          }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        poll = setInterval(function () {
          var now = Date.now();
          var settled = now - lastMutation >= QUIET_MS && !C.qs(C.sel.nativeLoader);
          if ((settled && now - shownAt >= MIN_VISIBLE_MS) || now - shownAt >= MAX_VISIBLE_MS) hide();
        }, 100);
      }

      var offRoute = C.onRoute(function () {
        if (!C.isLoginPage()) show();
      });

      return function () {
        offRoute();
        hide();
      };
    },
  });
})(window.__mgcCustomizer);
