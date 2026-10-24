/*
 * Floating buttons: net-new UI appended to document.body (not GHL's DOM).
 *
 * Each button is attached to a screen edge (right, bottom, left, top) and drawn as one of
 * four variants (solid, split icon+label, outline, ghost) in three sizes, horizontal or with
 * a vertical label on side edges. Buttons without an explicit position stack in a dock on
 * the right or bottom edge (the original behaviour); a button with a position percentage,
 * or one that viewers may drag, is placed on its own. Dragged buttons snap to the nearest
 * edge on release and remember where they were put (per browser).
 *
 * Clicking opens the button's target the way it asked for (pop-up, drawer, new tab, same
 * tab). A button with nav tabs opens a drawer with a tab bar that switches the page shown.
 * Without a target, its sub-items open in a small menu (a single one opens directly).
 *
 * A button can be scheduled: it only shows between startAt and endAt, with an optional
 * live "ends in" countdown. Times are compared on the server's clock (serverTime), so a
 * wrong browser clock doesn't show or hide a button early.
 *
 * Config: { serverTime, items: [{ id, position, label, icon, backgroundColor, textColor,
 *   borderRadius, shadow, animation, subItems, variant, size, layout, positionPercent,
 *   edgeOffset, url, openMode, drawerDirection, drawerPercent, navTabs, draggable,
 *   startAt, endAt, showCountdown }].
 */
