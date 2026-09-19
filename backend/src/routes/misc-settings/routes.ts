import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler';
import { attachCompany } from '../../middleware/company';
import { buildRouter, RouteDef } from '../routeTable';
import { getMiscSettings, upsertMiscSettings } from './services';

const tooltipSchema = z.object({
  enabled: z.boolean(),
  buttonText: z.string().min(1),
  placement: z.enum(['bottom-right', 'bottom-left', 'top-right', 'top-left']),
});

const addonBannerSchema = z.object({
  enabled: z.boolean(),
  placement: z.enum(['top', 'sidebar', 'dashboard']),
  showOnOtherPages: z.boolean(),
  message: z.string().default(''),
  ctaUrl: z.string().optional(),
});

const membershipSchema = z.object({
  enabled: z.boolean(),
  allowedLocationIds: z.array(z.string()).default([]),
});

const unreadBadgeSchema = z.object({
  enabled: z.boolean(),
});

const miscSettingsInputSchema = z.object({
  tooltip: tooltipSchema,
  addonBanner: addonBannerSchema,
  membership: membershipSchema,
  unreadBadge: unreadBadgeSchema,
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
      const settings = await getMiscSettings(req.companyId!, getGroupId(req));
      res.json({ settings });
    }),
  },
  {
    method: 'put',
    url: '/update',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const input = miscSettingsInputSchema.parse(req.body);
      const groupId = getGroupId(req);
      const settings = await upsertMiscSettings(req.companyId!, groupId, input);
      res.json({ settings });
    }),
  },
];

export const miscSettingsRouter: Router = buildRouter(routes);
