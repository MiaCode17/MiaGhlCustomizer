import { apiClient } from './apiClient';
import { GuideSettings, Tour, TourInput } from '../types/guide';

const scope = (groupId?: string) => (groupId ? { params: { groupId } } : undefined);

export const guidesService = {
  async listTours(groupId?: string): Promise<Tour[]> {
    const { data } = await apiClient.get<{ tours: Tour[] }>('/guides/tours', scope(groupId));
    return data.tours;
  },
  async createTour(input: TourInput, groupId?: string): Promise<Tour> {
    const { data } = await apiClient.post<{ tour: Tour }>('/guides/tours', input, scope(groupId));
    return data.tour;
  },
  async updateTour(id: string, input: TourInput): Promise<Tour> {
    const { data } = await apiClient.put<{ tour: Tour }>(`/guides/tours/${id}`, input);
    return data.tour;
  },
  async removeTour(id: string): Promise<void> {
    await apiClient.delete(`/guides/tours/${id}`);
  },
  async getSettings(groupId?: string): Promise<GuideSettings | null> {
    const { data } = await apiClient.get<{ settings: GuideSettings | null }>('/guides/settings', scope(groupId));
    return data.settings;
  },
  async saveSettings(settings: GuideSettings, groupId?: string): Promise<GuideSettings> {
    const { data } = await apiClient.put<{ settings: GuideSettings }>('/guides/settings/update', settings, scope(groupId));
    return data.settings;
  },
};
