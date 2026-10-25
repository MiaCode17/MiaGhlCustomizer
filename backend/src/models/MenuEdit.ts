import { Schema, model, Types } from 'mongoose';

/** Permission keys for GHL users: agency/sub-account crossed with admin/user. */
export type RoleKey = 'agency_admins' | 'agency_users' | 'account_admins' | 'account_users';
export const ROLE_KEYS: RoleKey[] = ['agency_admins', 'agency_users', 'account_admins', 'account_users'];

export type MenuOpenMode = 'auto' | 'modal' | 'drawer' | 'new-tab' | 'same-tab';
const MENU_OPEN_MODES = ['auto', 'modal', 'drawer', 'new-tab', 'same-tab'];

export type RolePermissions = Record<RoleKey, boolean>;

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
const EXTENDED_TAB_PAGES = [
  'opportunities',
  'marketing',
  'sites',
  'conversations',
  'calendars',
  'contacts',
  'custom',
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

export interface MenuEditDoc {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  groupId: string;
  renamed: RenamedMenuItem[];
  hidden: string[];
  hiddenByRole: RoleHiddenItem[];
  moved: MovedMenuItem[];
  settingsMenuItems: SettingsMenuItem[];
  navTree: NavTreeItem[];
  toolCategories: ToolCategory[];
  extendedTabs: ExtendedTab[];
  createdAt: Date;
  updatedAt: Date;
}

const permissionsSchema = new Schema<RolePermissions>(
  {
    agency_admins: { type: Boolean, default: true },
    agency_users: { type: Boolean, default: true },
    account_admins: { type: Boolean, default: true },
    account_users: { type: Boolean, default: true },
  },
  { _id: false },
);

const renamedMenuItemSchema = new Schema<RenamedMenuItem>(
  {
    originalLabel: { type: String, required: true },
    newLabel: { type: String, required: true },
    icon: { type: String },
  },
  { _id: false },
);

const roleHiddenItemSchema = new Schema<RoleHiddenItem>(
  {
    label: { type: String, required: true },
    roleKeys: { type: [String], enum: ROLE_KEYS, default: [] },
  },
  { _id: false },
);

const movedMenuItemSchema = new Schema<MovedMenuItem>(
  {
    label: { type: String, required: true },
    position: { type: String, enum: ['before', 'after'], default: 'after' },
    target: { type: String, required: true },
  },
  { _id: false },
);

const settingsMenuItemSchema = new Schema<SettingsMenuItem>(
  {
    type: { type: String, enum: ['link', 'divider'], default: 'link' },
    name: { type: String, required: true },
    link: { type: String, default: '' },
    openMode: { type: String, enum: MENU_OPEN_MODES, default: 'auto' },
  },
  { _id: false },
);

const navTreeItemSchema = new Schema<NavTreeItem>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    url: { type: String },
    parentId: { type: String },
    order: { type: Number, required: true },
    icon: { type: String },
    openMode: { type: String, enum: MENU_OPEN_MODES, default: 'auto' },
    permissions: { type: permissionsSchema, default: () => ({}) },
  },
  { _id: false },
);

const toolCategoryToolSchema = new Schema<ToolCategoryTool>(
  {
    label: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false },
);

const toolCategorySchema = new Schema<ToolCategory>(
  {
    name: { type: String, required: true },
    tools: { type: [toolCategoryToolSchema], default: [] },
  },
  { _id: false },
);

const extendedTabSchema = new Schema<ExtendedTab>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    url: { type: String, required: true },
    page: { type: String, enum: EXTENDED_TAB_PAGES, required: true },
    routeContains: { type: String },
    referenceSelector: { type: String },
    containerSelector: { type: String },
    permissions: { type: permissionsSchema, default: () => ({}) },
  },
  { _id: false },
);

const menuEditSchema = new Schema<MenuEditDoc>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    groupId: { type: String, default: '', index: true },
    renamed: { type: [renamedMenuItemSchema], default: [] },
    hidden: { type: [String], default: [] },
    hiddenByRole: { type: [roleHiddenItemSchema], default: [] },
    moved: { type: [movedMenuItemSchema], default: [] },
    settingsMenuItems: { type: [settingsMenuItemSchema], default: [] },
    navTree: { type: [navTreeItemSchema], default: [] },
    toolCategories: { type: [toolCategorySchema], default: [] },
    extendedTabs: { type: [extendedTabSchema], default: [] },
  },
  { timestamps: true },
);

menuEditSchema.index({ companyId: 1, groupId: 1 }, { unique: true });

export const MenuEdit = model<MenuEditDoc>('MenuEdit', menuEditSchema);
