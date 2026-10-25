import { Types } from 'mongoose';
import { Company } from '../models/Company';
import { MiscSettings } from '../models/MiscSettings';
import { getGhlApiToken } from '../routes/company/services';
import { findScoped } from '../utils/scope';

/**
 * Total unread conversations for a GHL location, for the sidebar badge.
 *
 * Uses the company's stored GHL Private Integration token. An agency-level token
 * can't read a location's conversations directly, so a 401/403 triggers minting a
 * location-scoped token (POST /oauth/locationToken) and one retry.
 *
 * Built to survive heavy polling (many sub-accounts x many open tabs): results are
 * cached per location, failures too (so a broken token isn't hammered), concurrent
 * requests share one in-flight lookup, and every upstream call has a timeout.
 */
const GHL_BASE = 'https://services.leadconnectorhq.com';
const CACHE_TTL_MS = 60 * 1000;
const FAIL_TTL_MS = 5 * 60 * 1000;
const TIMEOUT_MS = 10 * 1000;
const MAX_CACHE_ENTRIES = 5000;

export const LOCATION_ID = /^[A-Za-z0-9]{10,40}$/;

export interface UnreadResult {
  enabled: boolean;
  count: number | null;
}

interface CacheEntry<T> {
  expires: number;
  value: T;
}

const countCache = new Map<string, CacheEntry<UnreadResult>>();
const locationTokenCache = new Map<string, CacheEntry<string>>();
const inFlight = new Map<string, Promise<UnreadResult>>();

function cacheGet<T>(map: Map<string, CacheEntry<T>>, key: string): T | null {
  const hit = map.get(key);
  if (!hit) return null;
  if (hit.expires <= Date.now()) {
    map.delete(key);
    return null;
  }
  return hit.value;
}

function cacheSet<T>(map: Map<string, CacheEntry<T>>, key: string, value: T, ttlMs: number): void {
  // Map keeps insertion order, so the first key is the oldest entry.
  if (map.size >= MAX_CACHE_ENTRIES && !map.has(key)) {
    const oldest = map.keys().next().value;
    if (oldest !== undefined) map.delete(oldest);
  }
  map.set(key, { expires: Date.now() + ttlMs, value });
}

async function ghlRequest(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function searchUnread(token: string, locationId: string): Promise<Response> {
  return ghlRequest(
    `${GHL_BASE}/conversations/search?locationId=${encodeURIComponent(locationId)}&status=unread&limit=1`,
    { headers: { Accept: 'application/json', Authorization: `Bearer ${token}`, Version: '2021-04-15' } },
  );
}

async function mintLocationToken(
  agencyToken: string,
  ghlCompanyId: string,
  locationId: string,
): Promise<string | null> {
  const cached = cacheGet(locationTokenCache, `${ghlCompanyId}:${locationId}`);
  if (cached) return cached;

  const res = await ghlRequest(`${GHL_BASE}/oauth/locationToken`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${agencyToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Version: '2021-07-28',
    },
    body: new URLSearchParams({ companyId: ghlCompanyId, locationId }).toString(),
  });
  if (!res.ok) return null;
  const body = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!body.access_token) return null;
  const ttl = Math.max(60, (body.expires_in ?? 3600) - 120) * 1000;
  cacheSet(locationTokenCache, `${ghlCompanyId}:${locationId}`, body.access_token, ttl);
  return body.access_token;
}

async function fetchCount(
  token: string,
  ghlCompanyId: string | undefined,
  locationId: string,
): Promise<number | null> {
  let res = await searchUnread(token, locationId);
  if ((res.status === 401 || res.status === 403) && ghlCompanyId) {
    const locationToken = await mintLocationToken(token, ghlCompanyId, locationId);
    if (locationToken) res = await searchUnread(locationToken, locationId);
  }
  if (!res.ok) return null;
  const body = (await res.json()) as { total?: number; conversations?: unknown[] };
  return typeof body.total === 'number' ? body.total : (body.conversations ?? []).length;
}

async function compute(
  companyId: Types.ObjectId,
  groupId: string,
  locationId: string,
): Promise<UnreadResult> {
  const misc = await findScoped(MiscSettings, companyId, groupId);
  if (!misc?.unreadBadge.enabled) return { enabled: false, count: null };

  const [token, company] = await Promise.all([
    getGhlApiToken(companyId),
    Company.findById(companyId).select('ghlCompanyId').lean(),
  ]);
  if (!token) return { enabled: false, count: null };

  try {
    return { enabled: true, count: await fetchCount(token, company?.ghlCompanyId, locationId) };
  } catch (err) {
    console.warn('[unread] lookup failed', (err as Error).message);
    return { enabled: true, count: null };
  }
}

/** Cached, de-duplicated unread count for one location of one company. */
export function getUnreadCount(
  companyId: Types.ObjectId,
  groupId: string,
  locationId: string,
): Promise<UnreadResult> {
  const key = `${companyId}:${locationId}`;
  const cached = cacheGet(countCache, key);
  if (cached) return Promise.resolve(cached);

  const pending = inFlight.get(key);
  if (pending) return pending;

  const lookup = compute(companyId, groupId, locationId)
    .then((result) => {
      // A null count means the lookup failed (bad token, GHL down): remember that for longer.
      cacheSet(countCache, key, result, result.enabled && result.count === null ? FAIL_TTL_MS : CACHE_TTL_MS);
      return result;
    })
    .finally(() => {
      inFlight.delete(key);
    });
  inFlight.set(key, lookup);
  return lookup;
}

/** Drops cached counts for a company (called when its token changes). */
export function clearUnreadCache(companyId: Types.ObjectId): void {
  const prefix = `${companyId}:`;
  for (const key of [...countCache.keys()]) {
    if (key.startsWith(prefix)) countCache.delete(key);
  }
}
