import { Schema, model, Types } from 'mongoose';

export type LoaderType = 'spinner' | 'dots' | 'bar' | 'custom-image';

export interface LoaderConfigDoc {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  groupId: string;
  enabled: boolean;
  loaderType: LoaderType;
  customImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const loaderConfigSchema = new Schema<LoaderConfigDoc>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    groupId: { type: String, default: '', index: true },
    enabled: { type: Boolean, default: false },
    loaderType: { type: String, enum: ['spinner', 'dots', 'bar', 'custom-image'], default: 'spinner' },
    customImageUrl: { type: String },
  },
  { timestamps: true },
);

loaderConfigSchema.index({ companyId: 1, groupId: 1 }, { unique: true });

export const LoaderConfig = model<LoaderConfigDoc>('LoaderConfig', loaderConfigSchema);
