import { apiClient } from './apiClient';
import { CustomFieldCampaign, CustomFieldCampaignInput } from '../types/customField';

export const customFieldsService = {
  async list(groupId?: string): Promise<CustomFieldCampaign[]> {
    const { data } = await apiClient.get<{ campaigns: CustomFieldCampaign[] }>('/custom-fields', {
      params: groupId ? { groupId } : undefined,
    });
    return data.campaigns;
  },

  async create(input: CustomFieldCampaignInput, groupId?: string): Promise<CustomFieldCampaign> {
    const { data } = await apiClient.post<{ campaign: CustomFieldCampaign }>(
      '/custom-fields',
      input,
      { params: groupId ? { groupId } : undefined },
    );
    return data.campaign;
  },

  async update(id: string, input: CustomFieldCampaignInput): Promise<CustomFieldCampaign> {
    const { data } = await apiClient.put<{ campaign: CustomFieldCampaign }>(
      `/custom-fields/${id}`,
      input,
    );
    return data.campaign;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/custom-fields/${id}`);
  },
};
