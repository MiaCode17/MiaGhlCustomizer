import { apiClient } from './apiClient';
import { MiscSettings } from '../types/miscSettings';

export const miscSettingsService = {
  async get(groupId?: string): Promise<MiscSettings | null> {
    const { data } = await apiClient.get<{ settings: MiscSettings | null }>('/misc-settings', {
      params: groupId ? { groupId } : undefined,
    });
    return data.settings;
  },

  async save(settings: MiscSettings, groupId?: string): Promise<MiscSettings> {
    const { data } = await apiClient.put<{ settings: MiscSettings }>(
      '/misc-settings/update',
      settings,
      { params: groupId ? { groupId } : undefined },
    );
    return data.settings;
  },
};
