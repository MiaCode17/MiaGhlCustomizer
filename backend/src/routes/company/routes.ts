import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler';
import { attachCompany } from '../../middleware/company';
import { buildRouter, RouteDef } from '../routeTable';
import { getCompany, updateCompany } from './services';

function serializeCompany(company: { _id: unknown; name: string; plan: string }) {
  return { id: String(company._id), name: company.name, plan: company.plan };
}

const updateCompanySchema = z.object({
  name: z.string().min(1),
  plan: z.enum(['free', 'pro', 'agency']),
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
];

export const companyRouter: Router = buildRouter(routes);
