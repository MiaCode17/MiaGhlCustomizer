import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler';
import { attachCompany } from '../../middleware/company';
import { buildRouter, RouteDef } from '../routeTable';
import {
  createDynamicLink,
  deleteDynamicLink,
  listDynamicLinks,
  updateDynamicLink,
} from './services';

const dynamicLinkInputSchema = z.object({
  title: z.string().min(1),
  url: z.string().min(1),
  icon: z.string().optional(),
  openMode: z.enum(['same-tab', 'new-tab', 'modal']),
  roleTarget: z.enum(['all', 'owner', 'admin']),
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
      const links = await listDynamicLinks(req.companyId!, getGroupId(req));
      res.json({ links });
    }),
  },
  {
    method: 'post',
    url: '/',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const input = dynamicLinkInputSchema.parse(req.body);
      const groupId = getGroupId(req);
      const link = await createDynamicLink(req.companyId!, groupId, input);
      res.status(201).json({ link });
    }),
  },
  {
    method: 'put',
    url: '/:id',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const input = dynamicLinkInputSchema.parse(req.body);
      const link = await updateDynamicLink(req.companyId!, req.params.id, input);
      res.json({ link });
    }),
  },
  {
    method: 'delete',
    url: '/:id',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      await deleteDynamicLink(req.companyId!, req.params.id);
      res.status(204).send();
    }),
  },
];

export const dynamicLinksRouter: Router = buildRouter(routes);
