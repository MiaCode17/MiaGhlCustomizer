import { Schema, model, Types } from 'mongoose';

export interface SpecialThemePopup {
  visible: boolean;
  title: string;
  message: string;
  ctaText?: string;
  ctaUrl?: string;
}

export interface SpecialThemeParticleEffect {
  enabled: boolean;
  durationSeconds: number;
}

/** A user-designed occasion, used when themeKey is 'custom'. */
export interface SpecialThemeCustom {
  name: string;
  emoji: string;
  accent: string[];
  particles: string[];
}

export interface SpecialThemeDoc {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  groupId: string;
  enabled: boolean;
  themeKey: string;
  custom?: SpecialThemeCustom;
  popup: SpecialThemePopup;
  particleEffect: SpecialThemeParticleEffect;
  createdAt: Date;
  updatedAt: Date;
}

const popupSchema = new Schema<SpecialThemePopup>(
  {
    visible: { type: Boolean, default: false },
    title: { type: String, default: '' },
    message: { type: String, default: '' },
    ctaText: { type: String },
    ctaUrl: { type: String },
  },
  { _id: false },
);

const particleEffectSchema = new Schema<SpecialThemeParticleEffect>(
  {
    enabled: { type: Boolean, default: false },
    durationSeconds: { type: Number, default: 5 },
  },
  { _id: false },
);

const customSchema = new Schema<SpecialThemeCustom>(
  {
    name: { type: String, default: '' },
    emoji: { type: String, default: '' },
    accent: { type: [String], default: [] },
    particles: { type: [String], default: [] },
  },
  { _id: false },
);

const specialThemeSchema = new Schema<SpecialThemeDoc>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    groupId: { type: String, default: '', index: true },
    enabled: { type: Boolean, default: false },
    themeKey: { type: String, default: '' },
    custom: { type: customSchema, default: undefined },
    popup: { type: popupSchema, default: () => ({}) },
    particleEffect: { type: particleEffectSchema, default: () => ({}) },
  },
  { timestamps: true },
);

specialThemeSchema.index({ companyId: 1, groupId: 1 }, { unique: true });

export const SpecialTheme = model<SpecialThemeDoc>('SpecialTheme', specialThemeSchema);
