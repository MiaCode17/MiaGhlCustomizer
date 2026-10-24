/*
 * Custom fields: locks (read-only) or hides chosen custom fields on a contact's
 * detail page and in the opportunity dialog. A field is found by its key the way
 * GHL renders it: a name, id or class equal to the key, a "contact_" class, or a
 * "contact.<key>" id. Original state is remembered on the element so that
 * switching to a location with a different campaign restores the field.
 * Config: { lock: [fieldKey], hide: [fieldKey] } — keys are already normalised
 * (lower-case, underscores, no "contact."/"opportunity." prefix).
 *
 * Note: these markers deliberately avoid data-mgc="..." — that attribute means
 * "an element we injected and may remove", and these are GHL's own elements.
 */
(function (C) {
  if (!C) return;

  var LOCK_ATTR = 'data-mgcf-lock'; // value: "1" if the control was already disabled
  var HIDE_ATTR = 'data-mgcf-hide'; // value: the element's previous inline display
  var CONTROLS = 'input, select, textarea';

  function safeKey(key) {
    return /^[a-z0-9_-]+$/.test(key) ? key : '';
  }

  function find(key) {
    var k = safeKey(key);
    if (!k) return [];
    var selectors = [
      '[name="' + k + '"]',
      '[id="' + k + '"]',
      '[id="contact.' + k + '"]',
      '[id="contact_' + k + '"]',
      '[data-field-key="' + k + '"]',
      '.' + k,
      '.contact_' + k,
    ];
    var found = [];
    selectors.forEach(function (sel) {
      C.qsa(sel).forEach(function (el) {
        if (found.indexOf(el) < 0 && !el.closest('[data-mgc]')) found.push(el);
      });
    });
    return found;
  }

  function controlsIn(el) {
    return el.matches(CONTROLS) ? [el] : C.qsa(CONTROLS, el);
  }

  function lock(el) {
    controlsIn(el).forEach(function (control) {
      if (control.hasAttribute(LOCK_ATTR)) return;
      control.setAttribute(LOCK_ATTR, control.disabled ? '1' : '0');
      control.disabled = true;
      control.style.setProperty('pointer-events', 'none');
    });
  }

  function hide(el) {
    // Hide the whole field row, not just the bare input inside it.
    var target = el.matches(CONTROLS)
      ? el.closest('.form-group, .hl-form-group, .n-form-item, .hr-form-item, [class*="form-item"]') || el.parentElement
      : el;
    if (!target || target.hasAttribute(HIDE_ATTR)) return;
    target.setAttribute(HIDE_ATTR, target.style.display || '');
    target.style.setProperty('display', 'none', 'important');
  }

  function onRelevantPage() {
    return /\/contacts\/detail\//.test(C.path()) || !!C.qs(C.sel.opportunityModal);
  }

  C.register('custom-fields', {
    apply: function (cfg) {
      var lockKeys = cfg.lock || [];
      var hideKeys = cfg.hide || [];

      C.watch('custom-fields', function () {
        if (!onRelevantPage()) return;
        lockKeys.forEach(function (key) {
          find(key).forEach(lock);
        });
        hideKeys.forEach(function (key) {
          find(key).forEach(hide);
        });
      });

      return function () {
        C.qsa('[' + LOCK_ATTR + ']').forEach(function (control) {
          control.disabled = control.getAttribute(LOCK_ATTR) === '1';
          control.style.removeProperty('pointer-events');
          control.removeAttribute(LOCK_ATTR);
        });
        C.qsa('[' + HIDE_ATTR + ']').forEach(function (el) {
          var previous = el.getAttribute(HIDE_ATTR);
          el.style.removeProperty('display');
          if (previous) el.style.display = previous;
          el.removeAttribute(HIDE_ATTR);
        });
      };
    },
  });
})(window.__mgcCustomizer);
