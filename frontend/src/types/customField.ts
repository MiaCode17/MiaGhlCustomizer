export type CustomFieldMode = 'lock' | 'hide';

export interface CustomFieldCampaign {
  _id: string;
  name: string;
  /** Field keys the campaign acts on (named for the original "exposed fields" idea). */
  exposedFieldKeys: string[];
  /** lock = visible but read-only; hide = removed from the page. */
  mode: CustomFieldMode;
}

export interface CustomFieldCampaignInput {
  name: string;
  exposedFieldKeys: string[];
  mode: CustomFieldMode;
}

/** Suggestions only: any field key from the GHL location can be typed in. */
export const SUGGESTED_CUSTOM_FIELDS = [
  'contact.phone2',
  'contact.birthday',
  'contact.company_size',
  'contact.lead_source',
  'opportunity.close_probability',
  'opportunity.competitor',
  'contact.preferred_language',
  'contact.timezone',
] as const;
