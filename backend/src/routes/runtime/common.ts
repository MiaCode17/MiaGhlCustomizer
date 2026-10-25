import { Request } from 'express';
import { Types } from 'mongoose';
import { env } from '../../config/env';
import { HttpError } from '../../middleware/errorHandler';
import { Company } from '../../models/Company';

/** Helpers shared by the public runtime routes (called from inside GHL, no login cookie). */

const OBJECT_ID = /^[a-f0-9]{24}$/i;
const GHL_ID = /^[A-Za-z0-9]{1,64}$/;

/**
 * Accepts either our internal company _id or the agency's GHL company ID, so the
 * install snippet can use the ID agencies already know from GHL.
 */
export async function resolveCompanyId(raw: unknown): Promise<Types.ObjectId> {
  if (typeof raw === 'string' && OBJECT_ID.test(raw)) {
    return new Types.ObjectId(raw);
  }
  if (typeof raw !== 'string' || !GHL_ID.test(raw)) {
    throw new HttpError(400, 'A valid company_id is required');
  }
  const company = await Company.findOne({ ghlCompanyId: raw }).select('_id').lean();
  if (!company) {
    throw new HttpError(404, 'No account is linked to this GHL company ID');
  }
  return company._id;
}

export function queryString(req: Request, key: string): string | undefined {
  const raw = req.query[key];
  return typeof raw === 'string' && raw.trim().length > 0 ? raw.trim() : undefined;
}

export function locationContext(req: Request) {
  return { locationId: queryString(req, 'locationId'), planId: queryString(req, 'planId') };
}

export function apiBase(req: Request): string {
  return env.PUBLIC_BASE_URL ?? `${req.protocol}://${req.get('host')}`;
}
