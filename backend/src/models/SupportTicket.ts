import { Schema, model, Types } from 'mongoose';

export type SupportTicketStatus = 'open' | 'closed';
export type SupportSender = 'visitor' | 'agent' | 'system';

/**
 * One chat conversation started from the chat bubble inside a GHL location. The visitor's browser
 * holds a secret key (only its hash is stored) that lets it read and write this ticket and nothing
 * else; the agency reads and answers tickets from the admin dashboard.
 */
export interface SupportTicketDoc {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  locationId: string;
  accessKeyHash: string;
  status: SupportTicketStatus;
  visitorName: string;
  visitorEmail: string;
  /** The GHL user id the browser reported. Informational only: it is not verified. */
  visitorUserId: string;
  subject: string;
  lastMessageAt: Date;
  lastMessageFrom: SupportSender;
  lastMessagePreview: string;
  messageCount: number;
  /** Visitor messages the agency has not opened yet. */
  unreadForAgent: number;
  /** While in the future, the visitor sees a typing indicator. */
  agentTypingUntil: Date | null;
  closedAt: Date | null;
  closedBy: 'visitor' | 'agent' | null;
  createdAt: Date;
  updatedAt: Date;
}

const supportTicketSchema = new Schema<SupportTicketDoc>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    locationId: { type: String, required: true },
    accessKeyHash: { type: String, required: true, select: false },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    visitorName: { type: String, default: '' },
    visitorEmail: { type: String, default: '' },
    visitorUserId: { type: String, default: '' },
    subject: { type: String, default: '' },
    lastMessageAt: { type: Date, default: () => new Date() },
    lastMessageFrom: { type: String, enum: ['visitor', 'agent', 'system'], default: 'visitor' },
    lastMessagePreview: { type: String, default: '' },
    messageCount: { type: Number, default: 0 },
    unreadForAgent: { type: Number, default: 0 },
    agentTypingUntil: { type: Date, default: null },
    closedAt: { type: Date, default: null },
    closedBy: { type: String, enum: ['visitor', 'agent', null], default: null },
  },
  { timestamps: true },
);

supportTicketSchema.index({ companyId: 1, status: 1, lastMessageAt: -1 });
supportTicketSchema.index({ companyId: 1, locationId: 1, createdAt: -1 });

export const SupportTicket = model<SupportTicketDoc>('SupportTicket', supportTicketSchema);

export interface SupportMessageDoc {
  _id: Types.ObjectId;
  ticketId: Types.ObjectId;
  companyId: Types.ObjectId;
  sender: SupportSender;
  text: string;
  /** Who a reply is from, shown to the visitor. */
  authorName: string;
  createdAt: Date;
}

const supportMessageSchema = new Schema<SupportMessageDoc>(
  {
    ticketId: { type: Schema.Types.ObjectId, ref: 'SupportTicket', required: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    sender: { type: String, enum: ['visitor', 'agent', 'system'], required: true },
    text: { type: String, required: true },
    authorName: { type: String, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

supportMessageSchema.index({ ticketId: 1, createdAt: 1 });

export const SupportMessage = model<SupportMessageDoc>('SupportMessage', supportMessageSchema);
