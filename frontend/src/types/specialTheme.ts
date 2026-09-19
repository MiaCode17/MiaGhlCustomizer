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

export interface SpecialTheme {
  enabled: boolean;
  themeKey: string;
  popup: SpecialThemePopup;
  particleEffect: SpecialThemeParticleEffect;
}

export const emptySpecialTheme: SpecialTheme = {
  enabled: false,
  themeKey: '',
  popup: { visible: false, title: '', message: '', ctaText: '', ctaUrl: '' },
  particleEffect: { enabled: false, durationSeconds: 5 },
};
