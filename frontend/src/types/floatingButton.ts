export type FloatingButtonPosition = 'right' | 'bottom';
export type FloatingButtonShadow = 'none' | 'sm' | 'md' | 'lg';
export type FloatingButtonAnimation = 'none' | 'pulse' | 'bounce' | 'shimmer';

export interface FloatingButtonSubItem {
  label: string;
  url: string;
}

export interface FloatingButton {
  _id: string;
  companyId: string;
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
  createdAt: string;
  updatedAt: string;
}

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
}

export function emptyFloatingButtonInput(): FloatingButtonInput {
  return {
    position: 'right',
    label: '',
    icon: '',
    backgroundColor: '#6366f1',
    textColor: '#ffffff',
    borderRadius: 999,
    shadow: 'md',
    animation: 'none',
    subItems: [],
  };
}
