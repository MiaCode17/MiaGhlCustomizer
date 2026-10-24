import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler';
import { attachCompany } from '../../middleware/company';
import { buildRouter, RouteDef } from '../routeTable';
import { createHeroBanner, deleteHeroBanner, listHeroBanners, updateHeroBanner } from './services';

const COLOR = z.string().trim().regex(/^#[0-9a-fA-F]{3,8}$/, 'Use a hex color such as #4f46e5');

/** Empty, an uploaded file (relative), or an http(s) address. Never a script or data URL. */
const optionalImageUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((u) => u === '' || /^(https?:\/\/|\/(?!\/))/i.test(u), 'The address must start with http://, https:// or /');

const int = (min: number, max: number) => z.number().int().min(min).max(max);

const slideSchema = z
  .object({
    title: z.string().trim().max(120).default(''),
    subtitle: z.string().trim().max(160).default(''),
    description: z.string().trim().max(600).default(''),
    image: optionalImageUrl.default(''),
    imageAlt: z.string().trim().max(160).default(''),
    imagePosition: z.enum(['left', 'right']).default('right'),
    backgroundImage: optionalImageUrl.default(''),
    ctaText: z.string().trim().max(40).default(''),
    ctaUrl: optionalImageUrl.default(''),
    ctaOpenIn: z.enum(['new', 'same']).default('new'),
    background: z
      .object({
        type: z.enum(['solid', 'gradient']).default('gradient'),
        color: COLOR.default('#667eea'),
        color2: COLOR.default('#764ba2'),
        angle: int(0, 360).default(135),
      })
      .default({ type: 'gradient', color: '#667eea', color2: '#764ba2', angle: 135 }),
    textColor: COLOR.default('#ffffff'),
    icon: z
      .object({
        type: z.enum(['none', 'emoji', 'image']).default('none'),
        value: z.string().trim().max(2000).default(''),
        position: z.enum(['left', 'right', 'top', 'bottom']).default('left'),
      })
      .default({ type: 'none', value: '', position: 'left' }),
  })
  .refine((s) => s.title || s.subtitle || s.description || s.image, { message: 'A panel needs some text or a picture', path: ['title'] })
  .refine((s) => (s.ctaText.length > 0) === (s.ctaUrl.length > 0), { message: 'A button needs both a label and an address', path: ['ctaUrl'] })
  .refine((s) => s.icon.type !== 'emoji' || [...s.icon.value].length <= 8, { message: 'An emoji icon must be a few characters at most', path: ['icon'] })
  .refine((s) => s.icon.type !== 'image' || /^(https?:\/\/|\/(?!\/))/i.test(s.icon.value), { message: 'The icon image address must start with http://, https:// or /', path: ['icon'] });

const inputSchema = z
  .object({
    name: z.string().trim().min(1).max(80),
    enabled: z.boolean().default(true),
    order: int(0, 1000).default(0),
    kind: z.enum(['single', 'slider']).default('single'),
    position: z.enum(['top', 'bottom']).default('top'),
    slides: z.array(slideSchema).min(1, 'Add at least one panel').max(10),
    slider: z
      .object({
        autoSlide: z.boolean().default(true),
        intervalMs: int(1500, 30000).default(5000),
        showControls: z.boolean().default(true),
        controlsPosition: z.enum(['top', 'bottom', 'sides']).default('bottom'),
        pauseOnHover: z.boolean().default(true),
        loop: z.boolean().default(true),
        transition: z.enum(['slide', 'fade']).default('slide'),
        transitionMs: int(100, 2000).default(500),
      })
      .default({}),
    sizeMode: z.enum(['default', 'custom']).default('default'),
    height: int(120, 800).default(280),
    widthPercent: int(30, 100).default(100),
    borderRadius: int(0, 60).default(20),
    marginTop: int(0, 120).default(0),
    marginBottom: int(0, 120).default(24),
    padY: int(0, 160).default(48),
    padX: int(0, 160).default(56),
    mobilePadX: int(0, 100).default(24),
    titleSize: int(14, 72).default(36),
    subtitleSize: int(12, 48).default(20),
    descriptionSize: int(11, 32).default(16),
    animation: z.enum(['fade', 'slide', 'none']).default('fade'),
    closable: z.boolean().default(true),
  })
  // A single banner is one panel; extra panels would be silently hidden.
  .transform((b) => (b.kind === 'single' ? { ...b, slides: b.slides.slice(0, 1) } : b));

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
      res.json({ banners: await listHeroBanners(req.companyId!, getGroupId(req)) });
    }),
  },
  {
    method: 'post',
    url: '/',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const banner = await createHeroBanner(req.companyId!, getGroupId(req), inputSchema.parse(req.body));
      res.status(201).json({ banner });
    }),
  },
  {
    method: 'put',
    url: '/:id',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      res.json({ banner: await updateHeroBanner(req.companyId!, req.params.id, inputSchema.parse(req.body)) });
    }),
  },
  {
    method: 'delete',
    url: '/:id',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      await deleteHeroBanner(req.companyId!, req.params.id);
      res.status(204).send();
    }),
  },
];

export const heroBannersRouter: Router = buildRouter(routes);
