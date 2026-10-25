/*
 * Opportunity tabs: extra tabs in the tab list of GHL's opportunity dialog. Opening one
 * shows its URL in the dialog's content area (the native view is hidden, not removed);
 * clicking a native tab, or closing the dialog, brings the native view back.
 * The URL gets the opportunity's ID appended and may use {{placeholders}}; the contact's
 * details and the opportunity's custom fields can be appended too.
 * Config: { items: [{ id, label, icon, url, accentColor, sendContact, sendCustomFields, permissions }] }.
 *
 * The opportunity's ID is read from the dialog (GHL doesn't put it in the URL), then its
 * details come from GHL's API. Both depend on GHL's markup, so if the ID can't be found
 * the tab still opens, just without opportunity data.
 */
(function (C) {
  if (!C) return;

  var HIDDEN = 'data-mgc-opp-hidden';
  var ACTIVE = ['font-bold', 'text-blue-800', 'bg-blue-50'];
  var ID_PATTERN = /^[A-Za-z0-9]{15,40}$/;

  function opportunityId() {
    var fromUrl = new URLSearchParams(location.search).get('opportunityId');
    if (fromUrl && ID_PATTERN.test(fromUrl)) return fromUrl;
    // The dialog shows the opportunity's ID as the third blue text element.
    var el = document.querySelectorAll('.text-blue-700')[2];
    var text = el && el.textContent.trim();
    return text && ID_PATTERN.test(text) ? text : '';
  }

  /** The tab's URL with the opportunity (and optionally contact / custom field) data added. */
  function buildUrl(tab) {
    return C.resolveUrl(tab.url).then(function (base) {
      var id = opportunityId();
      if (!id) return base;
      var locationId = C.locationId || C.locationIdFromUrl();
      return Promise.all([
        C.ghlFetch('/opportunities/' + encodeURIComponent(id), { services: true }),
        tab.sendCustomFields && locationId
          ? C.ghlFetch('/locations/' + encodeURIComponent(locationId) + '/customFields')
          : null,
      ]).then(function (res) {
        var opp = (res[0] && res[0].opportunity) || {};
        var params = [['opportunityId', id]];
        if (tab.sendContact) {
          var contact = opp.contact || {};
          params.push(
            ['contactId', contact.id || ''],
            ['name', contact.name || ''],
            ['email', contact.email || ''],
            ['pipelineId', opp.pipelineId || ''],
          );
        }
        if (tab.sendCustomFields) {
          var defs = (res[1] && res[1].customFields) || [];
          (opp.customFields || []).forEach(function (field) {
            var def = defs.filter(function (d) {
              return d.id === field.id;
            })[0];
            var key = def && def.fieldKey ? String(def.fieldKey).replace(/^opportunity\./, '') : field.id;
            params.push([key, field.fieldValueString != null ? field.fieldValueString : field.fieldValue]);
          });
        }
        return C.appendQuery(base, params);
      });
    });
  }

  C.register('opportunity-tabs', {
    apply: function (cfg) {
      var tabs = (cfg.items || []).filter(function (item) {
        return C.allowedFor(item.permissions);
      });
      if (tabs.length === 0) return;
      var openId = null;

      function closeFrame() {
        C.removeMarked('opportunity-tab-frame');
        C.qsa('[' + HIDDEN + ']').forEach(function (el) {
          el.style.display = el.getAttribute(HIDDEN);
          el.removeAttribute(HIDDEN);
        });
        C.qsa('[data-mgc-opp-tab] button').forEach(function (btn) {
          ACTIVE.forEach(function (c) {
            btn.classList.remove(c);
          });
          btn.classList.add('text-gray-500');
        });
        openId = null;
      }

      function open(tab, button) {
        var content = C.qs(C.sel.opportunityTabContent);
        if (!content) {
          C.open(tab.url, 'modal', tab.label);
          return;
        }
        closeFrame();
        Array.prototype.slice.call(content.children).forEach(function (child) {
          if (child.hasAttribute('data-mgc')) return;
          child.setAttribute(HIDDEN, child.style.display || '');
          child.style.display = 'none';
        });
        var frame = C.mark(
          C.h('iframe', {
            attrs: { title: tab.label, allow: 'clipboard-write; fullscreen' },
            style: { border: '0', width: '100%', height: '600px', display: 'block', background: '#fff' },
          }),
          'opportunity-tab-frame',
        );
        content.appendChild(frame);
        buildUrl(tab).then(function (url) {
          var safe = C.safeUrl(url);
          if (safe && frame.parentNode) frame.setAttribute('src', safe);
        });
        button.classList.remove('text-gray-500');
        ACTIVE.forEach(function (c) {
          button.classList.add(c);
        });
        openId = tab.id;
      }

      function build(tab) {
        var button = C.h(
          'button',
          {
            className: 'text-gray-500 custom-button w-48 rounded p-2 text-left text-xs',
            attrs: { type: 'button' },
            style: tab.accentColor ? { 'border-left': '3px solid ' + tab.accentColor } : {},
            on: {
              click: function () {
                if (openId === tab.id) closeFrame();
                else open(tab, button);
              },
            },
          },
          [C.icon(tab.icon, 14), C.h('span', { text: tab.label, style: { 'margin-left': tab.icon ? '6px' : '0' } })],
        );
        var wrapper = C.h('div', { attrs: { 'data-mgc-opp-tab': tab.id } }, [
          C.h('div', { className: 'pr-4' }, [button]),
        ]);
        return C.mark(wrapper, 'opportunity-tabs');
      }

      // A native tab being clicked brings the native view back.
      function onDocClick(e) {
        if (!openId || !e.target.closest) return;
        if (e.target.closest('[data-mgc-opp-tab]')) return;
        if (e.target.closest(C.sel.opportunityTabStrip)) closeFrame();
      }
      document.addEventListener('click', onDocClick, true);

      C.watch('opportunity-tabs', function () {
        var modal = C.qs(C.sel.opportunityModal);
        var strip = modal ? C.qs(C.sel.opportunityTabStrip) : null;
        if (!strip) {
          if (openId) closeFrame();
          return;
        }
        tabs.forEach(function (tab) {
          if (strip.querySelector('[data-mgc-opp-tab="' + tab.id + '"]')) return;
          strip.appendChild(build(tab));
        });
      });

      return function () {
        document.removeEventListener('click', onDocClick, true);
        closeFrame();
      };
    },
  });
})(window.__mgcCustomizer);
