import { Types } from 'mongoose';
import { BookACall } from '../../models/BookACall';
import { findScoped } from '../../utils/scope';

export interface BookACallInput {
  enabled: boolean;
  buttonLabel: string;
  bookingUrl: string;
  backgroundColor: string;
  textColor: string;
}

export async function getBookACall(companyId: Types.ObjectId, groupId?: string) {
  return findScoped(BookACall, companyId, groupId);
}

export async function upsertBookACall(
  companyId: Types.ObjectId,
  groupId: string | undefined,
  input: BookACallInput,
) {
  const filter = { companyId, groupId: groupId ?? '' };
  return BookACall.findOneAndUpdate(
    filter,
    { $set: { ...input, companyId, groupId: groupId ?? '' } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}
