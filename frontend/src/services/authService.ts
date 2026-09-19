import { apiClient } from './apiClient';
import { AuthUser } from '../types/auth';

export const authService = {
  async login(email: string, password: string): Promise<AuthUser> {
    const { data } = await apiClient.post<{ user: AuthUser }>('/auth/login', { email, password });
    return data.user;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async me(): Promise<AuthUser | null> {
    try {
      const { data } = await apiClient.get<{ user: AuthUser }>('/auth/me');
      return data.user;
    } catch {
      return null;
    }
  },
};
