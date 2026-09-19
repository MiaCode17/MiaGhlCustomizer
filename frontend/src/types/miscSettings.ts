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

export interface MembershipSettings {
  enabled: boolean;
  allowedLocationIds: string[];
}

export interface UnreadBadgeSettings {
  enabled: boolean;
}

export interface MiscSettings {
  tooltip: TooltipSettings;
  addonBanner: AddonBannerSettings;
  membership: MembershipSettings;
  unreadBadge: UnreadBadgeSettings;
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
  membership: { enabled: false, allowedLocationIds: [] },
  unreadBadge: { enabled: true },
};
