import { apiClient } from './apiClient';
import { HeroBanner, HeroBannerInput } from '../types/heroBanner';

export const heroBannersService = {
  async list(groupId?: string): Promise<HeroBanner[]> {
    const { data } = await apiClient.get<{ banners: HeroBanner[] }>('/hero-banners', {
      params: groupId ? { groupId } : undefined,
    });
    return data.banners;
  },
  async create(input: HeroBannerInput, groupId?: string): Promise<HeroBanner> {
    const { data } = await apiClient.post<{ banner: HeroBanner }>('/hero-banners', input, {
      params: groupId ? { groupId } : undefined,
    });
    return data.banner;
  },
  async update(id: string, input: HeroBannerInput): Promise<HeroBanner> {
    const { data } = await apiClient.put<{ banner: HeroBanner }>(`/hero-banners/${id}`, input);
    return data.banner;
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/hero-banners/${id}`);
  },
};
