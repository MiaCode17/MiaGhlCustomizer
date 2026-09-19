import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler';
import { attachCompany } from '../../middleware/company';
import { buildRouter, RouteDef } from '../routeTable';
import { getBookACall, upsertBookACall } from './services';

const bookACallInputSchema = z.object({
  enabled: z.boolean(),
  buttonLabel: z.string(),
  bookingUrl: z.string(),
  backgroundColor: z.string(),
  textColor: z.string(),
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
      const bookACall = await getBookACall(req.companyId!, getGroupId(req));
      res.json({ bookACall });
    }),
  },
  {
    method: 'put',
    url: '/update',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const input = bookACallInputSchema.parse(req.body);
      const groupId = getGroupId(req);
      const bookACall = await upsertBookACall(req.companyId!, groupId, input);
      res.json({ bookACall });
    }),
  },
];

export const bookACallRouter: Router = buildRouter(routes);
