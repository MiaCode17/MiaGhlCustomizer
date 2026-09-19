import { apiClient } from './apiClient';
import { ChatBubbleConfig } from '../types/chatBubble';

export const chatBubbleService = {
  async get(groupId?: string): Promise<ChatBubbleConfig | null> {
    const { data } = await apiClient.get<{ chatBubble: ChatBubbleConfig | null }>('/chat-bubble', {
      params: groupId ? { groupId } : undefined,
    });
    return data.chatBubble;
  },

  async save(config: ChatBubbleConfig, groupId?: string): Promise<ChatBubbleConfig> {
    const { data } = await apiClient.put<{ chatBubble: ChatBubbleConfig }>(
      '/chat-bubble/update',
      config,
      { params: groupId ? { groupId } : undefined },
    );
    return data.chatBubble;
  },
};
