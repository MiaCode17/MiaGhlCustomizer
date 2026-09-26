export type GroupType = 'saas-plan' | 'custom';

export interface Group {
  _id: string;
  companyId: string;
  name: string;
  type: GroupType;
  planIds: string[];
  locationIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GroupInput {
  name: string;
  type: GroupType;
  planIds: string[];
  locationIds: string[];
}

export const emptyGroupInput: GroupInput = {
  name: '',
  type: 'custom',
  planIds: [],
  locationIds: [],
};
