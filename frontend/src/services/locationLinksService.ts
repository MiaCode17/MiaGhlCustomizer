import { apiClient } from './apiClient';
import { LocationLink } from '../types/locationLink';

export const locationLinksService = {
  async list(locationId?: string): Promise<LocationLink[]> {
    const { data } = await apiClient.get<{ links: LocationLink[] }>('/location-links', {
      params: locationId ? { locationId } : undefined,
    });
    return data.links;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/location-links/${id}`);
  },
};
