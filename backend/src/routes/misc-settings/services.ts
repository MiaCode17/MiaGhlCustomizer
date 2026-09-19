import { Types } from 'mongoose';
import { MiscSettings, MiscSettingsDoc } from '../../models/MiscSettings';
import { findScoped } from '../../utils/scope';

export interface MiscSettingsInput {
  tooltip: MiscSettingsDoc['tooltip'];
  addonBanner: MiscSettingsDoc['addonBanner'];
  membership: MiscSettingsDoc['membership'];
  unreadBadge: MiscSettingsDoc['unreadBadge'];
}

export async function getMiscSettings(companyId: Types.ObjectId, groupId?: string) {
  return findScoped(MiscSettings, companyId, groupId);
}

export async function upsertMiscSettings(
  companyId: Types.ObjectId,
  groupId: string | undefined,
  input: MiscSettingsInput,
) {
  const filter = { companyId, groupId: groupId ?? '' };
  return MiscSettings.findOneAndUpdate(
    filter,
    { $set: { ...input, companyId, groupId: groupId ?? '' } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}
