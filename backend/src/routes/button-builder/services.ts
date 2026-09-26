import { Types } from 'mongoose';
import { HttpError } from '../../middleware/errorHandler';
import { ButtonSurface, InjectedButton, InjectedButtonDoc } from '../../models/InjectedButton';
import { scopeFilter } from '../../utils/scope';

export interface InjectedButtonInput {
  surface: ButtonSurface;
  label: string;
  tooltip?: string;
  icon?: string;
  style: InjectedButtonDoc['style'];
  size: InjectedButtonDoc['size'];
  targetUrl?: string;
  order: number;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth: number;
  borderRadius: number;
  iconPosition: InjectedButtonDoc['iconPosition'];
  shadow: InjectedButtonDoc['shadow'];
  animation: InjectedButtonDoc['animation'];
  fullWidth: boolean;
}

export async function listButtons(
  companyId: Types.ObjectId,
  surface: ButtonSurface,
  groupId?: string,
) {
  return InjectedButton.find({ ...scopeFilter(companyId, groupId), surface }).sort({ order: 1 });
}

export async function createButton(
  companyId: Types.ObjectId,
  groupId: string | undefined,
  input: InjectedButtonInput,
) {
  return InjectedButton.create({ ...input, companyId, groupId: groupId ?? '' });
}

export async function updateButton(
  companyId: Types.ObjectId,
  id: string,
  input: InjectedButtonInput,
) {
  const button = await InjectedButton.findOneAndUpdate(
    { _id: id, companyId },
    { $set: input },
    { new: true },
  );
  if (!button) {
    throw new HttpError(404, 'Button not found');
  }
  return button;
}

export async function deleteButton(companyId: Types.ObjectId, id: string) {
  const result = await InjectedButton.deleteOne({ _id: id, companyId });
  if (result.deletedCount === 0) {
    throw new HttpError(404, 'Button not found');
  }
}
