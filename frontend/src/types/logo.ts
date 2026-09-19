export interface LogoCampaign {
  _id: string;
  companyId: string;
  groupId: string;
  name: string;
  logoUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface LogoCampaignInput {
  name: string;
  logoUrl: string;
}
