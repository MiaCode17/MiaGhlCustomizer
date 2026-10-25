import { Schema, model, Types } from 'mongoose';

export type CustomFieldMode = 'lock' | 'hide';

export interface CustomFieldCampaignDoc {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  groupId: string;
  name: string;
  /** Field keys the campaign acts on (kept under its original name for existing data). */
  exposedFieldKeys: string[];
  /** lock = the field stays visible but read-only; hide = the field is removed from the page. */
  mode: CustomFieldMode;
  createdAt: Date;
  updatedAt: Date;
}

const customFieldCampaignSchema = new Schema<CustomFieldCampaignDoc>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    groupId: { type: String, default: '', index: true },
    name: { type: String, required: true, trim: true },
    exposedFieldKeys: { type: [String], default: [] },
    mode: { type: String, enum: ['lock', 'hide'], default: 'lock' },
  },
  { timestamps: true },
);

export const CustomFieldCampaign = model<CustomFieldCampaignDoc>(
  'CustomFieldCampaign',
  customFieldCampaignSchema,
);
