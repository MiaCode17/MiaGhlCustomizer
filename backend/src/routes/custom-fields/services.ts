import { Types } from 'mongoose';
import { CustomFieldCampaign } from '../../models/CustomFieldCampaign';
import { scopeFilter } from '../../utils/scope';

export interface CustomFieldCampaignInput {
  name: string;
  exposedFieldKeys: string[];
}

export async function listCustomFieldCampaigns(companyId: Types.ObjectId, groupId?: string) {
  return CustomFieldCampaign.find(scopeFilter(companyId, groupId)).sort({ createdAt: -1 });
}

export async function createCustomFieldCampaign(
  companyId: Types.ObjectId,
  groupId: string | undefined,
  input: CustomFieldCampaignInput,
) {
  return CustomFieldCampaign.create({ ...input, companyId, groupId: groupId ?? '' });
}

export async function updateCustomFieldCampaign(
  companyId: Types.ObjectId,
  id: string,
  input: CustomFieldCampaignInput,
) {
  return CustomFieldCampaign.findOneAndUpdate(
    { _id: id, companyId },
    { $set: input },
    { new: true },
  );
}

export async function deleteCustomFieldCampaign(companyId: Types.ObjectId, id: string) {
  return CustomFieldCampaign.findOneAndDelete({ _id: id, companyId });
}
