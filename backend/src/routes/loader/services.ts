import { Types } from 'mongoose';
import { LoaderConfig, LoaderConfigDoc } from '../../models/LoaderConfig';
import { findScoped } from '../../utils/scope';

export interface LoaderConfigInput {
  enabled: boolean;
  loaderType: LoaderConfigDoc['loaderType'];
  customImageUrl?: string;
}

export async function getLoaderConfig(companyId: Types.ObjectId, groupId?: string) {
  return findScoped(LoaderConfig, companyId, groupId);
}

export async function upsertLoaderConfig(
  companyId: Types.ObjectId,
  groupId: string | undefined,
  input: LoaderConfigInput,
) {
  const filter = { companyId, groupId: groupId ?? '' };
  return LoaderConfig.findOneAndUpdate(
    filter,
    { $set: { ...input, companyId, groupId: groupId ?? '' } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}
