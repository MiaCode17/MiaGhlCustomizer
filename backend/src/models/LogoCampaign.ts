import { Schema, model, Types } from 'mongoose';

export interface LogoCampaignDoc {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  groupId: string;
  name: string;
  logoUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const logoCampaignSchema = new Schema<LogoCampaignDoc>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    groupId: { type: String, default: '', index: true },
    name: { type: String, required: true, trim: true },
    logoUrl: { type: String, required: true },
  },
  { timestamps: true },
);

export const LogoCampaign = model<LogoCampaignDoc>('LogoCampaign', logoCampaignSchema);
