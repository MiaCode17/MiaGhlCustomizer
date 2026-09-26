import { Types } from 'mongoose';
import { HttpError } from '../../middleware/errorHandler';
import { Group, GroupDoc } from '../../models/Group';

export interface GroupInput {
  name: string;
  type: GroupDoc['type'];
  planIds: string[];
  locationIds: string[];
}

function assertValidId(id: string): void {
  if (!Types.ObjectId.isValid(id)) {
    throw new HttpError(404, 'Group not found');
  }
}

export async function listGroups(companyId: Types.ObjectId) {
  return Group.find({ companyId }).sort({ createdAt: 1 });
}

export async function createGroup(companyId: Types.ObjectId, input: GroupInput) {
  return Group.create({ ...input, companyId });
}

export async function updateGroup(companyId: Types.ObjectId, id: string, input: GroupInput) {
  assertValidId(id);
  const group = await Group.findOneAndUpdate({ _id: id, companyId }, { $set: input }, { new: true });
  if (!group) {
    throw new HttpError(404, 'Group not found');
  }
  return group;
}

export async function deleteGroup(companyId: Types.ObjectId, id: string) {
  assertValidId(id);
  const result = await Group.deleteOne({ _id: id, companyId });
  if (result.deletedCount === 0) {
    throw new HttpError(404, 'Group not found');
  }
}
