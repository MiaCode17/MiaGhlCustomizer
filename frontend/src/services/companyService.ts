import { apiClient } from './apiClient';
import { Company, CompanyUpdateInput } from '../types/company';

export const companyService = {
  async get(): Promise<Company> {
    const { data } = await apiClient.get<{ company: Company }>('/company');
    return data.company;
  },

  async update(input: CompanyUpdateInput): Promise<Company> {
    const { data } = await apiClient.put<{ company: Company }>('/company/update', input);
    return data.company;
  },

  /** Saves a GHL Private Integration token; an empty string removes it. */
  async setGhlApiToken(token: string): Promise<Company> {
    const { data } = await apiClient.put<{ company: Company }>('/company/ghl-token', { token });
    return data.company;
  },
};
