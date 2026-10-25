import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler';
import { attachCompany } from '../../middleware/company';
import {
  BORDER_RADIUS_STYLES,
  DESIGN_STYLES,
  INTERFACE_COLOR_DEFAULTS,
  INTERFACE_COLOR_KEYS,
  SIDEBAR_EFFECT_DEFAULTS,
  SIDEBAR_EFFECT_STYLES,
  TEXTURE_DEFAULTS,
} from '../../models/premiumThemeShape';
import { buildRouter, RouteDef } from '../routeTable';
import { getPremiumTheme, upsertPremiumTheme } from './services';

/** Hex, rgb()/rgba(), hsl()/hsla() or "transparent": nothing that could close a CSS declaration. */
const COLOR = z
  .string()
  .trim()
  .max(80)
  .regex(
    /^(#[0-9a-fA-F]{3,8}|transparent|rgba?\(\s*[\d.\s,%/]+\)|hsla?\(\s*[\d.\s,%/deg]+\))$/,
    'Use a color such as #6366f1 or rgba(99, 102, 241, 0.5)',
  );

const number = z.number().finite().min(-500).max(1000);

const textureSchema = z
  .object(
    Object.fromEntries(
      Object.entries(TEXTURE_DEFAULTS).map(([style, settings]) => [
        style,
        z.object(Object.fromEntries(Object.keys(settings).map((k) => [k, number.optional()]))).strict().optional(),
      ]),
    ),
  )
  .strict();

const sidebarEffectSchema = z
  .object({
    style: z.enum(SIDEBAR_EFFECT_STYLES).optional(),
    textColor: COLOR.optional(),
    activeTextColor: COLOR.optional(),
    threeDBox: z.object({ depth: number.optional(), outlineWeight: number.optional() }).strict().optional(),
    glass: z.object({ blurAmount: number.optional(), opacity: number.optional() }).strict().optional(),
    bordered: z.object({ borderWeight: number.optional(), cornerRadius: number.optional() }).strict().optional(),
    neumorphic: z.object({ shadowDistance: number.optional(), shadowBlur: number.optional() }).strict().optional(),
    clay: z.object({ innerShadowDepth: number.optional(), outerShadowDepth: number.optional() }).strict().optional(),
  })
  .strict();

const themeSchema = z.object({
  name: z.string().trim().min(1).max(60),
  style: z.enum(DESIGN_STYLES),
  primary: COLOR,
  secondary: COLOR,
  accent: COLOR,
  bg: COLOR,
  text: COLOR.default('#1e293b'),
  border: COLOR.default('#e2e8f0'),
  borderRadius: z.enum(BORDER_RADIUS_STYLES).default('rounded'),
  interfaceColors: z
    .record(z.string(), COLOR)
    .refine((o) => Object.keys(o).every((k) => INTERFACE_COLOR_KEYS.includes(k)), 'Unknown interface color')
    .default({}),
  texture: textureSchema.default({}),
  sidebarEffect: sidebarEffectSchema.default({}),
});

const inputSchema = z
  .object({
    enabled: z.boolean(),
    theme: themeSchema.nullable(),
  })
  .refine((v) => !v.enabled || v.theme !== null, { message: 'Choose or build a theme before turning it on', path: ['theme'] });

type ThemeInput = z.infer<typeof themeSchema>;

/** Fills everything the saved theme left out, so the browser script always gets a complete object. */
function complete(theme: ThemeInput) {
  return {
    ...theme,
    interfaceColors: { ...INTERFACE_COLOR_DEFAULTS, ...theme.interfaceColors },
    texture: Object.fromEntries(
      Object.entries(TEXTURE_DEFAULTS).map(([style, defaults]) => [
        style,
        { ...defaults, ...((theme.texture as Record<string, Record<string, number> | undefined>)[style] ?? {}) },
      ]),
    ),
    sidebarEffect: {
      ...SIDEBAR_EFFECT_DEFAULTS,
      ...theme.sidebarEffect,
      threeDBox: { ...SIDEBAR_EFFECT_DEFAULTS.threeDBox, ...(theme.sidebarEffect.threeDBox ?? {}) },
      glass: { ...SIDEBAR_EFFECT_DEFAULTS.glass, ...(theme.sidebarEffect.glass ?? {}) },
      bordered: { ...SIDEBAR_EFFECT_DEFAULTS.bordered, ...(theme.sidebarEffect.bordered ?? {}) },
      neumorphic: { ...SIDEBAR_EFFECT_DEFAULTS.neumorphic, ...(theme.sidebarEffect.neumorphic ?? {}) },
      clay: { ...SIDEBAR_EFFECT_DEFAULTS.clay, ...(theme.sidebarEffect.clay ?? {}) },
    },
  };
}

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
      const premiumTheme = await getPremiumTheme(req.companyId!, getGroupId(req));
      res.json({ premiumTheme });
    }),
  },
  {
    method: 'put',
    url: '/update',
    middlewares: [attachCompany],
    handler: asyncHandler(async (req, res) => {
      const input = inputSchema.parse(req.body);
      const premiumTheme = await upsertPremiumTheme(req.companyId!, getGroupId(req), {
        enabled: input.enabled,
        theme: input.theme ? complete(input.theme) : null,
      });
      res.json({ premiumTheme });
    }),
  },
];

export const premiumThemeRouter: Router = buildRouter(routes);
