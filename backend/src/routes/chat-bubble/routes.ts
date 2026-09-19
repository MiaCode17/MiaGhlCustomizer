import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler';
import { attachCompany } from '../../middleware/company';
import { buildRouter, RouteDef } from '../routeTable';
import { getChatBubbleConfig, upsertChatBubbleConfig } from './services';

const quickActionSchema = z.object({
  label: z.string().min(1),
  url: z.string().min(1),
});

const chatBubbleInputSchema = z.object({
  enabled: z.boolean(),
  title: z.string().min(1),
  subtitle: z.string().default(''),
  gradientFrom: z.string().min(1),
  gradientTo: z.string().min(1),
  welcomeMessage: z.string().default(''),
  successMessage: z.string().default(''),
  errorMessage: z.string().default(''),
  quickActions: z.array(quickActionSchema).default([]),
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
      const chatBubble = await getChatBubbleConfig(req.companyId!, getGroupId(req));
      res.json({ chatBubble });
    }),
  },
  {
    method: 'put',
    url: '/update',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const input = chatBubbleInputSchema.parse(req.body);
      const groupId = getGroupId(req);
      const chatBubble = await upsertChatBubbleConfig(req.companyId!, groupId, input);
      res.json({ chatBubble });
    }),
  },
];

export const chatBubbleRouter: Router = buildRouter(routes);
