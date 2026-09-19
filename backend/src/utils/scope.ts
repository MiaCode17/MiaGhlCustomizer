import { Types, FilterQuery, Model } from 'mongoose';

export interface ScopedDoc {
  companyId: Types.ObjectId;
  groupId?: string;
}

/**
 * Builds a filter for the group-specific document if a groupId is given,
 * otherwise the company-wide default (empty/absent groupId).
 */
export function scopeFilter<T extends ScopedDoc>(
  companyId: Types.ObjectId,
  groupId?: string,
): FilterQuery<T> {
  return { companyId, groupId: groupId ?? '' } as FilterQuery<T>;
}

/**
 * Fetches the group-specific document if one exists, otherwise falls back
 * to the company-wide default document.
 */
export async function findScoped<T extends ScopedDoc>(
  model: Model<T>,
  companyId: Types.ObjectId,
  groupId?: string,
): Promise<T | null> {
  if (groupId) {
    const specific = await model.findOne({ companyId, groupId } as FilterQuery<T>);
    if (specific) return specific;
  }
  return model.findOne({ companyId, groupId: '' } as FilterQuery<T>);
}
