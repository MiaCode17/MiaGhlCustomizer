import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler';
import { DEFAULT_CANCEL_REASONS } from '../../models/Feedback';
import { attachCompany } from '../../middleware/company';
import { buildRouter, RouteDef } from '../routeTable';
import {
  deleteResponse,
  exportCsv,
  feedbackStats,
  getFeedbackConfig,
  listResponses,
  upsertFeedbackConfig,
} from './services';

const COLOR = z.string().trim().regex(/^#[0-9a-fA-F]{3,8}$/, 'Use a hex color such as #4f46e5');

const cancelSchema = z.object({
  enabled: z.boolean().default(false),
  required: z.boolean().default(false),
  title: z.string().trim().min(1).max(80).default('Before you go…'),
  message: z.string().trim().max(300).default('Help us understand why you are cancelling.'),
  reasons: z.array(z.string().trim().min(1).max(80)).max(10).default([...DEFAULT_CANCEL_REASONS]),
  commentPlaceholder: z.string().trim().max(120).default('Anything else you would like to share? (optional)'),
});

const configInputSchema = z.object({
  enabled: z.boolean().default(false),
  ratingType: z.enum(['stars', 'ten', 'emoji']).default('stars'),
  buttonText: z.string().trim().min(1).max(30).default('Feedback'),
  icon: z.string().trim().max(500).default('star'),
  placement: z.enum(['right', 'left', 'bottom-right', 'bottom-left', 'header']).default('right'),
  backgroundColor: COLOR.default('#4f46e5'),
  textColor: COLOR.default('#ffffff'),
  title: z.string().trim().min(1).max(120).default('How was your experience?'),
  commentMode: z.enum(['off', 'optional', 'required']).default('optional'),
  commentPlaceholder: z.string().trim().max(120).default('Tell us more (optional)'),
  thanksMessage: z.string().trim().max(200).default('Thank you for your feedback!'),
  cooldownHours: z.number().int().min(0).max(720).default(24),
  draggable: z.boolean().default(false),
  askAfterChat: z.boolean().default(false),
  cancel: cancelSchema.default({
    enabled: false,
    required: false,
    title: 'Before you go…',
    message: 'Help us understand why you are cancelling.',
    reasons: [...DEFAULT_CANCEL_REASONS],
    commentPlaceholder: 'Anything else you would like to share? (optional)',
  }),
});

const responseQuerySchema = z.object({
  kind: z.enum(['rating', 'chat', 'cancellation', 'all']).default('all'),
  minRating: z.coerce.number().min(1).max(5).optional(),
  maxRating: z.coerce.number().min(1).max(5).optional(),
  search: z.string().trim().max(100).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

const pageSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

function getGroupId(req: { query: { groupId?: unknown } }): string | undefined {
  const raw = req.query.groupId;
  return typeof raw === 'string' && raw.length > 0 ? raw : undefined;
}

const routes: RouteDef[] = [
  {
    method: 'get',
    url: '/config',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      res.json({ config: await getFeedbackConfig(req.companyId!, getGroupId(req)) });
    }),
  },
  {
    method: 'put',
    url: '/config/update',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const config = await upsertFeedbackConfig(req.companyId!, getGroupId(req), configInputSchema.parse(req.body));
      res.json({ config });
    }),
  },
  {
    method: 'get',
    url: '/responses',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const { page, limit } = pageSchema.parse(req.query);
      res.json(await listResponses(req.companyId!, responseQuerySchema.parse(req.query), page, limit));
    }),
  },
  {
    method: 'get',
    url: '/stats',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      res.json({ stats: await feedbackStats(req.companyId!) });
    }),
  },
  {
    method: 'get',
    url: '/export',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const csv = await exportCsv(req.companyId!, responseQuerySchema.parse(req.query));
      res.type('text/csv');
      res.set('Content-Disposition', 'attachment; filename="feedback.csv"');
      res.send(csv);
    }),
  },
  {
    method: 'delete',
    url: '/responses/:id',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      await deleteResponse(req.companyId!, req.params.id);
      res.status(204).send();
    }),
  },
];

export const feedbackRouter: Router = buildRouter(routes);
