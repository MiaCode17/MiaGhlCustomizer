import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { themeService } from '../services/themeService';
import { Theme } from '../types/theme';
import { BrandPalette, DEFAULT_BRAND_COLOR, buildBrandPalette, isValidHex } from '../utils/colorUtils';

function extractBrandColor(theme: Theme | null | undefined): string {
  if (!theme) return DEFAULT_BRAND_COLOR;

  const primaryRule = theme.colorRules?.find((r) => /primary/i.test(r.name));
  if (isValidHex(primaryRule?.value)) return primaryRule!.value;

  const buttonGradient = theme.gradients?.find((g) => g.target === 'button');
  if (isValidHex(buttonGradient?.from)) return buttonGradient!.from;

  const headerRule = theme.colorRules?.find((r) => /header/i.test(r.name));
  if (isValidHex(headerRule?.value)) return headerRule!.value;

  const headerGradient = theme.gradients?.find((g) => g.target === 'header');
  if (isValidHex(headerGradient?.from)) return headerGradient!.from;

  return DEFAULT_BRAND_COLOR;
}

const CSS_VAR_MAP: Record<keyof BrandPalette, string> = {
  primary: '--brand-primary',
  primaryHover: '--brand-primary-hover',
  primaryActive: '--brand-primary-active',
  gradientTop: '--brand-gradient-top',
  gradientMid: '--brand-gradient-mid',
  gradientBottom: '--brand-gradient-bottom',
  menuSelectedBg: '--brand-menu-selected',
  menuHoverBg: '--brand-menu-hover',
  tintBg: '--brand-tint-bg',
  tintBorder: '--brand-tint-border',
  whisper: '--brand-whisper',
  softShadow: '--brand-soft-shadow',
  glow: '--brand-glow',
  accent: '--brand-accent',
  accentSoft: '--brand-accent-soft',
  onPrimary: '--brand-on-primary',
};

interface BrandThemeContextValue {
  brandColor: string;
  palette: BrandPalette;
  /** Live-updates the customizer chrome to reflect a theme being edited or previewed. */
  setActiveTheme: (theme: Theme | null | undefined) => void;
}

const BrandThemeContext = createContext<BrandThemeContextValue | undefined>(undefined);

export function BrandThemeProvider({ children }: { children: React.ReactNode }) {
  const [brandColor, setBrandColor] = useState(DEFAULT_BRAND_COLOR);

  useEffect(() => {
    let cancelled = false;
    themeService
      .get()
      .then((loaded) => {
        if (!cancelled) setBrandColor(extractBrandColor(loaded));
      })
      .catch(() => {
        // Keep the default brand color if no theme is set up yet.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setActiveTheme = useCallback((theme: Theme | null | undefined) => {
    setBrandColor(extractBrandColor(theme));
  }, []);

  const palette = useMemo(() => buildBrandPalette(brandColor), [brandColor]);

  useEffect(() => {
    const root = document.documentElement.style;
    (Object.keys(CSS_VAR_MAP) as (keyof BrandPalette)[]).forEach((key) => {
      root.setProperty(CSS_VAR_MAP[key], palette[key]);
    });
  }, [palette]);

  const value = useMemo(() => ({ brandColor, palette, setActiveTheme }), [brandColor, palette, setActiveTheme]);

  return <BrandThemeContext.Provider value={value}>{children}</BrandThemeContext.Provider>;
}

export function useBrandTheme(): BrandThemeContextValue {
  const ctx = useContext(BrandThemeContext);
  if (!ctx) {
    throw new Error('useBrandTheme must be used within a BrandThemeProvider');
  }
  return ctx;
}
