import { apiClient } from './apiClient';
import { FloatingButton, FloatingButtonInput } from '../types/floatingButton';

export const floatingButtonsService = {
  async list(groupId?: string): Promise<FloatingButton[]> {
    const { data } = await apiClient.get<{ buttons: FloatingButton[] }>('/floating-buttons', {
      params: groupId ? { groupId } : undefined,
    });
    return data.buttons;
  },

  async create(input: FloatingButtonInput, groupId?: string): Promise<FloatingButton> {
    const { data } = await apiClient.post<{ button: FloatingButton }>('/floating-buttons', input, {
      params: groupId ? { groupId } : undefined,
    });
    return data.button;
  },

  async update(id: string, input: FloatingButtonInput): Promise<FloatingButton> {
    const { data } = await apiClient.put<{ button: FloatingButton }>(
      `/floating-buttons/${id}`,
      input,
    );
    return data.button;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/floating-buttons/${id}`);
  },
};
