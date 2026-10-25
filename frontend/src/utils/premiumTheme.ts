// The data model of the premium (design-movement) theme editor. Field names must stay identical
// to what backend/runtime-scripts/premium-theme.js reads, since a theme saved here is rendered by it.

export type DesignStyle =
  | 'brutalist'
  | 'clay'
  | 'maximalist'
  | 'liquidGlass'
  | 'skeuomorphic'
  | 'glass'
  | 'neumorphic'
  | 'cyberpunk'
  | 'vaporwave'
  | 'artdeco'
  | 'darkMode';

export type BorderRadiusStyle = 'sharp' | 'soft' | 'rounded' | 'pill';

export const DESIGN_STYLE_META: Record<DesignStyle, { label: string; icon: string }> = {
  brutalist: { label: 'Brutalism', icon: '■' },
  clay: { label: 'Claymorphism', icon: '●' },
  maximalist: { label: 'Maximalism', icon: '✦' },
  liquidGlass: { label: 'Liquid Glass', icon: '◉' },
  skeuomorphic: { label: 'Skeuomorphism', icon: '▤' },
  glass: { label: 'Glassmorphism', icon: '◇' },
  neumorphic: { label: 'Neumorphism', icon: '▢' },
  cyberpunk: { label: 'Cyberpunk', icon: '◈' },
  vaporwave: { label: 'Vaporwave', icon: '▲' },
  artdeco: { label: 'Art Deco', icon: '◆' },
  darkMode: { label: 'Dark Mode', icon: '◐' },
};

export interface InterfaceColors {
  dashboardBg: string
  sidebarBg: string
  sidebarText: string
  sidebarActive: string
  locationSwitcherBg: string
  locationSwitcherText: string
  sidebarSectionLabelBg: string
  sidebarSectionLabelText: string
  headerBg: string
  headerIcon: string
  quickActionsIcon: string
  cardHeaderBg: string
  cardContentBg: string
  inputBg: string
  primaryButtonBg: string
  activeTabAccent: string
  updateButtonBg: string
  sidebarGoBackBg: string
  titleText: string
  scrollbarThumb: string
  scrollbarTrack: string

  tableHeaderBg: string
  tableBorderColor: string
  statTileBg: string
  statTileBorder: string
  statTileValueText: string
  statTileLabelText: string
  avatarFallbackBg: string

  chartSeriesColor1: string
  chartSeriesColor2: string
  chartSeriesColor3: string
  dashboardEditModeBg: string
  dashboardDateRangeBg: string

  conversationsListBg: string
  bubbleInboundBg: string
  bubbleOutboundBg: string
  composerInputBg: string
  threadHeaderBg: string
  dateSeparatorBg: string

  calendarGridBg: string
  calendarTodayAccent: string
  calendarEventBg: string
  calendarToolbarBg: string
  calendarViewSelectBg: string
  calendarTypeSelectorText: string
  calendarManageViewAccent: string

  paymentsAlertBannerBg: string
  paymentsTableBg: string

  contactsCountBadgeBg: string
  contactsCountBadgeText: string
  contactsTagPillBg: string
  contactsBulkToolbarBg: string
  contactsImportButtonAccent: string
  contactsAddButtonBg: string

  oppStageColumnBg: string
  oppStageHeaderText: string
  oppCardBg: string
  oppCardWonBg: string

  dashboardWidgetBg: string
  dashboardWidgetBorder: string
  dashboardEmptyStateIconBg: string
  dashboardEmptyStateText: string
  dashboardDragHandleBg: string
  dashboardAddWidgetBg: string

  conversationsUnreadIndicatorBg: string
  conversationsTimestampText: string
  channelIconTint: string
  composerSendButtonBg: string
  newChatButtonBg: string
  contactDetailActiveIconColor: string
  channelDropdownOptionText: string
  sidePanelBg: string
  sidePanelTagsSectionBg: string

