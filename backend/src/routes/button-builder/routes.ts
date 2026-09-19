import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler';
import { attachCompany } from '../../middleware/company';
import { HttpError } from '../../middleware/errorHandler';
import { ButtonSurface } from '../../models/InjectedButton';
import { buildRouter, RouteDef } from '../routeTable';
import { createButton, deleteButton, listButtons, updateButton } from './services';

const BUTTON_SURFACES: ButtonSurface[] = ['header', 'dashboard', 'record-detail', 'record-tab'];

const buttonInputSchema = z.object({
  surface: z.enum(['header', 'dashboard', 'record-detail', 'record-tab']),
  label: z.string().min(1),
  tooltip: z.string().optional(),
  icon: z.string().optional(),
  style: z.enum(['primary', 'default', 'dashed', 'text']).default('default'),
  size: z.enum(['small', 'middle', 'large']).default('middle'),
  targetUrl: z.string().optional(),
  order: z.number().default(0),
});

function getGroupId(req: { query: { groupId?: unknown } }): string | undefined {
  const raw = req.query.groupId;
  return typeof raw === 'string' && raw.length > 0 ? raw : undefined;
}

function getSurface(req: { query: { surface?: unknown } }): ButtonSurface {
  const raw = req.query.surface;
  if (typeof raw !== 'string' || !BUTTON_SURFACES.includes(raw as ButtonSurface)) {
    throw new HttpError(400, 'A valid surface query param is required');
  }
  return raw as ButtonSurface;
}

const routes: RouteDef[] = [
  {
    method: 'get',
    url: '/',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const surface = getSurface(req);
      const buttons = await listButtons(req.companyId!, surface, getGroupId(req));
      res.json({ buttons });
    }),
  },
  {
    method: 'post',
    url: '/',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const input = buttonInputSchema.parse(req.body);
      const groupId = getGroupId(req);
      const button = await createButton(req.companyId!, groupId, input);
      res.status(201).json({ button });
    }),
  },
  {
    method: 'put',
    url: '/:id',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const input = buttonInputSchema.parse(req.body);
      const button = await updateButton(req.companyId!, req.params.id, input);
      res.json({ button });
    }),
  },
  {
    method: 'delete',
    url: '/:id',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      await deleteButton(req.companyId!, req.params.id);
      res.status(204).send();
    }),
  },
];

export const buttonBuilderRouter: Router = buildRouter(routes);
