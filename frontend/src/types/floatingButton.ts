/** The screen edge a button is attached to. */
export type FloatingButtonPosition = 'right' | 'bottom' | 'left' | 'top';
export type FloatingButtonShadow = 'none' | 'sm' | 'md' | 'lg';
export type FloatingButtonAnimation = 'none' | 'pulse' | 'bounce' | 'shimmer';
export type FloatingButtonVariant = 'solid' | 'split' | 'outline' | 'ghost';
export type FloatingButtonSize = 'small' | 'medium' | 'large';
/** vertical = the label reads top to bottom along a side edge (ignored on top/bottom edges). */
export type FloatingButtonLayout = 'horizontal' | 'vertical';
export type FloatingButtonOpenMode = 'modal' | 'drawer' | 'new-tab' | 'same-tab';
/** auto = the drawer slides in from the button's own edge. */
export type FloatingButtonDrawerDirection = 'auto' | 'right' | 'left' | 'top' | 'bottom';

export interface FloatingButtonSubItem {
  label: string;
  url: string;
}

export interface FloatingButtonNavTab {
  label: string;
  url: string;
}

/** Everything about a floating button except its identity and scoping fields. */
export interface FloatingButtonInput {
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
  /** 0-100 along the edge; null stacks the button in a dock with the others. */
  positionPercent: number | null;
  /** Distance from the edge in px. */
  edgeOffset: number;
  url: string;
  openMode: FloatingButtonOpenMode;
  drawerDirection: FloatingButtonDrawerDirection;
  /** How much of the screen a drawer covers along its axis, 20-100 percent. */
  drawerPercent: number;
  navTabs: FloatingButtonNavTab[];
  /** Viewers may drag it; it snaps to the nearest edge when released. */
  draggable: boolean;
  /** ISO date-times; null = no limit. */
  startAt: string | null;
  endAt: string | null;
  showCountdown: boolean;
}

export interface FloatingButton extends FloatingButtonInput {
  _id: string;
  companyId: string;
  groupId: string;
  createdAt: string;
  updatedAt: string;
}

export function floatingButtonDefaults(): Omit<FloatingButtonInput, 'position' | 'label'> {
  return {
    icon: '',
    backgroundColor: '#6366f1',
    textColor: '#ffffff',
    borderRadius: 999,
    shadow: 'md',
    animation: 'none',
    subItems: [],
    variant: 'solid',
    size: 'medium',
    layout: 'horizontal',
    positionPercent: null,
    edgeOffset: 16,
    url: '',
    openMode: 'new-tab',
    drawerDirection: 'auto',
    drawerPercent: 50,
    navTabs: [],
    draggable: false,
    startAt: null,
    endAt: null,
    showCountdown: false,
  };
}

export function emptyFloatingButtonInput(position: FloatingButtonPosition = 'right'): FloatingButtonInput {
  return { position, label: '', ...floatingButtonDefaults() };
}

/** Fills in fields an older saved button predates. */
export function normalizeFloatingButton(button: FloatingButton): FloatingButton {
  return { ...floatingButtonDefaults(), ...button };
}
