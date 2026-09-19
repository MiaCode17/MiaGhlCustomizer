import { Schema, model, Types } from 'mongoose';

export type BannerType = 'info' | 'warning' | 'success' | 'promo';
export type BannerPosition = 'top' | 'bottom';

export interface BannerDoc {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  groupId: string;
  name: string;
  type: BannerType;
  position: BannerPosition;
  enabled: boolean;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new Schema<BannerDoc>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    groupId: { type: String, default: '', index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['info', 'warning', 'success', 'promo'], default: 'info' },
    position: { type: String, enum: ['top', 'bottom'], default: 'top' },
    enabled: { type: Boolean, default: true },
    content: { type: String, required: true },
  },
  { timestamps: true },
);

export const Banner = model<BannerDoc>('Banner', bannerSchema);
