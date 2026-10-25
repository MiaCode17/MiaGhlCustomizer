/*
 * Guide element picker: lets an agency point at an element in GHL and get a CSS selector for it,
 * to use as a tour step, instead of writing selectors by hand.
 *
 * It only starts when the page was opened from the admin dashboard with "#mgc-pick" on its URL
 * (window.open keeps a reference to the dashboard in window.opener) and the viewer is an agency
 * admin (or their role is unknown). Hover outlines an element, a click selects it, and "Use this
 * element" posts { type: 'mgc-picked', selector, text, path } back to the dashboard. The picker
 * stays open across GHL page changes so several steps can be picked in one go; Esc stops it.
 *
 * Nothing about picking is sensitive (it sends a selector string), so the message is posted to
 * any origin; the dashboard checks that it came from the window it opened.
 */
(function (C) {
  if (!C) return;

  var Z = 2147483300;
  var STATE_WORDS = /^(active|hover|focus|focused|selected|disabled|open|opened|show|shown|collapsed|expanded|loading|router-link-active|router-link-exact-active|is-[\w-]+|has-[\w-]+)$/i;

  function esc(value) {
    if (window.CSS && window.CSS.escape) return window.CSS.escape(value);
    return String(value).replace(/([^\w-])/g, '\\$1');
  }

  function count(selector) {
    try {
      return document.querySelectorAll(selector).length;
    } catch (e) {
      return 0;
    }
  }

  function isStableId(id) {
    return !!id && /^[A-Za-z][\w-]*$/.test(id) && !/\d{4,}/.test(id) && !/[0-9a-f]{8,}/i.test(id);
  }

  function stableClasses(node) {
    return Array.prototype.filter.call(node.classList || [], function (c) {
      return /^[A-Za-z][\w-]{1,40}$/.test(c) && !/\d{3,}/.test(c) && !/[0-9a-f]{6,}/i.test(c) && !STATE_WORDS.test(c);
    });
  }

  /** A short selector for one element on its own: tag, a couple of stable classes, position if needed. */
  function segment(node) {
    var tag = node.tagName.toLowerCase();
    var seg = tag + stableClasses(node).slice(0, 2).map(function (c) { return '.' + esc(c); }).join('');
    var parent = node.parentElement;
    if (parent) {
      var same = Array.prototype.filter.call(parent.children, function (sib) {
        try { return sib.matches(seg); } catch (e) { return false; }
      });
      if (same.length > 1) seg += ':nth-of-type(' + (Array.prototype.filter.call(parent.children, function (s) { return s.tagName === node.tagName; }).indexOf(node) + 1) + ')';
    }
    return seg;
  }

  /** The shortest reliable selector it can find, and how many elements it matches (1 is ideal). */
  function buildSelector(el) {
    if (isStableId(el.id)) {
      var byId = '#' + esc(el.id);
      if (count(byId) === 1) return { selector: byId, matches: 1 };
    }
    var attrs = ['data-testid', 'data-test', 'data-cy', 'aria-label', 'name'];
    for (var i = 0; i < attrs.length; i++) {
      var v = el.getAttribute && el.getAttribute(attrs[i]);
      if (v && v.length < 80) {
        var bySelector = el.tagName.toLowerCase() + '[' + attrs[i] + '="' + v.replace(/"/g, '\\"') + '"]';
        if (count(bySelector) === 1) return { selector: bySelector, matches: 1 };
      }
    }
    var parts = [];
    var node = el;
    var last = null;
    for (var depth = 0; node && node.nodeType === 1 && depth < 7; depth++) {
      if (node === document.body || node === document.documentElement) break;
      var anchored = isStableId(node.id) && node !== el;
      parts.unshift(anchored ? '#' + esc(node.id) : segment(node));
      last = parts.join(' > ');
      if (count(last) === 1) return { selector: last, matches: 1 };
      if (anchored) break;
      node = node.parentElement;
    }
    return { selector: last || el.tagName.toLowerCase(), matches: last ? count(last) : 0 };
  }

  C.register('guide-picker', {
    standalone: true,
    apply: function () {
      if (!/mgc-pick/.test(window.location.hash) || !window.opener || window.opener === window) return;
      var role = C.roleKey();
      if (role && role !== 'agency_admins') return;

      var picked = null;
      var hovered = null;

      var outline = C.h('div', { style: { position: 'fixed', 'z-index': String(Z), 'pointer-events': 'none', border: '2px solid #4f46e5', background: 'rgba(79,70,229,.12)', 'border-radius': '4px', display: 'none' } });
      var title = C.h('div', { text: 'Pick an element for your guide', style: { 'font-weight': '700' } });
      var detail = C.h('div', { text: 'Click the part of the page you want to point at. Press Esc to stop.', style: { 'font-size': '12.5px', opacity: '.85', 'margin-top': '2px' } });
      var buttons = C.h('div', { style: { display: 'none', gap: '8px', 'margin-top': '8px' } });
      var banner = C.h(
        'div',
        { attrs: { 'data-mgc-picker-ui': '' }, style: { position: 'fixed', top: '12px', left: '50%', transform: 'translateX(-50%)', 'z-index': String(Z + 1), 'max-width': 'min(640px, 94vw)', background: '#111827', color: '#fff', 'border-radius': '12px', padding: '10px 14px', 'box-shadow': '0 12px 32px rgba(0,0,0,.35)', font: '14px/1.4 system-ui, sans-serif' } },
        [title, detail, buttons],
      );
      var root = C.mark(C.h('div', {}, [outline, banner]), 'guide-picker');
      document.body.appendChild(root);

      function inUi(target) {
        return !!(target && target.closest && target.closest('[data-mgc-picker-ui]'));
      }

      function btn(label, primary, onClick) {
        return C.h('button', { text: label, attrs: { type: 'button' }, style: { padding: '6px 12px', 'border-radius': '8px', border: primary ? '0' : '1px solid #4b5563', background: primary ? '#4f46e5' : 'transparent', color: '#fff', cursor: 'pointer', font: '600 13px system-ui, sans-serif' }, on: { click: onClick } });
      }

      function showResult(el) {
        var result = buildSelector(el);
        var text = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60);
        picked = { selector: result.selector, text: text, path: window.location.pathname, matches: result.matches };
        title.textContent = 'Selected';
        detail.textContent = '';
        detail.appendChild(C.h('code', { text: result.selector, style: { 'word-break': 'break-all', background: 'rgba(255,255,255,.12)', padding: '2px 6px', 'border-radius': '4px' } }));
        detail.appendChild(
          C.h('div', {
            text: result.matches === 1 ? 'Matches exactly this element.' : 'Matches ' + result.matches + ' elements; the guide uses the first visible one.',
            style: { 'margin-top': '4px', color: result.matches === 1 ? '#86efac' : '#fcd34d' },
          }),
        );
        buttons.textContent = '';
        buttons.style.display = 'flex';
        buttons.appendChild(btn('Use this element', true, send));
        buttons.appendChild(btn('Pick again', false, reset));
      }

      function reset() {
        picked = null;
        title.textContent = 'Pick an element for your guide';
        detail.textContent = 'Click the part of the page you want to point at. Press Esc to stop.';
        buttons.textContent = '';
        buttons.style.display = 'none';
      }

      function send() {
        if (!picked) return;
        try {
          window.opener.postMessage({ type: 'mgc-picked', selector: picked.selector, text: picked.text, path: picked.path }, '*');
          title.textContent = 'Sent to the editor ✓';
          detail.textContent = 'Pick another element, navigate to another page, or close this tab.';
        } catch (e) {
          title.textContent = 'Could not reach the editor';
          detail.textContent = 'Keep the dashboard tab open and try again.';
        }
        buttons.textContent = '';
        buttons.style.display = 'none';
        picked = null;
      }

      function stop() {
        document.removeEventListener('mousemove', onMove, true);
        document.removeEventListener('click', onClick, true);
        ['mousedown', 'mouseup', 'pointerdown', 'pointerup'].forEach(function (t) {
          document.removeEventListener(t, swallow, true);
        });
        document.removeEventListener('keydown', onKey, true);
        if (root.parentNode) root.parentNode.removeChild(root);
      }

      function onMove(e) {
        var t = e.target;
        if (!t || inUi(t) || t === document.documentElement || t === document.body) {
          outline.style.display = 'none';
          hovered = null;
          return;
        }
        hovered = t;
        var r = t.getBoundingClientRect();
        outline.style.display = 'block';
        outline.style.left = r.left + 'px';
        outline.style.top = r.top + 'px';
        outline.style.width = r.width + 'px';
        outline.style.height = r.height + 'px';
      }

      function swallow(e) {
        if (!inUi(e.target)) {
          e.preventDefault();
          e.stopPropagation();
        }
      }

      function onClick(e) {
        if (inUi(e.target)) return;
        e.preventDefault();
        e.stopPropagation();
        var t = e.target;
        if (t && t.nodeType === 1 && t !== document.body && t !== document.documentElement) showResult(t);
      }

      function onKey(e) {
        if (e.key === 'Escape') {
          e.preventDefault();
          stop();
        }
      }

      document.addEventListener('mousemove', onMove, true);
      document.addEventListener('click', onClick, true);
      ['mousedown', 'mouseup', 'pointerdown', 'pointerup'].forEach(function (t) {
        document.addEventListener(t, swallow, true);
      });
      document.addEventListener('keydown', onKey, true);

      return stop;
    },
  });
})(window.__mgcCustomizer);
