import express, { Request, Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler';
import { HttpError } from '../../middleware/errorHandler';
import { Company } from '../../models/Company';
import { LoginPageConfig } from '../../models/LoginPageConfig';
import { buildLoginCss } from '../../runtime/css';
import { isRuntimeFeature, resolveAllFeatures, RUNTIME_FEATURES } from '../../runtime/resolve';
import { buildEmbedScript, SCRIPT_FEATURES } from '../../runtime/scripts';
import {
  createLocationLink,
  deleteLocationLink,
  getUserLinksConfig,
  LinkLimitError,
  listLocationLinks,
  serializeLink,
  updateLocationLink,
  verifyLocationAccess,
} from '../../runtime/locationLinks';
import { getUnreadCount, LOCATION_ID } from '../../runtime/unread';
import { findScoped, resolveGroupId } from '../../utils/scope';
import { buildRouter, RouteDef } from '../routeTable';
import { chatRoutes } from './chatRoutes';
import { apiBase, locationContext, resolveCompanyId } from './common';

/**
 * Public, unauthenticated endpoints called from inside the live GHL portal by
 * the embed script. They take only company + location (+ optional plan) and
 * resolve group scoping server-side, so the script never needs to know about
 * groups. Mounted with open CORS in server.ts since GHL runs on each agency's
 * own white-label domain.
 */

const OBJECT_ID_ONLY = /^[a-f0-9]{24}$/i;

const locationLinkBodySchema = z.object({
  title: z.string().trim().min(1).max(60),
  url: z
    .string()
    .trim()
    .max(2000)
    .refine((u) => /^https?:\/\//i.test(u), 'The URL must start with http:// or https://'),
  icon: z.string().trim().max(300).optional(),
  openMode: z.enum(['new-tab', 'modal', 'drawer', 'same-tab']).default('new-tab'),
});

/**
 * Resolves a signed-in sub-account user's write request: the feature must be on for the
 * location's group, and the user's GHL session (X-GHL-Token) must be able to read the location.
 */
async function authoriseLinkWrite(req: Request) {
  const companyId = await resolveCompanyId(req.query.company_id);
  const { locationId, planId } = locationContext(req);
  if (!locationId || !LOCATION_ID.test(locationId)) {
    throw new HttpError(400, 'A valid locationId is required');
  }
  const token = req.get('x-ghl-token');
  if (!token || token.length > 4000) {
    throw new HttpError(401, 'A GHL session token is required');
  }
  const groupId = await resolveGroupId(companyId, { locationId, planId });
  const config = await getUserLinksConfig(companyId, groupId);
  if (!config.enabled) throw new HttpError(403, 'Location links are not enabled');
  if (!(await verifyLocationAccess(token, locationId))) {
    throw new HttpError(403, 'You do not have access to this location');
  }
  return { companyId, locationId, config };
}

const jsonBody = express.json({ limit: '10kb' });

const runtimeRoutes: RouteDef[] = [
  ...chatRoutes,
  {
    // The links users of a location created for themselves (public, like the rest of the runtime).
    method: 'get',
    url: '/location-links',
    handler: asyncHandler(async (req, res) => {
      const companyId = await resolveCompanyId(req.query.company_id);
      const { locationId, planId } = locationContext(req);
      if (!locationId || !LOCATION_ID.test(locationId)) {
        throw new HttpError(400, 'A valid locationId is required');
      }
      const groupId = await resolveGroupId(companyId, { locationId, planId });
      const config = await getUserLinksConfig(companyId, groupId);
      if (!config.enabled) {
        res.json({ enabled: false, maxLinks: config.maxLinks, links: [] });
        return;
      }
      const links = await listLocationLinks(companyId, locationId);
      res.set('Cache-Control', 'no-store');
      res.json({ enabled: true, maxLinks: config.maxLinks, links: links.map(serializeLink) });
    }),
  },
  {
    method: 'post',
    url: '/location-links',
    middlewares: [jsonBody],
    handler: asyncHandler(async (req, res) => {
      const { companyId, locationId, config } = await authoriseLinkWrite(req);
      const input = locationLinkBodySchema.parse(req.body);
      try {
        const link = await createLocationLink(companyId, locationId, config.maxLinks, input);
        res.status(201).json({ link: serializeLink(link) });
      } catch (err) {
        if (err instanceof LinkLimitError) throw new HttpError(409, err.message);
        throw err;
      }
    }),
  },
  {
    method: 'put',
    url: '/location-links/:id',
    middlewares: [jsonBody],
    handler: asyncHandler(async (req, res) => {
      if (!OBJECT_ID_ONLY.test(req.params.id)) throw new HttpError(400, 'Invalid link id');
      const { companyId, locationId } = await authoriseLinkWrite(req);
      const input = locationLinkBodySchema.parse(req.body);
      const link = await updateLocationLink(companyId, locationId, req.params.id, input);
      if (!link) throw new HttpError(404, 'Link not found');
      res.json({ link: serializeLink(link) });
    }),
  },
  {
    method: 'delete',
    url: '/location-links/:id',
    handler: asyncHandler(async (req, res) => {
      if (!OBJECT_ID_ONLY.test(req.params.id)) throw new HttpError(400, 'Invalid link id');
      const { companyId, locationId } = await authoriseLinkWrite(req);
      const link = await deleteLocationLink(companyId, locationId, req.params.id);
      if (!link) throw new HttpError(404, 'Link not found');
      res.status(204).send();
    }),
  },
  {
    // Every feature's resolved config in one round trip — what the embed script uses.
    method: 'get',
    url: '/config',
    handler: asyncHandler(async (req, res) => {
      const companyId = await resolveCompanyId(req.query.company_id);
      const groupId = await resolveGroupId(companyId, locationContext(req));
      const features = await resolveAllFeatures(companyId, groupId, { locationId: locationContext(req).locationId });
      res.set('Cache-Control', 'public, max-age=30');
      res.json({ groupId, features });
    }),
  },
  {
    method: 'get',
    url: '/config/:feature',
    handler: asyncHandler(async (req, res) => {
      const { feature } = req.params;
      if (!isRuntimeFeature(feature)) {
        throw new HttpError(404, `Unknown feature "${feature}"`);
      }
      const companyId = await resolveCompanyId(req.query.company_id);
      const groupId = await resolveGroupId(companyId, locationContext(req));
      const config = await RUNTIME_FEATURES[feature](companyId, groupId, {
        locationId: locationContext(req).locationId,
      });
      res.set('Cache-Control', 'public, max-age=30');
      res.json({ groupId, config });
    }),
  },
  {
    // Total unread conversations for a location, polled by the unread-badge script.
    // Cached server-side, so many tabs/sub-accounts cost one upstream call per minute each.
    method: 'get',
    url: '/unread-count',
    handler: asyncHandler(async (req, res) => {
      const companyId = await resolveCompanyId(req.query.company_id);
      const { locationId, planId } = locationContext(req);
      if (!locationId || !LOCATION_ID.test(locationId)) {
        throw new HttpError(400, 'A valid locationId is required');
      }
      const groupId = await resolveGroupId(companyId, { locationId, planId });
      const result = await getUnreadCount(companyId, groupId, locationId);
      res.set('Cache-Control', 'public, max-age=30');
      res.json(result);
    }),
  },
  {
    // GHL's login page loads this as a stylesheet (the `login` script adds the <link>).
    method: 'get',
    url: '/login-css/:companyId',
    handler: asyncHandler(async (req, res) => {
      const companyId = await resolveCompanyId(req.params.companyId);
      const groupId = await resolveGroupId(companyId, locationContext(req));
      const config = await findScoped(LoginPageConfig, companyId, groupId);
      res.type('text/css');
      res.set('Cache-Control', 'public, max-age=60');
      res.send(config ? buildLoginCss(config) : '/* no login page customization */');
    }),
  },
];

const cdnRoutes: RouteDef[] = [
  {
    // /cdn/<companyId>/customizer.js → every feature; /cdn/<companyId>/<feature>.js → one.
    method: 'get',
    url: '/:companyId/:script',
    handler: asyncHandler(async (req, res) => {
      const { script } = req.params;
      const name = script.endsWith('.js') ? script.slice(0, -3) : '';
      const features =
        name === 'customizer' ? SCRIPT_FEATURES : SCRIPT_FEATURES.includes(name) ? [name] : null;
      if (!features) {
        throw new HttpError(404, `Unknown script "${script}"`);
      }

      const companyId = await resolveCompanyId(req.params.companyId);
      if (!(await Company.exists({ _id: companyId }))) {
        throw new HttpError(404, 'Company not found');
      }

      res.type('application/javascript');
      res.set('Cache-Control', 'public, max-age=300');
      res.send(buildEmbedScript({ companyId: String(companyId), apiBase: apiBase(req), features }));
    }),
  },
];

export const runtimeRouter: Router = buildRouter(runtimeRoutes);
export const cdnRouter: Router = buildRouter(cdnRoutes);
