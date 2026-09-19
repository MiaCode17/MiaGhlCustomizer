export type FloatingButtonPosition = 'right' | 'bottom';

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
  backgroundColor: string;
  textColor: string;
  subItems: FloatingButtonSubItem[];
  createdAt: string;
  updatedAt: string;
}

export interface FloatingButtonInput {
  position: FloatingButtonPosition;
  label: string;
  backgroundColor: string;
  textColor: string;
  subItems: FloatingButtonSubItem[];
}

export function emptyFloatingButtonInput(): FloatingButtonInput {
  return {
    position: 'right',
    label: '',
    backgroundColor: '#6366f1',
    textColor: '#ffffff',
    subItems: [],
  };
}
