import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler';
import { attachCompany } from '../../middleware/company';
import { buildRouter, RouteDef } from '../routeTable';
import { getLoginPageConfig, upsertLoginPageConfig } from './services';

const cssVariableSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
});

const loginPageConfigInputSchema = z.object({
  preset: z.enum(['split-left', 'split-right', 'centered', 'full-bleed']),
  logoUrl: z.string().optional(),
  backgroundImageUrl: z.string().optional(),
  cssVariables: z.array(cssVariableSchema).default([]),
  customCss: z.string().default(''),
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
      const config = await getLoginPageConfig(req.companyId!, getGroupId(req));
      res.json({ config });
    }),
  },
  {
    method: 'put',
    url: '/update',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const input = loginPageConfigInputSchema.parse(req.body);
      const groupId = getGroupId(req);
      const config = await upsertLoginPageConfig(req.companyId!, groupId, input);
      res.json({ config });
    }),
  },
];

export const loginPageRouter: Router = buildRouter(routes);
