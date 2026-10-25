import { Types } from 'mongoose';
import { HttpError } from '../../middleware/errorHandler';
import { GuideSettings, GuideSettingsDoc, Tour, TourDoc } from '../../models/Tour';
import { findScoped, scopeFilter } from '../../utils/scope';

export type TourInput = Omit<TourDoc, '_id' | 'companyId' | 'groupId' | 'createdAt' | 'updatedAt'>;
export type GuideSettingsInput = Omit<GuideSettingsDoc, '_id' | 'companyId' | 'groupId' | 'createdAt' | 'updatedAt'>;

export async function listTours(companyId: Types.ObjectId, groupId?: string) {
  return Tour.find(scopeFilter(companyId, groupId)).sort({ order: 1, createdAt: 1 });
}

export async function createTour(companyId: Types.ObjectId, groupId: string | undefined, input: TourInput) {
  return Tour.create({ ...input, companyId, groupId: groupId ?? '' });
}

export async function updateTour(companyId: Types.ObjectId, id: string, input: TourInput) {
  if (!Types.ObjectId.isValid(id)) throw new HttpError(404, 'Tour not found');
  const tour = await Tour.findOneAndUpdate({ _id: id, companyId }, { $set: input }, { new: true });
  if (!tour) throw new HttpError(404, 'Tour not found');
  return tour;
}

export async function deleteTour(companyId: Types.ObjectId, id: string) {
  if (!Types.ObjectId.isValid(id)) throw new HttpError(404, 'Tour not found');
  const result = await Tour.deleteOne({ _id: id, companyId });
  if (result.deletedCount === 0) throw new HttpError(404, 'Tour not found');
}

export async function getGuideSettings(companyId: Types.ObjectId, groupId?: string) {
  return findScoped(GuideSettings, companyId, groupId);
}

export async function upsertGuideSettings(
  companyId: Types.ObjectId,
  groupId: string | undefined,
  input: GuideSettingsInput,
) {
  const filter = { companyId, groupId: groupId ?? '' };
  return GuideSettings.findOneAndUpdate(
    filter,
    { $set: { ...input, companyId, groupId: groupId ?? '' } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}
