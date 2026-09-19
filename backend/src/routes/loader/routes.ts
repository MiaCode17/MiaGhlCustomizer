import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler';
import { attachCompany } from '../../middleware/company';
import { buildRouter, RouteDef } from '../routeTable';
import { getLoaderConfig, upsertLoaderConfig } from './services';

const loaderInputSchema = z.object({
  enabled: z.boolean(),
  loaderType: z.enum(['spinner', 'dots', 'bar', 'custom-image']),
  customImageUrl: z.string().optional(),
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
      const loader = await getLoaderConfig(req.companyId!, getGroupId(req));
      res.json({ loader });
    }),
  },
  {
    method: 'put',
    url: '/update',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const input = loaderInputSchema.parse(req.body);
      const groupId = getGroupId(req);
      const loader = await upsertLoaderConfig(req.companyId!, groupId, input);
      res.json({ loader });
    }),
  },
];

export const loaderRouter: Router = buildRouter(routes);
