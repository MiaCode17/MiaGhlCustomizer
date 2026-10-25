import { Router } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler';
import { attachCompany } from '../../middleware/company';
import { HttpError } from '../../middleware/errorHandler';
import { SupportMessage, SupportTicket, SupportTicketDoc } from '../../models/SupportTicket';
import { agent, ChatError, publicMessage } from '../../runtime/chat';
import { buildRouter, RouteDef } from '../routeTable';

/** The agency's inbox for chats started from the chat bubble. */

function adminTicket(t: SupportTicketDoc) {
  return {
    id: String(t._id),
    locationId: t.locationId,
    status: t.status,
    visitorName: t.visitorName,
    visitorEmail: t.visitorEmail,
    subject: t.subject,
    lastMessageAt: t.lastMessageAt,
    lastMessageFrom: t.lastMessageFrom,
    lastMessagePreview: t.lastMessagePreview,
    messageCount: t.messageCount,
    unreadForAgent: t.unreadForAgent,
    closedAt: t.closedAt,
    closedBy: t.closedBy,
    createdAt: t.createdAt,
  };
}

async function findTicket(companyId: Types.ObjectId, id: string): Promise<SupportTicketDoc> {
  if (!Types.ObjectId.isValid(id)) throw new HttpError(404, 'Chat not found');
  const ticket = await SupportTicket.findOne({ _id: id, companyId });
  if (!ticket) throw new HttpError(404, 'Chat not found');
  return ticket;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const listQuerySchema = z.object({
  status: z.enum(['open', 'closed', 'all']).default('open'),
  search: z.string().trim().max(100).default(''),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

const replySchema = z.object({
  text: z.unknown(),
  authorName: z.string().trim().max(40).optional(),
});

const routes: RouteDef[] = [
  {
    method: 'get',
    url: '/tickets',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const { status, search, page, limit } = listQuerySchema.parse(req.query);
      const companyId = req.companyId!;
      const filter: Record<string, unknown> = { companyId };
      if (status !== 'all') filter.status = status;
      if (search) {
        const rx = new RegExp(escapeRegex(search), 'i');
        filter.$or = [{ visitorName: rx }, { visitorEmail: rx }, { subject: rx }, { locationId: rx }];
      }
      const [tickets, total] = await Promise.all([
        SupportTicket.find(filter)
          .sort({ lastMessageAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit),
        SupportTicket.countDocuments(filter),
      ]);
      res.json({ tickets: tickets.map(adminTicket), total, page, limit });
    }),
  },
  {
    // Total unanswered visitor messages across open chats, for a nav badge.
    method: 'get',
    url: '/unread',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const [row] = await SupportTicket.aggregate<{ count: number }>([
        { $match: { companyId: req.companyId!, status: 'open', unreadForAgent: { $gt: 0 } } },
        { $group: { _id: null, count: { $sum: 1 } } },
      ]);
      res.json({ count: row?.count ?? 0 });
    }),
  },
  {
    // Opening a chat marks it read.
    method: 'get',
    url: '/tickets/:id',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const ticket = await findTicket(req.companyId!, req.params.id);
      if (ticket.unreadForAgent > 0) {
        await SupportTicket.updateOne({ _id: ticket._id }, { $set: { unreadForAgent: 0 } });
        ticket.unreadForAgent = 0;
      }
      const messages = await SupportMessage.find({ ticketId: ticket._id }).sort({ createdAt: 1 }).limit(1000);
      res.json({ ticket: adminTicket(ticket), messages: messages.map(publicMessage) });
    }),
  },
  {
    method: 'post',
    url: '/tickets/:id/messages',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const ticket = await findTicket(req.companyId!, req.params.id);
      const { text, authorName } = replySchema.parse(req.body);
      try {
        res.status(201).json({ message: await agent.reply(ticket, text, authorName ?? '') });
      } catch (err) {
        if (err instanceof ChatError) throw new HttpError(err.status, err.message);
        throw err;
      }
    }),
  },
  {
    method: 'post',
    url: '/tickets/:id/typing',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      await agent.typing(await findTicket(req.companyId!, req.params.id));
      res.status(204).send();
    }),
  },
  {
    method: 'post',
    url: '/tickets/:id/close',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      await agent.close(await findTicket(req.companyId!, req.params.id));
      res.status(204).send();
    }),
  },
  {
    method: 'post',
    url: '/tickets/:id/reopen',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      await agent.reopen(await findTicket(req.companyId!, req.params.id));
      res.status(204).send();
    }),
  },
  {
    method: 'delete',
    url: '/tickets/:id',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const ticket = await findTicket(req.companyId!, req.params.id);
      await SupportMessage.deleteMany({ ticketId: ticket._id });
      await SupportTicket.deleteOne({ _id: ticket._id });
      res.status(204).send();
    }),
  },
];

export const supportChatRouter: Router = buildRouter(routes);
