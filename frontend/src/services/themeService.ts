import { apiClient } from './apiClient';
import { Theme } from '../types/theme';

export const themeService = {
  async get(groupId?: string): Promise<Theme | null> {
    const { data } = await apiClient.get<{ theme: Theme | null }>('/theme', {
      params: groupId ? { groupId } : undefined,
    });
    return data.theme;
  },

  async save(theme: Theme, groupId?: string): Promise<Theme> {
    const { data } = await apiClient.put<{ theme: Theme }>('/theme/update', theme, {
      params: groupId ? { groupId } : undefined,
    });
    return data.theme;
  },
};
