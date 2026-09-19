import { Types } from 'mongoose';
import { Company } from '../../models/Company';
import { HttpError } from '../../middleware/errorHandler';

export async function getCompany(companyId: Types.ObjectId) {
  const company = await Company.findById(companyId);
  if (!company) {
    throw new HttpError(404, 'Company not found');
  }
  return company;
}

export async function updateCompany(
  companyId: Types.ObjectId,
  input: { name: string; plan: 'free' | 'pro' | 'agency' },
) {
  const company = await Company.findByIdAndUpdate(companyId, { $set: input }, { new: true });
  if (!company) {
    throw new HttpError(404, 'Company not found');
  }
  return company;
}
