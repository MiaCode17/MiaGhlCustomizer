import { apiClient } from './apiClient';
import { BookACallConfig } from '../types/bookACall';

export const bookACallService = {
  async get(groupId?: string): Promise<BookACallConfig | null> {
    const { data } = await apiClient.get<{ bookACall: BookACallConfig | null }>('/book-a-call', {
      params: groupId ? { groupId } : undefined,
    });
    return data.bookACall;
  },

  async save(config: BookACallConfig, groupId?: string): Promise<BookACallConfig> {
    const { data } = await apiClient.put<{ bookACall: BookACallConfig }>(
      '/book-a-call/update',
      config,
      { params: groupId ? { groupId } : undefined },
    );
    return data.bookACall;
  },
};
