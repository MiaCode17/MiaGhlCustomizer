import { Schema, model, Types } from 'mongoose';

/**
 * A subset of an agency's GHL locations that can receive its own customizer
 * settings. `saas-plan` groups match locations by the SaaS plan they are on
 * (and take priority over custom groups); `custom` groups are an arbitrary
 * agency-defined list of locations.
 *
 * Every group-aware feature stores `groupId = String(group._id)`; an empty
 * groupId means the company-wide default.
 */
export type GroupType = 'saas-plan' | 'custom';

export interface GroupDoc {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  name: string;
  type: GroupType;
  planIds: string[];
  locationIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

const groupSchema = new Schema<GroupDoc>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['saas-plan', 'custom'], required: true },
    planIds: { type: [String], default: [] },
    locationIds: { type: [String], default: [] },
  },
  { timestamps: true },
);

groupSchema.index({ companyId: 1, locationIds: 1 });
groupSchema.index({ companyId: 1, planIds: 1 });

export const Group = model<GroupDoc>('Group', groupSchema);
