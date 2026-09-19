import { Schema, model, Types } from 'mongoose';

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

export interface MiscSettingsDoc {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  groupId: string;
  tooltip: TooltipSettings;
  addonBanner: AddonBannerSettings;
  membership: MembershipSettings;
  unreadBadge: UnreadBadgeSettings;
  createdAt: Date;
  updatedAt: Date;
}

const tooltipSchema = new Schema<TooltipSettings>(
  {
    enabled: { type: Boolean, default: false },
    buttonText: { type: String, default: 'Need help?' },
    placement: {
      type: String,
      enum: ['bottom-right', 'bottom-left', 'top-right', 'top-left'],
      default: 'bottom-right',
    },
  },
  { _id: false },
);

const addonBannerSchema = new Schema<AddonBannerSettings>(
  {
    enabled: { type: Boolean, default: false },
    placement: { type: String, enum: ['top', 'sidebar', 'dashboard'], default: 'top' },
    showOnOtherPages: { type: Boolean, default: false },
    message: { type: String, default: '' },
    ctaUrl: { type: String },
  },
  { _id: false },
);

const membershipSchema = new Schema<MembershipSettings>(
  {
    enabled: { type: Boolean, default: false },
    allowedLocationIds: { type: [String], default: [] },
  },
  { _id: false },
);

const unreadBadgeSchema = new Schema<UnreadBadgeSettings>(
  {
    enabled: { type: Boolean, default: true },
  },
  { _id: false },
);

const miscSettingsSchema = new Schema<MiscSettingsDoc>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    groupId: { type: String, default: '', index: true },
    tooltip: { type: tooltipSchema, default: () => ({}) },
    addonBanner: { type: addonBannerSchema, default: () => ({}) },
    membership: { type: membershipSchema, default: () => ({}) },
    unreadBadge: { type: unreadBadgeSchema, default: () => ({}) },
  },
  { timestamps: true },
);

miscSettingsSchema.index({ companyId: 1, groupId: 1 }, { unique: true });

export const MiscSettings = model<MiscSettingsDoc>('MiscSettings', miscSettingsSchema);
