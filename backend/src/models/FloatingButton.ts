import { Schema, model, Types } from 'mongoose';

export type FloatingButtonPosition = 'right' | 'bottom';

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
  backgroundColor: string;
  textColor: string;
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
    backgroundColor: { type: String, default: '#6366f1' },
    textColor: { type: String, default: '#ffffff' },
    subItems: { type: [subItemSchema], default: [] },
  },
  { timestamps: true },
);

floatingButtonSchema.index({ companyId: 1, groupId: 1 });

export const FloatingButton = model<FloatingButtonDoc>('FloatingButton', floatingButtonSchema);
