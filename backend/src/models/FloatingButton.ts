import { Schema, model, Types } from 'mongoose';

/** The screen edge a button is attached to. */
export type FloatingButtonPosition = 'right' | 'bottom' | 'left' | 'top';
export type FloatingButtonVariant = 'solid' | 'split' | 'outline' | 'ghost';
export type FloatingButtonSize = 'small' | 'medium' | 'large';
/** vertical = the label reads top to bottom along a side edge (ignored on top/bottom edges). */
export type FloatingButtonLayout = 'horizontal' | 'vertical';
export type FloatingButtonOpenMode = 'modal' | 'drawer' | 'new-tab' | 'same-tab';
/** auto = the drawer slides in from the button's own edge. */
export type FloatingButtonDrawerDirection = 'auto' | 'right' | 'left' | 'top' | 'bottom';
export type FloatingButtonShadow = 'none' | 'sm' | 'md' | 'lg';
export type FloatingButtonAnimation = 'none' | 'pulse' | 'bounce' | 'shimmer';

export interface FloatingButtonSubItem {
  label: string;
  url: string;
}

export interface FloatingButtonNavTab {
  label: string;
  url: string;
}

export interface FloatingButtonDoc {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  groupId: string;
  position: FloatingButtonPosition;
  label: string;
  icon?: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  shadow: FloatingButtonShadow;
  animation: FloatingButtonAnimation;
  subItems: FloatingButtonSubItem[];
  variant: FloatingButtonVariant;
  size: FloatingButtonSize;
  layout: FloatingButtonLayout;
  /**
   * Where along its edge the button sits, 0-100 (from the top on side edges, from the left on
   * top/bottom edges). Null keeps the original behaviour: buttons stack in a dock on their edge.
   */
  positionPercent: number | null;
  /** Distance from the edge in px. */
  edgeOffset: number;
  /** What the button opens (its url, or the first nav tab) and how. */
  url: string;
  openMode: FloatingButtonOpenMode;
  drawerDirection: FloatingButtonDrawerDirection;
  /** How much of the screen a drawer covers along its axis, 20-100 percent. */
  drawerPercent: number;
  /** Tabs shown at the top of the drawer; each switches the page shown. */
  navTabs: FloatingButtonNavTab[];
  /** Viewers may drag the button; it snaps to the nearest screen edge when released. */
  draggable: boolean;
  /** The button only shows between these moments (either may be empty). */
  startAt: Date | null;
  endAt: Date | null;
  /** Show a live "ends in ..." countdown on the button while it has an end time. */
  showCountdown: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const subItemSchema = new Schema<FloatingButtonSubItem>(
  {
    label: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false },
);

const navTabSchema = new Schema<FloatingButtonNavTab>(
  {
    label: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false },
);

const floatingButtonSchema = new Schema<FloatingButtonDoc>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    groupId: { type: String, default: '', index: true },
    position: { type: String, enum: ['right', 'bottom', 'left', 'top'], required: true },
    label: { type: String, required: true, trim: true },
    icon: { type: String },
    backgroundColor: { type: String, default: '#6366f1' },
    textColor: { type: String, default: '#ffffff' },
    borderRadius: { type: Number, default: 999 },
    shadow: { type: String, enum: ['none', 'sm', 'md', 'lg'], default: 'md' },
    animation: { type: String, enum: ['none', 'pulse', 'bounce', 'shimmer'], default: 'none' },
    subItems: { type: [subItemSchema], default: [] },
    variant: { type: String, enum: ['solid', 'split', 'outline', 'ghost'], default: 'solid' },
    size: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
    layout: { type: String, enum: ['horizontal', 'vertical'], default: 'horizontal' },
    positionPercent: { type: Number, default: null, min: 0, max: 100 },
    edgeOffset: { type: Number, default: 16, min: 0, max: 400 },
    url: { type: String, default: '' },
    openMode: { type: String, enum: ['modal', 'drawer', 'new-tab', 'same-tab'], default: 'new-tab' },
    drawerDirection: { type: String, enum: ['auto', 'right', 'left', 'top', 'bottom'], default: 'auto' },
    drawerPercent: { type: Number, default: 50, min: 20, max: 100 },
    navTabs: { type: [navTabSchema], default: [] },
    draggable: { type: Boolean, default: false },
    startAt: { type: Date, default: null },
    endAt: { type: Date, default: null },
    showCountdown: { type: Boolean, default: false },
  },
  { timestamps: true },
);

floatingButtonSchema.index({ companyId: 1, groupId: 1 });

export const FloatingButton = model<FloatingButtonDoc>('FloatingButton', floatingButtonSchema);
