import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler';
import { attachCompany } from '../../middleware/company';
import { buildRouter, RouteDef } from '../routeTable';
import { deleteTheme, getTheme, upsertTheme } from './services';

const colorRuleSchema = z.object({
  name: z.string().min(1),
  selector: z.string().min(1),
  property: z.string().min(1),
  value: z.string().min(1),
});

const gradientSchema = z.object({
  target: z.enum(['header', 'sidebar', 'button']),
  from: z.string().min(1),
  to: z.string().min(1),
  angle: z.number().min(0).max(360),
});

const themeInputSchema = z.object({
  themeName: z.string().min(1),
  colorRules: z.array(colorRuleSchema).default([]),
  gradients: z.array(gradientSchema).default([]),
  fonts: z.object({ heading: z.string().min(1), body: z.string().min(1) }),
  borderRadius: z.string().min(1),
  shadowIntensity: z.enum(['none', 'sm', 'md', 'lg']),
  enabled: z.boolean(),
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
      const theme = await getTheme(req.companyId!, getGroupId(req));
      res.json({ theme });
    }),
  },
  {
    method: 'post',
    url: '/',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const input = themeInputSchema.parse(req.body);
      const groupId = getGroupId(req);
      const theme = await upsertTheme(req.companyId!, groupId, input);
      res.status(201).json({ theme });
    }),
  },
  {
    method: 'put',
    url: '/update',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const input = themeInputSchema.parse(req.body);
      const groupId = getGroupId(req);
      const theme = await upsertTheme(req.companyId!, groupId, input);
      res.json({ theme });
    }),
  },
  {
    method: 'delete',
    url: '/delete',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      await deleteTheme(req.companyId!, getGroupId(req));
      res.status(204).send();
    }),
  },
];

export const themeRouter: Router = buildRouter(routes);
