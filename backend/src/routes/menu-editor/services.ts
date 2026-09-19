import { Types } from 'mongoose';
import { MenuEdit, MenuEditDoc } from '../../models/MenuEdit';
import { findScoped } from '../../utils/scope';

export interface MenuEditInput {
  renamed: MenuEditDoc['renamed'];
  hidden: MenuEditDoc['hidden'];
  settingsMenuItems: MenuEditDoc['settingsMenuItems'];
  navTree: MenuEditDoc['navTree'];
  toolCategories: MenuEditDoc['toolCategories'];
}

export async function getMenuEdit(companyId: Types.ObjectId, groupId?: string) {
  return findScoped(MenuEdit, companyId, groupId);
}

export async function upsertMenuEdit(
  companyId: Types.ObjectId,
  groupId: string | undefined,
  input: MenuEditInput,
) {
  const filter = { companyId, groupId: groupId ?? '' };
  return MenuEdit.findOneAndUpdate(
    filter,
    { $set: { ...input, companyId, groupId: groupId ?? '' } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}
