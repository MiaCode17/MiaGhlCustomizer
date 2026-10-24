import { Types } from 'mongoose';
import {
  FeedbackConfigDoc,
  FeedbackKind,
  FeedbackRatingType,
  FeedbackResponse,
  FeedbackResponseDoc,
} from '../models/Feedback';

/**
 * Recording feedback sent from inside GHL: ratings from the feedback button, ratings of a
 * finished support chat, and the reasons given when cancelling a subscription. The caller has
 * already authorised the request (a verified GHL session for ratings and cancellations, the
 * chat key for chat ratings); this validates the content against the group's configuration.
 */
export const RATING_RANGE: Record<FeedbackRatingType, { min: number; max: number }> = {
  stars: { min: 1, max: 5 },
  ten: { min: 1, max: 10 },
  emoji: { min: 1, max: 5 },
};

const MAX_COMMENT = 2000;
const MAX_REASONS = 10;
const MAX_REASON_LENGTH = 80;
const RESPONSES_PER_LOCATION_PER_HOUR = 30;

export class FeedbackError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export interface FeedbackInput {
  kind: FeedbackKind;
  rating?: unknown;
  comment?: unknown;
  reasons?: unknown;
  name?: unknown;
  email?: unknown;
  userId?: unknown;
  ticketId?: Types.ObjectId | null;
}

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function validRating(value: unknown, type: FeedbackRatingType): number {
  const { min, max } = RATING_RANGE[type];
  if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) {
    throw new FeedbackError(400, `Choose a rating from ${min} to ${max}`);
  }
  return value;
}

export async function recordFeedback(
  companyId: Types.ObjectId,
  locationId: string,
  config: FeedbackConfigDoc,
  input: FeedbackInput,
) {
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const recent = await FeedbackResponse.countDocuments({ companyId, locationId, kind: input.kind, createdAt: { $gte: since } });
  if (recent >= RESPONSES_PER_LOCATION_PER_HOUR) {
    throw new FeedbackError(429, 'Too much feedback was sent from this account recently. Please try again later.');
  }

  const doc: Partial<FeedbackResponseDoc> = {
    companyId,
    locationId,
    kind: input.kind,
    userName: text(input.name, 80),
    userEmail: text(input.email, 200),
    userId: text(input.userId, 64),
    ratingType: null,
    rating: null,
    reasons: [],
    comment: '',
    ticketId: null,
  };

  if (input.kind === 'cancellation') {
    if (!config.cancel.enabled) throw new FeedbackError(403, 'Cancellation feedback is not enabled');
    const reasons = Array.from(
      new Set(
        (Array.isArray(input.reasons) ? input.reasons : [])
          .map((r) => text(r, MAX_REASON_LENGTH))
          .filter(Boolean),
      ),
    ).slice(0, MAX_REASONS);
    const comment = text(input.comment, MAX_COMMENT);
    if (config.cancel.required && reasons.length === 0 && !comment) {
      throw new FeedbackError(400, 'Please tell us why you are cancelling');
    }
    doc.reasons = reasons;
    doc.comment = comment;
  } else if (input.kind === 'chat') {
    if (!config.enabled || !config.askAfterChat) throw new FeedbackError(403, 'Chat ratings are not enabled');
    if (!input.ticketId) throw new FeedbackError(400, 'A chat is required');
    if (await FeedbackResponse.exists({ ticketId: input.ticketId })) {
      throw new FeedbackError(409, 'This chat has already been rated');
    }
    doc.ratingType = config.ratingType;
    doc.rating = validRating(input.rating, config.ratingType);
    doc.comment = text(input.comment, MAX_COMMENT);
    doc.ticketId = input.ticketId;
  } else {
    if (!config.enabled) throw new FeedbackError(403, 'Feedback is not enabled');
    doc.ratingType = config.ratingType;
    doc.rating = validRating(input.rating, config.ratingType);
    if (config.commentMode !== 'off') {
      const comment = text(input.comment, MAX_COMMENT);
      if (config.commentMode === 'required' && !comment) throw new FeedbackError(400, 'Please add a comment');
      doc.comment = comment;
    }
  }

  const saved = await FeedbackResponse.create(doc);
  return { id: String(saved._id) };
}
