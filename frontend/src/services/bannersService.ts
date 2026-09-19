import { apiClient } from './apiClient';
import { Banner, BannerInput } from '../types/banner';

export const bannersService = {
  async list(groupId?: string): Promise<Banner[]> {
    const { data } = await apiClient.get<{ banners: Banner[] }>('/banners', {
      params: groupId ? { groupId } : undefined,
    });
    return data.banners;
  },

  async create(input: BannerInput, groupId?: string): Promise<Banner> {
    const { data } = await apiClient.post<{ banner: Banner }>('/banners', input, {
      params: groupId ? { groupId } : undefined,
    });
    return data.banner;
  },

  async update(id: string, input: Partial<BannerInput>): Promise<Banner> {
    const { data } = await apiClient.put<{ banner: Banner }>(`/banners/${id}`, input);
    return data.banner;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/banners/${id}`);
  },
};
