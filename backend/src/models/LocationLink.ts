import { Schema, model, Types } from 'mongoose';

export type LocationLinkOpenMode = 'new-tab' | 'modal' | 'drawer' | 'same-tab';

/** A sidebar link a sub-account's own users add for themselves (see the user-links runtime feature). */
export interface LocationLinkDoc {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  locationId: string;
  title: string;
  url: string;
  icon?: string;
  openMode: LocationLinkOpenMode;
  createdAt: Date;
  updatedAt: Date;
}

const locationLinkSchema = new Schema<LocationLinkDoc>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    locationId: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    icon: { type: String },
    openMode: { type: String, enum: ['new-tab', 'modal', 'drawer', 'same-tab'], default: 'new-tab' },
  },
  { timestamps: true },
);

locationLinkSchema.index({ companyId: 1, locationId: 1, createdAt: 1 });

export const LocationLink = model<LocationLinkDoc>('LocationLink', locationLinkSchema);
