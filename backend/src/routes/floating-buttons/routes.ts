import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler';
import { attachCompany } from '../../middleware/company';
import { buildRouter, RouteDef } from '../routeTable';
import {
  createFloatingButton,
  deleteFloatingButton,
  listFloatingButtons,
  updateFloatingButton,
} from './services';

const subItemSchema = z.object({
  label: z.string().min(1),
  url: z.string().min(1),
});

const floatingButtonInputSchema = z.object({
  position: z.enum(['right', 'bottom']),
  label: z.string().min(1),
  backgroundColor: z.string().min(1).default('#6366f1'),
  textColor: z.string().min(1).default('#ffffff'),
  subItems: z.array(subItemSchema).max(8).default([]),
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
      const buttons = await listFloatingButtons(req.companyId!, getGroupId(req));
      res.json({ buttons });
    }),
  },
  {
    method: 'post',
    url: '/',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const input = floatingButtonInputSchema.parse(req.body);
      const groupId = getGroupId(req);
      const button = await createFloatingButton(req.companyId!, groupId, input);
      res.status(201).json({ button });
    }),
  },
  {
    method: 'put',
    url: '/:id',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const input = floatingButtonInputSchema.parse(req.body);
      const button = await updateFloatingButton(req.companyId!, req.params.id, input);
      res.json({ button });
    }),
  },
  {
    method: 'delete',
    url: '/:id',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      await deleteFloatingButton(req.companyId!, req.params.id);
      res.status(204).send();
    }),
  },
];

export const floatingButtonsRouter: Router = buildRouter(routes);
