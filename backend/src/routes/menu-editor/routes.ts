import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler';
import { attachCompany } from '../../middleware/company';
import { buildRouter, RouteDef } from '../routeTable';
import { getMenuEdit, upsertMenuEdit } from './services';

const renamedMenuItemSchema = z.object({
  originalLabel: z.string().min(1),
  newLabel: z.string().min(1),
});

const settingsMenuItemSchema = z.object({
  name: z.string().min(1),
  link: z.string().min(1),
});

const navTreeItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  url: z.string().optional(),
  parentId: z.string().optional(),
  order: z.number(),
});

const toolCategoryToolSchema = z.object({
  label: z.string().min(1),
  url: z.string().min(1),
});

const toolCategorySchema = z.object({
  name: z.string().min(1),
  tools: z.array(toolCategoryToolSchema).default([]),
});

const menuEditInputSchema = z.object({
  renamed: z.array(renamedMenuItemSchema).default([]),
  hidden: z.array(z.string()).default([]),
  settingsMenuItems: z.array(settingsMenuItemSchema).default([]),
  navTree: z.array(navTreeItemSchema).default([]),
  toolCategories: z.array(toolCategorySchema).default([]),
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
      const menuEdit = await getMenuEdit(req.companyId!, getGroupId(req));
      res.json({ menuEdit });
    }),
  },
  {
    method: 'put',
    url: '/update',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const input = menuEditInputSchema.parse(req.body);
      const groupId = getGroupId(req);
      const menuEdit = await upsertMenuEdit(req.companyId!, groupId, input);
      res.json({ menuEdit });
    }),
  },
];

export const menuEditorRouter: Router = buildRouter(routes);
