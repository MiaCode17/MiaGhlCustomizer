import { FilterQuery, Model, Types } from 'mongoose';
import { Banner } from '../models/Banner';
import { BookACall } from '../models/BookACall';
import { ChatBubbleConfig } from '../models/ChatBubbleConfig';
import { Company } from '../models/Company';
import { ConversationStyle } from '../models/ConversationStyle';
import { CustomFieldCampaign } from '../models/CustomFieldCampaign';
import { DynamicLink } from '../models/DynamicLink';
import { FloatingButton } from '../models/FloatingButton';
import { InjectedButton } from '../models/InjectedButton';
import { LaunchpadTile } from '../models/LaunchpadTile';
import { LoaderConfig } from '../models/LoaderConfig';
import { LogoCampaign } from '../models/LogoCampaign';
import { MenuEdit } from '../models/MenuEdit';
import { MiscSettings } from '../models/MiscSettings';
import { SpecialTheme } from '../models/SpecialTheme';
import { Theme } from '../models/Theme';
import { findScoped, ScopedDoc } from '../utils/scope';
import { buildConversationCss, buildThemeCss, themeFontUrls } from './css';

/**
 * Per-feature resolvers for the public runtime API. Each receives an already
 * resolved groupId (see resolveGroupId) and returns only what the embed script
 * needs to render, always including an `enabled` flag so the script can no-op.
 */

export interface RuntimeFeatureConfig {
  enabled: boolean;
  [key: string]: unknown;
}

/** What the viewer's request tells us about where they are (set by the embed script). */
export interface RuntimeContext {
  locationId?: string;
}

type Resolver = (
  companyId: Types.ObjectId,
  groupId: string,
  ctx: RuntimeContext,
) => Promise<RuntimeFeatureConfig>;

const DISABLED: RuntimeFeatureConfig = { enabled: false };

/**
 * List-style features: a group's own items replace the global items entirely;
 * a group with no items of its own inherits the global list.
 */
async function findScopedList<T extends ScopedDoc>(
  model: Model<T>,
  companyId: Types.ObjectId,
  groupId: string,
  extra: FilterQuery<T>,
  sort: Record<string, 1 | -1>,
): Promise<T[]> {
  if (groupId) {
    const own = await model.find({ companyId, groupId, ...extra } as FilterQuery<T>).sort(sort).lean<T[]>();
    if (own.length > 0) return own;
  }
  return model.find({ companyId, groupId: '', ...extra } as FilterQuery<T>).sort(sort).lean<T[]>();
}

const resolveTheme: Resolver = async (companyId, groupId) => {
  const theme = await findScoped(Theme, companyId, groupId);
  if (!theme?.enabled) return DISABLED;
  return {
    enabled: true,
    themeName: theme.themeName,
    css: buildThemeCss(theme),
    fontUrls: themeFontUrls(theme),
  };
};

const resolveSpecialTheme: Resolver = async (companyId, groupId) => {
  const st = await findScoped(SpecialTheme, companyId, groupId);
  if (!st?.enabled || !st.themeKey) return DISABLED;
  return {
    enabled: true,
    themeKey: st.themeKey,
    popup: {
      visible: st.popup.visible,
      title: st.popup.title,
      message: st.popup.message,
      ctaText: st.popup.ctaText ?? '',
      ctaUrl: st.popup.ctaUrl ?? '',
    },
    particleEffect: {
      enabled: st.particleEffect.enabled,
      durationSeconds: st.particleEffect.durationSeconds,
    },
    // Lets popups/banners that just want "the active campaign" key off one value.
    version: st.updatedAt.getTime(),
  };
};

const resolveLogo: Resolver = async (companyId, groupId) => {
  const [campaign] = await findScopedList(LogoCampaign, companyId, groupId, {}, { updatedAt: -1 });
  if (!campaign) return DISABLED;
  return { enabled: true, name: campaign.name, logoUrl: campaign.logoUrl };
};

