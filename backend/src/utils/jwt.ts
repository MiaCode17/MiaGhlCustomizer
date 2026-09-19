import { CookieOptions } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthTokenPayload {
  userId: string;
  companyId: string;
}

export const AUTH_COOKIE_NAME = 'customizer_token';

const TOKEN_TTL = '7d';
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: TOKEN_TTL });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
}

function baseCookieOptions(): CookieOptions {
  const isProduction = env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    // Cross-site (frontend/backend on different domains) requires 'none' + secure
    // in production; 'lax' keeps local http dev working across localhost ports.
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  };
}

export function authCookieOptions(): CookieOptions {
  return { ...baseCookieOptions(), maxAge: COOKIE_MAX_AGE_MS };
}

// No maxAge here: res.clearCookie recomputes `expires` from maxAge if present,
// which would overwrite the immediate-past expiry it needs to actually clear the cookie.
export function clearAuthCookieOptions(): CookieOptions {
  return baseCookieOptions();
}
