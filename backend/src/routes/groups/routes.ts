import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler';
import { attachCompany } from '../../middleware/company';
import { buildRouter, RouteDef } from '../routeTable';
import { createGroup, deleteGroup, listGroups, updateGroup } from './services';

const idList = z.array(z.string().trim().min(1)).default([]);

const groupInputSchema = z
  .object({
    name: z.string().trim().min(1),
    type: z.enum(['saas-plan', 'custom']),
    planIds: idList,
    locationIds: idList,
  })
  .refine((g) => g.type !== 'saas-plan' || g.planIds.length > 0 || g.locationIds.length > 0, {
    message: 'A SaaS plan group needs at least one plan ID or location ID',
    path: ['planIds'],
  });

const routes: RouteDef[] = [
  {
    method: 'get',
    url: '/',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const groups = await listGroups(req.companyId!);
      res.json({ groups });
    }),
  },
  {
    method: 'post',
    url: '/',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const input = groupInputSchema.parse(req.body);
      const group = await createGroup(req.companyId!, input);
      res.status(201).json({ group });
    }),
  },
  {
    method: 'put',
    url: '/:id',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const input = groupInputSchema.parse(req.body);
      const group = await updateGroup(req.companyId!, req.params.id, input);
      res.json({ group });
    }),
  },
  {
    method: 'delete',
    url: '/:id',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      await deleteGroup(req.companyId!, req.params.id);
      res.status(204).send();
    }),
  },
];

export const groupsRouter: Router = buildRouter(routes);
