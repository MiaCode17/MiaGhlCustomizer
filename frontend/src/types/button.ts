export type ButtonSurface =
  | 'header'
  | 'dashboard'
  | 'contact'
  | 'opportunity'
  | 'record-detail'
  | 'record-tab'
  | 'opportunity-tab';
export type ButtonStyleVariant = 'primary' | 'default' | 'dashed' | 'text';
export type ButtonSizeVariant = 'small' | 'middle' | 'large';
export type ButtonIconPosition = 'left' | 'right';
export type ButtonShadow = 'none' | 'sm' | 'md' | 'lg';
export type ButtonAnimation = 'none' | 'pulse' | 'bounce' | 'shimmer';
export type ButtonOpenMode = 'modal' | 'drawer' | 'new-tab' | 'same-tab';
export type ButtonIconSize = 'small' | 'medium' | 'large';

/** Which kinds of GHL user may see a button. */
export interface ButtonPermissions {
  agency_admins: boolean;
  agency_users: boolean;
  account_admins: boolean;
  account_users: boolean;
}

export interface ButtonMenuItem {
  label: string;
  url: string;
  openMode: ButtonOpenMode;
  sendContact: boolean;
  sendCustomFields: boolean;
}

/** The fields added after the original style kit; every button has them (the API fills defaults). */
export interface ButtonBehaviorFields {
  openMode: ButtonOpenMode;
  iconOnly: boolean;
  iconSize: ButtonIconSize;
  uppercase: boolean;
  bold: boolean;
  underline: boolean;
  hoverEffect: boolean;
  gradient: boolean;
  gradientColor?: string;
  /** 0-100 percent. */
  opacity: number;
  permissions: ButtonPermissions;
  /** Append the contact's details / custom fields to the target URL. */
  sendContact: boolean;
  sendCustomFields: boolean;
  /** A non-empty menu turns the button into a dropdown. */
  menuItems: ButtonMenuItem[];
  /** Optional CSS selector overriding where the button row is placed. */
  placementSelector?: string;
}

export function buttonBehaviorDefaults(): ButtonBehaviorFields {
  return {
    openMode: 'new-tab',
    iconOnly: false,
    iconSize: 'medium',
    uppercase: false,
    bold: false,
    underline: false,
    hoverEffect: true,
    gradient: false,
    gradientColor: '',
    opacity: 100,
    permissions: { agency_admins: true, agency_users: true, account_admins: true, account_users: true },
    sendContact: false,
    sendCustomFields: false,
    menuItems: [],
    placementSelector: '',
  };
}

export interface InjectedButton extends ButtonBehaviorFields {
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

export interface InjectedButtonInput extends ButtonBehaviorFields {
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
    ...buttonBehaviorDefaults(),
  };
}
