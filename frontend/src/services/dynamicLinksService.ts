import { apiClient } from './apiClient';
import { DynamicLink, DynamicLinkInput } from '../types/dynamicLink';

export const dynamicLinksService = {
  async list(groupId?: string): Promise<DynamicLink[]> {
    const { data } = await apiClient.get<{ links: DynamicLink[] }>('/dynamic-links', {
      params: groupId ? { groupId } : undefined,
    });
    return data.links;
  },

  async create(input: DynamicLinkInput, groupId?: string): Promise<DynamicLink> {
    const { data } = await apiClient.post<{ link: DynamicLink }>('/dynamic-links', input, {
      params: groupId ? { groupId } : undefined,
    });
    return data.link;
  },

  async update(id: string, input: DynamicLinkInput): Promise<DynamicLink> {
    const { data } = await apiClient.put<{ link: DynamicLink }>(`/dynamic-links/${id}`, input);
    return data.link;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/dynamic-links/${id}`);
  },
};