  calendarNowLineColor: string
  calendarWeekendBg: string
  calendarFilterDrawerBg: string

  paymentsStatusPaidBg: string
  paymentsStatusOverdueBg: string
  paymentsStatusDraftBg: string
  paymentsTableZebraBg: string

  contactsDetailHeaderBannerBg: string
  contactsDetailCustomFieldBg: string

  oppStageCountBadgeBg: string
  oppCardValueText: string
  oppCardSourceTagBg: string
  oppCardAvatarBg: string
  oppPipelineSwitcherBg: string
  oppFilterBarAccent: string
}

export interface InterfaceElementMeta {
  key: keyof InterfaceColors
  label: string
  selector: string
  group:
    | 'Navigation & Sidebar' | 'Header' | 'Cards & Inputs' | 'Buttons'
    | 'Shared Components' | 'Dashboard' | 'Conversations' | 'Calendars' | 'Payments' | 'Contacts' | 'Opportunities'
  premium?: boolean
}

export const GHL_ELEMENTS: InterfaceElementMeta[] = [
  { key: 'headerIcon', label: 'Header Icon Color', selector: '#hl_header--help', group: 'Header' },
  { key: 'locationSwitcherBg', label: 'Location Switcher Background', selector: '#location-switcher-sidbar-v2', group: 'Navigation & Sidebar' },
  { key: 'locationSwitcherText', label: 'Location Switcher Text', selector: '#location-switcher-sidbar-v2 .hl_text-overflow', group: 'Navigation & Sidebar' },
  // "MY BUSINESS" / "BUSINESS SERVICES" / "OTHER SETTINGS" — the small
  // uppercase divider labels GHL renders above each sidebar section, all
  // sharing the identical ".divider > p > span.default-bg-color" markup, so
  // one pair of fields recolors every section label at once.
  { key: 'sidebarSectionLabelBg', label: 'Sidebar Section Label Background', selector: '#sidebar-v2 .divider .default-bg-color', group: 'Navigation & Sidebar' },
  { key: 'sidebarSectionLabelText', label: 'Sidebar Section Label Text', selector: '#sidebar-v2 .divider .default-bg-color', group: 'Navigation & Sidebar' },
  { key: 'cardHeaderBg', label: 'Card Header Background', selector: '.hl-card-header', group: 'Cards & Inputs' },
  { key: 'cardContentBg', label: 'Card Content Background', selector: '.hl-card-content', group: 'Cards & Inputs' },
  { key: 'inputBg', label: 'Input Field Background', selector: '.n-input', group: 'Cards & Inputs' },
  { key: 'primaryButtonBg', label: 'Primary / Dialer Button', selector: '#custom-dialer-button', group: 'Buttons' },
  { key: 'updateButtonBg', label: 'Update / Save Button', selector: '.n-button.n-button--primary-type', group: 'Buttons' },
  { key: 'sidebarGoBackBg', label: 'Sidebar "Go Back" Button', selector: '#backButtonv2', group: 'Buttons' },
  { key: 'activeTabAccent', label: 'Active Tab Accent', selector: '.topmenu-nav .topmenu-navitem.active, .topmenu-nav .active', group: 'Shared Components' },
  { key: 'quickActionsIcon', label: 'Quick Actions & Search Icon', selector: '#quickActions, #globalSearchOpener', group: 'Navigation & Sidebar' },
  { key: 'titleText', label: 'Page Title Text', selector: '.title', group: 'Buttons' },
  { key: 'scrollbarThumb', label: 'Scrollbar Thumb', selector: '::-webkit-scrollbar-thumb', group: 'Buttons', premium: true },
  { key: 'scrollbarTrack', label: 'Scrollbar Track', selector: '::-webkit-scrollbar-track', group: 'Buttons', premium: true },

  { key: 'tableHeaderBg', label: 'Table Header Background', selector: '.tabulator-header', group: 'Shared Components' },
  { key: 'tableBorderColor', label: 'Table Border Color', selector: '.tabulator-cell, .hr-data-table-table', group: 'Shared Components' },
  { key: 'statTileBg', label: 'Stat Tile Background', selector: '.ui-statistic', group: 'Shared Components' },
  { key: 'statTileBorder', label: 'Stat Tile Border', selector: '.ui-statistic', group: 'Shared Components' },
  { key: 'statTileValueText', label: 'Stat Tile Value Text', selector: '.ui-statistic .ui-display-sm-semibold', group: 'Shared Components' },
  { key: 'statTileLabelText', label: 'Stat Tile Label Text', selector: '.ui-statistic-header .ui-text-sm-medium', group: 'Shared Components' },
  { key: 'avatarFallbackBg', label: 'Avatar Fallback Background', selector: '.contact.my-tooltip, .avatar_img', group: 'Shared Components' },

  { key: 'dashboardEditModeBg', label: 'Edit Dashboard Button', selector: '#location-dashboard_btn--edit-dashboard', group: 'Dashboard' },
  { key: 'dashboardDateRangeBg', label: 'Date Range Picker', selector: '#reporting_common_datepicker-btn-trigger', group: 'Dashboard' },

  { key: 'conversationsListBg', label: 'Conversation List Background', selector: '#conversations-list', group: 'Conversations' },
  { key: 'composerInputBg', label: 'Composer Input Background', selector: '#conv-composer-inline-expand-trigger', group: 'Conversations' },
  { key: 'threadHeaderBg', label: 'Thread Header Background', selector: '#conv-mail-thread-header', group: 'Conversations' },
  { key: 'dateSeparatorBg', label: 'Date Separator Pill', selector: '#date-label-CONV_START_DATE', group: 'Conversations' },

  { key: 'calendarGridBg', label: 'Calendar Grid Background', selector: '#fc-calendar-container-v2', group: 'Calendars' },
  { key: 'calendarTodayAccent', label: "Today Column Accent", selector: '.fc-day-today, .fc-col-header-cell.fc-day', group: 'Calendars' },
  { key: 'calendarToolbarBg', label: 'Calendar Toolbar Background', selector: 'nav.bg-white.border-b', group: 'Calendars' },
  { key: 'calendarViewSelectBg', label: 'View Selector Background', selector: '#view-select', group: 'Calendars' },
  { key: 'calendarTypeSelectorText', label: 'Calendar Type Selector Text', selector: '#industry-select .n-base-selection-input__content', group: 'Calendars' },
  { key: 'calendarManageViewAccent', label: 'Manage View Panel Accent', selector: '#customizations-button, #all > input.n-radio-input, [id^="see-more-button-"]', group: 'Calendars' },

  { key: 'paymentsAlertBannerBg', label: 'Payment Gateway Alert Banner', selector: '#payment-integration-alert', group: 'Payments' },
  { key: 'paymentsTableBg', label: 'Invoice Table Background', selector: '#invoice_listing .ui-table-container__wrapper', group: 'Payments' },

  { key: 'contactsCountBadgeBg', label: 'Contact Count Badge', selector: '.pipeline-ribbon .count', group: 'Contacts' },
  { key: 'contactsCountBadgeText', label: 'Contact Count Badge Text', selector: '.pipeline-ribbon .count', group: 'Contacts' },
  { key: 'contactsTagPillBg', label: 'Tag Pill Background', selector: '#table-container .tabulator-cell.no-padding > div > div', group: 'Contacts' },
  { key: 'contactsBulkToolbarBg', label: 'Bulk Action Toolbar', selector: 'div.bulk-actions div.bulk-action.d-flex', group: 'Contacts' },
  { key: 'contactsImportButtonAccent', label: 'Import Button', selector: '#import-btn', group: 'Contacts' },
  { key: 'contactsAddButtonBg', label: 'Add Contact Button', selector: '#add-record-btn', group: 'Contacts' },

  { key: 'oppStageColumnBg', label: 'Pipeline Stage Column', selector: '.crm-opportunities-stage', group: 'Opportunities' },
  { key: 'oppStageHeaderText', label: 'Stage Header Text', selector: '[id^="data-stage-name-"]', group: 'Opportunities' },
  { key: 'oppCardBg', label: 'Opportunity Card Background', selector: '.crm-opportunities-card-fields', group: 'Opportunities' },
  { key: 'oppCardWonBg', label: "Opportunity Card — Won", selector: '.won-card-bg', group: 'Opportunities' },

  { key: 'dashboardWidgetBg', label: 'Widget Background', selector: '.hr-card', group: 'Dashboard' },
  { key: 'dashboardWidgetBorder', label: 'Widget Border', selector: '.hr-card', group: 'Dashboard' },
  { key: 'dashboardEmptyStateIconBg', label: 'Empty State Icon Background', selector: '.hr-empty__header .hr-icon-wrapper', group: 'Dashboard' },
  { key: 'dashboardEmptyStateText', label: 'Empty State Text', selector: 'p.hr-text.hr-text-lg', group: 'Dashboard' },
  { key: 'dashboardAddWidgetBg', label: 'Add Widget Button', selector: '#location-dashboard_btn--add-widget', group: 'Dashboard' },

  { key: 'conversationsUnreadIndicatorBg', label: 'Unread Indicator', selector: 'div.text-\\[12px\\].text-white', group: 'Conversations' },
  { key: 'conversationsTimestampText', label: 'Timestamp Text', selector: 'span.text-\\[12px\\].text-gray-500', group: 'Conversations' },
  { key: 'channelIconTint', label: 'Channel Icon Tint (SMS/Email/Call/FB)', selector: '#conv-provider-select-trigger svg.text-primary-600', group: 'Conversations' },
  { key: 'composerSendButtonBg', label: 'Composer Send Button', selector: '#conv-send-button-simple', group: 'Conversations' },
  { key: 'newChatButtonBg', label: 'New Conversation Button', selector: '#new-conversation-btn-collapsed, #new-conversation-btn', group: 'Conversations' },
  { key: 'contactDetailActiveIconColor', label: 'Active Detail Panel Icon', selector: '#contacts-highrise-right-side-bar-wrapper .sidebar-option-button.text-blue-600', group: 'Conversations' },
  { key: 'channelDropdownOptionText', label: 'Channel Dropdown Text', selector: '[id^="conv-channel-bar-option-"] .text-sm.font-medium.truncate.min-w-0', group: 'Conversations' },
  { key: 'sidePanelBg', label: 'Contact Side Panel Background', selector: '.bg-contacts-panel', group: 'Conversations' },

  { key: 'calendarNowLineColor', label: 'Now-Line Indicator', selector: '.fc-timegrid-now-indicator-line', group: 'Calendars' },
  { key: 'calendarFilterDrawerBg', label: 'Filter Drawer', selector: '#calendar-view-filter-drawer', group: 'Calendars' },

  { key: 'paymentsStatusPaidBg', label: 'Status Tag — Paid', selector: '.hr-tag.hr-tag--round (matched by text content "Paid")', group: 'Payments' },
  { key: 'paymentsStatusOverdueBg', label: 'Status Tag — Overdue', selector: '.hr-tag.hr-tag--round (matched by text content "Overdue")', group: 'Payments' },
  { key: 'paymentsStatusDraftBg', label: 'Status Tag — Draft', selector: '.hr-tag.hr-tag--round (matched by text content "Draft")', group: 'Payments' },

  { key: 'contactsDetailCustomFieldBg', label: 'Detail Page — Custom Field Group', selector: '.hr-collapse-item__header', group: 'Contacts' },

  { key: 'oppCardValueText', label: 'Card — Value/Currency Text', selector: '#monetaryValue span.truncate.hr-ellipsis span', group: 'Opportunities' },
  { key: 'oppCardAvatarBg', label: 'Card — Avatar', selector: '.hr-avatar.ui-avatar__default', group: 'Opportunities' },
  { key: 'oppPipelineSwitcherBg', label: 'Pipeline Switcher Dropdown', selector: '#pipelineDropdDown-listview', group: 'Opportunities' },
  { key: 'oppFilterBarAccent', label: 'Advanced Filters / Sort Accent', selector: '.advanced-container button, #field-selection', group: 'Opportunities' },
  // Same underlying elements/keys as the Contacts tab's count badge
  // fields — ".pipeline-ribbon .count" is a shared GHL component reused
  // on both pages, confirmed via a live DOM dump under "#newTopBar" here.
  // Surfaced again under Opportunities for discoverability; editing
  // either copy changes the same value.
  { key: 'contactsCountBadgeBg', label: 'Opportunity Count Badge', selector: '#newTopBar .pipeline-ribbon .count', group: 'Opportunities' },
  { key: 'contactsCountBadgeText', label: 'Opportunity Count Badge Text', selector: '#newTopBar .pipeline-ribbon .count', group: 'Opportunities' },
]

