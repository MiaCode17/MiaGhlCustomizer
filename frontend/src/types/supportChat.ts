export type SupportTicketStatus = 'open' | 'closed';
export type SupportSender = 'visitor' | 'agent' | 'system';

/** One chat started from the chat bubble inside a GHL location, as the agency's inbox sees it. */
export interface SupportTicket {
  id: string;
  locationId: string;
  status: SupportTicketStatus;
  visitorName: string;
  visitorEmail: string;
  subject: string;
  lastMessageAt: string;
  lastMessageFrom: SupportSender;
  lastMessagePreview: string;
  messageCount: number;
  /** Visitor messages not opened yet. */
  unreadForAgent: number;
  closedAt: string | null;
  closedBy: 'visitor' | 'agent' | null;
  createdAt: string;
}

export interface SupportMessage {
  id: string;
  sender: SupportSender;
  text: string;
  authorName: string;
  /** Epoch milliseconds. */
  at: number;
}

export interface SupportTicketList {
  tickets: SupportTicket[];
  total: number;
  page: number;
  limit: number;
}
