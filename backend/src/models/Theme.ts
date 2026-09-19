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
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true },
);

themeSchema.index({ companyId: 1, groupId: 1 }, { unique: true });

export const Theme = model<ThemeDoc>('Theme', themeSchema);
