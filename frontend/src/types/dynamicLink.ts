export type DynamicLinkOpenMode = 'same-tab' | 'new-tab' | 'modal';
export type DynamicLinkRoleTarget = 'all' | 'owner' | 'admin';

export interface DynamicLink {
  _id: string;
  companyId: string;
  groupId: string;
  title: string;
  url: string;
  icon?: string;
  openMode: DynamicLinkOpenMode;
  roleTarget: DynamicLinkRoleTarget;
  createdAt: string;
  updatedAt: string;
}

export interface DynamicLinkInput {
  title: string;
  url: string;
  icon?: string;
  openMode: DynamicLinkOpenMode;
  roleTarget: DynamicLinkRoleTarget;
}
