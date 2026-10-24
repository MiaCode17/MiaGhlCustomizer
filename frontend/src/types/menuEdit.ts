/** Kinds of GHL user a menu entry can be limited to. */
export type RoleKey = 'agency_admins' | 'agency_users' | 'account_admins' | 'account_users';
export type RolePermissions = Record<RoleKey, boolean>;

export const ROLE_LABELS: Record<RoleKey, string> = {
  agency_admins: 'Agency admins',
  agency_users: 'Agency users',
  account_admins: 'Sub-account admins',
  account_users: 'Sub-account users',
};

export const ROLE_KEYS = Object.keys(ROLE_LABELS) as RoleKey[];

export function allRoles(): RolePermissions {
  return { agency_admins: true, agency_users: true, account_admins: true, account_users: true };
}

/** auto = relative links stay in GHL's tab, absolute links open in a new tab. */
export type MenuOpenMode = 'auto' | 'modal' | 'drawer' | 'new-tab' | 'same-tab';

export const MENU_OPEN_MODE_OPTIONS: { value: MenuOpenMode; label: string }[] = [
  { value: 'auto', label: 'Automatic' },
  { value: 'modal', label: 'Pop-up window' },
  { value: 'drawer', label: 'Side drawer' },
  { value: 'new-tab', label: 'New tab' },
  { value: 'same-tab', label: 'Same tab' },
];

export interface RenamedMenuItem {
  originalLabel: string;
  newLabel: string;
  /** Replaces the item's icon: an emoji or an image URL. */
  icon?: string;
}

/** Hides a native item only from the listed kinds of user. */
export interface RoleHiddenItem {
  label: string;
  roleKeys: RoleKey[];
}

/** Moves a native item next to another native item. */
export interface MovedMenuItem {
  label: string;
  position: 'before' | 'after';
  target: string;
}

export interface SettingsMenuItem {
  /** A link, or a section divider that only shows `name` as its heading. */
  type: 'link' | 'divider';
  name: string;
  link: string;
  openMode: MenuOpenMode;
}

export interface NavTreeItem {
  id: string;
  label: string;
  url?: string;
  parentId?: string;
  order: number;
  icon?: string;
  openMode: MenuOpenMode;
  permissions: RolePermissions;
}

export interface ToolCategoryTool {
  label: string;
  url: string;
}

export interface ToolCategory {
  name: string;
  tools: ToolCategoryTool[];
}

export type ExtendedTabPage =
  | 'opportunities'
  | 'marketing'
  | 'sites'
  | 'conversations'
  | 'calendars'
  | 'contacts'
  | 'custom';

export const EXTENDED_TAB_PAGE_OPTIONS: { value: ExtendedTabPage; label: string }[] = [
  { value: 'opportunities', label: 'Opportunities' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sites', label: 'Sites' },
  { value: 'conversations', label: 'Conversations' },
  { value: 'calendars', label: 'Calendars' },
  { value: 'contacts', label: 'Contacts' },
  { value: 'custom', label: 'Custom page…' },
];

/** An extra tab in the sub-navigation bar of a GHL page, showing a URL inside the page. */
export interface ExtendedTab {
  id: string;
  label: string;
  url: string;
  page: ExtendedTabPage;
  /** page = custom only: the tab shows on routes whose path contains this text. */
  routeContains?: string;
  /** page = custom only: the existing tab the new one is inserted after. */
  referenceSelector?: string;
  /** page = custom only: the element whose content the URL replaces while the tab is open. */
  containerSelector?: string;
  permissions: RolePermissions;
}

export interface MenuEdit {
  renamed: RenamedMenuItem[];
  hidden: string[];
  hiddenByRole: RoleHiddenItem[];
  moved: MovedMenuItem[];
  settingsMenuItems: SettingsMenuItem[];
  navTree: NavTreeItem[];
  toolCategories: ToolCategory[];
  extendedTabs: ExtendedTab[];
}

export const NATIVE_MENU_ITEMS = [
  'Dashboard',
  'Conversations',
  'Calendar',
  'Contacts',
  'Opportunities',
  'Payments',
  'Marketing',
  'Automation',
  'Sites',
  'Reputation',
  'Reporting',
  'App Marketplace',
] as const;

export const emptyMenuEdit: MenuEdit = {
  renamed: [],
  hidden: [],
  hiddenByRole: [],
  moved: [],
  settingsMenuItems: [],
  navTree: [],
  toolCategories: [],
  extendedTabs: [],
};

/** Fills in fields a stored configuration predates, so older saved data still loads. */
export function normalizeMenuEdit(loaded: Partial<MenuEdit> | null | undefined): MenuEdit {
  const m = loaded ?? {};
  return {
    renamed: m.renamed ?? [],
    hidden: m.hidden ?? [],
    hiddenByRole: m.hiddenByRole ?? [],
    moved: m.moved ?? [],
    settingsMenuItems: (m.settingsMenuItems ?? []).map((i) => ({
      type: i.type ?? 'link',
      name: i.name,
      link: i.link ?? '',
      openMode: i.openMode ?? 'auto',
    })),
    navTree: (m.navTree ?? []).map((n) => ({
      ...n,
      openMode: n.openMode ?? 'auto',
      permissions: { ...allRoles(), ...(n.permissions ?? {}) },
    })),
    toolCategories: m.toolCategories ?? [],
    extendedTabs: (m.extendedTabs ?? []).map((t) => ({
      ...t,
      permissions: { ...allRoles(), ...(t.permissions ?? {}) },
    })),
  };
}
