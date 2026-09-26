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
  createdAt: Date;
  updatedAt: Date;
}

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
  },
  { timestamps: true },
);

injectedButtonSchema.index({ companyId: 1, groupId: 1, surface: 1 });

export const InjectedButton = model<InjectedButtonDoc>('InjectedButton', injectedButtonSchema);