export const DEFAULT_INTERFACE_COLORS: InterfaceColors = {
  dashboardBg: '#0f172a',
  sidebarBg: '#111827',
  sidebarText: '#e5e7eb',
  sidebarActive: '#6366f1',
  locationSwitcherBg: '#1f2937',
  locationSwitcherText: '#f8fafc',
  sidebarSectionLabelBg: '#000000',
  sidebarSectionLabelText: '#000000',
  headerBg: '#0f172a',
  headerIcon: '#818cf8',
  quickActionsIcon: '#a5b4fc',
  cardHeaderBg: '#f8fafc',
  cardContentBg: '#ffffff',
  inputBg: '#ffffff',
  primaryButtonBg: '#6366f1',
  updateButtonBg: '#6366f1',
  sidebarGoBackBg: '#0f172a',
  activeTabAccent: '#6366f1',
  titleText: '#1e293b',
  scrollbarThumb: '#94a3b8',
  scrollbarTrack: '#f1f5f9',

  tableHeaderBg: '#f8fafc',
  tableBorderColor: '#e2e8f0',
  statTileBg: '#ffffff',
  statTileBorder: '#e2e8f0',
  statTileValueText: '#0f172a',
  statTileLabelText: '#64748b',
  avatarFallbackBg: '#6366f1',

  chartSeriesColor1: '#6366f1',
  chartSeriesColor2: '#818cf8',
  chartSeriesColor3: '#e0e7ff',
  dashboardEditModeBg: '#6366f1',
  dashboardDateRangeBg: '#ffffff',

  conversationsListBg: '#ffffff',
  bubbleInboundBg: '#f1f5f9',
  bubbleOutboundBg: '#6366f1',
  composerInputBg: '#ffffff',
  threadHeaderBg: '#f8fafc',
  dateSeparatorBg: '#f1f5f9',

  calendarGridBg: '#ffffff',
  calendarTodayAccent: '#6366f1',
  calendarEventBg: '#6366f1',
  calendarToolbarBg: '#ffffff',
  calendarViewSelectBg: '#ffffff',
  calendarTypeSelectorText: '#1e293b',
  calendarManageViewAccent: '#6366f1',

  paymentsAlertBannerBg: '#e0e7ff',
  paymentsTableBg: '#ffffff',

  contactsCountBadgeBg: '#e0e7ff',
  contactsCountBadgeText: '#4338ca',
  contactsTagPillBg: '#e0e7ff',
  contactsBulkToolbarBg: '#f8fafc',
  contactsImportButtonAccent: '#6366f1',
  contactsAddButtonBg: '#6366f1',

  oppStageColumnBg: '#f8fafc',
  oppStageHeaderText: '#1e293b',
  oppCardBg: '#ffffff',
  oppCardWonBg: '#dcfce7',

  dashboardWidgetBg: '#0f172a',
  dashboardWidgetBorder: '#1f2937',
  dashboardEmptyStateIconBg: '#e0e7ff',
  dashboardEmptyStateText: '#f8fafc',
  dashboardDragHandleBg: '#6366f1',
  dashboardAddWidgetBg: '#6366f1',

  conversationsUnreadIndicatorBg: '#6366f1',
  conversationsTimestampText: '#f8fafc',
  channelIconTint: '#818cf8',
  composerSendButtonBg: '#6366f1',
  newChatButtonBg: '#6366f1',
  contactDetailActiveIconColor: '#6366f1',
  channelDropdownOptionText: '#1e293b',
  sidePanelBg: '#0f172a',
  sidePanelTagsSectionBg: '#e0e7ff',

  calendarNowLineColor: '#6366f1',
  calendarWeekendBg: '#e0e7ff',
  calendarFilterDrawerBg: '#ffffff',

  paymentsStatusPaidBg: '#dcfce7',
  paymentsStatusOverdueBg: '#fee2e2',
  paymentsStatusDraftBg: '#f1f5f9',
  paymentsTableZebraBg: '#e0e7ff',

  contactsDetailHeaderBannerBg: '#818cf8',
  contactsDetailCustomFieldBg: '#0f172a',

  oppStageCountBadgeBg: '#e0e7ff',
  oppCardValueText: '#f8fafc',
  oppCardSourceTagBg: '#e0e7ff',
  oppCardAvatarBg: '#6366f1',
  oppPipelineSwitcherBg: '#0f172a',
  oppFilterBarAccent: '#6366f1',
}

