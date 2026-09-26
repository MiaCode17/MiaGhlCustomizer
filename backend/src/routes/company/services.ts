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

export interface CompanyUpdateInput {
  name?: string;
  /** Empty string clears it. */
  ghlCompanyId?: string;
}

export async function updateCompany(companyId: Types.ObjectId, input: CompanyUpdateInput) {
  const set: Record<string, string> = {};
  const unset: Record<string, ''> = {};
  if (input.name !== undefined) set.name = input.name;
  if (input.ghlCompanyId !== undefined) {
    if (input.ghlCompanyId) set.ghlCompanyId = input.ghlCompanyId;
    else unset.ghlCompanyId = '';
  }

  try {
    const company = await Company.findByIdAndUpdate(
      companyId,
      { $set: set, ...(Object.keys(unset).length ? { $unset: unset } : {}) },
      { new: true },
    );
    if (!company) {
      throw new HttpError(404, 'Company not found');
    }
    return company;
  } catch (err) {
    if ((err as { code?: number }).code === 11000) {
      throw new HttpError(409, 'That GHL company ID is already linked to another account');
    }
    throw err;
  }
}
