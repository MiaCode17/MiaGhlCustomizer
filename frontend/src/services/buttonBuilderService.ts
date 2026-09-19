import { apiClient } from './apiClient';
import { ButtonSurface, InjectedButton, InjectedButtonInput } from '../types/button';

export const buttonBuilderService = {
  async list(surface: ButtonSurface, groupId?: string): Promise<InjectedButton[]> {
    const { data } = await apiClient.get<{ buttons: InjectedButton[] }>('/buttons', {
      params: { surface, ...(groupId ? { groupId } : {}) },
    });
    return data.buttons;
  },

  async create(input: InjectedButtonInput, groupId?: string): Promise<InjectedButton> {
    const { data } = await apiClient.post<{ button: InjectedButton }>('/buttons', input, {
      params: groupId ? { groupId } : undefined,
    });
    return data.button;
  },

  async update(id: string, input: InjectedButtonInput): Promise<InjectedButton> {
    const { data } = await apiClient.put<{ button: InjectedButton }>(`/buttons/${id}`, input);
    return data.button;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/buttons/${id}`);
  },
};