export interface TextureParams {
  liquidGlass: { blurAmount: number; refractionOpacity: number; orbGlow: number; edgeHighlightOpacity: number }
  maximalist: { boxDepth: number; bevelAngle: number; shadowLayers: number; outlineWeight: number }
  brutalist: { borderWeight: number; shadowOffsetX: number; shadowOffsetY: number }
  clay: { innerShadowDepth: number; outerShadowDepth: number; cornerSoftness: number }
  skeuomorphic: { gradientDepth: number; highlightOpacity: number; grainOpacity: number }
  glass: { blurAmount: number; panelOpacity: number; sidebarOpacity: number; borderGlowOpacity: number }
  neumorphic: { shadowDistance: number; shadowBlur: number; cornerRadius: number; highlightOpacity: number }
  cyberpunk: { neonGlowRadius: number; neonGlowOpacity: number; borderWeight: number; textGlowRadius: number }
  vaporwave: { gradientAngle: number; glowRadius: number; borderWeight: number; retroShadowOffset: number }
  artdeco: { lineWeight: number; letterSpacing: number; borderOpacity: number }
  darkMode: { blurAmount: number; shadowDepth: number; borderWeight: number; cornerRadius: number }
}

export const DEFAULT_TEXTURE: TextureParams = {
  liquidGlass: { blurAmount: 28, refractionOpacity: 0.08, orbGlow: 0.45, edgeHighlightOpacity: 0.5 },
  maximalist: { boxDepth: 6, bevelAngle: 0, shadowLayers: 1, outlineWeight: 3 },
  brutalist: { borderWeight: 3, shadowOffsetX: 0, shadowOffsetY: 0 },
  clay: { innerShadowDepth: 10, outerShadowDepth: 20, cornerSoftness: 26 },
  skeuomorphic: { gradientDepth: 3, highlightOpacity: 0.6, grainOpacity: 0.25 },
  glass: { blurAmount: 24, panelOpacity: 0.08, sidebarOpacity: 0.5, borderGlowOpacity: 0.18 },
  neumorphic: { shadowDistance: 6, shadowBlur: 12, cornerRadius: 16, highlightOpacity: 0.6 },
  cyberpunk: { neonGlowRadius: 16, neonGlowOpacity: 0.45, borderWeight: 2, textGlowRadius: 7 },
  vaporwave: { gradientAngle: 90, glowRadius: 20, borderWeight: 1, retroShadowOffset: 2 },
  artdeco: { lineWeight: 1.5, letterSpacing: 0.09, borderOpacity: 0.55 },
  darkMode: { blurAmount: 0, shadowDepth: 4, borderWeight: 1, cornerRadius: 8 },
}

