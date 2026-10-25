import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler';
import { attachCompany } from '../../middleware/company';
import { buildRouter, RouteDef } from '../routeTable';
import {
  createTour,
  deleteTour,
  getGuideSettings,
  listTours,
  updateTour,
  upsertGuideSettings,
} from './services';

const COLOR = z.string().trim().regex(/^#[0-9a-fA-F]{3,8}$/, 'Use a hex color such as #4f46e5');

/** Empty, or an http(s) address: step media and links are shown to the agency's own clients. */
const optionalHttpUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((u) => u === '' || /^https?:\/\//i.test(u), 'The URL must start with http:// or https://');

const stepSchema = z
  .object({
    title: z.string().trim().max(80).default(''),
    content: z.string().max(2000).default(''),
    selector: z.string().trim().max(300).default(''),
    clickSelector: z.string().trim().max(300).default(''),
    placement: z.enum(['auto', 'top', 'bottom', 'left', 'right', 'center']).default('auto'),
    mediaType: z.enum(['none', 'image', 'video']).default('none'),
    mediaUrl: optionalHttpUrl.default(''),
    ctaLabel: z.string().trim().max(40).default(''),
    ctaUrl: optionalHttpUrl.default(''),
  })
  .refine((s) => s.title.length > 0 || s.content.trim().length > 0, {
    message: 'A step needs a title or some text',
    path: ['title'],
  })
  .refine((s) => s.mediaType === 'none' || s.mediaUrl.length > 0, {
    message: 'Add the image or video URL',
    path: ['mediaUrl'],
  })
  .refine((s) => (s.ctaLabel.length > 0) === (s.ctaUrl.length > 0), {
    message: 'A button needs both a label and a URL',
    path: ['ctaUrl'],
  });

const tourInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
  enabled: z.boolean().default(true),
  pages: z.array(z.string().trim().min(1).max(100)).max(10).default([]),
  autoStart: z.enum(['never', 'first-visit']).default('never'),
  order: z.number().default(0),
  permissions: z
    .object({
      agency_admins: z.boolean(),
      agency_users: z.boolean(),
      account_admins: z.boolean(),
      account_users: z.boolean(),
    })
    .default({ agency_admins: true, agency_users: true, account_admins: true, account_users: true }),
  steps: z.array(stepSchema).min(1, 'A tour needs at least one step').max(20),
});

const settingsInputSchema = z.object({
  enabled: z.boolean().default(true),
  buttonText: z.string().trim().min(1).max(30).default('Guide'),
  icon: z.string().trim().max(500).default('help'),
  placement: z.enum(['header', 'bottom-right', 'bottom-left', 'top-right', 'top-left']).default('header'),
  backgroundColor: COLOR.default('#4f46e5'),
  textColor: COLOR.default('#ffffff'),
  borderRadius: z.number().min(0).max(999).default(999),
  size: z.enum(['small', 'medium', 'large']).default('medium'),
  shadow: z.enum(['none', 'sm', 'md', 'lg']).default('md'),
});

function getGroupId(req: { query: { groupId?: unknown } }): string | undefined {
  const raw = req.query.groupId;
  return typeof raw === 'string' && raw.length > 0 ? raw : undefined;
}

const routes: RouteDef[] = [
  {
    method: 'get',
    url: '/tours',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      res.json({ tours: await listTours(req.companyId!, getGroupId(req)) });
    }),
  },
  {
    method: 'post',
    url: '/tours',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const tour = await createTour(req.companyId!, getGroupId(req), tourInputSchema.parse(req.body));
      res.status(201).json({ tour });
    }),
  },
  {
    method: 'put',
    url: '/tours/:id',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const tour = await updateTour(req.companyId!, req.params.id, tourInputSchema.parse(req.body));
      res.json({ tour });
    }),
  },
  {
    method: 'delete',
    url: '/tours/:id',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      await deleteTour(req.companyId!, req.params.id);
      res.status(204).send();
    }),
  },
  {
    method: 'get',
    url: '/settings',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      res.json({ settings: await getGuideSettings(req.companyId!, getGroupId(req)) });
    }),
  },
  {
    method: 'put',
    url: '/settings/update',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const settings = await upsertGuideSettings(req.companyId!, getGroupId(req), settingsInputSchema.parse(req.body));
      res.json({ settings });
    }),
  },
];

export const guidesRouter: Router = buildRouter(routes);
