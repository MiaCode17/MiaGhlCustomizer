import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import { AUTH_COOKIE_NAME, verifyAuthToken } from '../utils/jwt';
import { HttpError } from './errorHandler';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      companyId?: Types.ObjectId;
      userId?: Types.ObjectId;
    }
  }
}

/**
 * Verifies the session cookie and attaches the authenticated user's
 * companyId/userId to the request. Every route that touches company data
 * uses this as its auth gate.
 */
export function attachCompany(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  if (!token) {
    throw new HttpError(401, 'Not authenticated');
  }

  try {
    const payload = verifyAuthToken(token);
    req.userId = new Types.ObjectId(payload.userId);
    req.companyId = new Types.ObjectId(payload.companyId);
  } catch {
    throw new HttpError(401, 'Invalid or expired session');
  }

  next();
}
