import { Schema, model, Types } from 'mongoose';

export interface ColorRule {
  name: string;
  selector: string;
  property: string;
  value: string;
}

export interface Gradient {
  target: 'header' | 'sidebar' | 'button';
  from: string;
  to: string;
  angle: number;
}

export type ShadowIntensity = 'none' | 'sm' | 'md' | 'lg';

export type SidebarHoverEffect = 'none' | 'slide' | 'fade' | 'scale' | 'glow';
export type SidebarIconStyle = 'outline' | 'bold' | 'line' | 'duotone';

export interface SidebarStyle {
  fontFamily: string;
  fontColor: string;
  fontSize: number;
  iconColor: string;
  iconStyle: SidebarIconStyle;
  iconSize: number;
  boldIcons: boolean;
  itemSpacing: number;
  itemPadding: number;
  iconLabelGap: number;
  cornerRadius: number;
  hoverEffect: SidebarHoverEffect;
  hoverTextColor: string;
  hoverBackgroundColor: string;
  scrollbarColor: string;
  locationSwitcherColor: string;
}

export interface ThemeDoc {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  groupId: string;
  themeName: string;
  colorRules: ColorRule[];
  gradients: Gradient[];
  fonts: { heading: string; body: string };
  borderRadius: string;
  shadowIntensity: ShadowIntensity;
  sidebarStyle: SidebarStyle;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const colorRuleSchema = new Schema<ColorRule>(
  {
    name: { type: String, required: true },
    selector: { type: String, required: true },
    property: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false },
);

const gradientSchema = new Schema<Gradient>(
  {
    target: { type: String, enum: ['header', 'sidebar', 'button'], required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    angle: { type: Number, default: 90 },
  },
  { _id: false },
);

const sidebarStyleSchema = new Schema<SidebarStyle>(
  {
    fontFamily: { type: String, default: 'Default' },
    fontColor: { type: String, default: '' },
    fontSize: { type: Number, default: 14 },
    iconColor: { type: String, default: '' },
    iconStyle: { type: String, enum: ['outline', 'bold', 'line', 'duotone'], default: 'bold' },
    iconSize: { type: Number, default: 20 },
    boldIcons: { type: Boolean, default: false },
    itemSpacing: { type: Number, default: 10 },
    itemPadding: { type: Number, default: 8 },
    iconLabelGap: { type: Number, default: 8 },
    cornerRadius: { type: Number, default: 6 },
    hoverEffect: { type: String, enum: ['none', 'slide', 'fade', 'scale', 'glow'], default: 'none' },
    hoverTextColor: { type: String, default: '' },
    hoverBackgroundColor: { type: String, default: '' },
    scrollbarColor: { type: String, default: '' },
    locationSwitcherColor: { type: String, default: '' },
  },
  { _id: false },
);

const themeSchema = new Schema<ThemeDoc>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    groupId: { type: String, default: '', index: true },
    themeName: { type: String, required: true, trim: true },
    colorRules: { type: [colorRuleSchema], default: [] },
    gradients: { type: [gradientSchema], default: [] },
    fonts: {
      heading: { type: String, default: 'Inter' },
      body: { type: String, default: 'Inter' },
    },
    borderRadius: { type: String, default: '8px' },
    shadowIntensity: { type: String, enum: ['none', 'sm', 'md', 'lg'], default: 'sm' },
    sidebarStyle: { type: sidebarStyleSchema, default: () => ({}) },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true },
);

themeSchema.index({ companyId: 1, groupId: 1 }, { unique: true });

export const Theme = model<ThemeDoc>('Theme', themeSchema);
