import jwt from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';
import { authCookieOptions, clearAuthCookieOptions, signAuthToken, verifyAuthToken } from '../src/utils/jwt';

describe('jwt utils', () => {
  it('round-trips a payload', () => {
    const token = signAuthToken({ userId: 'u1', companyId: 'c1' });
    expect(verifyAuthToken(token)).toMatchObject({ userId: 'u1', companyId: 'c1' });
  });

  it('rejects a token signed with another secret', () => {
    const forged = jwt.sign({ userId: 'u1', companyId: 'c1' }, 'a-different-secret-entirely');
    expect(() => verifyAuthToken(forged)).toThrow();
  });

  it('rejects an expired token', () => {
    const expired = jwt.sign({ userId: 'u1', companyId: 'c1' }, process.env.JWT_SECRET!, { expiresIn: -10 });
    expect(() => verifyAuthToken(expired)).toThrow();
  });

  it('rejects an unsigned (alg none) token', () => {
    const none = jwt.sign({ userId: 'u1', companyId: 'c1' }, '', { algorithm: 'none' });
    expect(() => verifyAuthToken(none)).toThrow();
  });

  it('uses httpOnly cookies, and clearing omits maxAge', () => {
    expect(authCookieOptions().httpOnly).toBe(true);
    expect(authCookieOptions().maxAge).toBeGreaterThan(0);
    expect(clearAuthCookieOptions().maxAge).toBeUndefined();
  });
});
