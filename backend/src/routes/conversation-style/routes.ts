import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler';
import { attachCompany } from '../../middleware/company';
import { buildRouter, RouteDef } from '../routeTable';
import { getConversationStyle, upsertConversationStyle } from './services';

const conversationStyleInputSchema = z.object({
  enabled: z.boolean(),
  agentBubbleColor: z.string().min(1),
  agentTextColor: z.string().min(1),
  contactBubbleColor: z.string().min(1),
  contactTextColor: z.string().min(1),
  fontFamily: z.string().min(1),
  bubbleRadius: z.number(),
  showTimestamps: z.boolean(),
  showAvatars: z.boolean(),
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
      const conversationStyle = await getConversationStyle(req.companyId!, getGroupId(req));
      res.json({ conversationStyle });
    }),
  },
  {
    method: 'put',
    url: '/update',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const input = conversationStyleInputSchema.parse(req.body);
      const groupId = getGroupId(req);
      const conversationStyle = await upsertConversationStyle(req.companyId!, groupId, input);
      res.json({ conversationStyle });
    }),
  },
];

export const conversationStyleRouter: Router = buildRouter(routes);
