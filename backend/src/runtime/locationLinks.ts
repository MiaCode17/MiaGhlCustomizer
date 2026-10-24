import crypto from 'crypto';
import { Types } from 'mongoose';
import { LocationLink, LocationLinkDoc, LocationLinkOpenMode } from '../models/LocationLink';
import { MiscSettings } from '../models/MiscSettings';
import { findScoped } from '../utils/scope';

/**
 * Links that a sub-account's own users add to their sidebar. The runtime endpoints are public
 * (called from inside GHL), so writes are authorised by proof of access: the caller sends their
 * GHL session token and we confirm with GHL that it can read that location. The token is never
 * stored or logged, and a successful check is cached briefly under a hash of token + location.
 */
const GHL_API = 'https://backend.leadconnectorhq.com';
const OK_TTL_MS = 5 * 60 * 1000;
const FAIL_TTL_MS = 60 * 1000;
const TIMEOUT_MS = 10 * 1000;
const MAX_CACHE_ENTRIES = 5000;

const accessCache = new Map<string, { expires: number; ok: boolean }>();

export interface LocationLinkInput {
  title: string;
  url: string;
  icon?: string;
  openMode: LocationLinkOpenMode;
}

export interface UserLinksConfig {
  enabled: boolean;
  maxLinks: number;
}

/** Whether the viewer's token can read this location in GHL (cached). */
export async function verifyLocationAccess(token: string, locationId: string): Promise<boolean> {
  const key = crypto.createHash('sha256').update(token).update('\0').update(locationId).digest('hex');
  const hit = accessCache.get(key);
  if (hit && hit.expires > Date.now()) return hit.ok;

  let ok = false;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${GHL_API}/locations/${encodeURIComponent(locationId)}/customFields`, {
      headers: {
        authorization: `Bearer ${token}`,
        channel: 'APP',
        source: 'WEB_USER',
        version: '2021-07-28',
      },
      signal: controller.signal,
    });
    ok = res.ok;
  } catch {
    ok = false;
  } finally {
    clearTimeout(timer);
  }

  if (accessCache.size >= MAX_CACHE_ENTRIES) {
    const oldest = accessCache.keys().next().value;
    if (oldest !== undefined) accessCache.delete(oldest);
  }
  accessCache.set(key, { expires: Date.now() + (ok ? OK_TTL_MS : FAIL_TTL_MS), ok });
  return ok;
}

export async function getUserLinksConfig(companyId: Types.ObjectId, groupId: string): Promise<UserLinksConfig> {
  const misc = await findScoped(MiscSettings, companyId, groupId);
  return { enabled: Boolean(misc?.userLinks?.enabled), maxLinks: misc?.userLinks?.maxLinks ?? 10 };
}

export function serializeLink(link: LocationLinkDoc) {
  return {
    id: String(link._id),
    title: link.title,
    url: link.url,
    icon: link.icon ?? '',
    openMode: link.openMode,
  };
}

export async function listLocationLinks(companyId: Types.ObjectId, locationId: string) {
  return LocationLink.find({ companyId, locationId }).sort({ createdAt: 1 });
}

export class LinkLimitError extends Error {}

export async function createLocationLink(
  companyId: Types.ObjectId,
  locationId: string,
  maxLinks: number,
  input: LocationLinkInput,
) {
  const count = await LocationLink.countDocuments({ companyId, locationId });
  if (count >= maxLinks) throw new LinkLimitError(`This location can keep up to ${maxLinks} links`);
  return LocationLink.create({ ...input, companyId, locationId });
}

export async function updateLocationLink(
  companyId: Types.ObjectId,
  locationId: string,
  id: string,
  input: LocationLinkInput,
) {
  return LocationLink.findOneAndUpdate({ _id: id, companyId, locationId }, { $set: input }, { new: true });
}

export async function deleteLocationLink(companyId: Types.ObjectId, locationId: string, id: string) {
  return LocationLink.findOneAndDelete({ _id: id, companyId, locationId });
}

/** Drops cached access decisions (tests, and a manual escape hatch). */
export function clearLocationAccessCache(): void {
  accessCache.clear();
}
