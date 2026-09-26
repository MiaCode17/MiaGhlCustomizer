import { Request, Router } from 'express';
import { Types } from 'mongoose';
import { env } from '../../config/env';
import { asyncHandler } from '../../middleware/asyncHandler';
import { HttpError } from '../../middleware/errorHandler';
import { Company } from '../../models/Company';
import { LoginPageConfig } from '../../models/LoginPageConfig';
import { buildLoginCss } from '../../runtime/css';
import { isRuntimeFeature, resolveAllFeatures, RUNTIME_FEATURES } from '../../runtime/resolve';
import { buildEmbedScript, SCRIPT_FEATURES } from '../../runtime/scripts';
import { findScoped, resolveGroupId } from '../../utils/scope';
import { buildRouter, RouteDef } from '../routeTable';

/**
 * Public, unauthenticated endpoints called from inside the live GHL portal by
 * the embed script. They take only company + location (+ optional plan) and
 * resolve group scoping server-side, so the script never needs to know about
 * groups. Mounted with open CORS in server.ts since GHL runs on each agency's
 * own white-label domain.
 */

const OBJECT_ID = /^[a-f0-9]{24}$/i;
const GHL_ID = /^[A-Za-z0-9]{1,64}$/;

/**
 * Accepts either our internal company _id or the agency's GHL company ID, so the
 * install snippet can use the ID agencies already know from GHL.
 */
async function resolveCompanyId(raw: unknown): Promise<Types.ObjectId> {
  if (typeof raw === 'string' && OBJECT_ID.test(raw)) {
    return new Types.ObjectId(raw);
  }
  if (typeof raw !== 'string' || !GHL_ID.test(raw)) {
    throw new HttpError(400, 'A valid company_id is required');
  }
  const company = await Company.findOne({ ghlCompanyId: raw }).select('_id').lean();
  if (!company) {
    throw new HttpError(404, 'No account is linked to this GHL company ID');
  }
  return company._id;
}

function queryString(req: Request, key: string): string | undefined {
  const raw = req.query[key];
  return typeof raw === 'string' && raw.trim().length > 0 ? raw.trim() : undefined;
}

function locationContext(req: Request) {
  return { locationId: queryString(req, 'locationId'), planId: queryString(req, 'planId') };
}

function apiBase(req: Request): string {
  return env.PUBLIC_BASE_URL ?? `${req.protocol}://${req.get('host')}`;
}

const runtimeRoutes: RouteDef[] = [
  {
    // Every feature's resolved config in one round trip — what the embed script uses.
    method: 'get',
    url: '/config',
    handler: asyncHandler(async (req, res) => {
      const companyId = await resolveCompanyId(req.query.company_id);
      const groupId = await resolveGroupId(companyId, locationContext(req));
      const features = await resolveAllFeatures(companyId, groupId);
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
      const config = await RUNTIME_FEATURES[feature](companyId, groupId);
      res.set('Cache-Control', 'public, max-age=30');
      res.json({ groupId, config });
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
