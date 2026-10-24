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
 * Selectors marked "verified" were confirmed against a live GHL portal (DOM
 * dumps of the v2 location and agency apps); the rest are best-known fallbacks.
 * Re-verify against a live portal (DevTools → inspect) after a GHL UI release.
 */
export const GHL_SELECTORS = {
  // App chrome
  sidebar: '#sidebar-v2, .sidebar-v2-location, .sidebar-v2-agency',
  sidebarNav: '#sidebar-v2 nav, .sidebar-v2-location nav, .sidebar-v2-agency nav',
  // verified: native links carry ids prefixed "sb_"; app-injected links use .custom_page_sidenav.
  sidebarLink:
    "#sidebar-v2 nav a[id^='sb_'], #sidebar-v2 nav a.custom_page_sidenav, #sidebar-v2 nav a, .sidebar-v2-location nav a, .sidebar-v2-agency nav a",
  sidebarLinkActive:
    '#sidebar-v2 nav a.active, #sidebar-v2 nav a.router-link-exact-active, .sidebar-v2-location nav a.active',
  sidebarLinkLabel: '.hl_text-overflow, .nav-title, span',
  sidebarIcon: '#sidebar-v2 nav a svg, #sidebar-v2 nav a img, #sidebar-v2 nav a i',
  sidebarScroll: '#sidebar-v2 .overflow-y-auto, #sidebar-v2 nav',
  locationSwitcher: '#location-switcher-sidbar-v2, .hl_switcher-loc-name',
  header: '.hl_header .container-fluid, .hl_header, header.hl_header',
  headerControls: '.hl_header--controls, .hl_header .hl_header--right, .hl_header',
  // verified: GHL renders the agency logo as .agency-logo — an <img> or an <svg> wrapping an <image>.
  logo: '.agency-logo, .agency-logo-container img, #sidebar-v2 .agency-logo img',
  primaryButton: '.btn-primary, .hl-btn.bg-curious-blue, .n-button--primary-type',
  link: '.hl_wrapper a:not(.btn):not(.n-button)',
  pageContent: '.hl_wrapper--inner, .hl_wrapper, #app main',

  // Page-level button placements (matched together with a route pattern in the script)
  dashboardToolbar: '.location-dashboard_header, #location-dashboard .dashboard-header, .hl_wrapper--inner',
  contactToolbar:
    '.flex.flex-row.justify-start.items-center.topmenu-nav, .hl_contact-details-left .hl_contact-details-header, .hl_wrapper--inner',
  opportunityToolbar: '#newTopBar, .hl_opportunities .hl_controls, .hl_controls, .hl_wrapper--inner',
  recordToolbar: '.hl_record-details-header, .hl_wrapper--inner',
  recordTabs: '.hl_record-details .n-tabs-nav, .n-tabs-nav, .hl_wrapper--inner',

  // Anchors used by the menu / launchpad / opportunity features (verified)
  topMenuNav: '.flex.flex-row.justify-start.items-center.topmenu-nav, .topmenu-nav',
  headerAnchor: '#CalendarsFeatureDiscovery',
  opportunityModal: '#opportunitiesModel',
  // The tab list inside the opportunity dialog, and the content area next to it (verified).
  opportunityTabStrip: '.wrapperHeader',
  opportunityTabContent:
    'body > div.n-modal-container > div > div > div.n-scrollbar-container > div > div.n-card.n-modal.hl-modal > div.n-card__content > div.wrapper > div > div.innerWrapper.mt-2\\.5.flex.border-t.border-gray-200.pt-3\\.5 > div.w-full',
  launchpadAnchor: '#invite-user',
  sidebarOpportunities: '#sb_opportunities',
  sidebarBilling: '#sb_saas-billing',

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
