import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler';
import { attachCompany } from '../../middleware/company';
import { HttpError } from '../../middleware/errorHandler';
import { buildRouter, RouteDef } from '../routeTable';
import { createBanner, deleteBanner, listBanners, updateBanner } from './services';

const bannerInputSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['info', 'warning', 'success', 'promo']),
  position: z.enum(['top', 'bottom']),
  enabled: z.boolean(),
  content: z.string().min(1),
});

const bannerUpdateSchema = bannerInputSchema.partial();

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
      const banners = await listBanners(req.companyId!, getGroupId(req));
      res.json({ banners });
    }),
  },
  {
    method: 'post',
    url: '/',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const input = bannerInputSchema.parse(req.body);
      const groupId = getGroupId(req);
      const banner = await createBanner(req.companyId!, groupId, input);
      res.status(201).json({ banner });
    }),
  },
  {
    method: 'put',
    url: '/:id',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const input = bannerUpdateSchema.parse(req.body);
      const banner = await updateBanner(req.companyId!, req.params.id, input);
      if (!banner) {
        throw new HttpError(404, 'Banner not found');
      }
      res.json({ banner });
    }),
  },
  {
    method: 'delete',
    url: '/:id',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const banner = await deleteBanner(req.companyId!, req.params.id);
      if (!banner) {
        throw new HttpError(404, 'Banner not found');
      }
      res.status(204).send();
    }),
  },
];

export const bannersRouter: Router = buildRouter(routes);
