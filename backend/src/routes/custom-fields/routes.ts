import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler';
import { attachCompany } from '../../middleware/company';
import { HttpError } from '../../middleware/errorHandler';
import { buildRouter, RouteDef } from '../routeTable';
import {
  createCustomFieldCampaign,
  deleteCustomFieldCampaign,
  listCustomFieldCampaigns,
  updateCustomFieldCampaign,
} from './services';

const customFieldCampaignInputSchema = z.object({
  name: z.string().min(1),
  exposedFieldKeys: z.array(z.string()).default([]),
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
      const campaigns = await listCustomFieldCampaigns(req.companyId!, getGroupId(req));
      res.json({ campaigns });
    }),
  },
  {
    method: 'post',
    url: '/',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const input = customFieldCampaignInputSchema.parse(req.body);
      const groupId = getGroupId(req);
      const campaign = await createCustomFieldCampaign(req.companyId!, groupId, input);
      res.status(201).json({ campaign });
    }),
  },
  {
    method: 'put',
    url: '/:id',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const input = customFieldCampaignInputSchema.parse(req.body);
      const campaign = await updateCustomFieldCampaign(req.companyId!, req.params.id, input);
      if (!campaign) {
        throw new HttpError(404, 'Campaign not found');
      }
      res.json({ campaign });
    }),
  },
  {
    method: 'delete',
    url: '/:id',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const campaign = await deleteCustomFieldCampaign(req.companyId!, req.params.id);
      if (!campaign) {
        throw new HttpError(404, 'Campaign not found');
      }
      res.status(204).send();
    }),
  },
];

export const customFieldsRouter: Router = buildRouter(routes);
