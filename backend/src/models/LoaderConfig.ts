import { Schema, model, Types } from 'mongoose';

export type LoaderType =
  | 'spinner'
  | 'dots'
  | 'bar'
  | 'pulse'
  | 'bars'
  | 'ring'
  | 'wave'
  | 'orbit'
  | 'grid'
  | 'custom-image';
export type LoaderSize = 'small' | 'medium' | 'large';

export interface SavedLoaderImage {
  name: string;
  url: string;
}

export interface LoaderConfigDoc {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  groupId: string;
  enabled: boolean;
  loaderType: LoaderType;
  customImageUrl?: string;
  /** Accent color of the built-in animations. */
  color: string;
  size: LoaderSize;
  /** Images the agency has uploaded, to switch between without uploading again. */
  library: SavedLoaderImage[];
  createdAt: Date;
  updatedAt: Date;
}

const loaderConfigSchema = new Schema<LoaderConfigDoc>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    groupId: { type: String, default: '', index: true },
    enabled: { type: Boolean, default: false },
    loaderType: {
      type: String,
      enum: ['spinner', 'dots', 'bar', 'pulse', 'bars', 'ring', 'wave', 'orbit', 'grid', 'custom-image'],
      default: 'spinner',
    },
    customImageUrl: { type: String },
    color: { type: String, default: '#4f46e5' },
    size: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
    library: { type: [{ name: { type: String, default: '' }, url: { type: String, default: '' }, _id: false }], default: [] },
  },
  { timestamps: true },
);

loaderConfigSchema.index({ companyId: 1, groupId: 1 }, { unique: true });

export const LoaderConfig = model<LoaderConfigDoc>('LoaderConfig', loaderConfigSchema);
