import { Types } from 'mongoose';
import { HttpError } from '../../middleware/errorHandler';
import { Company } from '../../models/Company';
import { FloatingButton, FloatingButtonDoc, FloatingButtonPosition } from '../../models/FloatingButton';
import { FLOATING_BUTTON_LIMITS } from '../../utils/planLimits';
import { scopeFilter } from '../../utils/scope';

export interface FloatingButtonInput {
  position: FloatingButtonPosition;
  label: string;
  backgroundColor: string;
  textColor: string;
  subItems: FloatingButtonDoc['subItems'];
}

export async function listFloatingButtons(companyId: Types.ObjectId, groupId?: string) {
  return FloatingButton.find(scopeFilter(companyId, groupId)).sort({ createdAt: -1 });
}

async function assertUnderPlanLimit(
  companyId: Types.ObjectId,
  groupId: string | undefined,
): Promise<void> {
  const company = await Company.findById(companyId);
  if (!company) {
    throw new HttpError(404, 'Company not found');
  }
  const count = await FloatingButton.countDocuments(scopeFilter(companyId, groupId));
  if (count >= FLOATING_BUTTON_LIMITS[company.plan]) {
    throw new HttpError(403, 'Floating button limit reached for your plan');
  }
}

export async function createFloatingButton(
  companyId: Types.ObjectId,
  groupId: string | undefined,
  input: FloatingButtonInput,
) {
  await assertUnderPlanLimit(companyId, groupId);
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
