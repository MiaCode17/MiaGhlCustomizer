import { Types, FilterQuery, Model } from 'mongoose';
import { Group } from '../models/Group';

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

export interface LocationContext {
  locationId?: string;
  planId?: string;
}

/**
 * Resolves which group a GHL location belongs to. SaaS-plan groups win over
 * custom groups; returns '' (company-wide default) when nothing matches.
 * Every runtime endpoint goes through this so the embed script only ever
 * needs to know company + location, never groups.
 */
export async function resolveGroupId(
  companyId: Types.ObjectId,
  { locationId, planId }: LocationContext,
): Promise<string> {
  if (!locationId && !planId) return '';

  const planMatch: FilterQuery<unknown>[] = [];
  if (planId) planMatch.push({ planIds: planId });
  if (locationId) planMatch.push({ locationIds: locationId });

  const saasGroup = await Group.findOne({ companyId, type: 'saas-plan', $or: planMatch })
    .sort({ createdAt: 1 })
    .select('_id');
  if (saasGroup) return String(saasGroup._id);

  if (locationId) {
    const customGroup = await Group.findOne({ companyId, type: 'custom', locationIds: locationId })
      .sort({ createdAt: 1 })
      .select('_id');
    if (customGroup) return String(customGroup._id);
  }

  return '';
}
