/*
 * Loader: shows the agency's loading indicator during GHL's in-app route
 * transitions. It appears on every SPA navigation and hides once the DOM has
 * been quiet for a moment and GHL's own loading indicators are gone (capped so
 * it can never get stuck).
 * Config: { loaderType: spinner|dots|bar|pulse|bars|ring|wave|orbit|grid|custom-image, customImageUrl,
 *           color (hex accent), size (small|medium|large) }.
 */
(function (C) {
  if (!C) return;

  var MIN_VISIBLE_MS = 300;
  var QUIET_MS = 350;
  var MAX_VISIBLE_MS = 5000;

  var SCALES = { small: 0.7, medium: 1, large: 1.5 };
  var COUNTS = { dots: 3, bars: 5, wave: 5, grid: 9 };

  var CSS = [
    '@keyframes mgc-spin{to{transform:rotate(360deg)}}',
    '@keyframes mgc-dot{0%,80%,100%{transform:scale(.4);opacity:.4}40%{transform:scale(1);opacity:1}}',
    '@keyframes mgc-bar{0%{left:-35%;right:100%}60%{left:100%;right:-90%}100%{left:100%;right:-90%}}',
    '@keyframes mgc-pulse{0%{transform:scale(0);opacity:1}100%{transform:scale(1);opacity:0}}',
    '@keyframes mgc-bars{0%,40%,100%{transform:scaleY(.4)}20%{transform:scaleY(1)}}',
    '@keyframes mgc-wave{0%,100%{height:12px}50%{height:36px}}',
    '@keyframes mgc-grid{0%,70%,100%{opacity:.2;transform:scale(.6)}35%{opacity:1;transform:scale(1)}}',
    '.mgc-loader-box{display:flex;align-items:center;justify-content:center;transform:scale(var(--mgc-loader-scale,1))}',
    '.mgc-loader-veil{position:fixed;inset:0;z-index:2147482900;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.55);backdrop-filter:blur(2px)}',
    '.mgc-loader-spinner{width:44px;height:44px;border-radius:50%;border:4px solid color-mix(in srgb,var(--mgc-loader-color,#4f46e5) 20%,transparent);border-top-color:var(--mgc-loader-color,#4f46e5);animation:mgc-spin .8s linear infinite}',
    '.mgc-loader-pulse{width:44px;height:44px;border-radius:50%;background:var(--mgc-loader-color,#4f46e5);animation:mgc-pulse 1.2s ease-out infinite}',
    '.mgc-loader-ring{width:44px;height:44px;border-radius:50%;border:4px solid transparent;border-top-color:var(--mgc-loader-color,#4f46e5);border-right-color:var(--mgc-loader-color,#4f46e5);animation:mgc-spin 1.1s cubic-bezier(.5,.1,.5,.9) infinite}',
    '.mgc-loader-orbit{position:relative;width:44px;height:44px;border-radius:50%;border:2px solid color-mix(in srgb,var(--mgc-loader-color,#4f46e5) 20%,transparent);animation:mgc-spin 2s linear infinite}',
    '.mgc-loader-orbit span{position:absolute;top:-6px;left:50%;margin-left:-5px;width:10px;height:10px;border-radius:50%;background:var(--mgc-loader-color,#4f46e5)}',
    '.mgc-loader-bars{display:flex;align-items:flex-end;gap:4px;height:44px}.mgc-loader-bars span{width:5px;height:100%;border-radius:2px;background:var(--mgc-loader-color,#4f46e5);animation:mgc-bars 1s ease-in-out infinite}',
    '.mgc-loader-wave{display:flex;align-items:center;gap:4px;height:44px}.mgc-loader-wave span{width:6px;height:12px;border-radius:4px;background:var(--mgc-loader-color,#4f46e5);animation:mgc-wave 1s ease-in-out infinite}',
    '.mgc-loader-grid{display:grid;grid-template-columns:repeat(3,12px);gap:4px}.mgc-loader-grid span{width:12px;height:12px;border-radius:2px;background:var(--mgc-loader-color,#4f46e5);animation:mgc-grid 1.3s ease-in-out infinite}',
    '.mgc-loader-bars span:nth-child(2),.mgc-loader-wave span:nth-child(2){animation-delay:.1s}.mgc-loader-bars span:nth-child(3),.mgc-loader-wave span:nth-child(3){animation-delay:.2s}',
    '.mgc-loader-bars span:nth-child(4),.mgc-loader-wave span:nth-child(4){animation-delay:.3s}.mgc-loader-bars span:nth-child(5),.mgc-loader-wave span:nth-child(5){animation-delay:.4s}',
    '.mgc-loader-grid span:nth-child(2),.mgc-loader-grid span:nth-child(4){animation-delay:.1s}.mgc-loader-grid span:nth-child(3),.mgc-loader-grid span:nth-child(5),.mgc-loader-grid span:nth-child(7){animation-delay:.2s}',
    '.mgc-loader-grid span:nth-child(6),.mgc-loader-grid span:nth-child(8){animation-delay:.3s}.mgc-loader-grid span:nth-child(9){animation-delay:.4s}',
    '.mgc-loader-dots{display:flex;gap:8px}.mgc-loader-dots span{width:12px;height:12px;border-radius:50%;background:var(--mgc-loader-color,#4f46e5);animation:mgc-dot 1.2s infinite ease-in-out both}',
    '.mgc-loader-dots span:nth-child(1){animation-delay:-.32s}.mgc-loader-dots span:nth-child(2){animation-delay:-.16s}',
    '.mgc-loader-bar{position:fixed;top:0;left:0;right:0;height:calc(3px * var(--mgc-loader-scale,1));z-index:2147482900;overflow:hidden;background:color-mix(in srgb,var(--mgc-loader-color,#4f46e5) 15%,transparent)}',
    '.mgc-loader-bar::before{content:"";position:absolute;top:0;bottom:0;background:var(--mgc-loader-color,#4f46e5);animation:mgc-bar 1.4s cubic-bezier(.65,.815,.735,.395) infinite}',
  ].join('\n');

  function repeat(n) {
    var out = [];
    for (var i = 0; i < n; i++) out.push(C.h('span'));
    return out;
  }

  /** The accent color is only ever used as a CSS variable, and only if it is a plain hex color. */
  function theme(el, cfg) {
    var color = /^#[0-9a-fA-F]{3,8}$/.test(cfg.color || '') ? cfg.color : '#4f46e5';
    el.style.setProperty('--mgc-loader-color', color);
    el.style.setProperty('--mgc-loader-scale', String(SCALES[cfg.size] || 1));
    return el;
  }

  function build(cfg) {
    if (cfg.loaderType === 'bar') return theme(C.h('div', { className: 'mgc-loader-bar' }), cfg);
    var inner;
    if (cfg.loaderType === 'custom-image') {
      inner = C.h('img', { attrs: { src: C.safeUrl(cfg.customImageUrl), alt: 'Loading' }, style: { 'max-width': '160px', 'max-height': '160px' } });
    } else if (cfg.loaderType === 'orbit') {
      inner = C.h('div', { className: 'mgc-loader-orbit' }, [C.h('span')]);
    } else if (COUNTS[cfg.loaderType]) {
      inner = C.h('div', { className: 'mgc-loader-' + cfg.loaderType }, repeat(COUNTS[cfg.loaderType]));
    } else if (cfg.loaderType === 'pulse' || cfg.loaderType === 'ring') {
      inner = C.h('div', { className: 'mgc-loader-' + cfg.loaderType });
    } else {
      inner = C.h('div', { className: 'mgc-loader-spinner' });
    }
    return theme(C.h('div', { className: 'mgc-loader-veil' }, [C.h('div', { className: 'mgc-loader-box' }, [inner])]), cfg);
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
