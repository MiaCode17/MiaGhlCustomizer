import { Types } from 'mongoose';
import { SpecialTheme, SpecialThemeDoc } from '../../models/SpecialTheme';
import { findScoped } from '../../utils/scope';

export interface SpecialThemeInput {
  enabled: boolean;
  themeKey: string;
  popup: SpecialThemeDoc['popup'];
  particleEffect: SpecialThemeDoc['particleEffect'];
}

export async function getSpecialTheme(companyId: Types.ObjectId, groupId?: string) {
  return findScoped(SpecialTheme, companyId, groupId);
}

export async function upsertSpecialTheme(
  companyId: Types.ObjectId,
  groupId: string | undefined,
  input: SpecialThemeInput,
) {
  const filter = { companyId, groupId: groupId ?? '' };
  return SpecialTheme.findOneAndUpdate(
    filter,
    { $set: { ...input, companyId, groupId: groupId ?? '' } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}
