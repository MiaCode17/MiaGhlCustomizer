export type BannerType = 'info' | 'warning' | 'success' | 'promo';
export type BannerPosition = 'top' | 'bottom';

export interface Banner {
  _id: string;
  companyId: string;
  groupId: string;
  name: string;
  type: BannerType;
  position: BannerPosition;
  enabled: boolean;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface BannerInput {
  name: string;
  type: BannerType;
  position: BannerPosition;
  enabled: boolean;
  content: string;
}
