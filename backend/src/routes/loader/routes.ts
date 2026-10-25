import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler';
import { attachCompany } from '../../middleware/company';
import { buildRouter, RouteDef } from '../routeTable';
import { getLoaderConfig, upsertLoaderConfig } from './services';

/** An uploaded file (relative) or an http(s) address: never a script or data URL. */
const savedImageSchema = z.object({
  name: z.string().trim().min(1).max(60),
  url: z
    .string()
    .trim()
    .max(2000)
    .refine((u) => /^(https?:\/\/|\/(?!\/))/i.test(u), 'The image address must start with http://, https:// or /'),
});

const loaderInputSchema = z.object({
  enabled: z.boolean(),
  loaderType: z.enum(['spinner', 'dots', 'bar', 'pulse', 'bars', 'ring', 'wave', 'orbit', 'grid', 'custom-image']),
  customImageUrl: z.string().optional(),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{3,8}$/, 'Use a hex color such as #4f46e5')
    .default('#4f46e5'),
  size: z.enum(['small', 'medium', 'large']).default('medium'),
  library: z.array(savedImageSchema).max(20).default([]),
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
      const loader = await getLoaderConfig(req.companyId!, getGroupId(req));
      res.json({ loader });
    }),
  },
  {
    method: 'put',
    url: '/update',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const input = loaderInputSchema.parse(req.body);
      const groupId = getGroupId(req);
      const loader = await upsertLoaderConfig(req.companyId!, groupId, input);
      res.json({ loader });
    }),
  },
];

export const loaderRouter: Router = buildRouter(routes);
