import { Schema, model, Types } from 'mongoose';

export type FloatingButtonPosition = 'right' | 'bottom';
export type FloatingButtonShadow = 'none' | 'sm' | 'md' | 'lg';
export type FloatingButtonAnimation = 'none' | 'pulse' | 'bounce' | 'shimmer';

export interface FloatingButtonSubItem {
  label: string;
  url: string;
}

export interface FloatingButtonDoc {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  groupId: string;
  position: FloatingButtonPosition;
  label: string;
  icon?: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  shadow: FloatingButtonShadow;
  animation: FloatingButtonAnimation;
  subItems: FloatingButtonSubItem[];
  createdAt: Date;
  updatedAt: Date;
}

const subItemSchema = new Schema<FloatingButtonSubItem>(
  {
    label: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false },
);

const floatingButtonSchema = new Schema<FloatingButtonDoc>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    groupId: { type: String, default: '', index: true },
    position: { type: String, enum: ['right', 'bottom'], required: true },
    label: { type: String, required: true, trim: true },
    icon: { type: String },
    backgroundColor: { type: String, default: '#6366f1' },
    textColor: { type: String, default: '#ffffff' },
    borderRadius: { type: Number, default: 999 },
    shadow: { type: String, enum: ['none', 'sm', 'md', 'lg'], default: 'md' },
    animation: { type: String, enum: ['none', 'pulse', 'bounce', 'shimmer'], default: 'none' },
    subItems: { type: [subItemSchema], default: [] },
  },
  { timestamps: true },
);

floatingButtonSchema.index({ companyId: 1, groupId: 1 });

export const FloatingButton = model<FloatingButtonDoc>('FloatingButton', floatingButtonSchema);
