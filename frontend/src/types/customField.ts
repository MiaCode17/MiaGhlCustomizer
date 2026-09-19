export interface CustomFieldCampaign {
  _id: string;
  name: string;
  exposedFieldKeys: string[];
}

export interface CustomFieldCampaignInput {
  name: string;
  exposedFieldKeys: string[];
}

export const AVAILABLE_CUSTOM_FIELDS = [
  'contact.phone2',
  'contact.birthday',
  'contact.company_size',
  'contact.lead_source',
  'opportunity.close_probability',
  'opportunity.competitor',
  'contact.preferred_language',
  'contact.timezone',
] as const;
