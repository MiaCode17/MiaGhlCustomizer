import { Schema, model, Types } from 'mongoose';

export type DynamicLinkOpenMode = 'same-tab' | 'new-tab' | 'modal';
export type DynamicLinkRoleTarget = 'all' | 'owner' | 'admin';

export interface DynamicLinkDoc {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  groupId: string;
  title: string;
  url: string;
  icon?: string;
  openMode: DynamicLinkOpenMode;
  roleTarget: DynamicLinkRoleTarget;
  createdAt: Date;
  updatedAt: Date;
}

const dynamicLinkSchema = new Schema<DynamicLinkDoc>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    groupId: { type: String, default: '', index: true },
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    icon: { type: String },
    openMode: { type: String, enum: ['same-tab', 'new-tab', 'modal'], default: 'new-tab' },
    roleTarget: { type: String, enum: ['all', 'owner', 'admin'], default: 'all' },
  },
  { timestamps: true },
);

export const DynamicLink = model<DynamicLinkDoc>('DynamicLink', dynamicLinkSchema);
