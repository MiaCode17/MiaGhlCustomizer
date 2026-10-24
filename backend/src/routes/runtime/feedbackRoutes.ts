import express, { Request, RequestHandler } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler';
import { HttpError } from '../../middleware/errorHandler';
import { FeedbackConfig } from '../../models/Feedback';
import { ChatError, loadTicket } from '../../runtime/chat';
import { FeedbackError, recordFeedback } from '../../runtime/feedback';
import { verifyLocationAccess } from '../../runtime/locationLinks';
import { LOCATION_ID } from '../../runtime/unread';
import { findScoped, resolveGroupId } from '../../utils/scope';
import { RouteDef } from '../routeTable';
import { locationContext, resolveCompanyId } from './common';

/**
 * Where the feedback button, the rating after a chat and the cancellation popup send their answers.
 * Ratings and cancellation reasons need proof of a real GHL session for the location (X-GHL-Token,
 * checked with GHL); a chat rating is authorised by that chat's secret key (X-Chat-Key) instead.
 */

const jsonBody = express.json({ limit: '10kb' });

const bodySchema = z.object({
  kind: z.enum(['rating', 'cancellation', 'chat']),
  rating: z.number().optional(),
  comment: z.string().max(5000).optional(),
  reasons: z.array(z.string().max(200)).max(30).optional(),
  name: z.string().max(200).optional(),
  email: z.string().max(200).optional(),
  userId: z.string().max(64).optional(),
  ticketId: z.string().max(64).optional(),
});

function feedbackHandler(fn: (req: Request, res: Parameters<RequestHandler>[1]) => Promise<void>): RequestHandler {
  return asyncHandler(async (req, res) => {
    try {
      await fn(req, res);
    } catch (err) {
      if (err instanceof FeedbackError || err instanceof ChatError) throw new HttpError(err.status, err.message);
      throw err;
    }
  });
}

export const feedbackRoutes: RouteDef[] = [
  {
    method: 'post',
    url: '/feedback',
    middlewares: [jsonBody],
    handler: feedbackHandler(async (req, res) => {
      const companyId = await resolveCompanyId(req.query.company_id);
      const body = bodySchema.parse(req.body);

      let locationId: string;
      let ticketId = null;
      if (body.kind === 'chat') {
        // A chat's own key is the credential; the location comes from the chat itself.
        const ticket = await loadTicket(companyId, body.ticketId ?? '', req.get('x-chat-key'));
        locationId = ticket.locationId;
        ticketId = ticket._id;
      } else {
        const ctx = locationContext(req);
        if (!ctx.locationId || !LOCATION_ID.test(ctx.locationId)) throw new HttpError(400, 'A valid locationId is required');
        const token = req.get('x-ghl-token');
        if (!token || token.length > 4000) throw new HttpError(401, 'A GHL session token is required');
        if (!(await verifyLocationAccess(token, ctx.locationId))) {
          throw new HttpError(403, 'You do not have access to this location');
        }
        locationId = ctx.locationId;
      }

      const groupId = await resolveGroupId(companyId, { locationId, planId: locationContext(req).planId });
      const config = await findScoped(FeedbackConfig, companyId, groupId);
      if (!config) throw new HttpError(403, 'Feedback is not enabled');

      const saved = await recordFeedback(companyId, locationId, config, { ...body, ticketId });
      res.status(201).json(saved);
    }),
  },
];
