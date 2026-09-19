import { Types } from 'mongoose';
import { ChatBubbleConfig, ChatBubbleConfigDoc } from '../../models/ChatBubbleConfig';
import { findScoped } from '../../utils/scope';

export interface ChatBubbleConfigInput {
  enabled: boolean;
  title: string;
  subtitle: string;
  gradientFrom: string;
  gradientTo: string;
  welcomeMessage: string;
  successMessage: string;
  errorMessage: string;
  quickActions: ChatBubbleConfigDoc['quickActions'];
}

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
