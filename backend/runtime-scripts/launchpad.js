/*
 * Launchpad: customises GHL's Launchpad page (the setup tiles).
 *  - custom tiles are added in front of GHL's "invite a user" tile, in configured order;
 *  - native tiles (found by the id GHL gives each tile) can get a new image, description,
 *    button text and destination, or be hidden. Originals are remembered and put back on
 *    teardown, e.g. when switching to a location in a group with a different launchpad.
 * Tiles reuse GHL's own launchpad classes so they look native.
 * Config: { items: [{ id, kind, nativeId, description, imageUrl, buttonText, url, openMode, hidden }] }.
 */
(function (C) {
  if (!C) return;

  var ORIGINAL = 'data-mgc-lp-original'; // JSON of what a native tile showed before we changed it
  var SIGNATURE = 'data-mgc-lp-sig';

  function openTile(item) {
    C.open(item.url, item.openMode, item.buttonText || item.description);
  }

  function parts(tile) {
    return {
      img: tile.querySelector('img.integration-icon') || tile.querySelector('img'),
      desc: tile.querySelector('.item-info > div') || tile.querySelector('.item-info'),
      button: tile.querySelector('button'),
    };
  }

  function buildTile(item) {
    var button = C.h('button', {
      className: 'green-btn overflow-hidden green-filled-button',
      text: item.buttonText,
      attrs: { type: 'button' },
      on: {
        click: function () {
          openTile(item);
        },
      },
    });
    var tile = C.h(
      'div',
      {
        className: 'launchpad-item-sub-container launchpad-bottom-border bg-white my-1',
        attrs: { id: 'mgc-lp-' + item.id },
      },
      [
        C.h('div', { className: 'items-tiles mx-3 my-2' }, [
          item.imageUrl
            ? C.h('img', { className: 'integration-icon mx-4', attrs: { src: C.safeUrl(item.imageUrl), alt: '' } })
            : C.h('span', { className: 'integration-icon mx-4' }),
          C.h('div', { className: 'item-info' }, [
            C.h('div', { className: 'font-normal text-sm text-gray-500', text: item.description }),
          ]),
          C.h('div', { className: 'flex flex-col justify-center item-end content-end w-40' }, [
            C.h('div', { className: 'flex flex-row justify-end item-end content-end w-full pr-4 pl-1' }, [button]),
          ]),
        ]),
      ],
    );
    return C.mark(tile, 'launchpad');
  }

  function itemSignature(item) {
    return [item.imageUrl, item.description, item.buttonText, item.url, item.openMode, item.hidden].join('\u0001');
  }

  function restoreNative(tile) {
    var raw = tile.getAttribute(ORIGINAL);
    if (raw === null) return;
    var original = JSON.parse(raw);
    var p = parts(tile);
    if (p.img && original.src !== null) p.img.setAttribute('src', original.src);
    if (p.desc && original.desc !== null) p.desc.textContent = original.desc;
    if (p.button && original.button !== null) p.button.textContent = original.button;
    tile.style.display = original.display;
    if (tile.__mgcOnClick && p.button) p.button.removeEventListener('click', tile.__mgcOnClick, true);
    tile.__mgcOnClick = null;
    tile.removeAttribute(ORIGINAL);
    tile.removeAttribute(SIGNATURE);
  }

  function applyNative(tile, item) {
    var sig = itemSignature(item);
    if (tile.getAttribute(SIGNATURE) === sig) return;
    var p = parts(tile);
    if (!tile.hasAttribute(ORIGINAL)) {
      tile.setAttribute(
        ORIGINAL,
        JSON.stringify({
          src: p.img ? p.img.getAttribute('src') : null,
          desc: p.desc ? p.desc.textContent : null,
          button: p.button ? p.button.textContent : null,
          display: tile.style.display || '',
        }),
      );
    }
    tile.style.display = item.hidden ? 'none' : JSON.parse(tile.getAttribute(ORIGINAL)).display;
    if (p.img && item.imageUrl) {
      p.img.removeAttribute('srcset');
      p.img.setAttribute('src', C.safeUrl(item.imageUrl));
    }
    if (p.desc && item.description) p.desc.textContent = item.description;
    if (p.button && item.buttonText) p.button.textContent = item.buttonText;

    // Re-point the button: our listener runs first (capture) and stops GHL's own handler.
    if (p.button && tile.__mgcOnClick) p.button.removeEventListener('click', tile.__mgcOnClick, true);
    tile.__mgcOnClick = null;
    if (p.button && item.url) {
      tile.__mgcOnClick = function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        openTile(item);
      };
      p.button.addEventListener('click', tile.__mgcOnClick, true);
    }
    tile.setAttribute(SIGNATURE, sig);
  }

  C.register('launchpad', {
    apply: function (cfg) {
      var items = cfg.items || [];
      var customs = items.filter(function (i) {
        return i.kind === 'custom' && !i.hidden;
      });
      var natives = items.filter(function (i) {
        return i.kind === 'native' && i.nativeId;
      });

      C.watch('launchpad', function () {
        if (!/\/launchpad(\/|$)/.test(C.path())) return;

        natives.forEach(function (item) {
          var tile = document.getElementById(item.nativeId);
          if (tile) applyNative(tile, item);
        });

        var anchor = C.qs(C.sel.launchpadAnchor);
        if (!anchor || !anchor.parentNode) return;
        // Walk backwards so each tile is placed relative to the one after it (the last
        // goes right before the anchor); a pass that finds everything in place changes nothing.
        var next = anchor;
        for (var i = customs.length - 1; i >= 0; i--) {
          var item = customs[i];
          var existing = document.getElementById('mgc-lp-' + item.id);
          if (!existing || existing.nextElementSibling !== next) {
            if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
            existing = buildTile(item);
            next.parentNode.insertBefore(existing, next);
          }
          next = existing;
        }
      });

      return function () {
        C.qsa('[' + ORIGINAL + ']').forEach(restoreNative);
      };
    },
  });
})(window.__mgcCustomizer);
