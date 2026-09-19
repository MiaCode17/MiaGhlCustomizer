export interface RenamedMenuItem {
  originalLabel: string;
  newLabel: string;
}

export interface SettingsMenuItem {
  name: string;
  link: string;
}

export interface NavTreeItem {
  id: string;
  label: string;
  url?: string;
  parentId?: string;
  order: number;
}

export interface ToolCategoryTool {
  label: string;
  url: string;
}

export interface ToolCategory {
  name: string;
  tools: ToolCategoryTool[];
}

export interface MenuEdit {
  renamed: RenamedMenuItem[];
  hidden: string[];
  settingsMenuItems: SettingsMenuItem[];
  navTree: NavTreeItem[];
  toolCategories: ToolCategory[];
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
  settingsMenuItems: [],
  navTree: [],
  toolCategories: [],
};
