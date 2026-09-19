import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler';
import { attachCompany } from '../../middleware/company';
import { buildRouter, RouteDef } from '../routeTable';
import {
  createLogoCampaign,
  deleteLogoCampaign,
  listLogoCampaigns,
  updateLogoCampaign,
} from './services';

const logoCampaignInputSchema = z.object({
  name: z.string().min(1),
  logoUrl: z.string().min(1),
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
      const campaigns = await listLogoCampaigns(req.companyId!, getGroupId(req));
      res.json({ campaigns });
    }),
  },
  {
    method: 'post',
    url: '/',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const input = logoCampaignInputSchema.parse(req.body);
      const groupId = getGroupId(req);
      const campaign = await createLogoCampaign(req.companyId!, groupId, input);
      res.status(201).json({ campaign });
    }),
  },
  {
    method: 'put',
    url: '/:id',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const input = logoCampaignInputSchema.parse(req.body);
      const campaign = await updateLogoCampaign(req.companyId!, req.params.id, input);
      res.json({ campaign });
    }),
  },
  {
    method: 'delete',
    url: '/:id',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      await deleteLogoCampaign(req.companyId!, req.params.id);
      res.status(204).send();
    }),
  },
];

export const logoRouter: Router = buildRouter(routes);
