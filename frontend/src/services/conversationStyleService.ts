import { apiClient } from './apiClient';
import { ConversationStyleConfig } from '../types/conversationStyle';

export const conversationStyleService = {
  async get(groupId?: string): Promise<ConversationStyleConfig | null> {
    const { data } = await apiClient.get<{ conversationStyle: ConversationStyleConfig | null }>(
      '/conversation-style',
      { params: groupId ? { groupId } : undefined },
    );
    return data.conversationStyle;
  },

  async save(config: ConversationStyleConfig, groupId?: string): Promise<ConversationStyleConfig> {
    const { data } = await apiClient.put<{ conversationStyle: ConversationStyleConfig }>(
      '/conversation-style/update',
      config,
      { params: groupId ? { groupId } : undefined },
    );
    return data.conversationStyle;
  },
};
