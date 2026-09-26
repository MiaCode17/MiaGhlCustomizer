/*
 * Customizer runtime core — shared injection library for every feature script.
 *
 * Served (with the feature scripts appended) by GET /cdn/<companyId>/customizer.js.
 * The BOOT placeholder below is replaced server-side with { companyId, apiBase, selectors }.
 *
 * Lifecycle: start() → read the GHL locationId from the URL → fetch the resolved
 * config for every feature from /api/v1/runtime/config → apply each enabled
 * feature. When SPA navigation moves to a different location, every feature is
 * torn down and re-applied with that location's config (its group may differ).
 *
 * Conventions every feature follows:
 *  - Every injected node carries data-mgc="<feature>" so it can be found,
 *    de-duplicated, and removed on teardown.
 *  - DOM work that depends on GHL's render timing goes through C.watch(), which
 *    combines a MutationObserver with an interval fallback and stores its handles
 *    on window.__mgc_<key>_observer / _interval so features never clobber each other.
 *  - User-provided text is only ever set via textContent, never innerHTML.
 */
(function () {
  'use strict';

  var BOOT = __MGC_BOOT__;

  var existing = window.__mgcCustomizer;
  if (existing) {
    if (existing.companyId !== BOOT.companyId) {
      console.warn('[customizer] already running for another company; ignoring script for', BOOT.companyId);
    }
    return;
  }

  var C = {
    companyId: BOOT.companyId,
    apiBase: BOOT.apiBase,
    sel: BOOT.selectors,
    features: {},
    active: {},
    config: null,
    locationId: null,
    started: false,
  };
  window.__mgcCustomizer = C;

  var DEBUG = false;
  try {
    DEBUG = window.localStorage.getItem('mgcDebug') === '1';
  } catch (e) {
    /* storage blocked */
  }

  C.log = function () {
    if (!DEBUG) return;
    var args = Array.prototype.slice.call(arguments);
    args.unshift('[customizer]');
    console.log.apply(console, args);
  };

  /* ------------------------------------------------------------------ DOM */

  function splitSelectors(list) {
    return String(list || '')
      .split(',')
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean);
  }

  /** First element matching the selector list, trying each alternative in priority order. */
  C.qs = function (list, root) {
    var parts = splitSelectors(list);
    for (var i = 0; i < parts.length; i++) {
      try {
        var el = (root || document).querySelector(parts[i]);
        if (el) return el;
      } catch (e) {
        /* invalid selector — skip */
      }
    }
    return null;
  };

  C.qsa = function (list, root) {
    try {
      return Array.prototype.slice.call((root || document).querySelectorAll(list));
    } catch (e) {
      return [];
    }
  };

  /**
   * Tiny element builder. props: { style, attrs, text, className, on: {event: fn} }.
   * Children may be nodes or strings (strings become text nodes).
   */
  C.h = function (tag, props, children) {
    var el = document.createElement(tag);
    props = props || {};
    if (props.className) el.className = props.className;
    if (props.text != null) el.textContent = String(props.text);
    if (props.style) {
      Object.keys(props.style).forEach(function (k) {
        var v = props.style[k];
        if (v !== undefined && v !== null && v !== '') el.style.setProperty(k, String(v));
      });
    }
    if (props.attrs) {
      Object.keys(props.attrs).forEach(function (k) {
        var v = props.attrs[k];
        if (v !== undefined && v !== null && v !== false) el.setAttribute(k, v === true ? '' : String(v));
      });
    }
    if (props.on) {
      Object.keys(props.on).forEach(function (k) {
        el.addEventListener(k, props.on[k]);
      });
    }
    (children || []).forEach(function (child) {
      if (child == null || child === false) return;
      el.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    });
    return el;
  };

  C.mark = function (el, feature) {
    el.setAttribute('data-mgc', feature);
    return el;
  };

  C.removeMarked = function (feature) {
    C.qsa('[data-mgc="' + feature + '"]').forEach(function (el) {
      if (el.parentNode) el.parentNode.removeChild(el);
    });
  };

  /** Upserts a <style> owned by `feature`. Preferred over inline styles: survives GHL re-renders. */
  C.style = function (feature, css, key) {
    var id = 'mgc-style-' + (key || feature);
    var el = document.getElementById(id);
    if (!el) {
      el = C.mark(C.h('style', { attrs: { id: id } }), feature);
      (document.head || document.documentElement).appendChild(el);
    }
    if (el.textContent !== css) el.textContent = css;
    return el;
  };

  C.stylesheet = function (feature, href, key) {
    var id = 'mgc-link-' + (key || feature);
    if (document.getElementById(id)) return;
    (document.head || document.documentElement).appendChild(
      C.mark(C.h('link', { attrs: { id: id, rel: 'stylesheet', href: href } }), feature),
    );
  };

  /** Only http(s), relative, mailto: and tel: URLs are allowed through — never javascript:. */
  C.safeUrl = function (url) {
    var u = String(url || '').trim();
    if (!u) return '';
    if (/^(https?:|mailto:|tel:)/i.test(u) || /^[/#?.]/.test(u)) return u;
    if (/^[a-z][a-z0-9+.-]*:/i.test(u)) return '';
    return 'https://' + u;
  };

  C.isImageUrl = function (value) {
    return /^(https?:\/\/|\/|data:image\/)/i.test(String(value || '').trim());
  };

  /** Renders an icon value: an image URL becomes <img>, anything else (emoji/text) a <span>. */
  C.icon = function (value, size) {
    var v = String(value || '').trim();
    if (!v) return null;
    size = size || 16;
    if (C.isImageUrl(v)) {
      return C.h('img', {
        attrs: { src: C.safeUrl(v), alt: '' },
        style: { width: size + 'px', height: size + 'px', 'object-fit': 'contain', display: 'inline-block' },
      });
    }
    return C.h('span', { text: v, style: { 'font-size': size + 'px', 'line-height': '1' } });
  };

  /* ------------------------------------------------------------ watching */

  /**
   * Runs `fn` now, again whenever the DOM changes (throttled to one animation
   * frame), and on an interval as a fallback for SPA subtree swaps the observer
   * can miss. `fn` must be idempotent: check for its data-mgc marker before
   * injecting. Returns a stop function.
   */
  C.watch = function (key, fn, intervalMs) {
    var handle = '__mgc_' + key.replace(/[^a-z0-9]/gi, '_');
    C.unwatch(key);

    var scheduled = false;
    var failed = false;
    function run() {
      scheduled = false;
      try {
        fn();
      } catch (e) {
        if (!failed) console.error('[customizer] ' + key + ' failed', e);
        failed = true;
      }
    }
    function schedule() {
      if (scheduled) return;
      scheduled = true;
      (window.requestAnimationFrame || setTimeout)(run);
    }

    var observer = new MutationObserver(schedule);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window[handle + '_observer'] = observer;
    window[handle + '_interval'] = setInterval(run, intervalMs || 700);
    run();

    return function () {
      C.unwatch(key);
    };
  };

  C.unwatch = function (key) {
    var handle = '__mgc_' + key.replace(/[^a-z0-9]/gi, '_');
    if (window[handle + '_observer']) window[handle + '_observer'].disconnect();
    if (window[handle + '_interval']) clearInterval(window[handle + '_interval']);
    window[handle + '_observer'] = null;
    window[handle + '_interval'] = null;
  };

  /* -------------------------------------------------------------- routing */

  var routeListeners = [];
  var lastPath = location.pathname + location.search;

  function emitRoute() {
    var path = location.pathname + location.search;
    if (path === lastPath) return;
    lastPath = path;
    routeListeners.slice().forEach(function (fn) {
      try {
        fn(location.pathname);
      } catch (e) {
        console.error('[customizer] route listener failed', e);
      }
    });
  }

  ['pushState', 'replaceState'].forEach(function (method) {
    var original = history[method];
    history[method] = function () {
      var result = original.apply(this, arguments);
      setTimeout(emitRoute, 0);
      return result;
    };
  });
  window.addEventListener('popstate', emitRoute);
  // GHL occasionally swaps routes without touching history (e.g. iframe-driven views).
  setInterval(emitRoute, 1000);

  /** Subscribes to SPA route changes. Returns an unsubscribe function. */
  C.onRoute = function (fn) {
    routeListeners.push(fn);
    return function () {
      routeListeners = routeListeners.filter(function (f) {
        return f !== fn;
      });
    };
  };

  C.path = function () {
    return location.pathname;
  };

  C.locationIdFromUrl = function () {
    var m = location.pathname.match(/\/location\/([^/?#]+)/);
    return m ? m[1] : '';
  };

  C.isLoginPage = function () {
    return !!C.qs(C.sel.loginRoot);
  };

  /** The viewer's GHL role, if an SSO handshake exposed it. Null means unknown. */
  C.userRole = function () {
    return window.__customizerUserRole || null;
  };

  /* --------------------------------------------------------------- events */

  var bus = {};
  C.on = function (event, fn) {
    (bus[event] = bus[event] || []).push(fn);
    return function () {
      bus[event] = (bus[event] || []).filter(function (f) {
        return f !== fn;
      });
    };
  };
  C.emit = function (event, payload) {
    (bus[event] || []).slice().forEach(function (fn) {
      fn(payload);
    });
  };
  C.hasListeners = function (event) {
    return (bus[event] || []).length > 0;
  };

  /* -------------------------------------------------------- session flags */

  /** True the first time it is called for `key` in this browser session. */
  C.once = function (key) {
    var k = 'mgc:' + C.companyId + ':' + key;
    try {
      if (window.sessionStorage.getItem(k)) return false;
      window.sessionStorage.setItem(k, '1');
    } catch (e) {
      /* storage blocked — show every time rather than never */
    }
    return true;
  };

  C.dismissed = function (key) {
    try {
      return window.sessionStorage.getItem('mgc:' + C.companyId + ':dismiss:' + key) === '1';
    } catch (e) {
      return false;
    }
  };
  C.dismiss = function (key) {
    try {
      window.sessionStorage.setItem('mgc:' + C.companyId + ':dismiss:' + key, '1');
    } catch (e) {
      /* ignore */
    }
  };

  /* ------------------------------------------------------ shared widgets */

  var SHADOWS = {
    none: 'none',
    sm: '0 1px 3px rgba(0,0,0,0.14)',
    md: '0 6px 16px rgba(0,0,0,0.18)',
    lg: '0 14px 32px rgba(0,0,0,0.24)',
  };
  C.shadow = function (key) {
    return SHADOWS[key] || SHADOWS.none;
  };

  var BASE_CSS = [
    '@keyframes mgc-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}',
    '@keyframes mgc-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}',
    '@keyframes mgc-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}',
    '@keyframes mgc-fade-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
    '.mgc-anim-pulse{animation:mgc-pulse 1.8s ease-in-out infinite}',
    '.mgc-anim-bounce{animation:mgc-bounce 1.4s ease-in-out infinite}',
    '.mgc-anim-shimmer{background-image:linear-gradient(110deg,transparent 30%,rgba(255,255,255,.45) 50%,transparent 70%)!important;background-size:200% 100%!important;animation:mgc-shimmer 2.2s linear infinite}',
    '.mgc-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;font:inherit;font-weight:500;white-space:nowrap;text-decoration:none;box-sizing:border-box;transition:filter .15s ease,transform .15s ease}',
    '.mgc-btn:hover{filter:brightness(1.07)}',
    '.mgc-btn:active{transform:translateY(1px)}',
    '.mgc-overlay{position:fixed;inset:0;z-index:2147483000;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;animation:mgc-fade-in .18s ease}',
  ].join('\n');

  var BUTTON_SIZES = {
    small: { height: '24px', padding: '0 8px', 'font-size': '12px' },
    middle: { height: '32px', padding: '0 14px', 'font-size': '14px' },
    large: { height: '40px', padding: '0 18px', 'font-size': '16px' },
  };

  /**
   * Builds a styled button from the shared button config shape (InjectedButton):
   * style variant, size, colors, border, radius, shadow, animation, icon, tooltip.
   */
  C.button = function (cfg, feature, onClick) {
    var variant = cfg.style || 'default';
    var base =
      variant === 'primary'
        ? { bg: '#4f46e5', color: '#ffffff', border: '#4f46e5', borderStyle: 'solid' }
        : variant === 'dashed'
          ? { bg: '#ffffff', color: '#1f2937', border: '#cbd5e1', borderStyle: 'dashed' }
          : variant === 'text'
            ? { bg: 'transparent', color: '#1f2937', border: 'transparent', borderStyle: 'solid' }
            : { bg: '#ffffff', color: '#1f2937', border: '#d9d9d9', borderStyle: 'solid' };

    var style = Object.assign({}, BUTTON_SIZES[cfg.size] || BUTTON_SIZES.middle, {
      background: cfg.backgroundColor || base.bg,
      color: cfg.textColor || base.color,
      'border-color': cfg.borderColor || base.border,
      'border-style': base.borderStyle,
      'border-width': (cfg.borderWidth != null ? cfg.borderWidth : variant === 'text' ? 0 : 1) + 'px',
      'border-radius': (cfg.borderRadius != null ? cfg.borderRadius : 8) + 'px',
      'box-shadow': C.shadow(cfg.shadow),
      width: cfg.fullWidth ? '100%' : '',
    });

    var icon = C.icon(cfg.icon, 16);
    var label = cfg.label ? C.h('span', { text: cfg.label }) : null;
    var children = cfg.iconPosition === 'right' ? [label, icon] : [icon, label];
    var anim = cfg.animation && cfg.animation !== 'none' ? ' mgc-anim-' + cfg.animation : '';

    var btn = C.h(
      'button',
      {
        className: 'mgc-btn' + anim,
        style: style,
        attrs: { type: 'button', title: cfg.tooltip || null, 'aria-label': cfg.label || cfg.tooltip || null },
        on: { click: onClick },
      },
      children,
    );
    return feature ? C.mark(btn, feature) : btn;
  };

  /** A native (non-injected) GHL sidebar link, used as a styling template. */
  C.nativeNavLink = function () {
    return (
      C.qsa(C.sel.sidebarLink).filter(function (a) {
        return !a.closest('[data-mgc]');
      })[0] || null
    );
  };

  /**
   * Builds a sidebar link that borrows the classes of GHL's own links so it
   * matches the portal's look. opts: { label, icon, href, onClick, indent, title }.
   */
  C.navLink = function (opts) {
    var native = C.nativeNavLink();
    var nativeLabel = native ? C.qs(C.sel.sidebarLinkLabel, native) : null;
    var className = native
      ? native.className.replace(/(^|\s)(active|router-link-active|router-link-exact-active)(?=\s|$)/g, ' ').trim()
      : '';

    var icon = C.icon(opts.icon, 18) || C.h('span', { style: { width: '18px', display: 'inline-block' } });
    var label = C.h('span', { text: opts.label, className: nativeLabel ? nativeLabel.className : '' });

    var a = C.h(
      'a',
      {
        className: className,
        attrs: { href: C.safeUrl(opts.href) || '#', title: opts.title || opts.label },
        style: native
          ? { 'padding-left': opts.indent ? '28px' : '' }
          : {
              display: 'flex',
              'align-items': 'center',
              gap: '10px',
              padding: '8px 12px',
              'padding-left': opts.indent ? '28px' : '12px',
              color: 'inherit',
              'text-decoration': 'none',
              cursor: 'pointer',
            },
        on: {
          click: function (e) {
            if (!opts.onClick) return;
            e.preventDefault();
            opts.onClick(e);
          },
        },
      },
      [icon, label],
    );
    return a;
  };

  /** Full-screen iframe modal, closed by the ✕, a backdrop click, or Escape. */
  C.modal = function (url, title) {
    var safe = C.safeUrl(url);
    if (!safe) return;
    C.removeMarked('modal');

    function close() {
      document.removeEventListener('keydown', onKey);
      C.removeMarked('modal');
    }
    function onKey(e) {
      if (e.key === 'Escape') close();
    }
    document.addEventListener('keydown', onKey);

    var frame = C.h('iframe', {
      attrs: { src: safe, title: title || 'Customizer', allow: 'clipboard-write; fullscreen' },
      style: { border: '0', width: '100%', flex: '1', background: '#fff' },
    });
    var panel = C.h(
      'div',
      {
        style: {
          width: 'min(1100px, 94vw)',
          height: 'min(760px, 90vh)',
          background: '#fff',
          'border-radius': '14px',
          overflow: 'hidden',
          display: 'flex',
          'flex-direction': 'column',
          'box-shadow': '0 24px 60px rgba(0,0,0,.35)',
        },
        on: {
          click: function (e) {
            e.stopPropagation();
          },
        },
      },
      [
        C.h(
          'div',
          {
            style: {
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'space-between',
              padding: '10px 14px',
              'border-bottom': '1px solid #e5e7eb',
              font: '600 14px/1.4 system-ui, sans-serif',
              color: '#111827',
            },
          },
          [
            C.h('span', { text: title || '' }),
            C.h('button', {
              text: '✕',
              attrs: { type: 'button', 'aria-label': 'Close' },
              style: { border: '0', background: 'transparent', cursor: 'pointer', 'font-size': '16px', color: '#6b7280' },
              on: { click: close },
            }),
          ],
        ),
        frame,
      ],
    );
    document.body.appendChild(C.mark(C.h('div', { className: 'mgc-overlay', on: { click: close } }, [panel]), 'modal'));
  };

  /**
   * Opens a URL the way a customizer link asked for. Relative links stay in the
   * GHL tab; absolute links default to a new tab.
   */
  C.open = function (url, mode, title) {
    var safe = C.safeUrl(url);
    if (!safe) return;
    if (!mode) mode = /^[/#?.]/.test(safe) ? 'same-tab' : 'new-tab';
    if (mode === 'modal') return C.modal(safe, title);
    if (mode === 'same-tab') {
      window.location.href = safe;
      return;
    }
    window.open(safe, '_blank', 'noopener');
  };

  /* ----------------------------------------------------- feature registry */

  /**
   * Registers a feature. def = { apply(cfg, C) → optional cleanup fn, standalone? }.
   * `standalone` features need no JSON config (e.g. login, which links a stylesheet).
   */
  C.register = function (name, def) {
    C.features[name] = def;
    if (C.config) applyFeature(name);
  };

  function applyFeature(name) {
    var def = C.features[name];
    if (!def || C.active[name]) return;
    var cfg = def.standalone ? { enabled: true } : C.config && C.config[name];
    if (!cfg || !cfg.enabled) return;
    try {
      var cleanup = def.apply(cfg, C);
      C.active[name] = typeof cleanup === 'function' ? cleanup : function () {};
      C.log('applied', name, cfg);
    } catch (e) {
      console.error('[customizer] failed to apply ' + name, e);
    }
  }

  function teardownFeature(name) {
    var cleanup = C.active[name];
    if (!cleanup) return;
    try {
      cleanup();
    } catch (e) {
      console.error('[customizer] failed to tear down ' + name, e);
    }
    delete C.active[name];
    C.unwatch(name);
    C.removeMarked(name);
  }

  function applyAll() {
    Object.keys(C.features).forEach(applyFeature);
  }

  function teardownAll() {
    Object.keys(C.active).forEach(teardownFeature);
    C.removeMarked('modal');
  }

  /* ------------------------------------------------------------ bootstrap */

  var requestSeq = 0;

  function load() {
    var seq = ++requestSeq;
    var url =
      C.apiBase +
      '/api/v1/runtime/config?company_id=' +
      encodeURIComponent(C.companyId) +
      (C.locationId ? '&locationId=' + encodeURIComponent(C.locationId) : '');

    fetch(url, { credentials: 'omit' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        if (seq !== requestSeq) return; // a newer location's request superseded this one
        teardownAll();
        C.config = data.features || {};
        C.groupId = data.groupId || '';
        C.log('config for location', C.locationId || '(none)', 'group', C.groupId || '(global)', C.config);
        applyAll();
      })
      .catch(function (e) {
        console.warn('[customizer] could not load config', e);
      });
  }

  function syncLocation() {
    var locationId = C.locationIdFromUrl();
    if (locationId === C.locationId) return;
    C.locationId = locationId;
    load();
  }

  C.start = function () {
    if (C.started) return;
    C.started = true;
    C.style('core', BASE_CSS);
    C.locationId = C.locationIdFromUrl();
    C.onRoute(syncLocation);
    load();
  };

  /** Re-fetches config and re-applies everything (handy from the console after saving). */
  C.reload = function () {
    load();
  };
})();
