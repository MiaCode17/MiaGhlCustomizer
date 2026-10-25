import { apiClient } from './apiClient';
import { FeedbackConfig, FeedbackFilters, FeedbackResponse, FeedbackStats } from '../types/feedback';

const scope = (groupId?: string) => (groupId ? { params: { groupId } } : undefined);

function filterParams(f: FeedbackFilters) {
  return {
    kind: f.kind,
    minRating: f.minRating,
    maxRating: f.maxRating,
    search: f.search || undefined,
    from: f.from || undefined,
    to: f.to || undefined,
  };
}

export const feedbackService = {
  async getConfig(groupId?: string): Promise<FeedbackConfig | null> {
    const { data } = await apiClient.get<{ config: FeedbackConfig | null }>('/feedback/config', scope(groupId));
    return data.config;
  },
  async saveConfig(config: FeedbackConfig, groupId?: string): Promise<FeedbackConfig> {
    const { data } = await apiClient.put<{ config: FeedbackConfig }>('/feedback/config/update', config, scope(groupId));
    return data.config;
  },
  async listResponses(filters: FeedbackFilters, page: number, limit: number) {
    const { data } = await apiClient.get<{ responses: FeedbackResponse[]; total: number; page: number; limit: number }>(
      '/feedback/responses',
      { params: { ...filterParams(filters), page, limit } },
    );
    return data;
  },
  async stats(): Promise<FeedbackStats> {
    const { data } = await apiClient.get<{ stats: FeedbackStats }>('/feedback/stats');
    return data.stats;
  },
  async exportCsv(filters: FeedbackFilters): Promise<string> {
    const { data } = await apiClient.get<string>('/feedback/export', {
      params: filterParams(filters),
      responseType: 'text',
      transformResponse: (d) => d,
    });
    return data;
  },
  async removeResponse(id: string): Promise<void> {
    await apiClient.delete(`/feedback/responses/${id}`);
  },
};
