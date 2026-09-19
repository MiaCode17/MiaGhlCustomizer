import { apiClient } from './apiClient';
import { MenuEdit } from '../types/menuEdit';

export const menuEditorService = {
  async get(groupId?: string): Promise<MenuEdit | null> {
    const { data } = await apiClient.get<{ menuEdit: MenuEdit | null }>('/menu-editor', {
      params: groupId ? { groupId } : undefined,
    });
    return data.menuEdit;
  },

  async save(menuEdit: MenuEdit, groupId?: string): Promise<MenuEdit> {
    const { data } = await apiClient.put<{ menuEdit: MenuEdit }>('/menu-editor/update', menuEdit, {
      params: groupId ? { groupId } : undefined,
    });
    return data.menuEdit;
  },
};
