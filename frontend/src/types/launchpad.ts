export type LaunchpadTileKind = 'custom' | 'native';
export type LaunchpadOpenMode = 'modal' | 'drawer' | 'new-tab' | 'same-tab';

/** GHL's own Launchpad tiles, by the element id GHL gives each. */
export const NATIVE_LAUNCHPAD_TILES: { id: string; label: string }[] = [
  { id: 'chat-connect', label: 'Chat widget (chat-connect)' },
  { id: 'gmb-connect', label: 'Google Business Profile (gmb-connect)' },
  { id: 'fb-connect', label: 'Facebook & Instagram (fb-connect)' },
  { id: 'invite-user', label: 'Invite a team member (invite-user)' },
];

export interface LaunchpadTile {
  _id: string;
  companyId: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface LaunchpadTileInput {
  order: number;
  kind: LaunchpadTileKind;
  nativeId: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  url: string;
  openMode: LaunchpadOpenMode;
  hidden: boolean;
}

export function emptyLaunchpadTile(kind: LaunchpadTileKind): LaunchpadTileInput {
  return {
    order: 0,
    kind,
    nativeId: kind === 'native' ? NATIVE_LAUNCHPAD_TILES[0].id : '',
    description: '',
    imageUrl: '',
    buttonText: '',
    url: '',
    openMode: 'new-tab',
    hidden: false,
  };
}
