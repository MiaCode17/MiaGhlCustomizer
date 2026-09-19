import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler';
import { attachCompany } from '../../middleware/company';
import { UserDoc } from '../../models/User';
import { AUTH_COOKIE_NAME, authCookieOptions, clearAuthCookieOptions, signAuthToken } from '../../utils/jwt';
import { buildRouter, RouteDef } from '../routeTable';
import { getUserById, login } from './services';

function serializeUser(user: Pick<UserDoc, '_id' | 'email'>) {
  return { id: String(user._id), email: user.email };
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const routes: RouteDef[] = [
  {
    method: 'post',
    url: '/login',
    handler: asyncHandler(async (req, res) => {
      const input = loginSchema.parse(req.body);
      const user = await login(input.email, input.password);
      const token = signAuthToken({ userId: String(user._id), companyId: String(user.companyId) });
      res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions());
      res.json({ user: serializeUser(user) });
    }),
  },
  {
    method: 'post',
    url: '/logout',
    handler: asyncHandler(async (_req, res) => {
      res.clearCookie(AUTH_COOKIE_NAME, clearAuthCookieOptions());
      res.json({ ok: true });
    }),
  },
  {
    method: 'get',
    url: '/me',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const user = await getUserById(req.userId!);
      res.json({ user: serializeUser(user) });
    }),
  },
];

export const authRouter: Router = buildRouter(routes);
