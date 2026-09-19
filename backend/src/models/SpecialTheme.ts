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

export interface SpecialThemeDoc {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  groupId: string;
  enabled: boolean;
  themeKey: string;
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

const specialThemeSchema = new Schema<SpecialThemeDoc>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    groupId: { type: String, default: '', index: true },
    enabled: { type: Boolean, default: false },
    themeKey: { type: String, default: '' },
    popup: { type: popupSchema, default: () => ({}) },
    particleEffect: { type: particleEffectSchema, default: () => ({}) },
  },
  { timestamps: true },
);

specialThemeSchema.index({ companyId: 1, groupId: 1 }, { unique: true });

export const SpecialTheme = model<SpecialThemeDoc>('SpecialTheme', specialThemeSchema);
