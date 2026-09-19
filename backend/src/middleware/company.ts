import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import { Company } from '../models/Company';
import { HttpError } from './errorHandler';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      companyId?: Types.ObjectId;
    }
  }
}

const DEFAULT_COMPANY_NAME = 'My Agency';

let defaultCompanyId: Types.ObjectId | null = null;

/**
 * There are no user accounts in this app: every request acts on a single
 * seeded company. This finds or creates that company once at boot.
 */
export async function ensureDefaultCompany(): Promise<void> {
  let company = await Company.findOne();
  if (!company) {
    company = await Company.create({ name: DEFAULT_COMPANY_NAME, plan: 'agency' });
  }
  defaultCompanyId = company._id;
}

export function attachCompany(req: Request, _res: Response, next: NextFunction): void {
  if (!defaultCompanyId) {
    throw new HttpError(500, 'Default company not initialized');
  }
  req.companyId = defaultCompanyId;
  next();
}
