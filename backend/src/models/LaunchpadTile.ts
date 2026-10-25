import { Schema, model, Types } from 'mongoose';

/**
 * GHL's Launchpad page lists setup tiles (connect chat, Google Business, Facebook, invite a user).
 * A tile here either adds a new tile ('custom') or restyles one of GHL's own ('native', identified
 * by the element id GHL gives it).
 */
export type LaunchpadTileKind = 'custom' | 'native';
export type LaunchpadOpenMode = 'modal' | 'drawer' | 'new-tab' | 'same-tab';

export const LAUNCHPAD_NATIVE_IDS = ['chat-connect', 'gmb-connect', 'fb-connect', 'invite-user'] as const;

export interface LaunchpadTileDoc {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  groupId: string;
  order: number;
  kind: LaunchpadTileKind;
  /** native tiles only: the id of GHL's tile element. */
  nativeId: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  /** Where the tile's button goes. Empty on a native tile keeps GHL's own action. */
  url: string;
  openMode: LaunchpadOpenMode;
  /** native tiles only: remove the tile from the page. */
  hidden: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const launchpadTileSchema = new Schema<LaunchpadTileDoc>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    groupId: { type: String, default: '', index: true },
    order: { type: Number, default: 0 },
    kind: { type: String, enum: ['custom', 'native'], default: 'custom' },
    nativeId: { type: String, default: '' },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    buttonText: { type: String, default: '' },
    url: { type: String, default: '' },
    openMode: { type: String, enum: ['modal', 'drawer', 'new-tab', 'same-tab'], default: 'new-tab' },
    hidden: { type: Boolean, default: false },
  },
  { timestamps: true },
);

launchpadTileSchema.index({ companyId: 1, groupId: 1, order: 1 });

export const LaunchpadTile = model<LaunchpadTileDoc>('LaunchpadTile', launchpadTileSchema);
