import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler';
import { attachCompany } from '../../middleware/company';
import { buildRouter, RouteDef } from '../routeTable';
import {
  createLaunchpadTile,
  deleteLaunchpadTile,
  listLaunchpadTiles,
  updateLaunchpadTile,
} from './services';

const tileInputSchema = z
  .object({
    order: z.number().default(0),
    kind: z.enum(['custom', 'native']).default('custom'),
    nativeId: z.string().trim().max(100).default(''),
    description: z.string().trim().max(500).default(''),
    imageUrl: z.string().trim().max(2000).default(''),
    buttonText: z.string().trim().max(60).default(''),
    url: z.string().trim().max(2000).default(''),
    openMode: z.enum(['modal', 'drawer', 'new-tab', 'same-tab']).default('new-tab'),
    hidden: z.boolean().default(false),
  })
  .superRefine((tile, ctx) => {
    if (tile.kind === 'native') {
      if (!tile.nativeId) {
        ctx.addIssue({ code: 'custom', path: ['nativeId'], message: 'Choose which GHL tile this changes' });
      }
      return;
    }
    // A custom tile is a real tile: it needs something to show and somewhere to go.
    if (!tile.description) {
      ctx.addIssue({ code: 'custom', path: ['description'], message: 'A description is required' });
    }
    if (!tile.buttonText) {
      ctx.addIssue({ code: 'custom', path: ['buttonText'], message: 'Button text is required' });
    }
    if (!tile.url) {
      ctx.addIssue({ code: 'custom', path: ['url'], message: 'A URL is required' });
    }
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
      const tiles = await listLaunchpadTiles(req.companyId!, getGroupId(req));
      res.json({ tiles });
    }),
  },
  {
    method: 'post',
    url: '/',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const input = tileInputSchema.parse(req.body);
      const tile = await createLaunchpadTile(req.companyId!, getGroupId(req), input);
      res.status(201).json({ tile });
    }),
  },
  {
    method: 'put',
    url: '/:id',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const input = tileInputSchema.parse(req.body);
      const tile = await updateLaunchpadTile(req.companyId!, req.params.id, input);
      res.json({ tile });
    }),
  },
  {
    method: 'delete',
    url: '/:id',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      await deleteLaunchpadTile(req.companyId!, req.params.id);
      res.status(204).send();
    }),
  },
];

export const launchpadRouter: Router = buildRouter(routes);