const resolveButtons: Resolver = async (companyId, groupId) => {
  const buttons = await findScopedList(
    InjectedButton,
    companyId,
    groupId,
    { surface: { $ne: 'opportunity-tab' } },
    { order: 1, createdAt: 1 },
  );
  if (buttons.length === 0) return DISABLED;
  const bySurface: Record<string, unknown[]> = {};
  for (const b of buttons) {
    (bySurface[b.surface] ??= []).push({
      id: String(b._id),
      label: b.label,
      tooltip: b.tooltip ?? '',
      icon: b.icon ?? '',
      style: b.style,
      size: b.size,
      targetUrl: b.targetUrl ?? '',
      backgroundColor: b.backgroundColor ?? '',
      textColor: b.textColor ?? '',
      borderColor: b.borderColor ?? '',
      borderWidth: b.borderWidth,
      borderRadius: b.borderRadius,
      iconPosition: b.iconPosition,
      shadow: b.shadow,
      animation: b.animation,
      fullWidth: b.fullWidth,
      openMode: b.openMode,
      iconOnly: b.iconOnly,
      iconSize: b.iconSize,
      uppercase: b.uppercase,
      bold: b.bold,
      underline: b.underline,
      hoverEffect: b.hoverEffect,
      gradient: b.gradient,
      gradientColor: b.gradientColor ?? '',
      opacity: b.opacity,
      permissions: b.permissions,
      sendContact: b.sendContact,
      sendCustomFields: b.sendCustomFields,
      menuItems: b.menuItems.map((m) => ({
        label: m.label,
        url: m.url,
        openMode: m.openMode,
        sendContact: m.sendContact,
        sendCustomFields: m.sendCustomFields,
      })),
      placementSelector: b.placementSelector ?? '',
    });
  }
  return { enabled: true, surfaces: bySurface };
};

const resolveOpportunityTabs: Resolver = async (companyId, groupId) => {
  const tabs = await findScopedList(
    InjectedButton,
    companyId,
    groupId,
    { surface: 'opportunity-tab' },
    { order: 1, createdAt: 1 },
  );
  if (tabs.length === 0) return DISABLED;
  return {
    enabled: true,
    items: tabs.map((t) => ({
      id: String(t._id),
      label: t.label,
      icon: t.icon ?? '',
      url: t.targetUrl ?? '',
      accentColor: t.backgroundColor ?? '',
      sendContact: t.sendContact,
      sendCustomFields: t.sendCustomFields,
      permissions: t.permissions,
    })),
  };
};

const resolveFloatingButtons: Resolver = async (companyId, groupId) => {
  const buttons = await findScopedList(FloatingButton, companyId, groupId, {}, { createdAt: 1 });
  if (buttons.length === 0) return DISABLED;
  return {
    enabled: true,
    // The browser's clock may be off; the script uses this to time start/end windows correctly.
    serverTime: Date.now(),
    items: buttons.map((b) => ({
      id: String(b._id),
      position: b.position,
      label: b.label,
      icon: b.icon ?? '',
      backgroundColor: b.backgroundColor,
      textColor: b.textColor,
      borderRadius: b.borderRadius,
      shadow: b.shadow,
      animation: b.animation,
      subItems: b.subItems.map((s) => ({ label: s.label, url: s.url })),
      variant: b.variant,
      size: b.size,
      layout: b.layout,
      positionPercent: b.positionPercent,
      edgeOffset: b.edgeOffset,
      url: b.url,
      openMode: b.openMode,
      drawerDirection: b.drawerDirection,
      drawerPercent: b.drawerPercent,
      navTabs: b.navTabs.map((t) => ({ label: t.label, url: t.url })),
      draggable: b.draggable,
      startAt: b.startAt ? b.startAt.getTime() : null,
      endAt: b.endAt ? b.endAt.getTime() : null,
      showCountdown: b.showCountdown,
    })),
  };
};

const resolveLaunchpad: Resolver = async (companyId, groupId) => {
  const tiles = await findScopedList(LaunchpadTile, companyId, groupId, {}, { order: 1, createdAt: 1 });
  if (tiles.length === 0) return DISABLED;
  return {
    enabled: true,
    items: tiles.map((t) => ({
      id: String(t._id),
      kind: t.kind,
      nativeId: t.nativeId,
      description: t.description,
      imageUrl: t.imageUrl,
      buttonText: t.buttonText,
      url: t.url,
      openMode: t.openMode,
      hidden: t.hidden,
    })),
  };
};

const resolveUserLinks: Resolver = async (companyId, groupId, ctx) => {
  const misc = await findScoped(MiscSettings, companyId, groupId);
  // Only meaningful inside a sub-account; the script fetches the links themselves separately
  // so that adding or removing one shows up immediately rather than after the config cache.
  if (!misc?.userLinks?.enabled || !ctx.locationId) return DISABLED;
  return { enabled: true, maxLinks: misc.userLinks.maxLinks };
};

const resolveBookACall: Resolver = async (companyId, groupId) => {
  const cfg = await findScoped(BookACall, companyId, groupId);
  if (!cfg?.enabled || !cfg.bookingUrl) return DISABLED;
  return {
    enabled: true,
    buttonLabel: cfg.buttonLabel,
    bookingUrl: cfg.bookingUrl,
    backgroundColor: cfg.backgroundColor,
    textColor: cfg.textColor,
  };
};

