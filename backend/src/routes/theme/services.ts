import { Types } from 'mongoose';
import { Theme, ThemeDoc } from '../../models/Theme';
import { findScoped } from '../../utils/scope';

export interface ThemeInput {
  themeName: string;
  colorRules: ThemeDoc['colorRules'];
  gradients: ThemeDoc['gradients'];
  fonts: ThemeDoc['fonts'];
  borderRadius: string;
  shadowIntensity: ThemeDoc['shadowIntensity'];
  sidebarStyle: Partial<ThemeDoc['sidebarStyle']>;
  enabled: boolean;
}

export async function getTheme(companyId: Types.ObjectId, groupId?: string) {
  return findScoped(Theme, companyId, groupId);
}

export async function upsertTheme(
  companyId: Types.ObjectId,
  groupId: string | undefined,
  input: ThemeInput,
) {
  const filter = { companyId, groupId: groupId ?? '' };
  return Theme.findOneAndUpdate(
    filter,
    { $set: { ...input, companyId, groupId: groupId ?? '' } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}

export async function deleteTheme(companyId: Types.ObjectId, groupId?: string) {
  await Theme.deleteOne({ companyId, groupId: groupId ?? '' });
}