export function normalizeTexture(input: unknown): TextureParams {
  const source = (input && typeof input === 'object' ? input : {}) as Record<string, Record<string, number> | undefined>
  const result: Record<string, Record<string, number>> = {}
  ;(Object.keys(DEFAULT_TEXTURE) as (keyof TextureParams)[]).forEach((style) => {
    result[style as string] = { ...(DEFAULT_TEXTURE[style] as Record<string, number>), ...(source[style as string] || {}) }
  })
  return result as unknown as TextureParams
}

export type SidebarEffectStyle = 'inherit' | 'flat' | 'threeDBox' | 'glass' | 'bordered' | 'neumorphic' | 'clay'

export interface SidebarEffectMeta {
  label: string
  icon: string
}

export const SIDEBAR_EFFECT_META: Record<SidebarEffectStyle, SidebarEffectMeta> = {
  inherit: { label: 'Match Theme Style', icon: '◐' },
  flat: { label: 'Flat', icon: '▬' },
  threeDBox: { label: '3D Box', icon: '▣' },
  glass: { label: 'Glass', icon: '◇' },
  bordered: { label: 'Bordered', icon: '▢' },
  neumorphic: { label: 'Neumorphic', icon: '◌' },
  clay: { label: 'Clay', icon: '●' },
}

