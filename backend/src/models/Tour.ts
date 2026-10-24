import { Schema, model, Types } from 'mongoose';

export type TourPlacement = 'auto' | 'top' | 'bottom' | 'left' | 'right' | 'center';
export type TourMediaType = 'none' | 'image' | 'video';
export type TourAutoStart = 'never' | 'first-visit';

/** One stop of a guided tour. */
export interface TourStep {
  title: string;
  content: string;
  /** CSS selector of the element to point at; empty shows the step as a centered card. */
  selector: string;
  /** Element to click before showing the step (to open a menu or tab the target lives in). */
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

/**
 * A guided tour for the GHL page(s) it names: a sequence of highlighted elements with short
 * explanations (optionally an image or video each). Viewers start it from the guide button, or
 * automatically the first time they open the page.
 */
export interface TourDoc {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  groupId: string;
  name: string;
  enabled: boolean;
  /** The tour applies on pages whose path contains any of these; empty means every page. */
  pages: string[];
  autoStart: TourAutoStart;
  order: number;
  permissions: TourPermissions;
  steps: TourStep[];
  createdAt: Date;
  updatedAt: Date;
}

const permissionsSchema = new Schema<TourPermissions>(
  {
    agency_admins: { type: Boolean, default: true },
    agency_users: { type: Boolean, default: true },
    account_admins: { type: Boolean, default: true },
    account_users: { type: Boolean, default: true },
  },
  { _id: false },
);

const stepSchema = new Schema<TourStep>(
  {
    title: { type: String, default: '' },
    content: { type: String, default: '' },
    selector: { type: String, default: '' },
    clickSelector: { type: String, default: '' },
    placement: { type: String, enum: ['auto', 'top', 'bottom', 'left', 'right', 'center'], default: 'auto' },
    mediaType: { type: String, enum: ['none', 'image', 'video'], default: 'none' },
    mediaUrl: { type: String, default: '' },
    ctaLabel: { type: String, default: '' },
    ctaUrl: { type: String, default: '' },
  },
  { _id: false },
);

const tourSchema = new Schema<TourDoc>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    groupId: { type: String, default: '', index: true },
    name: { type: String, required: true, trim: true },
    enabled: { type: Boolean, default: true },
    pages: { type: [String], default: [] },
    autoStart: { type: String, enum: ['never', 'first-visit'], default: 'never' },
    order: { type: Number, default: 0 },
    permissions: { type: permissionsSchema, default: () => ({}) },
    steps: { type: [stepSchema], default: [] },
  },
  { timestamps: true },
);

tourSchema.index({ companyId: 1, groupId: 1, order: 1 });

export const Tour = model<TourDoc>('Tour', tourSchema);

export type GuideButtonPlacement = 'header' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

/** How the "Guide" button that starts a tour looks and where it sits. */
export interface GuideSettingsDoc {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  groupId: string;
  enabled: boolean;
  buttonText: string;
  icon: string;
  placement: GuideButtonPlacement;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  size: 'small' | 'medium' | 'large';
  shadow: 'none' | 'sm' | 'md' | 'lg';
  createdAt: Date;
  updatedAt: Date;
}

const guideSettingsSchema = new Schema<GuideSettingsDoc>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    groupId: { type: String, default: '', index: true },
    enabled: { type: Boolean, default: true },
    buttonText: { type: String, default: 'Guide' },
    icon: { type: String, default: 'help' },
    placement: {
      type: String,
      enum: ['header', 'bottom-right', 'bottom-left', 'top-right', 'top-left'],
      default: 'header',
    },
    backgroundColor: { type: String, default: '#4f46e5' },
    textColor: { type: String, default: '#ffffff' },
    borderRadius: { type: Number, default: 999, min: 0, max: 999 },
    size: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
    shadow: { type: String, enum: ['none', 'sm', 'md', 'lg'], default: 'md' },
  },
  { timestamps: true },
);

guideSettingsSchema.index({ companyId: 1, groupId: 1 }, { unique: true });

export const GuideSettings = model<GuideSettingsDoc>('GuideSettings', guideSettingsSchema);
