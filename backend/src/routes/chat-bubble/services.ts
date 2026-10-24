import { Types } from 'mongoose';
import { ChatBubbleConfig, ChatBubbleConfigDoc } from '../../models/ChatBubbleConfig';
import { findScoped } from '../../utils/scope';

/** Everything the admin can set; identity, scope and timestamps are managed by the server. */
export type ChatBubbleConfigInput = Omit<
  ChatBubbleConfigDoc,
  '_id' | 'companyId' | 'groupId' | 'createdAt' | 'updatedAt'
>;

export async function getChatBubbleConfig(companyId: Types.ObjectId, groupId?: string) {
  return findScoped(ChatBubbleConfig, companyId, groupId);
}

export async function upsertChatBubbleConfig(
  companyId: Types.ObjectId,
  groupId: string | undefined,
  input: ChatBubbleConfigInput,
) {
  const filter = { companyId, groupId: groupId ?? '' };
  return ChatBubbleConfig.findOneAndUpdate(
    filter,
    { $set: { ...input, companyId, groupId: groupId ?? '' } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}
