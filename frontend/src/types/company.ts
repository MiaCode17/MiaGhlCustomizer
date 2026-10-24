export interface Company {
  id: string;
  name: string;
  /** The agency's GHL company ID; '' when not linked yet. */
  ghlCompanyId: string;
  /** Whether a GHL API token is stored. The token itself is write-only and never returned. */
  hasGhlApiToken: boolean;
}

export interface CompanyUpdateInput {
  name?: string;
  ghlCompanyId?: string;
}
