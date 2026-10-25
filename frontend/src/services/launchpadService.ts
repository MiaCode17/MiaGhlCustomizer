import { apiClient } from './apiClient';
import { LaunchpadTile, LaunchpadTileInput } from '../types/launchpad';

export const launchpadService = {
  async list(groupId?: string): Promise<LaunchpadTile[]> {
    const { data } = await apiClient.get<{ tiles: LaunchpadTile[] }>('/launchpad', {
      params: groupId ? { groupId } : undefined,
    });
    return data.tiles;
  },

  async create(input: LaunchpadTileInput, groupId?: string): Promise<LaunchpadTile> {
    const { data } = await apiClient.post<{ tile: LaunchpadTile }>('/launchpad', input, {
      params: groupId ? { groupId } : undefined,
    });
    return data.tile;
  },

  async update(id: string, input: LaunchpadTileInput): Promise<LaunchpadTile> {
    const { data } = await apiClient.put<{ tile: LaunchpadTile }>(`/launchpad/${id}`, input);
    return data.tile;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/launchpad/${id}`);
  },
};
