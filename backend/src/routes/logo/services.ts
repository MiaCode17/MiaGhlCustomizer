import { Types } from 'mongoose';
import { HttpError } from '../../middleware/errorHandler';
import { Company } from '../../models/Company';
import { LogoCampaign } from '../../models/LogoCampaign';
import { LOGO_CAMPAIGN_LIMITS } from '../../utils/planLimits';
import { scopeFilter } from '../../utils/scope';

export interface LogoCampaignInput {
  name: string;
  logoUrl: string;
}

export async function listLogoCampaigns(companyId: Types.ObjectId, groupId?: string) {
  return LogoCampaign.find(scopeFilter(companyId, groupId)).sort({ createdAt: -1 });
}

export async function createLogoCampaign(
  companyId: Types.ObjectId,
  groupId: string | undefined,
  input: LogoCampaignInput,
) {
  const company = await Company.findById(companyId);
  if (!company) {
    throw new HttpError(404, 'Company not found');
  }

  const existingCount = await LogoCampaign.countDocuments({ companyId });
  const limit = LOGO_CAMPAIGN_LIMITS[company.plan];
  if (existingCount >= limit) {
    throw new HttpError(403, 'Logo campaign limit reached for your plan');
  }

  return LogoCampaign.create({ ...input, companyId, groupId: groupId ?? '' });
}

export async function updateLogoCampaign(
  companyId: Types.ObjectId,
  id: string,
  input: LogoCampaignInput,
) {
  const campaign = await LogoCampaign.findOneAndUpdate(
    { _id: id, companyId },
    { $set: input },
    { new: true },
  );
  if (!campaign) {
    throw new HttpError(404, 'Logo campaign not found');
  }
  return campaign;
}

export async function deleteLogoCampaign(companyId: Types.ObjectId, id: string) {
  const result = await LogoCampaign.deleteOne({ _id: id, companyId });
  if (result.deletedCount === 0) {
    throw new HttpError(404, 'Logo campaign not found');
  }
}
