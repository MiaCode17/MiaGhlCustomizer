export type TooltipPlacement = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
export type AddonBannerPlacement = 'top' | 'sidebar' | 'dashboard';

export interface TooltipSettings {
  enabled: boolean;
  buttonText: string;
  placement: TooltipPlacement;
}

export interface AddonBannerSettings {
  enabled: boolean;
  placement: AddonBannerPlacement;
  showOnOtherPages: boolean;
  message: string;
  ctaUrl?: string;
}

export type MembershipOpenMode = 'modal' | 'drawer' | 'new-tab';

export interface MembershipSettings {
  enabled: boolean;
  /** Locations that get the button; empty means every location in scope. */
  allowedLocationIds: string[];
  buttonLabel: string;
  /** May contain placeholders such as {{location.id}} and {{user.email}}. */
  url: string;
  openMode: MembershipOpenMode;
  icon?: string;
  backgroundColor: string;
  textColor: string;
}

export interface UnreadBadgeSettings {
  enabled: boolean;
  badgeColor: string;
}

export interface UserLinksSettings {
  enabled: boolean;
  /** How many links one location may keep. */
  maxLinks: number;
}

export interface MiscSettings {
  tooltip: TooltipSettings;
  addonBanner: AddonBannerSettings;
  membership: MembershipSettings;
  unreadBadge: UnreadBadgeSettings;
  userLinks: UserLinksSettings;
}

export const emptyMiscSettings: MiscSettings = {
  tooltip: { enabled: false, buttonText: 'Need help?', placement: 'bottom-right' },
  addonBanner: {
    enabled: false,
    placement: 'top',
    showOnOtherPages: false,
    message: '',
    ctaUrl: undefined,
  },
  membership: {
    enabled: false,
    allowedLocationIds: [],
    buttonLabel: 'Membership',
    url: '',
    openMode: 'modal',
    icon: undefined,
    backgroundColor: '#4f46e5',
    textColor: '#ffffff',
  },
  unreadBadge: { enabled: true, badgeColor: '#2563eb' },
  userLinks: { enabled: false, maxLinks: 10 },
};