export interface SidebarEffectParams {
  style: SidebarEffectStyle
  textColor: string
  activeTextColor: string
  threeDBox: { depth: number; outlineWeight: number }
  glass: { blurAmount: number; opacity: number }
  bordered: { borderWeight: number; cornerRadius: number }
  neumorphic: { shadowDistance: number; shadowBlur: number }
  clay: { innerShadowDepth: number; outerShadowDepth: number }
}

export const DEFAULT_SIDEBAR_EFFECT: SidebarEffectParams = {
  style: 'inherit',
  textColor: '#1e293b',
  activeTextColor: '#ffffff',
  threeDBox: { depth: 4, outlineWeight: 2 },
  glass: { blurAmount: 16, opacity: 0.12 },
  bordered: { borderWeight: 2, cornerRadius: 8 },
  neumorphic: { shadowDistance: 6, shadowBlur: 12 },
  clay: { innerShadowDepth: 8, outerShadowDepth: 16 },
}

export function normalizeSidebarEffect(input: unknown): SidebarEffectParams {
  const source = (input && typeof input === 'object' ? input : {}) as Partial<SidebarEffectParams>
  return {
    style: source.style || DEFAULT_SIDEBAR_EFFECT.style,
    textColor: source.textColor || DEFAULT_SIDEBAR_EFFECT.textColor,
    activeTextColor: source.activeTextColor || DEFAULT_SIDEBAR_EFFECT.activeTextColor,
    threeDBox: { ...DEFAULT_SIDEBAR_EFFECT.threeDBox, ...(source.threeDBox || {}) },
    glass: { ...DEFAULT_SIDEBAR_EFFECT.glass, ...(source.glass || {}) },
    bordered: { ...DEFAULT_SIDEBAR_EFFECT.bordered, ...(source.bordered || {}) },
    neumorphic: { ...DEFAULT_SIDEBAR_EFFECT.neumorphic, ...(source.neumorphic || {}) },
    clay: { ...DEFAULT_SIDEBAR_EFFECT.clay, ...(source.clay || {}) },
  }
}


export interface PremiumTheme {
  name: string;
  style: DesignStyle;
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  text: string;
  border: string;
  borderRadius: BorderRadiusStyle;
  interfaceColors: InterfaceColors;
  texture: TextureParams;
  sidebarEffect: SidebarEffectParams;
}
