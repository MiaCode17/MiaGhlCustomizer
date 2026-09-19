import { Types } from 'mongoose';
import { HttpError } from '../../middleware/errorHandler';
import { Company } from '../../models/Company';
import { ButtonSurface, InjectedButton, InjectedButtonDoc } from '../../models/InjectedButton';
import { BUTTON_PER_SURFACE_LIMITS } from '../../utils/planLimits';
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
}

export async function listButtons(
  companyId: Types.ObjectId,
  surface: ButtonSurface,
  groupId?: string,
) {
  return InjectedButton.find({ ...scopeFilter(companyId, groupId), surface }).sort({ order: 1 });
}

async function assertUnderPlanLimit(
  companyId: Types.ObjectId,
  groupId: string | undefined,
  surface: ButtonSurface,
): Promise<void> {
  const company = await Company.findById(companyId);
  if (!company) {
    throw new HttpError(404, 'Company not found');
  }
  const count = await InjectedButton.countDocuments({
    ...scopeFilter(companyId, groupId),
    surface,
  });
  if (count >= BUTTON_PER_SURFACE_LIMITS[company.plan]) {
    throw new HttpError(403, 'Button limit reached for your plan on this surface');
  }
}

export async function createButton(
  companyId: Types.ObjectId,
  groupId: string | undefined,
  input: InjectedButtonInput,
) {
  await assertUnderPlanLimit(companyId, groupId, input.surface);
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
