import crypto from 'crypto';
import { Types } from 'mongoose';
import {
  SupportMessage,
  SupportMessageDoc,
  SupportSender,
  SupportTicket,
  SupportTicketDoc,
} from '../models/SupportTicket';

/**
 * The visitor side of the support chat: everything the chat bubble in GHL can do with a ticket.
 * A ticket is opened by someone whose GHL session was verified (done by the route); from then on
 * the browser holds the ticket's secret key, and the key alone authorises reading and writing it.
 */
export const MAX_TEXT = 2000;
const MAX_MESSAGES_PER_TICKET = 500;
const MIN_GAP_MS = 700;
const TICKETS_PER_LOCATION_PER_HOUR = 20;
const TYPING_WINDOW_MS = 6000;
const MAX_NAME = 80;

export class ChatError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function generateAccessKey(): string {
  return crypto.randomBytes(24).toString('hex');
}

export function hashAccessKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

function keyMatches(storedHash: string, key: string): boolean {
  const a = Buffer.from(storedHash, 'hex');
  const b = Buffer.from(hashAccessKey(key), 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function cleanText(raw: unknown): string {
  const text = typeof raw === 'string' ? raw.trim() : '';
  if (!text) throw new ChatError(400, 'A message is required');
  if (text.length > MAX_TEXT) throw new ChatError(400, `Messages can be up to ${MAX_TEXT} characters`);
  return text;
}

function preview(text: string): string {
  return text.length > 140 ? `${text.slice(0, 137)}…` : text;
}

export function publicMessage(m: Pick<SupportMessageDoc, '_id' | 'sender' | 'text' | 'authorName' | 'createdAt'>) {
  return {
    id: String(m._id),
    sender: m.sender,
    text: m.text,
    authorName: m.authorName,
    at: m.createdAt.getTime(),
  };
}

export function publicTicket(t: SupportTicketDoc) {
  return {
    id: String(t._id),
    status: t.status,
    agentTyping: Boolean(t.agentTypingUntil && t.agentTypingUntil.getTime() > Date.now()),
    closedBy: t.closedBy,
  };
}

async function addMessage(
  ticket: SupportTicketDoc,
  sender: SupportSender,
  text: string,
  authorName: string,
): Promise<SupportMessageDoc> {
  const message = await SupportMessage.create({
    ticketId: ticket._id,
    companyId: ticket.companyId,
    sender,
    text,
    authorName,
  });
  const update: Record<string, unknown> = {
    $set: {
      lastMessageAt: message.createdAt,
      lastMessageFrom: sender,
      lastMessagePreview: preview(text),
    },
    $inc: { messageCount: 1 },
  };
  if (sender === 'visitor') (update.$inc as Record<string, number>).unreadForAgent = 1;
  if (sender === 'agent') (update.$set as Record<string, unknown>).agentTypingUntil = null;
  await SupportTicket.updateOne({ _id: ticket._id }, update);
  return message;
}

/** Opens a ticket with the visitor's first message. */
export async function createTicket(
  companyId: Types.ObjectId,
  locationId: string,
  input: { text?: unknown; name?: unknown; email?: unknown; userId?: unknown },
) {
  const text = cleanText(input.text);
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const recent = await SupportTicket.countDocuments({ companyId, locationId, createdAt: { $gte: since } });
  if (recent >= TICKETS_PER_LOCATION_PER_HOUR) {
    throw new ChatError(429, 'Too many chats were started from this account recently. Please try again later.');
  }

  const key = generateAccessKey();
  const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  const ticket = await SupportTicket.create({
    companyId,
    locationId,
    accessKeyHash: hashAccessKey(key),
    visitorName: str(input.name, MAX_NAME),
    visitorEmail: str(input.email, 200),
    visitorUserId: str(input.userId, 64),
    subject: preview(text),
  });
  const message = await addMessage(ticket, 'visitor', text, str(input.name, MAX_NAME));
  return { ticketId: String(ticket._id), key, message: publicMessage(message) };
}

/** Finds a ticket the key opens. Wrong id, wrong key and wrong company all look the same. */
export async function loadTicket(companyId: Types.ObjectId, id: string, key: unknown): Promise<SupportTicketDoc> {
  const notFound = new ChatError(404, 'Chat not found');
  if (!Types.ObjectId.isValid(id) || typeof key !== 'string' || key.length < 16 || key.length > 200) throw notFound;
  const ticket = await SupportTicket.findOne({ _id: id, companyId }).select('+accessKeyHash');
  if (!ticket || !keyMatches(ticket.accessKeyHash, key)) throw notFound;
  return ticket;
}

/** Messages newer than `sinceMs` (all of them, capped, when it is 0). */
export async function messagesSince(ticket: SupportTicketDoc, sinceMs: number) {
  const filter = sinceMs > 0 ? { ticketId: ticket._id, createdAt: { $gt: new Date(sinceMs) } } : { ticketId: ticket._id };
  const found = await SupportMessage.find(filter).sort({ createdAt: 1 }).limit(MAX_MESSAGES_PER_TICKET);
  return found.map(publicMessage);
}

export async function addVisitorMessage(ticket: SupportTicketDoc, rawText: unknown) {
  if (ticket.status !== 'open') throw new ChatError(409, 'This chat has ended');
  const text = cleanText(rawText);
  if (ticket.messageCount >= MAX_MESSAGES_PER_TICKET) {
    throw new ChatError(409, 'This chat has reached its message limit. Please start a new one.');
  }
  if (ticket.lastMessageFrom === 'visitor' && Date.now() - ticket.lastMessageAt.getTime() < MIN_GAP_MS) {
    throw new ChatError(429, 'You are sending messages too quickly');
  }
  return publicMessage(await addMessage(ticket, 'visitor', text, ticket.visitorName));
}

async function close(ticket: SupportTicketDoc, by: 'visitor' | 'agent') {
  if (ticket.status === 'closed') return;
  await SupportTicket.updateOne(
    { _id: ticket._id },
    { $set: { status: 'closed', closedAt: new Date(), closedBy: by, agentTypingUntil: null } },
  );
  await addMessage(ticket, 'system', by === 'visitor' ? 'The customer ended the chat.' : 'The chat was closed by our team.', '');
}

export async function closeByVisitor(ticket: SupportTicketDoc) {
  await close(ticket, 'visitor');
}

/* ----------------------------------------------------------------- agency side */

export const agent = {
  async reply(ticket: SupportTicketDoc, rawText: unknown, authorName: string) {
    const text = cleanText(rawText);
    if (ticket.status !== 'open') throw new ChatError(409, 'Reopen the chat to reply');
    return publicMessage(await addMessage(ticket, 'agent', text, authorName.trim().slice(0, 40) || 'Support'));
  },
  async close(ticket: SupportTicketDoc) {
    await close(ticket, 'agent');
  },
  async reopen(ticket: SupportTicketDoc) {
    if (ticket.status === 'open') return;
    await SupportTicket.updateOne(
      { _id: ticket._id },
      { $set: { status: 'open', closedAt: null, closedBy: null } },
    );
    await addMessage(ticket, 'system', 'The chat was reopened by our team.', '');
  },
  async typing(ticket: SupportTicketDoc) {
    await SupportTicket.updateOne({ _id: ticket._id }, { $set: { agentTypingUntil: new Date(Date.now() + TYPING_WINDOW_MS) } });
  },
};
