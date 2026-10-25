import {
  DEFAULT_INTERFACE_COLORS,
  DEFAULT_SIDEBAR_EFFECT,
  DEFAULT_TEXTURE,
  DesignStyle,
  InterfaceColors,
  PremiumTheme,
} from './premiumTheme';

export interface PremiumStarter {
  name: string;
  tagline: string;
  style: DesignStyle;
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  text: string;
  border: string;
}

/** One ready-made starting point per design movement. */
export const PREMIUM_STARTERS: PremiumStarter[] = [
  { name: 'Skeuomorphism', tagline: 'Warm wood grain', style: 'skeuomorphic', primary: '#8a7355', secondary: '#3a2f28', accent: '#e8dcc8', bg: '#d4c9b8', text: '#2a1f14', border: '#b8a888' },
  { name: 'Maximalism', tagline: 'Loud, layered, alive', style: 'maximalist', primary: '#22d3c0', secondary: '#f7931e', accent: '#8b5cf6', bg: '#fffdf5', text: '#1c1917', border: '#f7931e' },
  { name: 'Brutalism', tagline: 'Raw and unapologetic', style: 'brutalist', primary: '#c0392b', secondary: '#000000', accent: '#e5484d', bg: '#ece0c8', text: '#000000', border: '#000000' },
  { name: 'Liquid Glass', tagline: 'Shifting light refraction', style: 'liquidGlass', primary: '#7c3aed', secondary: '#1e1b4b', accent: '#38bdf8', bg: '#0f172a', text: '#f5f3ff', border: '#ffffff33' },
  { name: 'Claymorphism', tagline: 'Soft puffy warmth', style: 'clay', primary: '#8b6dd6', secondary: '#d9cdf5', accent: '#ffb6c1', bg: '#f3f0fb', text: '#443366', border: '#d9cdf5' },
  { name: 'Glassmorphism', tagline: 'Frosted translucent panels', style: 'glass', primary: '#3b82f6', secondary: '#0f172a', accent: '#a78bfa', bg: '#0b1220', text: '#e2e8f0', border: '#ffffff2e' },
  { name: 'Neumorphism', tagline: 'Soft extruded surfaces', style: 'neumorphic', primary: '#6c7ae0', secondary: '#dfe3ee', accent: '#9aa5f0', bg: '#e6e9f2', text: '#3a4060', border: '#d1d6e6' },
  { name: 'Cyberpunk', tagline: 'Neon on black', style: 'cyberpunk', primary: '#00f0ff', secondary: '#0a0a14', accent: '#ff2bd6', bg: '#05050d', text: '#e0f7ff', border: '#00f0ff' },
  { name: 'Vaporwave', tagline: 'Retro sunset gradients', style: 'vaporwave', primary: '#ff71ce', secondary: '#2b1055', accent: '#01cdfe', bg: '#1a0b3b', text: '#fdf2ff', border: '#b967ff' },
  { name: 'Art Deco', tagline: 'Gold lines, geometric luxury', style: 'artdeco', primary: '#c9a24b', secondary: '#14211c', accent: '#e7d29a', bg: '#0d1713', text: '#f3ead2', border: '#c9a24b' },
  { name: 'Dark Mode', tagline: 'Calm and focused', style: 'darkMode', primary: '#6366f1', secondary: '#111827', accent: '#818cf8', bg: '#0f172a', text: '#e5e7eb', border: '#1f2937' },
];

function toRgb(hex: string): [number, number, number] | null {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function toHex([r, g, b]: [number, number, number]): string {
  return '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
}

/** Blends `a` towards `b` by `t` (0 = a, 1 = b). Colors that are not plain hex are returned as they are. */
export function mix(a: string, b: string, t: number): string {
  const x = toRgb(a);
  const y = toRgb(b);
  if (!x || !y) return a;
  return toHex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]);
}

function luminance(hex: string): number {
  const rgb = toRgb(hex);
  if (!rgb) return 0.5;
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Black or white, whichever reads better on `background`. */
export function readableOn(background: string): string {
  return luminance(background) > 0.45 ? '#111827' : '#ffffff';
}

/**
 * Builds the full set of page colors from a theme's base palette. Accent-type fields follow
 * the palette; fields that sit on a dark or light surface get a readable text color; anything
 * else keeps its default. Every one can be changed afterwards.
 */
export function deriveInterfaceColors(p: Pick<PremiumStarter, 'primary' | 'secondary' | 'accent' | 'bg' | 'text'>): InterfaceColors {
  const d = DEFAULT_INTERFACE_COLORS;
  const tint = mix(p.primary, '#ffffff', 0.86);
  const onSecondary = readableOn(p.secondary);
  const onBg = readableOn(p.bg);
  const swap: Record<string, string> = {
    '#6366f1': p.primary,
    '#818cf8': p.accent,
    '#a5b4fc': p.accent,
    '#e0e7ff': tint,
    '#4338ca': mix(p.primary, '#000000', 0.35),
    '#0f172a': p.bg,
    '#111827': p.secondary,
    '#1f2937': mix(p.secondary, onSecondary, 0.12),
    '#e5e7eb': onSecondary,
    '#f8fafc': onBg,
  };
  const colors = { ...d } as Record<string, string>;
  for (const [key, value] of Object.entries(d)) colors[key] = swap[value.toLowerCase()] ?? value;
  // Fields whose default is the pale surface/text pair need to follow the page background.
  colors.dashboardBg = p.bg;
  colors.headerBg = p.bg;
  colors.sidebarBg = p.secondary;
  colors.sidebarText = onSecondary;
  colors.sidebarActive = p.primary;
  colors.locationSwitcherBg = mix(p.secondary, onSecondary, 0.12);
  colors.locationSwitcherText = onSecondary;
  colors.titleText = p.text;
  return colors as unknown as InterfaceColors;
}

export function themeFromStarter(starter: PremiumStarter): PremiumTheme {
  return {
    name: starter.name,
    style: starter.style,
    primary: starter.primary,
    secondary: starter.secondary,
    accent: starter.accent,
    bg: starter.bg,
    text: starter.text,
    border: starter.border,
    borderRadius: 'rounded',
    interfaceColors: deriveInterfaceColors(starter),
    texture: JSON.parse(JSON.stringify(DEFAULT_TEXTURE)),
    sidebarEffect: JSON.parse(JSON.stringify(DEFAULT_SIDEBAR_EFFECT)),
  };
}
