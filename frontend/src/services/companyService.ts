import { apiClient } from './apiClient';
import { Company } from '../types/company';

export const companyService = {
  async get(): Promise<Company> {
    const { data } = await apiClient.get<{ company: Company }>('/company');
    return data.company;
  },

  async update(input: { name: string }): Promise<Company> {
    const { data } = await apiClient.put<{ company: Company }>('/company/update', input);
    return data.company;
  },
};
