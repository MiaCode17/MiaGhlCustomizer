import { Types } from 'mongoose';
import { PremiumTheme, PremiumThemeData } from '../../models/PremiumTheme';
import { findScoped } from '../../utils/scope';

export interface PremiumThemeInput {
  enabled: boolean;
  theme: PremiumThemeData | null;
}

export async function getPremiumTheme(companyId: Types.ObjectId, groupId?: string) {
  return findScoped(PremiumTheme, companyId, groupId);
}

export async function upsertPremiumTheme(companyId: Types.ObjectId, groupId: string | undefined, input: PremiumThemeInput) {
  const filter = { companyId, groupId: groupId ?? '' };
  return PremiumTheme.findOneAndUpdate(
    filter,
    { $set: { ...input, companyId, groupId: groupId ?? '' } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}