const resolveDynamicLinks: Resolver = async (companyId, groupId) => {
  const links = await findScopedList(DynamicLink, companyId, groupId, {}, { createdAt: 1 });
  if (links.length === 0) return DISABLED;
  return {
    enabled: true,
    items: links.map((l) => ({
      id: String(l._id),
      title: l.title,
      url: l.url,
      icon: l.icon ?? '',
      openMode: l.openMode,
      roleTarget: l.roleTarget,
    })),
  };
};

const resolveMenu: Resolver = async (companyId, groupId) => {
  const menu = await findScoped(MenuEdit, companyId, groupId);
  if (!menu) return DISABLED;
  const hasAny =
    menu.renamed.length +
      menu.hidden.length +
      menu.hiddenByRole.length +
      menu.moved.length +
      menu.settingsMenuItems.length +
      menu.navTree.length +
      menu.extendedTabs.length >
      0 || menu.toolCategories.some((c) => c.tools.length > 0);
  if (!hasAny) return DISABLED;
  return {
    enabled: true,
    renamed: menu.renamed.map((r) => ({
      originalLabel: r.originalLabel,
      newLabel: r.newLabel,
      icon: r.icon ?? '',
    })),
    hidden: [...menu.hidden],
    hiddenByRole: menu.hiddenByRole.map((h) => ({ label: h.label, roleKeys: [...h.roleKeys] })),
    moved: menu.moved.map((m) => ({ label: m.label, position: m.position, target: m.target })),
    settingsMenuItems: menu.settingsMenuItems.map((i) => ({
      type: i.type,
      name: i.name,
      link: i.link,
      openMode: i.openMode,
    })),
    navTree: menu.navTree.map((n) => ({
      id: n.id,
      label: n.label,
      url: n.url ?? '',
      parentId: n.parentId ?? '',
      order: n.order,
      icon: n.icon ?? '',
      openMode: n.openMode,
      permissions: n.permissions,
    })),
    extendedTabs: menu.extendedTabs.map((t) => ({
      id: t.id,
      label: t.label,
      url: t.url,
      page: t.page,
      routeContains: t.routeContains ?? '',
      referenceSelector: t.referenceSelector ?? '',
      containerSelector: t.containerSelector ?? '',
      permissions: t.permissions,
    })),
    toolCategories: menu.toolCategories
      .filter((c) => c.tools.length > 0)
      .map((c) => ({ name: c.name, tools: c.tools.map((t) => ({ label: t.label, url: t.url })) })),
  };
};

const resolveBanners: Resolver = async (companyId, groupId) => {
  const banners = await findScopedList(Banner, companyId, groupId, { enabled: true }, { createdAt: 1 });
  if (banners.length === 0) return DISABLED;
  return {
    enabled: true,
    items: banners.map((b) => ({
      id: String(b._id),
      name: b.name,
      type: b.type,
      position: b.position,
      content: b.content,
      version: b.updatedAt.getTime(),
    })),
  };
};

const resolveChatBubble: Resolver = async (companyId, groupId) => {
  const cfg = await findScoped(ChatBubbleConfig, companyId, groupId);
  if (!cfg?.enabled) return DISABLED;
  return {
    enabled: true,
    title: cfg.title,
    subtitle: cfg.subtitle,
    gradientFrom: cfg.gradientFrom,
    gradientTo: cfg.gradientTo,
    welcomeMessage: cfg.welcomeMessage,
    quickActions: cfg.quickActions.map((q) => ({ label: q.label, url: q.url })),
  };
};

const resolveLoader: Resolver = async (companyId, groupId) => {
  const cfg = await findScoped(LoaderConfig, companyId, groupId);
  if (!cfg?.enabled) return DISABLED;
  if (cfg.loaderType === 'custom-image' && !cfg.customImageUrl) return DISABLED;
  return {
    enabled: true,
    loaderType: cfg.loaderType,
    customImageUrl: cfg.customImageUrl ?? '',
  };
};

const resolveConversationStyle: Resolver = async (companyId, groupId) => {
  const cfg = await findScoped(ConversationStyle, companyId, groupId);
  if (!cfg?.enabled) return DISABLED;
  return { enabled: true, css: buildConversationCss(cfg) };
};

const resolveMisc: Resolver = async (companyId, groupId) => {
  const misc = await findScoped(MiscSettings, companyId, groupId);
  if (!misc || (!misc.tooltip.enabled && !misc.addonBanner.enabled)) return DISABLED;
  return {
    enabled: true,
    tooltip: {
      enabled: misc.tooltip.enabled,
      buttonText: misc.tooltip.buttonText,
      placement: misc.tooltip.placement,
    },
    addonBanner: {
      enabled: misc.addonBanner.enabled,
      placement: misc.addonBanner.placement,
      showOnOtherPages: misc.addonBanner.showOnOtherPages,
      message: misc.addonBanner.message,
      ctaUrl: misc.addonBanner.ctaUrl ?? '',
    },
  };
};

