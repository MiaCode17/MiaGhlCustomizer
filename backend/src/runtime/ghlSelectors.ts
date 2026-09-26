/**
 * The one map of GHL portal DOM selectors used by the runtime layer.
 *
 * GHL has no stable public JS/DOM API, so everything the customizer injects is
 * located by CSS selector. Both the server-side CSS builders (runtime/css.ts)
 * and the browser embed script (runtime-scripts/*.js, which receives this
 * object as `C.sel`) read from here. When GHL changes its markup, this is the
 * only file that needs updating.
 *
 * Selectors are comma-separated fallback lists: the first match wins for DOM
 * injection, and all of them receive CSS rules.
 *
 * These are best-known GHL v2 selectors. Verify them against a live GHL portal
 * (DevTools → inspect) before relying on a feature in production.
 */
export const GHL_SELECTORS = {
  // App chrome
  sidebar: '#sidebar-v2, .sidebar-v2-location, .sidebar-v2-agency',
  sidebarNav: '#sidebar-v2 nav, .sidebar-v2-location nav, .sidebar-v2-agency nav',
  sidebarLink: '#sidebar-v2 nav a, .sidebar-v2-location nav a, .sidebar-v2-agency nav a',
  sidebarLinkActive:
    '#sidebar-v2 nav a.active, #sidebar-v2 nav a.router-link-exact-active, .sidebar-v2-location nav a.active',
  sidebarLinkLabel: '.nav-title, .hl_text-overflow, span',
  sidebarIcon: '#sidebar-v2 nav a svg, #sidebar-v2 nav a img, #sidebar-v2 nav a i',
  sidebarScroll: '#sidebar-v2 .overflow-y-auto, #sidebar-v2 nav',
  locationSwitcher: '#location-switcher-sidbar-v2, .hl_switcher-loc-name',
  header: '.hl_header, header.hl_header',
  headerControls: '.hl_header .hl_header--controls, .hl_header .hl_header--right, .hl_header',
  logo: '.agency-logo-container img, img.agency-logo, #sidebar-v2 .agency-logo img',
  primaryButton: '.btn-primary, .hl-btn.bg-curious-blue, .n-button--primary-type',
  link: '.hl_wrapper a:not(.btn):not(.n-button)',
  pageContent: '.hl_wrapper--inner, .hl_wrapper, #app main',

  // Page-level button placements (matched together with a route pattern in the script)
  dashboardToolbar: '#location-dashboard .dashboard-header, .hl_wrapper--inner',
  contactToolbar: '.hl_contact-details-left .hl_contact-details-header, .hl_contact-details-left, .hl_wrapper--inner',
  opportunityToolbar: '.hl_opportunities .hl_controls, .hl_controls, .hl_wrapper--inner',
  recordToolbar: '.hl_record-details-header, .hl_wrapper--inner',
  recordTabs: '.hl_record-details .n-tabs-nav, .n-tabs-nav, .hl_wrapper--inner',

  // Native loading states (used by the loader feature to know when a route has settled)
  nativeLoader: '.hl-loader, .n-spin-container .n-spin, .loading-overlay',

  // Conversations
  conversationsLink: '#sb_conversations, a[href*="/conversations"]',
  messageOutbound: '.messages-single--outbound .message-bubble, .message-outbound .message-body',
  messageInbound: '.messages-single--inbound .message-bubble, .message-inbound .message-body',
  messageTimestamp: '.messages-single .time-date, .message-time',
  messageAvatar: '.messages-single .avatar, .message-avatar',
  messageThread: '.hl_conversations--message-body, .conversation-messages',

  // Login page (served as a standalone stylesheet by /runtime/login-css)
  loginRoot: '.hl_login, #app .hl_login',
  loginBody: '.hl_login--body, .hl_login .card',
  loginLogo: '.hl_login .agency-logo, .hl_login--header img, .hl_login img',
  loginInput: '.hl_login input, .hl_login .form-control',
  loginButton: '.hl_login button[type="submit"], .hl_login .btn-primary',
  loginLink: '.hl_login a',
} as const;

export type GhlSelectorKey = keyof typeof GHL_SELECTORS;

/**
 * Stored theme color rules may use these short, portable aliases instead of
 * raw GHL selectors (the built-in presets do). They are expanded server-side
 * before the CSS is served.
 */
export const SELECTOR_ALIASES: Record<string, GhlSelectorKey> = {
  '.hl-header': 'header',
  '.hl-sidebar': 'sidebar',
  '.hl-btn-primary': 'primaryButton',
  '.hl-link': 'link',
  '.hl-logo': 'logo',
};

export function expandSelector(selector: string): string {
  return selector
    .split(',')
    .map((part) => {
      const trimmed = part.trim();
      const alias = SELECTOR_ALIASES[trimmed];
      return alias ? GHL_SELECTORS[alias] : trimmed;
    })
    .join(', ');
}
