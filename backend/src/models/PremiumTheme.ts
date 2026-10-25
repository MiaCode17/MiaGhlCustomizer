import { Schema, model, Types } from 'mongoose';

export interface PremiumThemeData {
  name: string;
  style: string;
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  text: string;
  border: string;
  borderRadius: string;
  interfaceColors: Record<string, string>;
  texture: Record<string, Record<string, number>>;
  sidebarEffect: Record<string, unknown>;
}

/**
 * A premium (design-movement) theme for GHL's interface. It replaces the classic theme while
 * enabled. The theme itself is validated and completed by the API before it is stored.
 */
export interface PremiumThemeDoc {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  groupId: string;
  enabled: boolean;
  theme: PremiumThemeData | null;
  createdAt: Date;
  updatedAt: Date;
}

const premiumThemeSchema = new Schema<PremiumThemeDoc>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    groupId: { type: String, default: '', index: true },
    enabled: { type: Boolean, default: false },
    theme: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true },
);

premiumThemeSchema.index({ companyId: 1, groupId: 1 }, { unique: true });

export const PremiumTheme = model<PremiumThemeDoc>('PremiumTheme', premiumThemeSchema);
