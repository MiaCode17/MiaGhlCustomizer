export type ButtonSurface = 'header' | 'dashboard' | 'contact' | 'opportunity' | 'record-detail' | 'record-tab';
export type ButtonStyleVariant = 'primary' | 'default' | 'dashed' | 'text';
export type ButtonSizeVariant = 'small' | 'middle' | 'large';
export type ButtonIconPosition = 'left' | 'right';
export type ButtonShadow = 'none' | 'sm' | 'md' | 'lg';
export type ButtonAnimation = 'none' | 'pulse' | 'bounce' | 'shimmer';

export interface InjectedButton {
  _id: string;
  companyId: string;
  groupId: string;
  surface: ButtonSurface;
  label: string;
  tooltip?: string;
  icon?: string;
  style: ButtonStyleVariant;
  size: ButtonSizeVariant;
  targetUrl?: string;
  order: number;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth: number;
  borderRadius: number;
  iconPosition: ButtonIconPosition;
  shadow: ButtonShadow;
  animation: ButtonAnimation;
  fullWidth: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InjectedButtonInput {
  surface: ButtonSurface;
  label: string;
  tooltip?: string;
  icon?: string;
  style: ButtonStyleVariant;
  size: ButtonSizeVariant;
  targetUrl?: string;
  order: number;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth: number;
  borderRadius: number;
  iconPosition: ButtonIconPosition;
  shadow: ButtonShadow;
  animation: ButtonAnimation;
  fullWidth: boolean;
}

export function emptyButtonInput(surface: ButtonSurface): InjectedButtonInput {
  return {
    surface,
    label: '',
    tooltip: '',
    icon: '',
    style: 'default',
    size: 'middle',
    targetUrl: '',
    order: 0,
    backgroundColor: '',
    textColor: '',
    borderColor: '',
    borderWidth: 0,
    borderRadius: 8,
    iconPosition: 'left',
    shadow: 'none',
    animation: 'none',
    fullWidth: false,
  };
}
