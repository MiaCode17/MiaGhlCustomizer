import { CssVariable, LoginPagePreset } from '../types/loginPage';

export interface LoginDesign {
  id: string;
  name: string;
  description: string;
  preset: LoginPagePreset;
  /** CSS variables the design sets; everything else the agency added is left alone. */
  vars: Record<string, string>;
}

export const SHAPES = [
  { id: 'hexagon', label: 'Soft point', value: 'polygon(0% 0%, 70% 0%, 85% 50%, 70% 100%, 0% 100%)' },
  { id: 'rectangle', label: 'Rectangle', value: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' },
  { id: 'diagonal', label: 'Wide point', value: 'polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%)' },
  { id: 'triangle', label: 'Triangle', value: 'polygon(0% 0%, 100% 0%, 0% 100%)' },
] as const;

const POINT = SHAPES[0].value;
const WIDE = SHAPES[2].value;
const FULL = SHAPES[1].value;

function design(
  id: string,
  name: string,
  description: string,
  preset: LoginPagePreset,
  o: { bg: string; card: string; primary: string; accent: string; shape?: string; width?: string; offset?: string; dark?: boolean },
): LoginDesign {
  const vars: Record<string, string> = {
    '--login-bg-gradient': o.bg,
    '--login-card-bg': o.card,
    '--primary-color': o.primary,
    '--login-button-gradient': `linear-gradient(135deg, ${o.primary} 0%, ${o.accent} 100%)`,
    '--login-focus-color': o.primary,
    '--login-card-radius': '24px',
    '--login-card-shadow': '0 20px 60px rgba(15, 23, 42, 0.25)',
    '--login-card-hover-shadow': '0 25px 70px rgba(15, 23, 42, 0.35)',
    '--login-input-bg': o.dark ? '#374151' : '#f3f4f6',
    '--login-text-color': o.dark ? '#f9fafb' : '#1f2937',
  };
  if (preset === 'shape-left' || preset === 'shape-right') {
    vars['--login-shape'] = o.shape ?? POINT;
    vars['--login-shape-width'] = o.width ?? '65%';
    vars['--login-shape-offset'] = o.offset ?? '55%';
  }
  return { id, name, description, preset, vars };
}

const INDIGO = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

export const LOGIN_DESIGNS: LoginDesign[] = [
  design('classic-split', 'Classic Split', 'Picture on the left, form on the right', 'shape-left', { bg: INDIGO, card: '#ffffff', primary: '#6366f1', accent: '#8b5cf6' }),
  design('modern-reverse', 'Modern Reverse', 'Form on the left, picture on the right', 'shape-right', { bg: INDIGO, card: '#ffffff', primary: '#6366f1', accent: '#8b5cf6' }),
  design('minimalist-gradient', 'Minimalist Gradient', 'Clean gradient, no picture', 'centered', { bg: INDIGO, card: '#ffffff', primary: '#6366f1', accent: '#8b5cf6' }),
  design('sunset-vibes', 'Sunset Vibes', 'Warm sunset gradient', 'centered', { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)', card: '#ffffff', primary: '#f5576c', accent: '#f093fb' }),
  design('ocean-breeze', 'Ocean Breeze', 'Cool, calming ocean gradient', 'centered', { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #06b6d4 100%)', card: '#ffffff', primary: '#06b6d4', accent: '#667eea' }),
  design('image-focus', 'Image Focus', 'Full-page picture with a centered form', 'full-bleed', { bg: INDIGO, card: '#ffffff', primary: '#6366f1', accent: '#8b5cf6' }),
  design('centered-elegance', 'Centered Elegance', 'Centered form, subtle gradient', 'centered', { bg: INDIGO, card: '#ffffff', primary: '#6366f1', accent: '#8b5cf6' }),
  design('dark-mode-pro', 'Dark Mode Pro', 'Dark and sleek', 'centered', { bg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e293b 100%)', card: '#1f2937', primary: '#818cf8', accent: '#a78bfa', dark: true }),
  design('diagonal-split', 'Diagonal Split', 'A bold diagonal picture panel', 'shape-left', { bg: INDIGO, card: '#ffffff', primary: '#6366f1', accent: '#8b5cf6', shape: WIDE, width: '70%', offset: '60%' }),
  design('nature-inspired', 'Nature Inspired', 'Warm earth tones', 'shape-left', { bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #92400e 100%)', card: '#ffffff', primary: '#f59e0b', accent: '#d97706' }),
];

/** Every variable a design may set, so applying another design replaces them cleanly. */
export const DESIGN_VAR_NAMES = new Set(LOGIN_DESIGNS.flatMap((d) => Object.keys(d.vars)));

export function applyDesign(current: CssVariable[], design: LoginDesign): CssVariable[] {
  const kept = current.filter((v) => !DESIGN_VAR_NAMES.has(v.name.trim()));
  return [...kept, ...Object.entries(design.vars).map(([name, value]) => ({ name, value }))];
}

export function getVar(vars: CssVariable[], name: string): string | undefined {
  return vars.find((v) => v.name.trim() === name)?.value;
}

export function setVar(vars: CssVariable[], name: string, value: string): CssVariable[] {
  const rest = vars.filter((v) => v.name.trim() !== name);
  return [...rest, { name, value }];
}

export function mirrorClipPath(clipPath: string): string {
  return clipPath.replace(/polygon\(([^)]+)\)/, (_m, coords: string) => {
    const points = coords.split(',').map((p) => {
      const [x, y] = p.trim().split(/\s+/);
      const n = parseFloat(x ?? '');
      return y !== undefined && /%$/.test(x ?? '') && Number.isFinite(n) ? `${(100 - n).toFixed(2)}% ${y}` : p.trim();
    });
    return `polygon(${points.join(', ')})`;
  });
}

export const FULL_SHAPE = FULL;
