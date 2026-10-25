import { Schema, model, Types } from 'mongoose';

export interface CompanyDoc {
  _id: Types.ObjectId;
  name: string;
  /**
   * The agency's own GHL company ID (e.g. "zyvKWkiBNLlwzBcEAEyM"). The embed script and
   * runtime API accept it in place of our internal _id, so the install snippet uses the ID
   * agencies already know from GHL.
   */
  ghlCompanyId?: string;
  /**
   * A GHL Private Integration token (encrypted, never serialized to the client). Lets the
   * server read data the browser can't, such as a location's unread conversation count.
   */
  ghlApiTokenEnc?: string;
  /** Mirrors whether ghlApiTokenEnc is set, so it can be reported without selecting the secret. */
  hasGhlApiToken: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<CompanyDoc>(
  {
    name: { type: String, required: true, trim: true },
    ghlCompanyId: { type: String, trim: true },
    ghlApiTokenEnc: { type: String, select: false },
    hasGhlApiToken: { type: Boolean, default: false },
  },
  { timestamps: true },
);

companySchema.index({ ghlCompanyId: 1 }, { unique: true, sparse: true });

export const Company = model<CompanyDoc>('Company', companySchema);
