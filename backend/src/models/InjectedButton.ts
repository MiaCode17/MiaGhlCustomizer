import { Schema, model, Types } from 'mongoose';

export type ButtonSurface =
  | 'header'
  | 'dashboard'
  | 'contact'
  | 'opportunity'
  | 'record-detail'
  | 'record-tab';
export type ButtonStyle = 'primary' | 'default' | 'dashed' | 'text';
export type ButtonSize = 'small' | 'middle' | 'large';
export type ButtonIconPosition = 'left' | 'right';
export type ButtonShadow = 'none' | 'sm' | 'md' | 'lg';
export type ButtonAnimation = 'none' | 'pulse' | 'bounce' | 'shimmer';
export type ButtonOpenMode = 'modal' | 'drawer' | 'new-tab' | 'same-tab';
export type ButtonIconSize = 'small' | 'medium' | 'large';

/** Which kinds of GHL user may see the button (missing/true = allowed). */
export interface ButtonPermissions {
  agency_admins: boolean;
  agency_users: boolean;
  account_admins: boolean;
  account_users: boolean;
}

/** One entry of a dropdown button's menu. */
export interface ButtonMenuItem {
  label: string;
  url: string;
  openMode: ButtonOpenMode;
  sendContact: boolean;
  sendCustomFields: boolean;
}

export interface InjectedButtonDoc {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  groupId: string;
  surface: ButtonSurface;
  label: string;
  tooltip?: string;
  icon?: string;
  style: ButtonStyle;
  size: ButtonSize;
  targetUrl?: string;
  order: number;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth: number;
  borderRadius: number;
  iconPosition: ButtonIconPosition;
  shadow: ButtonShadow;
  animation: ButtonAnimation;
  fullWidth: boolean;
  /** How the target opens: pop-up, drawer, new tab, or the same tab. */
  openMode: ButtonOpenMode;
  iconOnly: boolean;
  iconSize: ButtonIconSize;
  uppercase: boolean;
  bold: boolean;
  underline: boolean;
  hoverEffect: boolean;
  /** When on, the background fades from backgroundColor to gradientColor. */
  gradient: boolean;
  gradientColor?: string;
  /** 0-100 percent. */
  opacity: number;
  permissions: ButtonPermissions;
  /** Append the contact's details / custom fields to the target URL (contact and opportunity pages). */
  sendContact: boolean;
  sendCustomFields: boolean;
  /** A non-empty menu turns the button into a dropdown (targetUrl is then ignored). */
  menuItems: ButtonMenuItem[];
  /** Optional CSS selector overriding where a page button row is placed. */
  placementSelector?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OPEN_MODES = ['modal', 'drawer', 'new-tab', 'same-tab'];

const permissionsSchema = new Schema<ButtonPermissions>(
  {
    agency_admins: { type: Boolean, default: true },
    agency_users: { type: Boolean, default: true },
    account_admins: { type: Boolean, default: true },
    account_users: { type: Boolean, default: true },
  },
  { _id: false },
);

const menuItemSchema = new Schema<ButtonMenuItem>(
  {
    label: { type: String, required: true },
    url: { type: String, required: true },
    openMode: { type: String, enum: OPEN_MODES, default: 'new-tab' },
    sendContact: { type: Boolean, default: false },
    sendCustomFields: { type: Boolean, default: false },
  },
  { _id: false },
);

const injectedButtonSchema = new Schema<InjectedButtonDoc>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    groupId: { type: String, default: '', index: true },
    surface: {
      type: String,
      enum: ['header', 'dashboard', 'contact', 'opportunity', 'record-detail', 'record-tab'],
      required: true,
    },
    label: { type: String, required: true, trim: true },
    tooltip: { type: String },
    icon: { type: String },
    style: { type: String, enum: ['primary', 'default', 'dashed', 'text'], default: 'default' },
    size: { type: String, enum: ['small', 'middle', 'large'], default: 'middle' },
    targetUrl: { type: String },
    order: { type: Number, default: 0 },
    backgroundColor: { type: String },
    textColor: { type: String },
    borderColor: { type: String },
    borderWidth: { type: Number, default: 0 },
    borderRadius: { type: Number, default: 8 },
    iconPosition: { type: String, enum: ['left', 'right'], default: 'left' },
    shadow: { type: String, enum: ['none', 'sm', 'md', 'lg'], default: 'none' },
    animation: { type: String, enum: ['none', 'pulse', 'bounce', 'shimmer'], default: 'none' },
    fullWidth: { type: Boolean, default: false },
    openMode: { type: String, enum: OPEN_MODES, default: 'new-tab' },
    iconOnly: { type: Boolean, default: false },
    iconSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
    uppercase: { type: Boolean, default: false },
    bold: { type: Boolean, default: false },
    underline: { type: Boolean, default: false },
    hoverEffect: { type: Boolean, default: true },
    gradient: { type: Boolean, default: false },
    gradientColor: { type: String },
    opacity: { type: Number, default: 100, min: 0, max: 100 },
    permissions: { type: permissionsSchema, default: () => ({}) },
    sendContact: { type: Boolean, default: false },
    sendCustomFields: { type: Boolean, default: false },
    menuItems: { type: [menuItemSchema], default: [] },
    placementSelector: { type: String },
  },
  { timestamps: true },
);

injectedButtonSchema.index({ companyId: 1, groupId: 1, surface: 1 });

export const InjectedButton = model<InjectedButtonDoc>('InjectedButton', injectedButtonSchema);
