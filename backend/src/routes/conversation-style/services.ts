import { Types } from 'mongoose';
import { ConversationStyle } from '../../models/ConversationStyle';
import { findScoped } from '../../utils/scope';

export interface ConversationStyleInput {
  enabled: boolean;
  agentBubbleColor: string;
  agentTextColor: string;
  contactBubbleColor: string;
  contactTextColor: string;
  fontFamily: string;
  bubbleRadius: number;
  showTimestamps: boolean;
  showAvatars: boolean;
}

export async function getConversationStyle(companyId: Types.ObjectId, groupId?: string) {
  return findScoped(ConversationStyle, companyId, groupId);
}

export async function upsertConversationStyle(
  companyId: Types.ObjectId,
  groupId: string | undefined,
  input: ConversationStyleInput,
) {
  const filter = { companyId, groupId: groupId ?? '' };
  return ConversationStyle.findOneAndUpdate(
    filter,
    { $set: { ...input, companyId, groupId: groupId ?? '' } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}
