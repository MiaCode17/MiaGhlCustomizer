import { apiClient } from './apiClient';
import { LoginPageConfig } from '../types/loginPage';

export const loginPageService = {
  async get(groupId?: string): Promise<LoginPageConfig | null> {
    const { data } = await apiClient.get<{ config: LoginPageConfig | null }>('/login-page', {
      params: groupId ? { groupId } : undefined,
    });
    return data.config;
  },

  async save(config: LoginPageConfig, groupId?: string): Promise<LoginPageConfig> {
    const { data } = await apiClient.put<{ config: LoginPageConfig }>(
      '/login-page/update',
      config,
      { params: groupId ? { groupId } : undefined },
    );
    return data.config;
  },
};
