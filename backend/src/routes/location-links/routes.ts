import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { attachCompany } from '../../middleware/company';
import { HttpError } from '../../middleware/errorHandler';
import { LocationLink } from '../../models/LocationLink';
import { buildRouter, RouteDef } from '../routeTable';

/** Admin view of the links sub-account users created, so the agency can review and remove them. */
const routes: RouteDef[] = [
  {
    method: 'get',
    url: '/',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const locationId = typeof req.query.locationId === 'string' ? req.query.locationId.trim() : '';
      const filter = { companyId: req.companyId!, ...(locationId ? { locationId } : {}) };
      const links = await LocationLink.find(filter).sort({ locationId: 1, createdAt: 1 }).limit(500);
      res.json({ links });
    }),
  },
  {
    method: 'delete',
    url: '/:id',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const link = await LocationLink.findOneAndDelete({ _id: req.params.id, companyId: req.companyId! });
      if (!link) throw new HttpError(404, 'Link not found');
      res.status(204).send();
    }),
  },
];

export const locationLinksRouter: Router = buildRouter(routes);