const resolveMembership: Resolver = async (companyId, groupId, ctx) => {
  const misc = await findScoped(MiscSettings, companyId, groupId);
  const m = misc?.membership;
  if (!m?.enabled || !m.url) return DISABLED;
  // The button is for sub-accounts, so it never shows outside a location; an empty
  // allow-list means every location in scope.
  if (!ctx.locationId) return DISABLED;
  if (m.allowedLocationIds.length > 0 && !m.allowedLocationIds.includes(ctx.locationId)) return DISABLED;
  return {
    enabled: true,
    buttonLabel: m.buttonLabel,
    url: m.url,
    openMode: m.openMode,
    icon: m.icon ?? '',
    backgroundColor: m.backgroundColor,
    textColor: m.textColor,
  };
};

const resolveUnreadBadge: Resolver = async (companyId, groupId) => {
  const misc = await findScoped(MiscSettings, companyId, groupId);
  if (!misc?.unreadBadge.enabled) return DISABLED;
  // Counting unread conversations needs the company's GHL API token; without one the
  // badge can never be populated, so don't make the browser poll for it.
  const company = await Company.findById(companyId).select('hasGhlApiToken').lean();
  if (!company?.hasGhlApiToken) return DISABLED;
  return { enabled: true, badgeColor: misc.unreadBadge.badgeColor, pollSeconds: 60 };
};

/** Field keys are matched loosely: case-insensitive, spaces as underscores, no "contact."/"opportunity." prefix. */
export function normalizeFieldKey(key: string): string {
  return key
    .trim()
    .toLowerCase()
    .replace(/^(contact|opportunity)\./, '')
    .replace(/\s+/g, '_');
}

const resolveCustomFields: Resolver = async (companyId, groupId) => {
  const campaigns = await findScopedList(CustomFieldCampaign, companyId, groupId, {}, { createdAt: 1 });
  const lock = new Set<string>();
  const hide = new Set<string>();
  for (const c of campaigns) {
    const target = c.mode === 'hide' ? hide : lock;
    for (const key of c.exposedFieldKeys) {
      const k = normalizeFieldKey(key);
      if (k) target.add(k);
    }
  }
  // A field that is both locked and hidden is simply hidden.
  hide.forEach((k) => lock.delete(k));
  if (lock.size + hide.size === 0) return DISABLED;
  return { enabled: true, lock: [...lock], hide: [...hide] };
};

/**
 * Feature key → resolver. The keys are also the CDN script names
 * (runtime-scripts/<key>.js) and the keys of the bundled runtime config.
 */
export const RUNTIME_FEATURES = {
  theme: resolveTheme,
  'special-theme': resolveSpecialTheme,
  logo: resolveLogo,
  buttons: resolveButtons,
  'opportunity-tabs': resolveOpportunityTabs,
  'floating-buttons': resolveFloatingButtons,
  launchpad: resolveLaunchpad,
  'user-links': resolveUserLinks,
  'book-a-call': resolveBookACall,
  'dynamic-links': resolveDynamicLinks,
  menu: resolveMenu,
  banners: resolveBanners,
  'chat-bubble': resolveChatBubble,
  loader: resolveLoader,
  'conversation-style': resolveConversationStyle,
  misc: resolveMisc,
  membership: resolveMembership,
  'unread-badge': resolveUnreadBadge,
  'custom-fields': resolveCustomFields,
} satisfies Record<string, Resolver>;

export type RuntimeFeatureKey = keyof typeof RUNTIME_FEATURES;

export function isRuntimeFeature(key: string): key is RuntimeFeatureKey {
  return Object.prototype.hasOwnProperty.call(RUNTIME_FEATURES, key);
}

export async function resolveAllFeatures(
  companyId: Types.ObjectId,
  groupId: string,
  ctx: RuntimeContext = {},
): Promise<Record<RuntimeFeatureKey, RuntimeFeatureConfig>> {
  const keys = Object.keys(RUNTIME_FEATURES) as RuntimeFeatureKey[];
  const results = await Promise.all(keys.map((k) => RUNTIME_FEATURES[k](companyId, groupId, ctx)));
  return Object.fromEntries(keys.map((k, i) => [k, results[i]])) as Record<
    RuntimeFeatureKey,
    RuntimeFeatureConfig
  >;
}
