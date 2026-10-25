import { FilterQuery, Types } from 'mongoose';
import { HttpError } from '../../middleware/errorHandler';
import {
  FeedbackConfig,
  FeedbackConfigDoc,
  FeedbackKind,
  FeedbackResponse,
  FeedbackResponseDoc,
} from '../../models/Feedback';
import { findScoped } from '../../utils/scope';

export type FeedbackConfigInput = Omit<FeedbackConfigDoc, '_id' | 'companyId' | 'groupId' | 'createdAt' | 'updatedAt'>;

export async function getFeedbackConfig(companyId: Types.ObjectId, groupId?: string) {
  return findScoped(FeedbackConfig, companyId, groupId);
}

export async function upsertFeedbackConfig(
  companyId: Types.ObjectId,
  groupId: string | undefined,
  input: FeedbackConfigInput,
) {
  const filter = { companyId, groupId: groupId ?? '' };
  return FeedbackConfig.findOneAndUpdate(
    filter,
    { $set: { ...input, companyId, groupId: groupId ?? '' } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}

export interface ResponseQuery {
  kind?: FeedbackKind | 'all';
  minRating?: number;
  maxRating?: number;
  search?: string;
  from?: Date;
  to?: Date;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Ratings differ in scale; 1-10 is folded onto 1-5 so they can be filtered and averaged together. */
const STAR_EQUIVALENT = {
  $cond: [{ $eq: ['$ratingType', 'ten'] }, { $divide: ['$rating', 2] }, '$rating'],
};

function buildFilter(companyId: Types.ObjectId, q: ResponseQuery): FilterQuery<FeedbackResponseDoc> {
  const filter: FilterQuery<FeedbackResponseDoc> = { companyId };
  if (q.kind && q.kind !== 'all') filter.kind = q.kind;
  if (q.from || q.to) {
    filter.createdAt = { ...(q.from ? { $gte: q.from } : {}), ...(q.to ? { $lte: q.to } : {}) };
  }
  if (q.search) {
    const rx = new RegExp(escapeRegex(q.search), 'i');
    filter.$or = [{ comment: rx }, { userName: rx }, { userEmail: rx }, { locationId: rx }, { reasons: rx }];
  }
  if (q.minRating !== undefined || q.maxRating !== undefined) {
    // Compare on the 5-point equivalent, so "4 and up" means the same for stars and a 1-10 scale.
    const exprs: unknown[] = [{ $ne: ['$rating', null] }];
    if (q.minRating !== undefined) exprs.push({ $gte: [STAR_EQUIVALENT, q.minRating] });
    if (q.maxRating !== undefined) exprs.push({ $lte: [STAR_EQUIVALENT, q.maxRating] });
    filter.$expr = { $and: exprs } as never;
  }
  return filter;
}

export function serializeResponse(r: FeedbackResponseDoc) {
  return {
    id: String(r._id),
    kind: r.kind,
    ratingType: r.ratingType,
    rating: r.rating,
    comment: r.comment,
    reasons: r.reasons,
    userName: r.userName,
    userEmail: r.userEmail,
    locationId: r.locationId,
    ticketId: r.ticketId ? String(r.ticketId) : null,
    createdAt: r.createdAt,
  };
}

export async function listResponses(companyId: Types.ObjectId, q: ResponseQuery, page: number, limit: number) {
  const filter = buildFilter(companyId, q);
  const [rows, total] = await Promise.all([
    FeedbackResponse.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    FeedbackResponse.countDocuments(filter),
  ]);
  return { responses: rows.map(serializeResponse), total, page, limit };
}

export async function deleteResponse(companyId: Types.ObjectId, id: string) {
  if (!Types.ObjectId.isValid(id)) throw new HttpError(404, 'Response not found');
  const result = await FeedbackResponse.deleteOne({ _id: id, companyId });
  if (result.deletedCount === 0) throw new HttpError(404, 'Response not found');
}

export interface FeedbackStats {
  total: number;
  /** Ratings (button + chat) on a common 1-5 scale. */
  rating: { count: number; average: number | null; distribution: number[] };
  chat: { count: number; average: number | null };
  cancellation: { count: number; reasons: { reason: string; count: number }[] };
  /** Responses per day, oldest first, for the last 30 days. */
  byDay: { date: string; count: number }[];
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export async function feedbackStats(companyId: Types.ObjectId): Promise<FeedbackStats> {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [ratings, averageAgg, chatAgg, cancelCount, reasonAgg, dayAgg, total] = await Promise.all([
    FeedbackResponse.aggregate<{ _id: number; count: number }>([
      { $match: { companyId, kind: { $in: ['rating', 'chat'] }, rating: { $ne: null } } },
      { $group: { _id: { $min: [5, { $max: [1, { $ceil: STAR_EQUIVALENT }] }] }, count: { $sum: 1 } } },
    ]),
    // The average is taken from the exact 5-point equivalents, not from the rounded buckets above.
    FeedbackResponse.aggregate<{ avg: number }>([
      { $match: { companyId, kind: { $in: ['rating', 'chat'] }, rating: { $ne: null } } },
      { $group: { _id: null, avg: { $avg: STAR_EQUIVALENT } } },
    ]),
    FeedbackResponse.aggregate<{ avg: number; count: number }>([
      { $match: { companyId, kind: 'chat', rating: { $ne: null } } },
      { $group: { _id: null, avg: { $avg: STAR_EQUIVALENT }, count: { $sum: 1 } } },
    ]),
    FeedbackResponse.countDocuments({ companyId, kind: 'cancellation' }),
    FeedbackResponse.aggregate<{ _id: string; count: number }>([
      { $match: { companyId, kind: 'cancellation' } },
      { $unwind: '$reasons' },
      { $group: { _id: '$reasons', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 20 },
    ]),
    FeedbackResponse.aggregate<{ _id: string; count: number }>([
      { $match: { companyId, createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    ]),
    FeedbackResponse.countDocuments({ companyId }),
  ]);

  const distribution = [0, 0, 0, 0, 0];
  let ratingCount = 0;
  ratings.forEach((row) => {
    distribution[row._id - 1] += row.count;
    ratingCount += row.count;
  });
  const average = ratingCount && averageAgg[0] ? round1(averageAgg[0].avg) : null;

  const days = new Map(dayAgg.map((d) => [d._id, d.count]));
  const byDay: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    byDay.push({ date, count: days.get(date) ?? 0 });
  }

  return {
    total,
    rating: { count: ratingCount, average, distribution },
    chat: { count: chatAgg[0]?.count ?? 0, average: chatAgg[0] ? round1(chatAgg[0].avg) : null },
    cancellation: { count: cancelCount, reasons: reasonAgg.map((r) => ({ reason: r._id, count: r.count })) },
    byDay,
  };
}

/** A spreadsheet cell that cannot be run as a formula when opened in Excel or Sheets. */
function cell(value: unknown): string {
  let s = value == null ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function exportCsv(companyId: Types.ObjectId, q: ResponseQuery): Promise<string> {
  const rows = await FeedbackResponse.find(buildFilter(companyId, q)).sort({ createdAt: -1 }).limit(10000);
  const header = ['Date', 'Type', 'Rating', 'Scale', 'Comment', 'Reasons', 'Name', 'Email', 'Location', 'Chat'];
  const lines = rows.map((r) =>
    [
      r.createdAt.toISOString(),
      r.kind,
      r.rating,
      r.ratingType ?? '',
      r.comment,
      r.reasons.join('; '),
      r.userName,
      r.userEmail,
      r.locationId,
      r.ticketId ? String(r.ticketId) : '',
    ]
      .map(cell)
      .join(','),
  );
  return [header.map(cell).join(','), ...lines].join('\r\n');
}
