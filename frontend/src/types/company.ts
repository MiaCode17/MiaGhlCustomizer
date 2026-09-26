export interface Company {
  id: string;
  name: string;
  /** The agency's GHL company ID; '' when not linked yet. */
  ghlCompanyId: string;
}

export interface CompanyUpdateInput {
  name?: string;
  ghlCompanyId?: string;
}
