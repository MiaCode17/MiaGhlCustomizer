/*
 * Special (occasional) theme: a one-per-session announcement popup and a
 * falling-particle effect keyed to the occasion (Christmas, Halloween, ...).
 * Both re-appear when the admin saves a new version of the campaign.
 * Config: { themeKey, popup: {visible,title,message,ctaText,ctaUrl},
 *           particleEffect: {enabled,durationSeconds}, version }.
 */
(function (C) {
  if (!C) return;

  var OCCASIONS = {
    christmas: { particles: ['❄','❅','❆'], accent: ['#1b4332','#d90429'] },
    halloween: { particles: ['🦇','👻','🕸️'], accent: ['#ff7b00','#240046'] },
    'new-year': { particles: ['🎉','✨','🎊'], accent: ['#ffd60a','#000814'] },
    valentines: { particles: ['💕','❤️','💗'], accent: ['#ff8fa3','#c9184a'] },
    easter: { particles: ['🥚','🌷','🐰'], accent: ['#f9c7e2','#fdf3a7'] },
    diwali: { particles: ['🪔','✨','🎆'], accent: ['#6b1e8e','#f4a022'] },
    thanksgiving: { particles: ['🍁','🍂','🌰'], accent: ['#7f4f24','#d4a373'] },
    'st-patricks-day': { particles: ['🍀','☘️','🌈'], accent: ['#1a5e1a','#7bc67e'] },
    'spring-bloom': { particles: ['🌸','🌷','🦋'], accent: ['#2e7d32','#f7b6cf'] },
    summer: { particles: ['☀️','🌊','🍹'], accent: ['#00b4d8','#ffb703'] },
    'black-friday': { particles: ['🔥','💥','🏷️'], accent: ['#000000','#7a1f2b'] },
    'independence-day': { particles: ['🎆','⭐','🎇'], accent: ['#b22234','#3c3b6e'] },
    hanukkah: { particles: ['🕯️','✡️','✨'], accent: ['#003f8a','#c0c0c0'] },
    'autumn-harvest': { particles: ['🍂','🍁','🌰'], accent: ['#3e1a00','#e07b39'] },
    'winter-wonderland': { particles: ['❄','❅','⛄'], accent: ['#1a2a4a','#5b8ecb'] },
    ramadan: { particles: ['🌙','⭐','🏮'], accent: ['#0a2540','#d4af37'] },
    'eid-al-fitr': { particles: ['🌙','✨','🕌'], accent: ['#0b3d2e','#d4af37'] },
    holi: { particles: ['🎨','💦','🌈'], accent: ['#ff006e','#ffbe0b'] },
    navratri: { particles: ['🪘','✨','🔥'], accent: ['#4a0404','#f5a623'] },
    vaisakhi: { particles: ['🌾','☀️','✨'], accent: ['#7a2e00','#ff9933'] },
    vesak: { particles: ['🪷','🕯️','✨'], accent: ['#5c3d00','#f4c95d'] },
    'rosh-hashanah': { particles: ['🍯','✡️','🍎'], accent: ['#0a2a4d','#e8b84b'] },
    'good-friday': { particles: ['✝️','🕊️','✨'], accent: ['#2b1a3d','#7d5ba6'] },
    'eid-al-adha': { particles: ['🐑','🌙','✨'], accent: ['#1b3a2f','#c9a227'] },
    'yom-kippur': { particles: ['🕊️','✡️','🕯️'], accent: ['#0d2436','#a8c5d6'] },
    passover: { particles: ['🫓','✡️','🍷'], accent: ['#0a2a4d','#8b1a3d'] },
    'guru-nanak-jayanti': { particles: ['🙏','🕯️','✨'], accent: ['#0d3b66','#ff9f1c'] },
    'maha-shivaratri': { particles: ['🔱','🕉️','✨'], accent: ['#0a1f33','#4fc3d9'] },
    'raksha-bandhan': { particles: ['🎗️','💛','✨'], accent: ['#7a1030','#f5c451'] },
    'bodhi-day': { particles: ['🌳','🍃','✨'], accent: ['#0d2b1a','#8bc34a'] },
    'mawlid-al-nabi': { particles: ['🌟','🕌','✨'], accent: ['#0a3d24','#e8c468'] },
    'palm-sunday': { particles: ['🌿','🕊️','✨'], accent: ['#1b4d3e','#a8d5ba'] },
  };
  var FALLBACK = { particles: ['✨'], accent: ['#4f46e5', '#7c3aed'] };

  var CSS = [
    '@keyframes mgc-fall{0%{transform:translate3d(0,-10vh,0) rotate(0)}100%{transform:translate3d(var(--mgc-drift),110vh,0) rotate(360deg)}}',
    '.mgc-particle{position:fixed;top:0;z-index:2147482000;pointer-events:none;user-select:none;animation:mgc-fall linear forwards}',
  ].join('\n');

  function particles(occasion, seconds) {
    var layer = C.mark(C.h('div', { attrs: { 'aria-hidden': 'true' } }), 'special-theme');
    var count = 36;
    for (var i = 0; i < count; i++) {
      var glyph = occasion.particles[i % occasion.particles.length];
      var duration = 4 + Math.random() * 5;
      layer.appendChild(
        C.h('span', {
          className: 'mgc-particle',
          text: glyph,
          style: {
            left: Math.random() * 100 + 'vw',
            'font-size': 14 + Math.random() * 16 + 'px',
            opacity: String(0.6 + Math.random() * 0.4),
            'animation-duration': duration + 's',
            'animation-delay': Math.random() * Math.max(1, seconds - duration) + 's',
            '--mgc-drift': (Math.random() * 30 - 15).toFixed(1) + 'vw',
          },
        }),
      );
    }
    document.body.appendChild(layer);
    return setTimeout(function () {
      if (layer.parentNode) layer.parentNode.removeChild(layer);
    }, (seconds + 10) * 1000);
  }

  function popup(cfg, occasion) {
    var p = cfg.popup;
    function close() {
      C.removeMarked('special-theme-popup');
    }
    var ctaUrl = C.safeUrl(p.ctaUrl);
    var card = C.h(
      'div',
      {
        style: {
          width: 'min(440px, 92vw)',
          background: '#fff',
          'border-radius': '16px',
          overflow: 'hidden',
          'box-shadow': '0 24px 60px rgba(0,0,0,.35)',
          font: '14px/1.5 system-ui, -apple-system, sans-serif',
          color: '#111827',
        },
        on: {
          click: function (e) {
            e.stopPropagation();
          },
        },
      },
      [
        C.h('div', {
          style: {
            height: '8px',
            background: 'linear-gradient(90deg,' + occasion.accent[0] + ',' + occasion.accent[1] + ')',
          },
        }),
        C.h('div', { style: { padding: '22px 24px 20px' } }, [
          C.h('div', { text: occasion.particles[0], style: { 'font-size': '30px', 'margin-bottom': '6px' } }),
          p.title ? C.h('div', { text: p.title, style: { 'font-size': '18px', 'font-weight': '700', 'margin-bottom': '6px' } }) : null,
          p.message ? C.h('div', { text: p.message, style: { color: '#4b5563', 'white-space': 'pre-line' } }) : null,
          C.h('div', { style: { display: 'flex', gap: '8px', 'justify-content': 'flex-end', 'margin-top': '18px' } }, [
            C.h('button', {
              text: 'Close',
              className: 'mgc-btn',
              attrs: { type: 'button' },
              style: { height: '34px', padding: '0 14px', background: '#f3f4f6', color: '#111827', border: '0', 'border-radius': '8px' },
              on: { click: close },
            }),
            ctaUrl && p.ctaText
              ? C.h('button', {
                  text: p.ctaText,
                  className: 'mgc-btn',
                  attrs: { type: 'button' },
                  style: {
                    height: '34px',
                    padding: '0 16px',
                    color: '#fff',
                    border: '0',
                    'border-radius': '8px',
                    background: 'linear-gradient(135deg,' + occasion.accent[0] + ',' + occasion.accent[1] + ')',
                  },
                  on: {
                    click: function () {
                      close();
                      C.open(ctaUrl);
                    },
                  },
                })
              : null,
          ]),
        ]),
      ],
    );
    document.body.appendChild(
      C.mark(C.h('div', { className: 'mgc-overlay', on: { click: close } }, [card]), 'special-theme-popup'),
    );
  }

  C.register('special-theme', {
    apply: function (cfg) {
      var occasion = OCCASIONS[cfg.themeKey] || FALLBACK;
      var timer = null;
      C.style('special-theme', CSS);

      if (cfg.particleEffect && cfg.particleEffect.enabled && C.once('particles:' + cfg.themeKey + ':' + cfg.version)) {
        timer = particles(occasion, Math.max(1, Number(cfg.particleEffect.durationSeconds) || 5));
      }
      if (cfg.popup && cfg.popup.visible && (cfg.popup.title || cfg.popup.message) && C.once('popup:' + cfg.themeKey + ':' + cfg.version)) {
        popup(cfg, occasion);
      }

      return function () {
        if (timer) clearTimeout(timer);
        C.removeMarked('special-theme-popup');
      };
    },
  });
})(window.__mgcCustomizer);
