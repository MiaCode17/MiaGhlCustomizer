import { Schema, model, Types } from 'mongoose';

export interface CompanyDoc {
  _id: Types.ObjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<CompanyDoc>(
  {
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

export const Company = model<CompanyDoc>('Company', companySchema);
