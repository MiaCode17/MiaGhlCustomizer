/*
 * Conversation style: restyles GHL's conversation thread bubbles via a
 * server-built stylesheet. Config: { css }.
 */
(function (C) {
  if (!C) return;

  C.register('conversation-style', {
    apply: function (cfg) {
      C.style('conversation-style', cfg.css || '');
    },
  });
})(window.__mgcCustomizer);
