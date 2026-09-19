import { Schema, model, Types } from 'mongoose';

export type ButtonSurface = 'header' | 'dashboard' | 'record-detail' | 'record-tab';
export type ButtonStyle = 'primary' | 'default' | 'dashed' | 'text';
export type ButtonSize = 'small' | 'middle' | 'large';

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
  createdAt: Date;
  updatedAt: Date;
}

const injectedButtonSchema = new Schema<InjectedButtonDoc>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    groupId: { type: String, default: '', index: true },
    surface: {
      type: String,
      enum: ['header', 'dashboard', 'record-detail', 'record-tab'],
      required: true,
    },
    label: { type: String, required: true, trim: true },
    tooltip: { type: String },
    icon: { type: String },
    style: { type: String, enum: ['primary', 'default', 'dashed', 'text'], default: 'default' },
    size: { type: String, enum: ['small', 'middle', 'large'], default: 'middle' },
    targetUrl: { type: String },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

injectedButtonSchema.index({ companyId: 1, groupId: 1, surface: 1 });

export const InjectedButton = model<InjectedButtonDoc>('InjectedButton', injectedButtonSchema);
