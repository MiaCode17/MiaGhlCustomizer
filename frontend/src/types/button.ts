export type ButtonSurface = 'header' | 'dashboard' | 'record-detail' | 'record-tab';
export type ButtonStyleVariant = 'primary' | 'default' | 'dashed' | 'text';
export type ButtonSizeVariant = 'small' | 'middle' | 'large';

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
  };
}
