export type TourPlacement = 'auto' | 'top' | 'bottom' | 'left' | 'right' | 'center';
export type TourMediaType = 'none' | 'image' | 'video';
export type TourAutoStart = 'never' | 'first-visit';
export type GuideButtonPlacement = 'header' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

export interface TourStep {
  title: string;
  content: string;
  selector: string;
  clickSelector: string;
  placement: TourPlacement;
  mediaType: TourMediaType;
  mediaUrl: string;
  ctaLabel: string;
  ctaUrl: string;
}

export interface TourPermissions {
  agency_admins: boolean;
  agency_users: boolean;
  account_admins: boolean;
  account_users: boolean;
}

export interface TourInput {
  name: string;
  enabled: boolean;
  pages: string[];
  autoStart: TourAutoStart;
  order: number;
  permissions: TourPermissions;
  steps: TourStep[];
}

export interface Tour extends TourInput {
  _id: string;
  companyId: string;
  groupId: string;
  createdAt: string;
  updatedAt: string;
}

export const emptyTourStep: TourStep = {
  title: '',
  content: '',
  selector: '',
  clickSelector: '',
  placement: 'auto',
  mediaType: 'none',
  mediaUrl: '',
  ctaLabel: '',
  ctaUrl: '',
};

export const emptyTourInput: TourInput = {
  name: '',
  enabled: true,
  pages: [],
  autoStart: 'never',
  order: 0,
  permissions: { agency_admins: true, agency_users: true, account_admins: true, account_users: true },
  steps: [{ ...emptyTourStep }],
};

export function normalizeTour(tour: Partial<TourInput> | null | undefined): TourInput {
  return {
    ...emptyTourInput,
    ...(tour ?? {}),
    permissions: { ...emptyTourInput.permissions, ...(tour?.permissions ?? {}) },
    steps: (tour?.steps?.length ? tour.steps : emptyTourInput.steps).map((s) => ({ ...emptyTourStep, ...s })),
  };
}

export interface GuideSettings {
  enabled: boolean;
  buttonText: string;
  icon: string;
  placement: GuideButtonPlacement;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  size: 'small' | 'medium' | 'large';
  shadow: 'none' | 'sm' | 'md' | 'lg';
}

export const emptyGuideSettings: GuideSettings = {
  enabled: true,
  buttonText: 'Guide',
  icon: 'help',
  placement: 'header',
  backgroundColor: '#4f46e5',
  textColor: '#ffffff',
  borderRadius: 999,
  size: 'medium',
  shadow: 'md',
};

export function normalizeGuideSettings(s: Partial<GuideSettings> | null | undefined): GuideSettings {
  return { ...emptyGuideSettings, ...(s ?? {}) };
}
