import { Types } from 'mongoose';
import { Banner, BannerDoc } from '../../models/Banner';
import { scopeFilter } from '../../utils/scope';

export interface BannerInput {
  name: string;
  type: BannerDoc['type'];
  position: BannerDoc['position'];
  enabled: boolean;
  content: string;
}

export async function listBanners(companyId: Types.ObjectId, groupId?: string) {
  return Banner.find(scopeFilter(companyId, groupId)).sort({ createdAt: -1 });
}

export async function createBanner(
  companyId: Types.ObjectId,
  groupId: string | undefined,
  input: BannerInput,
) {
  return Banner.create({ ...input, companyId, groupId: groupId ?? '' });
}

export async function updateBanner(
  companyId: Types.ObjectId,
  id: string,
  input: Partial<BannerInput>,
) {
  return Banner.findOneAndUpdate({ _id: id, companyId }, { $set: input }, { new: true });
}

export async function deleteBanner(companyId: Types.ObjectId, id: string) {
  return Banner.findOneAndDelete({ _id: id, companyId });
}
