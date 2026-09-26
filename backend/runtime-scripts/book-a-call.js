/*
 * Book a Call: a floating bottom-left pill that opens the agency's booking
 * page in an in-portal modal.
 * Config: { buttonLabel, bookingUrl, backgroundColor, textColor }.
 */
(function (C) {
  if (!C) return;

  C.register('book-a-call', {
    apply: function (cfg) {
      C.watch('book-a-call', function () {
        var existing = document.querySelector('[data-mgc="book-a-call"]');
        if (C.isLoginPage()) {
          if (existing) existing.parentNode.removeChild(existing);
          return;
        }
        if (existing) return;

        var btn = C.button(
          {
            label: cfg.buttonLabel,
            icon: '📅',
            style: 'primary',
            size: 'large',
            backgroundColor: cfg.backgroundColor,
            textColor: cfg.textColor,
            borderColor: cfg.backgroundColor,
            borderWidth: 0,
            borderRadius: 999,
            shadow: 'md',
          },
          'book-a-call',
          function () {
            C.modal(cfg.bookingUrl, cfg.buttonLabel);
          },
        );
        btn.style.position = 'fixed';
        btn.style.left = '16px';
        btn.style.bottom = '16px';
        btn.style.zIndex = '2147482500';
        btn.style.fontWeight = '600';
        document.body.appendChild(btn);
      });
    },
  });
})(window.__mgcCustomizer);
