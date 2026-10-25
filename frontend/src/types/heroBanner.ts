export interface HeroBackground {
  type: 'solid' | 'gradient';
  color: string;
  color2: string;
  angle: number;
}

export interface HeroIcon {
  type: 'none' | 'emoji' | 'image';
  value: string;
  position: 'left' | 'right' | 'top' | 'bottom';
}

export interface HeroSlide {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  imageAlt: string;
  imagePosition: 'left' | 'right';
  backgroundImage: string;
  ctaText: string;
  ctaUrl: string;
  ctaOpenIn: 'new' | 'same';
  background: HeroBackground;
  textColor: string;
  icon: HeroIcon;
}

export interface HeroSliderOptions {
  autoSlide: boolean;
  intervalMs: number;
  showControls: boolean;
  controlsPosition: 'top' | 'bottom' | 'sides';
  pauseOnHover: boolean;
  loop: boolean;
  transition: 'slide' | 'fade';
  transitionMs: number;
}

export interface HeroBannerInput {
  name: string;
  enabled: boolean;
  order: number;
  kind: 'single' | 'slider';
  position: 'top' | 'bottom';
  slides: HeroSlide[];
  slider: HeroSliderOptions;
  sizeMode: 'default' | 'custom';
  height: number;
  widthPercent: number;
  borderRadius: number;
  marginTop: number;
  marginBottom: number;
  padY: number;
  padX: number;
  mobilePadX: number;
  titleSize: number;
  subtitleSize: number;
  descriptionSize: number;
  animation: 'fade' | 'slide' | 'none';
  closable: boolean;
}

export interface HeroBanner extends HeroBannerInput {
  _id: string;
  companyId: string;
  groupId: string;
  createdAt: string;
  updatedAt: string;
}

export const emptyHeroSlide: HeroSlide = {
  title: '',
  subtitle: '',
  description: '',
  image: '',
  imageAlt: '',
  imagePosition: 'right',
  backgroundImage: '',
  ctaText: '',
  ctaUrl: '',
  ctaOpenIn: 'new',
  background: { type: 'gradient', color: '#667eea', color2: '#764ba2', angle: 135 },
  textColor: '#ffffff',
  icon: { type: 'none', value: '', position: 'left' },
};

export const emptyHeroBanner: HeroBannerInput = {
  name: '',
  enabled: true,
  order: 0,
  kind: 'single',
  position: 'top',
  slides: [{ ...emptyHeroSlide, title: 'Welcome', description: 'Tell your clients what is new.' }],
  slider: { autoSlide: true, intervalMs: 5000, showControls: true, controlsPosition: 'bottom', pauseOnHover: true, loop: true, transition: 'slide', transitionMs: 500 },
  sizeMode: 'default',
  height: 280,
  widthPercent: 100,
  borderRadius: 20,
  marginTop: 0,
  marginBottom: 24,
  padY: 48,
  padX: 56,
  mobilePadX: 24,
  titleSize: 36,
  subtitleSize: 20,
  descriptionSize: 16,
  animation: 'fade',
  closable: true,
};

export function normalizeHeroBanner(b: Partial<HeroBannerInput> | null | undefined): HeroBannerInput {
  const base = { ...emptyHeroBanner, ...(b ?? {}) };
  return {
    ...base,
    slider: { ...emptyHeroBanner.slider, ...(b?.slider ?? {}) },
    slides: (b?.slides?.length ? b.slides : emptyHeroBanner.slides).map((s) => ({
      ...emptyHeroSlide,
      ...s,
      background: { ...emptyHeroSlide.background, ...(s.background ?? {}) },
      icon: { ...emptyHeroSlide.icon, ...(s.icon ?? {}) },
    })),
  };
}

export function slideBackground(bg: HeroBackground): string {
  return bg.type === 'solid' ? bg.color : `linear-gradient(${bg.angle}deg, ${bg.color} 0%, ${bg.color2} 100%)`;
}
