/** What a saved premium theme may contain: the allow-lists the API validates against. Generated from the editor's data model; keep in step with frontend/src/utils/premiumTheme.ts. */

export const DESIGN_STYLES = ["brutalist","clay","maximalist","liquidGlass","skeuomorphic","glass","neumorphic","cyberpunk","vaporwave","artdeco","darkMode"] as const;

export const BORDER_RADIUS_STYLES = ['sharp', 'soft', 'rounded', 'pill'] as const;

export const SIDEBAR_EFFECT_STYLES = ['inherit', 'flat', 'threeDBox', 'glass', 'bordered', 'neumorphic', 'clay'] as const;

export const INTERFACE_COLOR_KEYS: readonly string[] = [
  "dashboardBg",
  "sidebarBg",
  "sidebarText",
  "sidebarActive",
  "locationSwitcherBg",
  "locationSwitcherText",
  "sidebarSectionLabelBg",
  "sidebarSectionLabelText",
  "headerBg",
  "headerIcon",
  "quickActionsIcon",
  "cardHeaderBg",
  "cardContentBg",
  "inputBg",
  "primaryButtonBg",
  "activeTabAccent",
  "updateButtonBg",
  "sidebarGoBackBg",
  "titleText",
  "scrollbarThumb",
  "scrollbarTrack",
  "tableHeaderBg",
  "tableBorderColor",
  "statTileBg",
  "statTileBorder",
  "statTileValueText",
  "statTileLabelText",
  "avatarFallbackBg",
  "chartSeriesColor1",
  "chartSeriesColor2",
  "chartSeriesColor3",
  "dashboardEditModeBg",
  "dashboardDateRangeBg",
  "conversationsListBg",
  "bubbleInboundBg",
  "bubbleOutboundBg",
  "composerInputBg",
  "threadHeaderBg",
  "dateSeparatorBg",
  "calendarGridBg",
  "calendarTodayAccent",
  "calendarEventBg",
  "calendarToolbarBg",
  "calendarViewSelectBg",
  "calendarTypeSelectorText",
  "calendarManageViewAccent",
  "paymentsAlertBannerBg",
  "paymentsTableBg",
  "contactsCountBadgeBg",
  "contactsCountBadgeText",
  "contactsTagPillBg",
  "contactsBulkToolbarBg",
  "contactsImportButtonAccent",
  "contactsAddButtonBg",
  "oppStageColumnBg",
  "oppStageHeaderText",
  "oppCardBg",
  "oppCardWonBg",
  "dashboardWidgetBg",
  "dashboardWidgetBorder",
  "dashboardEmptyStateIconBg",
  "dashboardEmptyStateText",
  "dashboardDragHandleBg",
  "dashboardAddWidgetBg",
  "conversationsUnreadIndicatorBg",
  "conversationsTimestampText",
  "channelIconTint",
  "composerSendButtonBg",
  "newChatButtonBg",
  "contactDetailActiveIconColor",
  "channelDropdownOptionText",
  "sidePanelBg",
  "sidePanelTagsSectionBg",
  "calendarNowLineColor",
  "calendarWeekendBg",
  "calendarFilterDrawerBg",
  "paymentsStatusPaidBg",
  "paymentsStatusOverdueBg",
  "paymentsStatusDraftBg",
  "paymentsTableZebraBg",
  "contactsDetailHeaderBannerBg",
  "contactsDetailCustomFieldBg",
  "oppStageCountBadgeBg",
  "oppCardValueText",
  "oppCardSourceTagBg",
  "oppCardAvatarBg",
  "oppPipelineSwitcherBg",
  "oppFilterBarAccent"
];

/** Fallback for any interface color a saved theme leaves out. */

