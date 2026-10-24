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

const COLOR = z.string().regex(/^#[0-9a-fA-F]{3,8}$/, 'Use a hex color such as #4f46e5');

const membershipSchema = z.object({
  enabled: z.boolean(),
  allowedLocationIds: z.array(z.string().trim().min(1)).default([]),
  buttonLabel: z.string().trim().min(1).max(60).default('Membership'),
  url: z.string().trim().max(2000).default(''),
  openMode: z.enum(['modal', 'drawer', 'new-tab']).default('modal'),
  icon: z.string().max(500).optional(),
  backgroundColor: COLOR.default('#4f46e5'),
  textColor: COLOR.default('#ffffff'),
});

const unreadBadgeSchema = z.object({
  enabled: z.boolean(),
  badgeColor: COLOR.default('#2563eb'),
});

const userLinksSchema = z.object({
  enabled: z.boolean(),
  maxLinks: z.number().int().min(1).max(30).default(10),
});

const miscSettingsInputSchema = z.object({
  tooltip: tooltipSchema,
  addonBanner: addonBannerSchema,
  membership: membershipSchema,
  unreadBadge: unreadBadgeSchema,
  userLinks: userLinksSchema.default({ enabled: false, maxLinks: 10 }),
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
