import { Schema, model, Types } from 'mongoose';

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

export interface MenuEditDoc {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  groupId: string;
  renamed: RenamedMenuItem[];
  hidden: string[];
  settingsMenuItems: SettingsMenuItem[];
  navTree: NavTreeItem[];
  toolCategories: ToolCategory[];
  createdAt: Date;
  updatedAt: Date;
}

const renamedMenuItemSchema = new Schema<RenamedMenuItem>(
  {
    originalLabel: { type: String, required: true },
    newLabel: { type: String, required: true },
  },
  { _id: false },
);

const settingsMenuItemSchema = new Schema<SettingsMenuItem>(
  {
    name: { type: String, required: true },
    link: { type: String, required: true },
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

const menuEditSchema = new Schema<MenuEditDoc>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    groupId: { type: String, default: '', index: true },
    renamed: { type: [renamedMenuItemSchema], default: [] },
    hidden: { type: [String], default: [] },
    settingsMenuItems: { type: [settingsMenuItemSchema], default: [] },
    navTree: { type: [navTreeItemSchema], default: [] },
    toolCategories: { type: [toolCategorySchema], default: [] },
  },
  { timestamps: true },
);

menuEditSchema.index({ companyId: 1, groupId: 1 }, { unique: true });

export const MenuEdit = model<MenuEditDoc>('MenuEdit', menuEditSchema);
