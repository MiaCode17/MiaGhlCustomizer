import { Types } from 'mongoose';
import { HttpError } from '../../middleware/errorHandler';
import { FloatingButton, FloatingButtonDoc, FloatingButtonPosition } from '../../models/FloatingButton';
import { scopeFilter } from '../../utils/scope';

export interface FloatingButtonInput {
  position: FloatingButtonPosition;
  label: string;
  icon?: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  shadow: FloatingButtonDoc['shadow'];
  animation: FloatingButtonDoc['animation'];
  subItems: FloatingButtonDoc['subItems'];
}

export async function listFloatingButtons(companyId: Types.ObjectId, groupId?: string) {
  return FloatingButton.find(scopeFilter(companyId, groupId)).sort({ createdAt: -1 });
}

export async function createFloatingButton(
  companyId: Types.ObjectId,
  groupId: string | undefined,
  input: FloatingButtonInput,
) {
  return FloatingButton.create({ ...input, companyId, groupId: groupId ?? '' });
}

export async function updateFloatingButton(
  companyId: Types.ObjectId,
  id: string,
  input: FloatingButtonInput,
) {
  const button = await FloatingButton.findOneAndUpdate(
    { _id: id, companyId },
    { $set: input },
    { new: true },
  );
  if (!button) {
    throw new HttpError(404, 'Floating button not found');
  }
  return button;
}

export async function deleteFloatingButton(companyId: Types.ObjectId, id: string) {
  const result = await FloatingButton.deleteOne({ _id: id, companyId });
  if (result.deletedCount === 0) {
    throw new HttpError(404, 'Floating button not found');
  }
}
