export interface SpecialThemePopup {
  visible: boolean;
  title: string;
  message: string;
  ctaText?: string;
  ctaUrl?: string;
}

export interface SpecialThemeParticleEffect {
  enabled: boolean;
  durationSeconds: number;
}

/** A user-designed occasion, used when themeKey is 'custom'. */
export interface CustomOccasion {
  name: string;
  emoji: string;
  accent: [string, string];
  particles: string[];
}

export const CUSTOM_OCCASION_KEY = 'custom';

export const DEFAULT_CUSTOM_OCCASION: CustomOccasion = {
  name: 'My occasion',
  emoji: '🎉',
  accent: ['#4f46e5', '#ec4899'],
  particles: ['🎉', '✨', '🎊'],
};

export interface SpecialTheme {
  enabled: boolean;
  themeKey: string;
  custom?: CustomOccasion;
  popup: SpecialThemePopup;
  particleEffect: SpecialThemeParticleEffect;
}

export const emptySpecialTheme: SpecialTheme = {
  enabled: false,
  themeKey: '',
  popup: { visible: false, title: '', message: '', ctaText: '', ctaUrl: '' },
  particleEffect: { enabled: false, durationSeconds: 5 },
};
