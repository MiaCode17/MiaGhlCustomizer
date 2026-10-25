import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler';
import { attachCompany } from '../../middleware/company';
import { buildRouter, RouteDef } from '../routeTable';
import { clearUnreadCache } from '../../runtime/unread';
import { getCompany, setGhlApiToken, updateCompany } from './services';

function serializeCompany(company: {
  _id: unknown;
  name: string;
  ghlCompanyId?: string;
  hasGhlApiToken?: boolean;
}) {
  return {
    id: String(company._id),
    name: company.name,
    ghlCompanyId: company.ghlCompanyId ?? '',
    // The token itself is write-only: only whether one is stored is ever reported.
    hasGhlApiToken: company.hasGhlApiToken ?? false,
  };
}

const ghlTokenSchema = z.object({
  token: z.string().trim().max(2000),
});

const updateCompanySchema = z.object({
  name: z.string().min(1).optional(),
  ghlCompanyId: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9]*$/, 'A GHL company ID only contains letters and numbers')
    .max(64)
    .optional(),
});

const routes: RouteDef[] = [
  {
    method: 'get',
    url: '/',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const company = await getCompany(req.companyId!);
      res.json({ company: serializeCompany(company) });
    }),
  },
  {
    method: 'put',
    url: '/update',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const input = updateCompanySchema.parse(req.body);
      const company = await updateCompany(req.companyId!, input);
      res.json({ company: serializeCompany(company) });
    }),
  },
  {
    // Write-only: saves a GHL Private Integration token (empty string removes it).
    method: 'put',
    url: '/ghl-token',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const { token } = ghlTokenSchema.parse(req.body);
      const company = await setGhlApiToken(req.companyId!, token);
      clearUnreadCache(req.companyId!);
      res.json({ company: serializeCompany(company) });
    }),
  },
];

export const companyRouter: Router = buildRouter(routes);
