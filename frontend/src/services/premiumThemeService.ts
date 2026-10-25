import { apiClient } from './apiClient';
import { PremiumTheme } from '../utils/premiumTheme';

export interface PremiumThemeSettings {
  enabled: boolean;
  theme: PremiumTheme | null;
}

export const premiumThemeService = {
  async get(groupId?: string): Promise<PremiumThemeSettings | null> {
    const { data } = await apiClient.get<{ premiumTheme: PremiumThemeSettings | null }>('/premium-theme', {
      params: groupId ? { groupId } : undefined,
    });
    return data.premiumTheme;
  },

  async save(settings: PremiumThemeSettings, groupId?: string): Promise<PremiumThemeSettings> {
    const { data } = await apiClient.put<{ premiumTheme: PremiumThemeSettings }>('/premium-theme/update', settings, {
      params: groupId ? { groupId } : undefined,
    });
    return data.premiumTheme;
  },
};
