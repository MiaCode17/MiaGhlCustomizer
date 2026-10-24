import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler';
import { attachCompany } from '../../middleware/company';
import { buildRouter, RouteDef } from '../routeTable';
import { getChatBubbleConfig, upsertChatBubbleConfig } from './services';

const COLOR = z.string().trim().regex(/^#[0-9a-fA-F]{3,8}$/, 'Use a hex color such as #4f46e5');
const OPTIONAL_COLOR = z.union([COLOR, z.literal('')]);

const quickActionSchema = z.object({
  label: z.string().trim().min(1).max(60),
  url: z.string().trim().min(1).max(2000),
});

const navTabSchema = z.object({
  label: z.string().trim().min(1).max(30),
  url: z.string().trim().min(1).max(2000),
  icon: z.string().trim().max(500).optional(),
  enabled: z.boolean().default(true),
});

const chatBubbleInputSchema = z.object({
  enabled: z.boolean(),

  title: z.string().trim().min(1).max(80),
  subtitle: z.string().trim().max(200).default(''),
  logoUrl: z.string().trim().max(2000).default(''),
  statusText: z.string().trim().max(80).default('Online'),
  showStatus: z.boolean().default(true),
  statusColor: COLOR.default('#22c55e'),
  agentName: z.string().trim().min(1).max(40).default('Support'),
  welcomeMessage: z.string().max(1000).default(''),
  successMessage: z.string().max(500).default(''),
  errorMessage: z.string().max(500).default(''),
  inputPlaceholder: z.string().trim().max(80).default('Type your message…'),

  chatEnabled: z.boolean().default(true),
  quickReplies: z.array(z.string().trim().min(1).max(80)).max(6).default([]),
  quickActions: z.array(quickActionSchema).max(8).default([]),
  navTabs: z.array(navTabSchema).max(6).default([]),
  hideNavTabs: z.boolean().default(false),
  hideInput: z.boolean().default(false),
  hideSendButton: z.boolean().default(false),

  gradientFrom: COLOR.default('#6366f1'),
  gradientTo: COLOR.default('#8b5cf6'),
  headerBgColor: OPTIONAL_COLOR.default(''),
  headerTitleColor: COLOR.default('#ffffff'),
  headerSubtitleColor: COLOR.default('#e0e7ff'),
  visitorBubbleBg: COLOR.default('#4f46e5'),
  visitorBubbleText: COLOR.default('#ffffff'),
  agentBubbleBg: COLOR.default('#f3f4f6'),
  agentBubbleText: COLOR.default('#111827'),
  navBarBgColor: COLOR.default('#ffffff'),
  navBarBorderColor: COLOR.default('#e5e7eb'),
  navTabActiveColor: COLOR.default('#4f46e5'),
  navTabInactiveColor: COLOR.default('#6b7280'),
  navTabActiveBgColor: COLOR.default('#eef2ff'),

  bubbleIcon: z.string().trim().max(500).default('chat'),
  bubbleSize: z.number().min(40).max(96).default(60),
  bubbleTextColor: COLOR.default('#ffffff'),
  side: z.enum(['right', 'left']).default('right'),
  sideOffset: z.number().min(0).max(400).default(20),
  bottomOffset: z.number().min(0).max(600).default(20),
  draggable: z.boolean().default(true),
  windowWidth: z.number().min(300).max(640).default(380),
  windowHeight: z.number().min(360).max(900).default(560),
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
