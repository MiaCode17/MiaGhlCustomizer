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

const navTabSchema = z.object({
  label: z.string().trim().min(1).max(40),
  url: z.string().trim().min(1).max(2000),
});

const dateOrNull = z.preprocess(
  (v) => (v === '' || v === undefined ? null : v),
  z.coerce.date().nullable(),
);

const floatingButtonInputSchema = z
  .object({
    position: z.enum(['right', 'bottom', 'left', 'top']),
    label: z.string().min(1),
    icon: z.string().optional(),
    backgroundColor: z.string().min(1).default('#6366f1'),
    textColor: z.string().min(1).default('#ffffff'),
    borderRadius: z.number().default(999),
    shadow: z.enum(['none', 'sm', 'md', 'lg']).default('md'),
    animation: z.enum(['none', 'pulse', 'bounce', 'shimmer']).default('none'),
    subItems: z.array(subItemSchema).max(8).default([]),
    variant: z.enum(['solid', 'split', 'outline', 'ghost']).default('solid'),
    size: z.enum(['small', 'medium', 'large']).default('medium'),
    layout: z.enum(['horizontal', 'vertical']).default('horizontal'),
    positionPercent: z.number().min(0).max(100).nullable().default(null),
    edgeOffset: z.number().min(0).max(400).default(16),
    url: z.string().trim().max(2000).default(''),
    openMode: z.enum(['modal', 'drawer', 'new-tab', 'same-tab']).default('new-tab'),
    drawerDirection: z.enum(['auto', 'right', 'left', 'top', 'bottom']).default('auto'),
    drawerPercent: z.number().min(20).max(100).default(50),
    navTabs: z.array(navTabSchema).max(8).default([]),
    draggable: z.boolean().default(false),
    startAt: dateOrNull.default(null),
    endAt: dateOrNull.default(null),
    showCountdown: z.boolean().default(false),
  })
  .refine((b) => !b.startAt || !b.endAt || b.endAt > b.startAt, {
    message: 'The end time must be after the start time',
    path: ['endAt'],
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
