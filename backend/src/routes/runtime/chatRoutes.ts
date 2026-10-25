import express, { Request, RequestHandler } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler';
import { HttpError } from '../../middleware/errorHandler';
import { ChatBubbleConfig } from '../../models/ChatBubbleConfig';
import {
  addVisitorMessage,
  ChatError,
  closeByVisitor,
  createTicket,
  loadTicket,
  messagesSince,
  publicTicket,
} from '../../runtime/chat';
import { verifyLocationAccess } from '../../runtime/locationLinks';
import { LOCATION_ID } from '../../runtime/unread';
import { findScoped, resolveGroupId } from '../../utils/scope';
import { RouteDef } from '../routeTable';
import { locationContext, queryString, resolveCompanyId } from './common';

/**
 * The chat bubble's server API, called from the browser inside GHL.
 *  - Starting a chat needs proof of a real GHL session for the location (X-GHL-Token, checked with
 *    GHL), which keeps strangers from filling the inbox.
 *  - Reading, writing and ending an existing chat needs only that chat's secret key (X-Chat-Key),
 *    handed out once when it was started.
 */

const jsonBody = express.json({ limit: '10kb' });

const startSchema = z.object({
  text: z.unknown(),
  name: z.string().max(200).optional(),
  email: z.string().max(200).optional(),
  userId: z.string().max(64).optional(),
});

const messageSchema = z.object({ text: z.unknown() });

/** Turns chat-domain errors into HTTP errors. */
function chatHandler(fn: (req: Request, res: Parameters<RequestHandler>[1]) => Promise<void>): RequestHandler {
  return asyncHandler(async (req, res) => {
    try {
      await fn(req, res);
    } catch (err) {
      if (err instanceof ChatError) throw new HttpError(err.status, err.message);
      throw err;
    }
  });
}

/** Whether live chat is switched on for the group this location falls in. */
async function chatIsOn(companyId: Parameters<typeof findScoped>[1], locationId: string, planId?: string) {
  const groupId = await resolveGroupId(companyId, { locationId, planId });
  const cfg = await findScoped(ChatBubbleConfig, companyId, groupId);
  return Boolean(cfg?.enabled && cfg.chatEnabled);
}

function chatKey(req: Request): string | undefined {
  return req.get('x-chat-key') ?? undefined;
}

export const chatRoutes: RouteDef[] = [
  {
    method: 'post',
    url: '/chat/tickets',
    middlewares: [jsonBody],
    handler: chatHandler(async (req, res) => {
      const companyId = await resolveCompanyId(req.query.company_id);
      const { locationId, planId } = locationContext(req);
      if (!locationId || !LOCATION_ID.test(locationId)) throw new HttpError(400, 'A valid locationId is required');
      const token = req.get('x-ghl-token');
      if (!token || token.length > 4000) throw new HttpError(401, 'A GHL session token is required');
      if (!(await chatIsOn(companyId, locationId, planId))) throw new HttpError(403, 'Chat is not enabled');
      if (!(await verifyLocationAccess(token, locationId))) throw new HttpError(403, 'You do not have access to this location');

      const body = startSchema.parse(req.body);
      const created = await createTicket(companyId, locationId, body);
      res.status(201).json(created);
    }),
  },
  {
    method: 'get',
    url: '/chat/tickets/:id',
    handler: chatHandler(async (req, res) => {
      const companyId = await resolveCompanyId(req.query.company_id);
      const ticket = await loadTicket(companyId, req.params.id, chatKey(req));
      const since = Number.parseInt(queryString(req, 'since') ?? '0', 10);
      const messages = await messagesSince(ticket, Number.isFinite(since) && since > 0 ? since : 0);
      res.set('Cache-Control', 'no-store');
      res.json({ ticket: publicTicket(ticket), messages, serverTime: Date.now() });
    }),
  },
  {
    method: 'post',
    url: '/chat/tickets/:id/messages',
    middlewares: [jsonBody],
    handler: chatHandler(async (req, res) => {
      const companyId = await resolveCompanyId(req.query.company_id);
      const ticket = await loadTicket(companyId, req.params.id, chatKey(req));
      if (!(await chatIsOn(companyId, ticket.locationId, queryString(req, 'planId')))) {
        throw new HttpError(403, 'Chat is not enabled');
      }
      const { text } = messageSchema.parse(req.body);
      res.status(201).json({ message: await addVisitorMessage(ticket, text) });
    }),
  },
  {
    method: 'post',
    url: '/chat/tickets/:id/close',
    handler: chatHandler(async (req, res) => {
      const companyId = await resolveCompanyId(req.query.company_id);
      const ticket = await loadTicket(companyId, req.params.id, chatKey(req));
      await closeByVisitor(ticket);
      res.status(204).send();
    }),
  },
];
