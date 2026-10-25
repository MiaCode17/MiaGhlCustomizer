import { Types } from 'mongoose';
import { HttpError } from '../../middleware/errorHandler';
import { LaunchpadTile, LaunchpadTileDoc } from '../../models/LaunchpadTile';
import { scopeFilter } from '../../utils/scope';

export interface LaunchpadTileInput {
  order: number;
  kind: LaunchpadTileDoc['kind'];
  nativeId: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  url: string;
  openMode: LaunchpadTileDoc['openMode'];
  hidden: boolean;
}

export async function listLaunchpadTiles(companyId: Types.ObjectId, groupId?: string) {
  return LaunchpadTile.find(scopeFilter(companyId, groupId)).sort({ order: 1, createdAt: 1 });
}

export async function createLaunchpadTile(
  companyId: Types.ObjectId,
  groupId: string | undefined,
  input: LaunchpadTileInput,
) {
  return LaunchpadTile.create({ ...input, companyId, groupId: groupId ?? '' });
}

export async function updateLaunchpadTile(companyId: Types.ObjectId, id: string, input: LaunchpadTileInput) {
  const tile = await LaunchpadTile.findOneAndUpdate({ _id: id, companyId }, { $set: input }, { new: true });
  if (!tile) {
    throw new HttpError(404, 'Tile not found');
  }
  return tile;
}

export async function deleteLaunchpadTile(companyId: Types.ObjectId, id: string) {
  const result = await LaunchpadTile.deleteOne({ _id: id, companyId });
  if (result.deletedCount === 0) {
    throw new HttpError(404, 'Tile not found');
  }
}
