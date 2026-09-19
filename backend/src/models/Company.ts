import { Schema, model, Types } from 'mongoose';

export type PlanTier = 'free' | 'pro' | 'agency';

export interface CompanyDoc {
  _id: Types.ObjectId;
  name: string;
  plan: PlanTier;
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<CompanyDoc>(
  {
    name: { type: String, required: true, trim: true },
    plan: { type: String, enum: ['free', 'pro', 'agency'], default: 'free' },
  },
  { timestamps: true },
);

export const Company = model<CompanyDoc>('Company', companySchema);
