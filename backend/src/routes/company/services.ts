import { Types } from 'mongoose';
import { Company } from '../../models/Company';
import { HttpError } from '../../middleware/errorHandler';
import { decryptSecret, encryptSecret } from '../../utils/secrets';

export async function getCompany(companyId: Types.ObjectId) {
  const company = await Company.findById(companyId);
  if (!company) {
    throw new HttpError(404, 'Company not found');
  }
  return company;
}

/** Stores (encrypted) or clears the company's GHL API token. An empty token clears it. */
export async function setGhlApiToken(companyId: Types.ObjectId, token: string) {
  const update = token
    ? { $set: { ghlApiTokenEnc: encryptSecret(token), hasGhlApiToken: true } }
    : { $unset: { ghlApiTokenEnc: '' }, $set: { hasGhlApiToken: false } };
  const company = await Company.findByIdAndUpdate(companyId, update, { new: true });
  if (!company) {
    throw new HttpError(404, 'Company not found');
  }
  return company;
}

/** The decrypted GHL API token, or null if none is stored (or it can no longer be decrypted). */
export async function getGhlApiToken(companyId: Types.ObjectId): Promise<string | null> {
  const company = await Company.findById(companyId).select('+ghlApiTokenEnc').lean();
  return company?.ghlApiTokenEnc ? decryptSecret(company.ghlApiTokenEnc) : null;
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
