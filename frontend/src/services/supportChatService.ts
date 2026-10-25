import { apiClient } from './apiClient';
import { SupportMessage, SupportTicket, SupportTicketList } from '../types/supportChat';

export interface TicketListQuery {
  status?: 'open' | 'closed' | 'all';
  search?: string;
  page?: number;
  limit?: number;
}

export const supportChatService = {
  async list(query: TicketListQuery = {}): Promise<SupportTicketList> {
    const { data } = await apiClient.get<SupportTicketList>('/support-chat/tickets', { params: query });
    return data;
  },

  /** Opening a chat also marks it read. */
  async get(id: string): Promise<{ ticket: SupportTicket; messages: SupportMessage[] }> {
    const { data } = await apiClient.get<{ ticket: SupportTicket; messages: SupportMessage[] }>(
      `/support-chat/tickets/${id}`,
    );
    return data;
  },

  async unreadCount(): Promise<number> {
    const { data } = await apiClient.get<{ count: number }>('/support-chat/unread');
    return data.count;
  },

  async reply(id: string, text: string, authorName?: string): Promise<SupportMessage> {
    const { data } = await apiClient.post<{ message: SupportMessage }>(`/support-chat/tickets/${id}/messages`, {
      text,
      authorName,
    });
    return data.message;
  },

  /** Tells the visitor their agent is typing (lasts a few seconds). */
  async typing(id: string): Promise<void> {
    await apiClient.post(`/support-chat/tickets/${id}/typing`);
  },

  async close(id: string): Promise<void> {
    await apiClient.post(`/support-chat/tickets/${id}/close`);
  },

  async reopen(id: string): Promise<void> {
    await apiClient.post(`/support-chat/tickets/${id}/reopen`);
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/support-chat/tickets/${id}`);
  },
};
