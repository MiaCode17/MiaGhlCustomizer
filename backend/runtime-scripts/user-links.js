/*
 * User links: lets a sub-account's own admins add links to their sidebar.
 *  - Everyone in the location sees the links, appended to the sidebar nav.
 *  - Agency admins and sub-account admins also get a "My links" entry that opens a small
 *    manager dialog (add, edit, delete). Writes go to /api/v1/runtime/location-links with the
 *    user's GHL session token, which the server checks against GHL before accepting it.
 * The link list is fetched fresh (not part of the cached config) so changes appear at once.
 * Config: { maxLinks }.
 */
(function (C) {
  if (!C) return;

  var MODES = [
    ['new-tab', 'New tab'],
    ['modal', 'Pop-up window'],
    ['drawer', 'Side drawer'],
    ['same-tab', 'Same tab'],
  ];

  C.register('user-links', {
    apply: function (cfg) {
      var locationId = C.locationId;
      if (!locationId) return;
      var state = { links: [], max: cfg.maxLinks || 10, stopped: false };

      var canManage = C.roleKey() === 'agency_admins' || C.roleKey() === 'account_admins';

      function endpoint(path) {
        return (
          C.apiBase +
          '/api/v1/runtime/location-links' +
          (path || '') +
          '?company_id=' +
          encodeURIComponent(C.companyId) +
          '&locationId=' +
          encodeURIComponent(locationId) +
          (C.planId ? '&planId=' + encodeURIComponent(C.planId) : '')
        );
      }

      function request(method, path, body) {
        var headers = { 'x-ghl-token': C.getCookie('m_a') || '' };
        if (body) headers['content-type'] = 'application/json';
        return fetch(endpoint(path), {
          method: method,
          headers: headers,
          credentials: 'omit',
          body: body ? JSON.stringify(body) : undefined,
        }).then(function (res) {
          if (res.status === 204) return null;
          return res.json().then(function (data) {
            if (!res.ok) {
              // Validation errors carry per-field messages; show the first one.
              var detail = data && data.details && Object.keys(data.details).map(function (k) {
                return (data.details[k] || [])[0];
              }).filter(Boolean)[0];
              throw new Error(detail || (data && data.error) || 'Request failed (' + res.status + ')');
            }
            return data;
          });
        });
      }

      function refresh() {
        return fetch(endpoint(), { credentials: 'omit' })
          .then(function (res) {
            return res.ok ? res.json() : null;
          })
          .then(function (data) {
            if (state.stopped || !data || !data.enabled) return;
            state.links = data.links || [];
            state.max = data.maxLinks || state.max;
          })
          .catch(function () {});
      }

      /* ------------------------------------------------------------ sidebar */

      function signature() {
        return (
          (canManage ? 'm|' : '|') +
          state.links
            .map(function (l) {
              return [l.id, l.title, l.url, l.icon, l.openMode].join('~');
            })
            .join('|')
        );
      }

      function render() {
        var nav = C.qs(C.sel.sidebarNav);
        if (!nav || C.isLoginPage()) return;
        var onSettings = /\/settings(\/|$)/.test(C.path());
        var existing = C.qsa('[data-mgc="user-links"]', nav);
        if (onSettings) {
          existing.forEach(function (el) {
            el.parentNode.removeChild(el);
          });
          return;
        }
        var sig = signature();
        var wanted = state.links.length + (canManage ? 1 : 0);
        if (existing.length === wanted && existing.every(function (el) { return el.getAttribute('data-mgc-sig') === sig; })) {
          return;
        }
        existing.forEach(function (el) {
          el.parentNode.removeChild(el);
        });
        state.links.forEach(function (link) {
          var el = C.navLink({
            label: link.title,
            icon: link.icon,
            href: link.url,
            onClick: function () {
              C.open(link.url, link.openMode, link.title);
            },
          });
          el.setAttribute('data-mgc-sig', sig);
          nav.appendChild(C.mark(el, 'user-links'));
        });
        if (canManage) {
          var manage = C.navLink({ label: 'My links', icon: '⚙', onClick: openManager });
          manage.setAttribute('data-mgc-sig', sig);
          nav.appendChild(C.mark(manage, 'user-links'));
        }
      }

      /* ------------------------------------------------------------ manager */

      var field = function (label, input) {
        return C.h('label', { style: { display: 'block', 'margin-bottom': '10px', 'font-size': '12px', color: '#374151', 'font-weight': '600' } }, [
          label,
          input,
        ]);
      };
      var inputStyle = {
        display: 'block',
        width: '100%',
        'box-sizing': 'border-box',
        'margin-top': '4px',
        padding: '8px 10px',
        border: '1px solid #d1d5db',
        'border-radius': '8px',
        font: '14px system-ui, sans-serif',
        'font-weight': '400',
      };

      function closeManager() {
        C.removeMarked('user-links-manager');
      }

      function openManager() {
        closeManager();
        var editingId = null;
        var title = C.h('input', { attrs: { type: 'text', maxlength: '60', placeholder: 'Link name' }, style: inputStyle });
        var url = C.h('input', { attrs: { type: 'url', placeholder: 'https://…' }, style: inputStyle });
        var icon = C.h('input', { attrs: { type: 'text', maxlength: '300', placeholder: 'Emoji or image URL (optional)' }, style: inputStyle });
        var mode = C.h(
          'select',
          { style: inputStyle },
          MODES.map(function (m) {
            return C.h('option', { text: m[1], attrs: { value: m[0] } });
          }),
        );
        var error = C.h('div', { style: { color: '#b91c1c', 'font-size': '12px', 'min-height': '16px', 'margin-bottom': '6px' } });
        var submit = C.h('button', { text: 'Add link', className: 'mgc-btn', attrs: { type: 'button' }, style: { background: '#4f46e5', color: '#fff', border: '0', 'border-radius': '8px', padding: '8px 16px' } });
        var cancelEdit = C.h('button', { text: 'Cancel edit', className: 'mgc-btn', attrs: { type: 'button' }, style: { display: 'none', background: '#fff', border: '1px solid #d1d5db', 'border-radius': '8px', padding: '8px 14px', 'margin-left': '8px' } });
        var list = C.h('div', { style: { 'margin-bottom': '16px' } });
        var counter = C.h('div', { style: { 'font-size': '12px', color: '#6b7280', 'margin-bottom': '8px' } });

        function resetForm() {
          editingId = null;
          title.value = '';
          url.value = '';
          icon.value = '';
          mode.value = 'new-tab';
          submit.textContent = 'Add link';
          cancelEdit.style.display = 'none';
          error.textContent = '';
        }

        function renderList() {
          list.textContent = '';
          counter.textContent = state.links.length + ' of ' + state.max + ' links used';
          if (!state.links.length) {
            list.appendChild(C.h('div', { text: 'No links yet.', style: { color: '#6b7280', 'font-size': '14px' } }));
          }
          state.links.forEach(function (link) {
            list.appendChild(
              C.h(
                'div',
                { style: { display: 'flex', 'align-items': 'center', gap: '8px', padding: '8px 0', 'border-bottom': '1px solid #f3f4f6' } },
                [
                  C.h('div', { style: { flex: '1', 'min-width': '0' } }, [
                    C.h('div', { text: link.title, style: { 'font-weight': '600', 'font-size': '14px' } }),
                    C.h('div', { text: link.url, style: { color: '#6b7280', 'font-size': '12px', overflow: 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap' } }),
                  ]),
                  C.h('button', {
                    text: 'Edit',
                    attrs: { type: 'button' },
                    style: { border: '0', background: 'transparent', color: '#4f46e5', cursor: 'pointer' },
                    on: {
                      click: function () {
                        editingId = link.id;
                        title.value = link.title;
                        url.value = link.url;
                        icon.value = link.icon || '';
                        mode.value = link.openMode;
                        submit.textContent = 'Save changes';
                        cancelEdit.style.display = '';
                        error.textContent = '';
                      },
                    },
                  }),
                  C.h('button', {
                    text: 'Delete',
                    attrs: { type: 'button' },
                    style: { border: '0', background: 'transparent', color: '#b91c1c', cursor: 'pointer' },
                    on: {
                      click: function () {
                        request('DELETE', '/' + encodeURIComponent(link.id))
                          .then(refresh)
                          .then(function () {
                            if (editingId === link.id) resetForm();
                            renderList();
                            render();
                          })
                          .catch(function (e) {
                            error.textContent = e.message;
                          });
                      },
                    },
                  }),
                ],
              ),
            );
          });
        }

        submit.addEventListener('click', function () {
          error.textContent = '';
          var body = { title: title.value.trim(), url: url.value.trim(), icon: icon.value.trim() || undefined, openMode: mode.value };
          if (!body.title || !body.url) {
            error.textContent = 'Add a name and a URL.';
            return;
          }
          submit.disabled = true;
          request(editingId ? 'PUT' : 'POST', editingId ? '/' + encodeURIComponent(editingId) : '', body)
            .then(refresh)
            .then(function () {
              resetForm();
              renderList();
              render();
            })
            .catch(function (e) {
              error.textContent = e.message;
            })
            .then(function () {
              submit.disabled = false;
            });
        });
        cancelEdit.addEventListener('click', resetForm);

        var panel = C.h(
          'div',
          {
            style: { width: 'min(520px, 94vw)', 'max-height': '88vh', overflow: 'auto', background: '#fff', color: '#111827', 'border-radius': '14px', padding: '20px', 'box-shadow': '0 24px 60px rgba(0,0,0,.35)', font: '14px/1.4 system-ui, sans-serif' },
            on: { click: function (e) { e.stopPropagation(); } },
          },
          [
            C.h('div', { style: { display: 'flex', 'justify-content': 'space-between', 'align-items': 'center', 'margin-bottom': '8px' } }, [
              C.h('div', { text: 'My links', style: { 'font-size': '16px', 'font-weight': '700' } }),
              C.h('button', { text: '✕', attrs: { type: 'button', 'aria-label': 'Close' }, style: { border: '0', background: 'transparent', cursor: 'pointer', 'font-size': '16px' }, on: { click: closeManager } }),
            ]),
            counter,
            list,
            field('Name', title),
            field('URL', url),
            field('Icon', icon),
            field('Opens in', mode),
            error,
            C.h('div', {}, [submit, cancelEdit]),
          ],
        );
        document.body.appendChild(C.mark(C.h('div', { className: 'mgc-overlay', on: { click: closeManager } }, [panel]), 'user-links-manager'));
        renderList();
      }

      refresh().then(render);
      C.watch('user-links', render);

      return function () {
        state.stopped = true;
        closeManager();
      };
    },
  });
})(window.__mgcCustomizer);
