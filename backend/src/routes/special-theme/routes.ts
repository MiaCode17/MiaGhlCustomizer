import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler';
import { attachCompany } from '../../middleware/company';
import { buildRouter, RouteDef } from '../routeTable';
import { getSpecialTheme, upsertSpecialTheme } from './services';

const popupSchema = z.object({
  visible: z.boolean(),
  title: z.string(),
  message: z.string(),
  ctaText: z.string().optional(),
  ctaUrl: z.string().optional(),
});

const particleEffectSchema = z.object({
  enabled: z.boolean(),
  durationSeconds: z.number().min(0),
});

const specialThemeInputSchema = z.object({
  enabled: z.boolean(),
  themeKey: z.string(),
  popup: popupSchema,
  particleEffect: particleEffectSchema,
});

function getGroupId(req: { query: { groupId?: unknown } }): string | undefined {
  const raw = req.query.groupId;
  return typeof raw === 'string' && raw.length > 0 ? raw : undefined;
}

const routes: RouteDef[] = [
  {
    method: 'get',
    url: '/',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const specialTheme = await getSpecialTheme(req.companyId!, getGroupId(req));
      res.json({ specialTheme });
    }),
  },
  {
    method: 'put',
    url: '/update',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const input = specialThemeInputSchema.parse(req.body);
      const groupId = getGroupId(req);
      const specialTheme = await upsertSpecialTheme(req.companyId!, groupId, input);
      res.json({ specialTheme });
    }),
  },
];

export const specialThemeRouter: Router = buildRouter(routes);