export const INTERFACE_COLOR_DEFAULTS: Record<string, string> = {
  "dashboardBg": "#0f172a",
  "sidebarBg": "#111827",
  "sidebarText": "#e5e7eb",
  "sidebarActive": "#6366f1",
  "locationSwitcherBg": "#1f2937",
  "locationSwitcherText": "#f8fafc",
  "sidebarSectionLabelBg": "#000000",
  "sidebarSectionLabelText": "#000000",
  "headerBg": "#0f172a",
  "headerIcon": "#818cf8",
  "quickActionsIcon": "#a5b4fc",
  "cardHeaderBg": "#f8fafc",
  "cardContentBg": "#ffffff",
  "inputBg": "#ffffff",
  "primaryButtonBg": "#6366f1",
  "updateButtonBg": "#6366f1",
  "sidebarGoBackBg": "#0f172a",
  "activeTabAccent": "#6366f1",
  "titleText": "#1e293b",
  "scrollbarThumb": "#94a3b8",
  "scrollbarTrack": "#f1f5f9",
  "tableHeaderBg": "#f8fafc",
  "tableBorderColor": "#e2e8f0",
  "statTileBg": "#ffffff",
  "statTileBorder": "#e2e8f0",
  "statTileValueText": "#0f172a",
  "statTileLabelText": "#64748b",
  "avatarFallbackBg": "#6366f1",
  "chartSeriesColor1": "#6366f1",
  "chartSeriesColor2": "#818cf8",
  "chartSeriesColor3": "#e0e7ff",
  "dashboardEditModeBg": "#6366f1",
  "dashboardDateRangeBg": "#ffffff",
  "conversationsListBg": "#ffffff",
  "bubbleInboundBg": "#f1f5f9",
  "bubbleOutboundBg": "#6366f1",
  "composerInputBg": "#ffffff",
  "threadHeaderBg": "#f8fafc",
  "dateSeparatorBg": "#f1f5f9",
  "calendarGridBg": "#ffffff",
  "calendarTodayAccent": "#6366f1",
  "calendarEventBg": "#6366f1",
  "calendarToolbarBg": "#ffffff",
  "calendarViewSelectBg": "#ffffff",
  "calendarTypeSelectorText": "#1e293b",
  "calendarManageViewAccent": "#6366f1",
  "paymentsAlertBannerBg": "#e0e7ff",
  "paymentsTableBg": "#ffffff",
  "contactsCountBadgeBg": "#e0e7ff",
  "contactsCountBadgeText": "#4338ca",
  "contactsTagPillBg": "#e0e7ff",
  "contactsBulkToolbarBg": "#f8fafc",
  "contactsImportButtonAccent": "#6366f1",
  "contactsAddButtonBg": "#6366f1",
  "oppStageColumnBg": "#f8fafc",
  "oppStageHeaderText": "#1e293b",
  "oppCardBg": "#ffffff",
  "oppCardWonBg": "#dcfce7",
  "dashboardWidgetBg": "#0f172a",
  "dashboardWidgetBorder": "#1f2937",
  "dashboardEmptyStateIconBg": "#e0e7ff",
  "dashboardEmptyStateText": "#f8fafc",
  "dashboardDragHandleBg": "#6366f1",
  "dashboardAddWidgetBg": "#6366f1",
  "conversationsUnreadIndicatorBg": "#6366f1",
  "conversationsTimestampText": "#f8fafc",
  "channelIconTint": "#818cf8",
  "composerSendButtonBg": "#6366f1",
  "newChatButtonBg": "#6366f1",
  "contactDetailActiveIconColor": "#6366f1",
  "channelDropdownOptionText": "#1e293b",
  "sidePanelBg": "#0f172a",
  "sidePanelTagsSectionBg": "#e0e7ff",
  "calendarNowLineColor": "#6366f1",
  "calendarWeekendBg": "#e0e7ff",
  "calendarFilterDrawerBg": "#ffffff",
  "paymentsStatusPaidBg": "#dcfce7",
  "paymentsStatusOverdueBg": "#fee2e2",
  "paymentsStatusDraftBg": "#f1f5f9",
  "paymentsTableZebraBg": "#e0e7ff",
  "contactsDetailHeaderBannerBg": "#818cf8",
  "contactsDetailCustomFieldBg": "#0f172a",
  "oppStageCountBadgeBg": "#e0e7ff",
  "oppCardValueText": "#f8fafc",
  "oppCardSourceTagBg": "#e0e7ff",
  "oppCardAvatarBg": "#6366f1",
  "oppPipelineSwitcherBg": "#0f172a",
  "oppFilterBarAccent": "#6366f1"
};

/** Every texture setting per style, with its default; saved values must use exactly these keys. */
export const TEXTURE_DEFAULTS: Record<string, Record<string, number>> = {
  "liquidGlass": {
    "blurAmount": 28,
    "refractionOpacity": 0.08,
    "orbGlow": 0.45,
    "edgeHighlightOpacity": 0.5
  },
  "maximalist": {
    "boxDepth": 6,
    "bevelAngle": 0,
    "shadowLayers": 1,
    "outlineWeight": 3
  },
  "brutalist": {
    "borderWeight": 3,
    "shadowOffsetX": 0,
    "shadowOffsetY": 0
  },
  "clay": {
    "innerShadowDepth": 10,
    "outerShadowDepth": 20,
    "cornerSoftness": 26
  },
  "skeuomorphic": {
    "gradientDepth": 3,
    "highlightOpacity": 0.6,
    "grainOpacity": 0.25
  },
  "glass": {
    "blurAmount": 24,
    "panelOpacity": 0.08,
    "sidebarOpacity": 0.5,
    "borderGlowOpacity": 0.18
  },
  "neumorphic": {
    "shadowDistance": 6,
    "shadowBlur": 12,
    "cornerRadius": 16,
    "highlightOpacity": 0.6
  },
  "cyberpunk": {
    "neonGlowRadius": 16,
    "neonGlowOpacity": 0.45,
    "borderWeight": 2,
    "textGlowRadius": 7
  },
  "vaporwave": {
    "gradientAngle": 90,
    "glowRadius": 20,
    "borderWeight": 1,
    "retroShadowOffset": 2
  },
  "artdeco": {
    "lineWeight": 1.5,
    "letterSpacing": 0.09,
    "borderOpacity": 0.55
  },
  "darkMode": {
    "blurAmount": 0,
    "shadowDepth": 4,
    "borderWeight": 1,
    "cornerRadius": 8
  }
};

export const SIDEBAR_EFFECT_DEFAULTS = {
  "style": "inherit",
  "textColor": "#1e293b",
  "activeTextColor": "#ffffff",
  "threeDBox": {
    "depth": 4,
    "outlineWeight": 2
  },
  "glass": {
    "blurAmount": 16,
    "opacity": 0.12
  },
  "bordered": {
    "borderWeight": 2,
    "cornerRadius": 8
  },
  "neumorphic": {
    "shadowDistance": 6,
    "shadowBlur": 12
  },
  "clay": {
    "innerShadowDepth": 8,
    "outerShadowDepth": 16
  }
};
