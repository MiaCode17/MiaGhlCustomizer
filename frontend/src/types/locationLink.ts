export type LocationLinkOpenMode = 'new-tab' | 'modal' | 'drawer' | 'same-tab';

/** A sidebar link a sub-account's own users added (read-only here; the agency can remove them). */
export interface LocationLink {
  _id: string;
  companyId: string;
  locationId: string;
  title: string;
  url: string;
  icon?: string;
  openMode: LocationLinkOpenMode;
  createdAt: string;
  updatedAt: string;
}
