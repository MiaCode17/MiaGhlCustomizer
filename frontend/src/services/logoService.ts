import { apiClient } from './apiClient';
import { LogoCampaign, LogoCampaignInput } from '../types/logo';

export const logoService = {
  async list(groupId?: string): Promise<LogoCampaign[]> {
    const { data } = await apiClient.get<{ campaigns: LogoCampaign[] }>('/logo', {
      params: groupId ? { groupId } : undefined,
    });
    return data.campaigns;
  },

  async create(input: LogoCampaignInput, groupId?: string): Promise<LogoCampaign> {
    const { data } = await apiClient.post<{ campaign: LogoCampaign }>('/logo', input, {
      params: groupId ? { groupId } : undefined,
    });
    return data.campaign;
  },

  async update(id: string, input: LogoCampaignInput): Promise<LogoCampaign> {
    const { data } = await apiClient.put<{ campaign: LogoCampaign }>(`/logo/${id}`, input);
    return data.campaign;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/logo/${id}`);
  },
};