(function (C) {
  if (!C) return;

  var SIZES = {
    small: { h: 32, font: 12, icon: 14, pad: 12 },
    medium: { h: 40, font: 14, icon: 16, pad: 16 },
    large: { h: 48, font: 16, icon: 20, pad: 20 },
  };
  var EDGES = ['right', 'bottom', 'left', 'top'];
  var DRAG_THRESHOLD = 6;

  /* ---------------------------------------------------------------- helpers */

  function rgba(hex, alpha) {
    var m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(hex || '').trim());
    if (!m) return hex;
    var h = m[1].length === 3 ? m[1].replace(/./g, '$&$&') : m[1];
    return (
      'rgba(' +
      parseInt(h.slice(0, 2), 16) +
      ',' +
      parseInt(h.slice(2, 4), 16) +
      ',' +
      parseInt(h.slice(4, 6), 16) +
      ',' +
      alpha +
      ')'
    );
  }

  function pad2(n) {
    return n < 10 ? '0' + n : String(n);
  }

  /** "2d 04:12:09" or "04:12:09" for the time left. */
  function countdown(ms) {
    var total = Math.max(0, Math.floor(ms / 1000));
    var d = Math.floor(total / 86400);
    var h = Math.floor((total % 86400) / 3600);
    var m = Math.floor((total % 3600) / 60);
    var s = total % 60;
    return (d ? d + 'd ' : '') + pad2(h) + ':' + pad2(m) + ':' + pad2(s);
  }

  function storageKey(id) {
    return 'mgc:' + C.companyId + ':fb:' + id;
  }

  function loadSaved(id) {
    try {
      var raw = JSON.parse(window.localStorage.getItem(storageKey(id)) || 'null');
      if (raw && EDGES.indexOf(raw.edge) >= 0 && typeof raw.pct === 'number') return raw;
    } catch (e) {
      /* storage blocked or corrupt: fall back to the configured position */
    }
    return null;
  }

  function save(id, edge, pct) {
    try {
      window.localStorage.setItem(storageKey(id), JSON.stringify({ edge: edge, pct: pct }));
    } catch (e) {
      /* ignore */
    }
  }

  /* ------------------------------------------------------------------ faces */

  /**
   * The clickable button. `edge` decides whether a vertical layout applies; `state.labelEl`
   * is kept so a countdown can rewrite the text without rebuilding the button.
   */
  function buildFace(item, edge, state, onClick) {
    var size = SIZES[item.size] || SIZES.medium;
    var side = edge === 'left' || edge === 'right';
    var vertical = item.layout === 'vertical' && side;
    var icon = C.icon(item.icon, size.icon);
    var bg = item.backgroundColor || '#6366f1';
    var fg = item.textColor || '#ffffff';
    var variant = item.variant === 'split' && !icon ? 'solid' : item.variant || 'solid';

    var label = C.h('span', {
      text: item.label,
      style: vertical ? { 'writing-mode': 'vertical-rl', 'white-space': 'nowrap' } : { 'white-space': 'nowrap' },
    });
    state.labelEl = label;

    var style = {
      display: 'flex',
      'flex-direction': vertical ? 'column' : 'row',
      'align-items': 'center',
      'justify-content': 'center',
      gap: '8px',
      'box-sizing': 'border-box',
      'font-size': size.font + 'px',
      'font-weight': '600',
      'border-radius': (item.borderRadius != null ? item.borderRadius : 999) + 'px',
      'box-shadow': C.shadow(item.shadow),
      overflow: 'hidden',
      border: '0',
    };
    style[vertical ? 'width' : 'height'] = size.h + 'px';
    style[vertical ? 'padding' : 'padding'] = vertical ? size.pad + 'px 0' : '0 ' + size.pad + 'px';

    var children;
    if (variant === 'split') {
      // An icon block in the brand color next to a plain label area.
      var block = C.h(
        'span',
        {
          style: {
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
            background: bg,
            color: fg,
            width: size.h + 'px',
            height: size.h + 'px',
            'flex-shrink': '0',
          },
        },
        [icon],
      );
      style.padding = '0';
      style.gap = '0';
      style.background = '#ffffff';
      style.color = '#111827';
      style.border = '1px solid rgba(0,0,0,.08)';
      label.style.setProperty('padding', vertical ? size.pad / 2 + 'px 0' : '0 ' + size.pad + 'px 0 ' + size.pad / 1.5 + 'px');
      children = [block, label];
    } else {
      if (variant === 'outline') {
        style.background = '#ffffff';
        style.color = bg;
        style.border = '2px solid ' + bg;
      } else if (variant === 'ghost') {
        style.background = rgba(bg, 0.14);
        style.color = bg;
      } else {
        style.background = bg;
        style.color = fg;
      }
      children = [icon, label];
    }

    var anim = item.animation && item.animation !== 'none' ? ' mgc-anim-' + item.animation : '';
    return C.h(
      'button',
      {
        className: 'mgc-btn mgc-fb' + anim,
        attrs: { type: 'button', 'aria-label': item.label, 'data-mgc-fb': item.id },
        style: style,
        on: { click: onClick },
      },
      children,
    );
  }

  /* --------------------------------------------------------------- actions */

  function drawerOpts(item, edge) {
    return {
      direction: item.drawerDirection && item.drawerDirection !== 'auto' ? item.drawerDirection : edge,
      percent: item.drawerPercent,
    };
  }

  function openSub(item, sub, edge) {
    var opts = drawerOpts(item, edge);
    C.open(sub.url, item.openMode, sub.label, opts);
  }

  function activate(item, face, edge) {
    var tabs = item.navTabs || [];
    if (tabs.length > 0) {
      // Tabs only make sense in a drawer; the first tab is the page shown first.
      C.resolveUrl(tabs[0].url).then(function (first) {
        var opts = drawerOpts(item, edge);
        opts.tabs = tabs;
        opts.activeIndex = 0;
        C.drawer(first, item.label, opts);
      });
      return;
    }
    if (item.url) {
      C.open(item.url, item.openMode, item.label, drawerOpts(item, edge));
      return;
    }
    var subs = item.subItems || [];
    if (subs.length === 1) {
      openSub(item, subs[0], edge);
    } else if (subs.length > 1) {
      C.popover(
        face,
        subs.map(function (sub) {
          return {
            label: sub.label,
            onClick: function () {
              openSub(item, sub, edge);
            },
          };
        }),
      );
    }
  }

  /* ----------------------------------------------------------- positioning */

  function placeStyle(edge, pct, offset) {
    var s = { position: 'fixed', 'z-index': '2147482500' };
    if (edge === 'right' || edge === 'left') {
      s[edge] = offset + 'px';
      s.top = pct + '%';
      s.transform = 'translateY(-50%)';
    } else {
      s[edge] = offset + 'px';
      s.left = pct + '%';
      s.transform = 'translateX(-50%)';
    }
    return s;
  }

  /** Items without a position, a drag, or a left/top edge keep the original stacked dock. */
  function isDocked(item) {
    return item.positionPercent == null && !item.draggable && (item.position === 'right' || item.position === 'bottom');
  }

  function dockEl(position) {
    var style =
      position === 'right'
        ? { top: '90px', right: '16px', 'flex-direction': 'column', 'align-items': 'flex-end' }
        : { bottom: '16px', left: '16px', 'flex-direction': 'row', 'align-items': 'center' };
    return C.h('div', {
      attrs: { 'data-mgc-dock': position },
      style: Object.assign({ position: 'fixed', 'z-index': '2147482500', display: 'flex', gap: '8px' }, style),
    });
  }

  /* ------------------------------------------------------------------ drag */

  function makeDraggable(state, redraw) {
    var start = null;
    var moved = false;
    var suppressClick = false;
    var wrapper = state.wrapper;
    var face = state.face;

    face.addEventListener(
      'click',
      function (e) {
        if (suppressClick) {
          e.stopImmediatePropagation();
          e.preventDefault();
        }
      },
      true,
    );

    face.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      var rect = wrapper.getBoundingClientRect();
      start = { x: e.clientX, y: e.clientY, left: rect.left, top: rect.top };
      moved = false;
      try {
        if (face.setPointerCapture) face.setPointerCapture(e.pointerId);
      } catch (err) {
        /* capture is a nicety */
      }
    });

    face.addEventListener('pointermove', function (e) {
      if (!start) return;
      var dx = e.clientX - start.x;
      var dy = e.clientY - start.y;
      if (!moved && Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD) return;
      moved = true;
      wrapper.style.transform = 'none';
      wrapper.style.right = 'auto';
      wrapper.style.bottom = 'auto';
      wrapper.style.left = start.left + dx + 'px';
      wrapper.style.top = start.top + dy + 'px';
    });

    function finish() {
      if (!start) return;
      var wasMoved = moved;
      start = null;
      moved = false;
      if (!wasMoved) return;
      // Swallow the click the browser fires right after a drag.
      suppressClick = true;
      setTimeout(function () {
        suppressClick = false;
      }, 0);

      var rect = wrapper.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var vw = window.innerWidth || 1;
      var vh = window.innerHeight || 1;
      var distances = { left: cx, right: vw - cx, top: cy, bottom: vh - cy };
      var edge = EDGES.reduce(function (best, e2) {
        return distances[e2] < distances[best] ? e2 : best;
      }, 'right');
      var pct = edge === 'left' || edge === 'right' ? (cy / vh) * 100 : (cx / vw) * 100;
      pct = Math.round(Math.min(95, Math.max(5, pct)));
      state.edge = edge;
      state.pct = pct;
      save(state.item.id, edge, pct);
      redraw();
    }
    face.addEventListener('pointerup', finish);
    face.addEventListener('pointercancel', finish);
  }

  /* --------------------------------------------------------------- feature */

  C.register('floating-buttons', {
    apply: function (cfg) {
      var skew = (cfg.serverTime || Date.now()) - Date.now();
      var states = (cfg.items || []).map(function (item) {
        var saved = item.draggable ? loadSaved(item.id) : null;
        var edge = saved ? saved.edge : item.position;
        var pct = saved ? saved.pct : item.positionPercent != null ? item.positionPercent : 50;
        return { item: item, edge: edge, pct: pct, wrapper: null, face: null, labelEl: null };
      });
      var lastSignature = null;
      var docks = {};

      function now() {
        return Date.now() + skew;
      }

      function inWindow(item) {
        var t = now();
        return (item.startAt == null || t >= item.startAt) && (item.endAt == null || t < item.endAt);
      }

      function clearAll() {
        C.qsa('[data-mgc-dock], [data-mgc-fb-wrap]').forEach(function (n) {
          if (n.parentNode) n.parentNode.removeChild(n);
        });
        docks = {};
      }

      function labelFor(item) {
        if (item.showCountdown && item.endAt != null) {
          var left = item.endAt - now();
          if (left > 0) return item.label + ' · ' + countdown(left);
        }
        return item.label;
      }

      function build(visible) {
        clearAll();
        visible.forEach(function (state) {
          var item = state.item;
          var face = buildFace(item, state.edge, state, function () {
            activate(item, face, state.edge);
          });
          state.face = face;
          if (state.labelEl) state.labelEl.textContent = labelFor(item);

          if (isDocked(item)) {
            var dock = docks[item.position];
            if (!dock) {
              dock = C.mark(dockEl(item.position), 'floating-buttons');
              docks[item.position] = dock;
              document.body.appendChild(dock);
            }
            dock.appendChild(face);
            state.wrapper = dock;
          } else {
            var wrapper = C.mark(
              C.h('div', { attrs: { 'data-mgc-fb-wrap': item.id }, style: placeStyle(state.edge, state.pct, item.edgeOffset) }, [face]),
              'floating-buttons',
            );
            state.wrapper = wrapper;
            document.body.appendChild(wrapper);
            if (item.draggable) makeDraggable(state, sync.bind(null, true));
          }
        });
      }

      function sync(force) {
        if (C.isLoginPage()) {
          if (lastSignature !== 'login') clearAll();
          lastSignature = 'login';
          return;
        }
        var visible = states.filter(function (s) {
          return inWindow(s.item);
        });
        var signature = visible
          .map(function (s) {
            return s.item.id + ':' + s.edge + ':' + s.pct;
          })
          .join('|');
        var mounted = visible.length === 0 || !!document.querySelector('[data-mgc="floating-buttons"]');
        if (force === true || signature !== lastSignature || !mounted) {
          build(visible);
          lastSignature = signature;
        } else {
          visible.forEach(function (s) {
            if (s.labelEl && s.item.showCountdown && s.item.endAt != null) {
              var text = labelFor(s.item);
              if (s.labelEl.textContent !== text) s.labelEl.textContent = text;
            }
          });
        }
        // Leave room for the Book-a-Call pill when both sit bottom-left.
        var bottomDock = docks.bottom;
        if (bottomDock) {
          var bottom = C.active['book-a-call'] ? '72px' : '16px';
          if (bottomDock.style.bottom !== bottom) bottomDock.style.bottom = bottom;
        }
      }

      C.watch('floating-buttons', sync, 1000);

      return function () {
        C.removeMarked('popover');
        clearAll();
      };
    },
  });
})(window.__mgcCustomizer);
