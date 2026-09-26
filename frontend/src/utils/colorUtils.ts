export const DEFAULT_BRAND_COLOR = '#7a1f2b';

export function isValidHex(hex: string | undefined | null): hex is string {
  return !!hex && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex);
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(h, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0'))
      .join('')
  );
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360;
  h /= 360;
  s /= 100;
  l /= 100;
  if (s === 0) {
    const v = l * 255;
    return [v, v, v];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [255 * hue2rgb(p, q, h + 1 / 3), 255 * hue2rgb(p, q, h), 255 * hue2rgb(p, q, h - 1 / 3)];
}

export function hexToHsl(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHsl(r, g, b);
}

export function hslToHex(h: number, s: number, l: number): string {
  const [r, g, b] = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

export function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export interface BrandPalette {
  /** The true brand color, lightly normalized for legibility. */
  primary: string;
  primaryHover: string;
  primaryActive: string;
  /** Dark gradient stops for chrome surfaces (sidebar etc.), same hue as primary. */
  gradientTop: string;
  gradientMid: string;
  gradientBottom: string;
  menuSelectedBg: string;
  menuHoverBg: string;
  /** Pale tint for header backgrounds / table headers. */
  tintBg: string;
  tintBorder: string;
  /** rgba shadows/washes at increasing strength. */
  whisper: string;
  softShadow: string;
  glow: string;
  /** Analogous accent used for sparkle/divider highlights. */
  accent: string;
  accentSoft: string;
  /** Text color that reads well on top of `primary`. */
  onPrimary: string;
}

export function buildBrandPalette(hexInput: string): BrandPalette {
  const hex = isValidHex(hexInput) ? hexInput : DEFAULT_BRAND_COLOR;
  const [h, rawS, rawL] = hexToHsl(hex);
  const s = clamp(rawS, 35, 90);
  const primary = hslToHex(h, s, clamp(rawL, 28, 46));

  return {
    primary,
    primaryHover: hslToHex(h, s, clamp(rawL + 8, 12, 62)),
    primaryActive: hslToHex(h, s, clamp(rawL - 8, 6, 55)),
    gradientTop: hslToHex(h, s, 19),
    gradientMid: hslToHex(h, s, 12),
    gradientBottom: hslToHex(h, clamp(s - 15, 20, 90), 7),
    menuSelectedBg: hslToHex(h, s, 24),
    menuHoverBg: withAlpha(hslToHex(h, s, 60), 0.1),
    tintBg: hslToHex(h, Math.min(s, 55), 97),
    tintBorder: hslToHex(h, Math.min(s, 55), 90),
    whisper: withAlpha(primary, 0.08),
    softShadow: withAlpha(primary, 0.16),
    glow: withAlpha(primary, 0.35),
    accent: hslToHex(h + 35, clamp(s + 10, 45, 90), 66),
    accentSoft: withAlpha(hslToHex(h + 35, clamp(s + 10, 45, 90), 66), 0.55),
    onPrimary: rawL > 68 ? '#1f0a0d' : '#ffffff',
  };
}
