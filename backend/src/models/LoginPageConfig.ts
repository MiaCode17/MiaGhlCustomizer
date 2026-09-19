import { Schema, model, Types } from 'mongoose';

export type LoginPagePreset = 'split-left' | 'split-right' | 'centered' | 'full-bleed';

export interface CssVariable {
  name: string;
  value: string;
}

export interface LoginPageConfigDoc {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  groupId: string;
  preset: LoginPagePreset;
  logoUrl?: string;
  backgroundImageUrl?: string;
  cssVariables: CssVariable[];
  customCss: string;
  createdAt: Date;
  updatedAt: Date;
}

const cssVariableSchema = new Schema<CssVariable>(
  {
    name: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false },
);

const loginPageConfigSchema = new Schema<LoginPageConfigDoc>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    groupId: { type: String, default: '', index: true },
    preset: {
      type: String,
      enum: ['split-left', 'split-right', 'centered', 'full-bleed'],
      default: 'centered',
    },
    logoUrl: { type: String },
    backgroundImageUrl: { type: String },
    cssVariables: { type: [cssVariableSchema], default: [] },
    customCss: { type: String, default: '' },
  },
  { timestamps: true },
);

loginPageConfigSchema.index({ companyId: 1, groupId: 1 }, { unique: true });

export const LoginPageConfig = model<LoginPageConfigDoc>(
  'LoginPageConfig',
  loginPageConfigSchema,
);
