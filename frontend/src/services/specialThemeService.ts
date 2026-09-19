import { apiClient } from './apiClient';
import { SpecialTheme } from '../types/specialTheme';

export const specialThemeService = {
  async get(groupId?: string): Promise<SpecialTheme | null> {
    const { data } = await apiClient.get<{ specialTheme: SpecialTheme | null }>('/special-theme', {
      params: groupId ? { groupId } : undefined,
    });
    return data.specialTheme;
  },

  async save(specialTheme: SpecialTheme, groupId?: string): Promise<SpecialTheme> {
    const { data } = await apiClient.put<{ specialTheme: SpecialTheme }>(
      '/special-theme/update',
      specialTheme,
      { params: groupId ? { groupId } : undefined },
    );
    return data.specialTheme;
  },
};
