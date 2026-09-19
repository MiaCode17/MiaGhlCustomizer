import { Types } from 'mongoose';
import { HttpError } from '../../middleware/errorHandler';
import { DynamicLink, DynamicLinkDoc } from '../../models/DynamicLink';
import { scopeFilter } from '../../utils/scope';

export interface DynamicLinkInput {
  title: string;
  url: string;
  icon?: string;
  openMode: DynamicLinkDoc['openMode'];
  roleTarget: DynamicLinkDoc['roleTarget'];
}

const RESERVED_MENU_LABELS = [
  'Dashboard',
  'Conversations',
  'Calendar',
  'Contacts',
  'Opportunities',
  'Payments',
  'Marketing',
  'Automation',
  'Sites',
  'Reputation',
  'Reporting',
  'App Marketplace',
  'Settings',
];

function assertNotReservedTitle(title: string): void {
  const collides = RESERVED_MENU_LABELS.some(
    (label) => label.toLowerCase() === title.trim().toLowerCase(),
  );
  if (collides) {
    throw new HttpError(400, `"${title}" collides with a built-in menu item name`);
  }
}

export async function listDynamicLinks(companyId: Types.ObjectId, groupId?: string) {
  return DynamicLink.find(scopeFilter(companyId, groupId)).sort({ createdAt: -1 });
}

export async function createDynamicLink(
  companyId: Types.ObjectId,
  groupId: string | undefined,
  input: DynamicLinkInput,
) {
  assertNotReservedTitle(input.title);
  return DynamicLink.create({ ...input, companyId, groupId: groupId ?? '' });
}

export async function updateDynamicLink(
  companyId: Types.ObjectId,
  id: string,
  input: DynamicLinkInput,
) {
  assertNotReservedTitle(input.title);
  const link = await DynamicLink.findOneAndUpdate(
    { _id: id, companyId },
    { $set: input },
    { new: true },
  );
  if (!link) {
    throw new HttpError(404, 'Dynamic link not found');
  }
  return link;
}

export async function deleteDynamicLink(companyId: Types.ObjectId, id: string) {
  const result = await DynamicLink.deleteOne({ _id: id, companyId });
  if (result.deletedCount === 0) {
    throw new HttpError(404, 'Dynamic link not found');
  }
}
