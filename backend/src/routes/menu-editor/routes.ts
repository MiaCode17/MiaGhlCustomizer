import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler';
import { attachCompany } from '../../middleware/company';
import { buildRouter, RouteDef } from '../routeTable';
import { getMenuEdit, upsertMenuEdit } from './services';

const ROLE_KEYS = ['agency_admins', 'agency_users', 'account_admins', 'account_users'] as const;
const roleKeySchema = z.enum(ROLE_KEYS);

const permissionsSchema = z
  .object({
    agency_admins: z.boolean(),
    agency_users: z.boolean(),
    account_admins: z.boolean(),
    account_users: z.boolean(),
  })
  .default({ agency_admins: true, agency_users: true, account_admins: true, account_users: true });

const openModeSchema = z.enum(['auto', 'modal', 'drawer', 'new-tab', 'same-tab']).default('auto');

const renamedMenuItemSchema = z.object({
  originalLabel: z.string().min(1),
  newLabel: z.string().min(1),
  icon: z.string().max(500).optional(),
});

const roleHiddenItemSchema = z.object({
  label: z.string().min(1),
  roleKeys: z.array(roleKeySchema).default([]),
});

const movedMenuItemSchema = z.object({
  label: z.string().min(1),
  position: z.enum(['before', 'after']).default('after'),
  target: z.string().min(1),
});

const settingsMenuItemSchema = z
  .object({
    type: z.enum(['link', 'divider']).default('link'),
    name: z.string().min(1),
    link: z.string().default(''),
    openMode: openModeSchema,
  })
  .refine((item) => item.type === 'divider' || item.link.trim().length > 0, {
    message: 'A settings link needs a URL',
    path: ['link'],
  });

const navTreeItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  url: z.string().optional(),
  parentId: z.string().optional(),
  order: z.number(),
  icon: z.string().max(500).optional(),
  openMode: openModeSchema,
  permissions: permissionsSchema,
});

const toolCategoryToolSchema = z.object({
  label: z.string().min(1),
  url: z.string().min(1),
});

const toolCategorySchema = z.object({
  name: z.string().min(1),
  tools: z.array(toolCategoryToolSchema).default([]),
});

const extendedTabSchema = z
  .object({
    id: z.string().min(1),
    label: z.string().trim().min(1),
    url: z.string().trim().min(1),
    page: z.enum(['opportunities', 'marketing', 'sites', 'conversations', 'calendars', 'contacts', 'custom']),
    routeContains: z.string().trim().max(200).optional(),
    referenceSelector: z.string().trim().max(300).optional(),
    containerSelector: z.string().trim().max(300).optional(),
    permissions: permissionsSchema,
  })
  .refine(
    (tab) =>
      tab.page !== 'custom' ||
      Boolean(tab.routeContains?.trim() && tab.referenceSelector?.trim() && tab.containerSelector?.trim()),
    { message: 'A custom tab needs a route, a reference selector and a container selector', path: ['page'] },
  );

const menuEditInputSchema = z.object({
  renamed: z.array(renamedMenuItemSchema).default([]),
  hidden: z.array(z.string()).default([]),
  hiddenByRole: z.array(roleHiddenItemSchema).default([]),
  moved: z.array(movedMenuItemSchema).default([]),
  settingsMenuItems: z.array(settingsMenuItemSchema).default([]),
  navTree: z.array(navTreeItemSchema).default([]),
  toolCategories: z.array(toolCategorySchema).default([]),
  extendedTabs: z.array(extendedTabSchema).max(30).default([]),
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
