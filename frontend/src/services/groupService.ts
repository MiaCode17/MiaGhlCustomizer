import { apiClient } from './apiClient';
import { Group, GroupInput } from '../types/group';

export const groupService = {
  async list(): Promise<Group[]> {
    const { data } = await apiClient.get<{ groups: Group[] }>('/groups');
    return data.groups;
  },

  async create(input: GroupInput): Promise<Group> {
    const { data } = await apiClient.post<{ group: Group }>('/groups', input);
    return data.group;
  },

  async update(id: string, input: GroupInput): Promise<Group> {
    const { data } = await apiClient.put<{ group: Group }>(`/groups/${id}`, input);
    return data.group;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/groups/${id}`);
  },
};
