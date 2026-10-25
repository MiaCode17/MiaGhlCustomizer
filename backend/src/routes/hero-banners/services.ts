import { Types } from 'mongoose';
import { HttpError } from '../../middleware/errorHandler';
import { HeroBanner, HeroBannerDoc } from '../../models/HeroBanner';
import { scopeFilter } from '../../utils/scope';

export type HeroBannerInput = Omit<HeroBannerDoc, '_id' | 'companyId' | 'groupId' | 'createdAt' | 'updatedAt'>;

export async function listHeroBanners(companyId: Types.ObjectId, groupId?: string) {
  return HeroBanner.find(scopeFilter(companyId, groupId)).sort({ order: 1, createdAt: 1 });
}

export async function createHeroBanner(companyId: Types.ObjectId, groupId: string | undefined, input: HeroBannerInput) {
  return HeroBanner.create({ ...input, companyId, groupId: groupId ?? '' });
}

export async function updateHeroBanner(companyId: Types.ObjectId, id: string, input: HeroBannerInput) {
  if (!Types.ObjectId.isValid(id)) throw new HttpError(404, 'Banner not found');
  const banner = await HeroBanner.findOneAndUpdate({ _id: id, companyId }, { $set: input }, { new: true });
  if (!banner) throw new HttpError(404, 'Banner not found');
  return banner;
}

export async function deleteHeroBanner(companyId: Types.ObjectId, id: string) {
  if (!Types.ObjectId.isValid(id)) throw new HttpError(404, 'Banner not found');
  const result = await HeroBanner.deleteOne({ _id: id, companyId });
  if (result.deletedCount === 0) throw new HttpError(404, 'Banner not found');
}
