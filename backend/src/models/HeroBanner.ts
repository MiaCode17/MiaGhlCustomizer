import { Schema, model, Types } from 'mongoose';

export type HeroBannerKind = 'single' | 'slider';
export type HeroBannerPosition = 'top' | 'bottom';

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

/** One panel of a hero banner. A single banner has one; a slider has several. */
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

/**
 * A large banner shown on the GHL dashboard, above or below its content: one panel, or a
 * slider of several, each with text, a picture and a button. Sizes are plain numbers (pixels or
 * percent) so no free-form CSS is ever stored.
 */
export interface HeroBannerDoc {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  groupId: string;
  name: string;
  enabled: boolean;
  order: number;
  kind: HeroBannerKind;
  position: HeroBannerPosition;
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
  createdAt: Date;
  updatedAt: Date;
}

const backgroundSchema = new Schema<HeroBackground>(
  {
    type: { type: String, enum: ['solid', 'gradient'], default: 'gradient' },
    color: { type: String, default: '#667eea' },
    color2: { type: String, default: '#764ba2' },
    angle: { type: Number, default: 135 },
  },
  { _id: false },
);

const iconSchema = new Schema<HeroIcon>(
  {
    type: { type: String, enum: ['none', 'emoji', 'image'], default: 'none' },
    value: { type: String, default: '' },
    position: { type: String, enum: ['left', 'right', 'top', 'bottom'], default: 'left' },
  },
  { _id: false },
);

const slideSchema = new Schema<HeroSlide>(
  {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    imageAlt: { type: String, default: '' },
    imagePosition: { type: String, enum: ['left', 'right'], default: 'right' },
    backgroundImage: { type: String, default: '' },
    ctaText: { type: String, default: '' },
    ctaUrl: { type: String, default: '' },
    ctaOpenIn: { type: String, enum: ['new', 'same'], default: 'new' },
    background: { type: backgroundSchema, default: () => ({}) },
    textColor: { type: String, default: '#ffffff' },
    icon: { type: iconSchema, default: () => ({}) },
  },
  { _id: false },
);

const sliderSchema = new Schema<HeroSliderOptions>(
  {
    autoSlide: { type: Boolean, default: true },
    intervalMs: { type: Number, default: 5000 },
    showControls: { type: Boolean, default: true },
    controlsPosition: { type: String, enum: ['top', 'bottom', 'sides'], default: 'bottom' },
    pauseOnHover: { type: Boolean, default: true },
    loop: { type: Boolean, default: true },
    transition: { type: String, enum: ['slide', 'fade'], default: 'slide' },
    transitionMs: { type: Number, default: 500 },
  },
  { _id: false },
);

const heroBannerSchema = new Schema<HeroBannerDoc>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    groupId: { type: String, default: '', index: true },
    name: { type: String, required: true, trim: true },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    kind: { type: String, enum: ['single', 'slider'], default: 'single' },
    position: { type: String, enum: ['top', 'bottom'], default: 'top' },
    slides: { type: [slideSchema], default: [] },
    slider: { type: sliderSchema, default: () => ({}) },
    sizeMode: { type: String, enum: ['default', 'custom'], default: 'default' },
    height: { type: Number, default: 280 },
    widthPercent: { type: Number, default: 100 },
    borderRadius: { type: Number, default: 20 },
    marginTop: { type: Number, default: 0 },
    marginBottom: { type: Number, default: 24 },
    padY: { type: Number, default: 48 },
    padX: { type: Number, default: 56 },
    mobilePadX: { type: Number, default: 24 },
    titleSize: { type: Number, default: 36 },
    subtitleSize: { type: Number, default: 20 },
    descriptionSize: { type: Number, default: 16 },
    animation: { type: String, enum: ['fade', 'slide', 'none'], default: 'fade' },
    closable: { type: Boolean, default: true },
  },
  { timestamps: true },
);

heroBannerSchema.index({ companyId: 1, groupId: 1, order: 1 });

export const HeroBanner = model<HeroBannerDoc>('HeroBanner', heroBannerSchema);
