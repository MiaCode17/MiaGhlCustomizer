/*
 * Hero banners: large banners on the GHL dashboard, above or below its content. A banner is one
 * panel, or a slider of several; each panel can have an icon, a picture, a title, a subtitle, text
 * and a button. Visitors can close a banner (it stays closed until the agency edits it).
 * Config: { items: [{ id, kind, position, slides[], slider{}, sizeMode, height, widthPercent,
 *           borderRadius, marginTop, marginBottom, padY, padX, mobilePadX, titleSize, subtitleSize,
 *           descriptionSize, animation, closable, version }] }.
 */
(function (C) {
  if (!C) return;

  var FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
  var COLOR = /^#[0-9a-fA-F]{3,8}$/;

  function color(value, fallback) {
    return COLOR.test(value || '') ? value : fallback;
  }

  function background(bg) {
    bg = bg || {};
    var c1 = color(bg.color, '#667eea');
    if (bg.type === 'solid') return c1;
    var angle = Math.max(0, Math.min(360, Number(bg.angle) || 135));
    return 'linear-gradient(' + angle + 'deg, ' + c1 + ' 0%, ' + color(bg.color2, '#764ba2') + ' 100%)';
  }

  function isMobile() {
    return window.innerWidth <= 768;
  }

  function icon(slide) {
    var ic = slide.icon || {};
    if (ic.type === 'emoji' && ic.value) {
      return C.h('div', { text: ic.value, attrs: { 'aria-hidden': 'true' }, style: { 'font-size': '56px', 'line-height': '1', 'flex-shrink': '0' } });
    }
    if (ic.type === 'image') {
      var src = C.safeUrl(ic.value);
      if (src) return C.h('img', { attrs: { src: src, alt: '' }, style: { width: '72px', height: '72px', 'object-fit': 'contain', 'flex-shrink': '0' } });
    }
    return null;
  }

  function cta(slide, textColor) {
    if (!slide.ctaText || !slide.ctaUrl) return null;
    return C.h('button', {
      text: slide.ctaText,
      className: 'mgc-btn',
      attrs: { type: 'button' },
      style: {
        'align-self': 'flex-start',
        padding: '12px 26px',
        'border-radius': '999px',
        border: '2px solid ' + textColor,
        background: 'rgba(255,255,255,.16)',
        color: textColor,
        font: '600 15px/1 ' + FONT,
        cursor: 'pointer',
      },
      on: {
        click: function () {
          C.open(slide.ctaUrl, slide.ctaOpenIn === 'same' ? 'same-tab' : 'new-tab');
        },
      },
    });
  }

  /** One panel of a banner. */
  function panel(item, slide) {
    var text = color(slide.textColor, '#ffffff');
    var pad = item.padY + 'px ' + (isMobile() ? item.mobilePadX : item.padX) + 'px';
    var minHeight = (item.sizeMode === 'custom' ? item.height : 280) + 'px';

    var kids = [];
    var bgSrc = C.safeUrl(slide.backgroundImage);
    if (bgSrc) {
      kids.push(
        C.h('div', {
          attrs: { 'aria-hidden': 'true' },
          style: { position: 'absolute', inset: '0', 'background-image': 'url("' + bgSrc.replace(/["\\\n\r]/g, '') + '")', 'background-size': 'cover', 'background-position': 'center', opacity: '.15', 'z-index': '1' },
        }),
      );
    }
    kids.push(
      C.h('div', {
        attrs: { 'aria-hidden': 'true' },
        style: { position: 'absolute', inset: '0', 'background-image': 'radial-gradient(circle at 2px 2px, rgba(255,255,255,.15) 1px, transparent 0)', 'background-size': '40px 40px', opacity: '.4', 'pointer-events': 'none', 'z-index': '2' },
      }),
    );

    var textBlock = C.h(
      'div',
      { style: { flex: '1 1 240px', 'min-width': '0', display: 'flex', 'flex-direction': 'column', gap: '16px' } },
      [
        slide.title ? C.h('h2', { text: slide.title, style: { margin: '0', 'font-size': item.titleSize + 'px', 'font-weight': '800', 'line-height': '1.2', color: text, 'overflow-wrap': 'anywhere' } }) : null,
        slide.subtitle ? C.h('h3', { text: slide.subtitle, style: { margin: '0', 'font-size': item.subtitleSize + 'px', 'font-weight': '600', color: text, opacity: '.95', 'overflow-wrap': 'anywhere' } }) : null,
        slide.description ? C.h('p', { text: slide.description, style: { margin: '0', 'font-size': item.descriptionSize + 'px', color: text, opacity: '.9', 'line-height': '1.7', 'max-width': '600px', 'overflow-wrap': 'anywhere', 'white-space': 'pre-line' } }) : null,
        cta(slide, text),
      ],
    );

    var imgSrc = C.safeUrl(slide.image);
    var picture = imgSrc
      ? C.h('div', { style: { 'flex-shrink': '0', width: 'min(320px, 100%)', 'border-radius': '16px', overflow: 'hidden', 'box-shadow': '0 10px 40px rgba(0,0,0,.2)' } }, [
          C.h('img', { attrs: { src: imgSrc, alt: slide.imageAlt || '' }, style: { display: 'block', width: '100%', height: '100%', 'min-height': '160px', 'object-fit': 'cover' } }),
        ])
      : null;
    var ic = picture ? null : icon(slide);
    var iconPos = (slide.icon && slide.icon.position) || 'left';

    var parts;
    if (picture) parts = slide.imagePosition === 'left' ? [picture, textBlock] : [textBlock, picture];
    else if (ic) parts = iconPos === 'right' || iconPos === 'bottom' ? [textBlock, ic] : [ic, textBlock];
    else parts = [textBlock];

    kids.push(
      C.h(
        'div',
        {
          style: {
            position: 'relative',
            'z-index': '3',
            display: 'flex',
            'flex-wrap': 'wrap',
            'flex-direction': ic && (iconPos === 'top' || iconPos === 'bottom') ? 'column' : 'row',
            'box-sizing': 'border-box',
            'align-items': ic && (iconPos === 'top' || iconPos === 'bottom') ? 'flex-start' : 'center',
            gap: '32px',
            padding: pad,
            'min-height': minHeight,
            color: text,
          },
        },
        parts,
      ),
    );

    return C.h(
      'div',
      { attrs: { 'data-mgc-hero-panel': '' }, style: { position: 'relative', 'box-sizing': 'border-box', width: '100%', 'min-height': minHeight, background: background(slide.background), color: text, overflow: 'hidden' } },
      kids,
    );
  }

  function navButton(label, aria, onClick, style) {
    return C.h('button', {
      text: label,
      attrs: { type: 'button', 'aria-label': aria },
      style: Object.assign(
        { width: '38px', height: '38px', 'border-radius': '50%', border: '0', background: 'rgba(255,255,255,.28)', color: '#fff', 'font-size': '22px', 'line-height': '1', cursor: 'pointer', 'z-index': '5', 'backdrop-filter': 'blur(6px)' },
        style || {},
      ),
      on: { click: onClick },
    });
  }

  /** A slider of panels. Returns { el, stop }. */
  function slider(item) {
    var opts = item.slider || {};
    var slides = item.slides;
    var fade = opts.transition === 'fade';
    var ms = Math.max(100, Number(opts.transitionMs) || 500);
    var index = 0;
    var timer = null;
    var hovering = false;

    var panels = slides.map(function (s) {
      var p = panel(item, s);
      if (fade) Object.assign(p.style, { position: 'absolute', inset: '0', opacity: '0', transition: 'opacity ' + ms + 'ms ease', 'pointer-events': 'none' });
      else p.style.flex = '0 0 100%';
      return p;
    });
    var track = C.h('div', { style: fade ? { position: 'relative' } : { display: 'flex', transition: 'transform ' + ms + 'ms ease' } }, panels);
    var viewport = C.h('div', { style: { overflow: 'hidden', position: 'relative' } }, [track]);
    var dots = [];

    function show(i) {
      var last = slides.length - 1;
      if (i > last) i = opts.loop === false ? last : 0;
      if (i < 0) i = opts.loop === false ? 0 : last;
      index = i;
      if (fade) {
        panels.forEach(function (p, n) {
          p.style.opacity = n === i ? '1' : '0';
          p.style.pointerEvents = n === i ? 'auto' : 'none';
          p.setAttribute('aria-hidden', n === i ? 'false' : 'true');
        });
        // The tallest panel keeps the viewport from collapsing, since faded panels are stacked.
        var tallest = 0;
        panels.forEach(function (p) {
          tallest = Math.max(tallest, p.firstChild ? p.scrollHeight : 0);
        });
        track.style.minHeight = Math.max(tallest, item.sizeMode === 'custom' ? item.height : 280) + 'px';
      } else {
        track.style.transform = 'translateX(-' + i * 100 + '%)';
        panels.forEach(function (p, n) {
          p.setAttribute('aria-hidden', n === i ? 'false' : 'true');
        });
      }
      dots.forEach(function (d, n) {
        d.style.background = n === i ? '#fff' : 'rgba(255,255,255,.45)';
        d.style.width = n === i ? '22px' : '8px';
      });
    }

    function restart() {
      if (timer) clearInterval(timer);
      timer = null;
      if (opts.autoSlide === false || slides.length < 2) return;
      timer = setInterval(function () {
        if (hovering && opts.pauseOnHover !== false) return;
        if (opts.loop === false && index === slides.length - 1) return;
        show(index + 1);
      }, Math.max(1500, Number(opts.intervalMs) || 5000));
    }

    var wrap = C.h('div', { attrs: { 'aria-roledescription': 'carousel' }, style: { position: 'relative' } }, [viewport]);

    if (slides.length > 1 && opts.showControls !== false) {
      var prev = navButton('‹', 'Previous', function () { show(index - 1); restart(); });
      var next = navButton('›', 'Next', function () { show(index + 1); restart(); });
      slides.forEach(function (_s, n) {
        dots.push(
          C.h('button', {
            attrs: { type: 'button', 'aria-label': 'Go to slide ' + (n + 1) },
            style: { height: '8px', width: '8px', 'border-radius': '999px', border: '0', padding: '0', cursor: 'pointer', transition: 'all .3s ease' },
            on: { click: function () { show(n); restart(); } },
          }),
        );
      });
      var dotRow = C.h('div', { style: { display: 'flex', gap: '6px', 'align-items': 'center' } }, dots);
      var pos = opts.controlsPosition || 'bottom';
      if (pos === 'sides') {
        Object.assign(prev.style, { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' });
        Object.assign(next.style, { position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' });
        Object.assign(dotRow.style, { position: 'absolute', left: '50%', bottom: '14px', transform: 'translateX(-50%)', 'z-index': '5' });
        wrap.appendChild(prev);
        wrap.appendChild(next);
        wrap.appendChild(dotRow);
      } else {
        var bar = C.h('div', { style: { position: 'absolute', left: '0', right: '0', display: 'flex', 'justify-content': 'center', 'align-items': 'center', gap: '14px', 'z-index': '5', top: pos === 'top' ? '12px' : '', bottom: pos === 'bottom' ? '12px' : '' } }, [prev, dotRow, next]);
        wrap.appendChild(bar);
      }
    }

    wrap.addEventListener('mouseenter', function () { hovering = true; });
    wrap.addEventListener('mouseleave', function () { hovering = false; });
    show(0);
    restart();

    return {
      el: wrap,
      stop: function () {
        if (timer) clearInterval(timer);
        timer = null;
      },
    };
  }

  function banner(item, onClose) {
    var key = item.id + ':' + item.version;
    var body = null;
    var stop = function () {};
    if (item.kind === 'slider' && item.slides.length > 1) {
      var s = slider(item);
      body = s.el;
      stop = s.stop;
    } else {
      body = panel(item, item.slides[0]);
    }

    var radius = item.borderRadius + 'px';
    var width = item.sizeMode === 'custom' ? item.widthPercent + '%' : '100%';
    var root = C.h(
      'div',
      {
        attrs: { 'data-mgc-hero': item.id, role: 'region', 'aria-label': 'Announcement' },
        style: {
          position: 'relative',
          'box-sizing': 'border-box',
          width: width,
          'max-width': '100%',
          margin: item.marginTop + 'px ' + (item.sizeMode === 'custom' ? 'auto' : '0') + ' ' + item.marginBottom + 'px',
          'border-radius': radius,
          overflow: 'hidden',
          'box-shadow': '0 20px 60px rgba(0,0,0,.15), 0 8px 25px rgba(0,0,0,.1)',
          'font-family': FONT,
        },
      },
      [body],
    );

    C.mark(root, 'hero-banners');
    if (item.closable) {
      root.appendChild(
        C.h('button', {
          text: '×',
          attrs: { type: 'button', 'aria-label': 'Close' },
          style: { position: 'absolute', top: '16px', right: '16px', width: '36px', height: '36px', 'border-radius': '50%', border: '0', background: 'rgba(255,255,255,.22)', color: '#fff', 'font-size': '26px', 'line-height': '1', cursor: 'pointer', 'z-index': '10', 'backdrop-filter': 'blur(8px)' },
          on: {
            click: function () {
              C.dismiss('hero:' + key);
              stop();
              root.style.transition = 'opacity .35s ease, transform .35s ease';
              root.style.opacity = '0';
              root.style.transform = 'translateY(-16px)';
              setTimeout(function () {
                if (root.parentNode) root.parentNode.removeChild(root);
                onClose();
              }, 350);
            },
          },
        }),
      );
    }

    if (item.animation !== 'none') {
      root.style.transition = 'opacity .35s ease, transform .35s ease';
      root.style.opacity = '0';
      if (item.animation === 'slide') root.style.transform = 'translateY(-20px)';
      setTimeout(function () {
        root.style.opacity = '1';
        root.style.transform = 'translateY(0)';
      }, 20);
    }
    return { el: root, stop: stop };
  }

  C.register('hero-banners', {
    apply: function (cfg) {
      var items = cfg.items || [];
      var live = {};

      function stopAll() {
        Object.keys(live).forEach(function (id) {
          live[id].stop();
          if (live[id].el.parentNode) live[id].el.parentNode.removeChild(live[id].el);
        });
        live = {};
      }

      C.watch('hero-banners', function () {
        var root = C.qs(C.sel.dashboardRoot);
        var main = C.qs(C.sel.dashboardMain);
        if (!root || !main || !main.children[0]) {
          if (Object.keys(live).length) stopAll();
          return;
        }
        var anchor = null;
        items.forEach(function (item) {
          if (C.dismissed('hero:' + item.id + ':' + item.version)) return;
          var existing = live[item.id];
          if (existing && existing.el.isConnected) return;
          if (existing) existing.stop();
          var made = banner(item, function () { delete live[item.id]; });
          live[item.id] = made;
          // Siblings of GHL's first block, not inside it, so the banner scrolls with the page.
          if (item.position === 'bottom') main.appendChild(made.el);
          else {
            anchor = anchor || Array.prototype.find.call(main.children, function (c) { return !c.hasAttribute('data-mgc-hero'); });
            main.insertBefore(made.el, anchor || main.firstChild);
          }
        });
      });

      return function () {
        stopAll();
        C.removeMarked('hero-banners');
        Array.prototype.forEach.call(document.querySelectorAll('[data-mgc-hero]'), function (n) {
          if (n.parentNode) n.parentNode.removeChild(n);
        });
      };
    },
  });
})(window.__mgcCustomizer);
