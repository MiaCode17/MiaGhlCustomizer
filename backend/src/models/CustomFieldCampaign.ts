import { Schema, model, Types } from 'mongoose';

export interface CustomFieldCampaignDoc {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  groupId: string;
  name: string;
  exposedFieldKeys: string[];
  createdAt: Date;
  updatedAt: Date;
}

const customFieldCampaignSchema = new Schema<CustomFieldCampaignDoc>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    groupId: { type: String, default: '', index: true },
    name: { type: String, required: true, trim: true },
    exposedFieldKeys: { type: [String], default: [] },
  },
  { timestamps: true },
);

export const CustomFieldCampaign = model<CustomFieldCampaignDoc>(
  'CustomFieldCampaign',
  customFieldCampaignSchema,
);
