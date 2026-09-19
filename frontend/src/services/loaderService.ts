import { apiClient } from './apiClient';
import { LoaderConfig } from '../types/loader';

export const loaderService = {
  async get(groupId?: string): Promise<LoaderConfig | null> {
    const { data } = await apiClient.get<{ loader: LoaderConfig | null }>('/loader', {
      params: groupId ? { groupId } : undefined,
    });
    return data.loader;
  },

  async save(config: LoaderConfig, groupId?: string): Promise<LoaderConfig> {
    const { data } = await apiClient.put<{ loader: LoaderConfig }>('/loader/update', config, {
      params: groupId ? { groupId } : undefined,
    });
    return data.loader;
  },
};
