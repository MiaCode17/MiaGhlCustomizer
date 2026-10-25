import { Schema, model, Types } from 'mongoose';

export interface ChatBubbleQuickAction {
  label: string;
  url: string;
}

/** An extra tab in the chat window that shows a page (help center, bookings, ...). */
export interface ChatBubbleNavTab {
  label: string;
  url: string;
  /** A built-in icon name, an emoji or an image URL. */
  icon?: string;
  enabled: boolean;
}

export type ChatBubbleSide = 'right' | 'left';

export interface ChatBubbleConfigDoc {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  groupId: string;
  enabled: boolean;

  /* Window header and copy */
  title: string;
  subtitle: string;
  logoUrl: string;
  statusText: string;
  showStatus: boolean;
  statusColor: string;
  /** Name shown on replies from your team. */
  agentName: string;
  welcomeMessage: string;
  successMessage: string;
  errorMessage: string;
  inputPlaceholder: string;

  /* Behaviour */
  /** false = a link-only launcher: no live chat, just the tabs and quick links. */
  chatEnabled: boolean;
  /** Buttons under the welcome message that send their text as the first chat message. */
  quickReplies: string[];
  /** Buttons under the welcome message that open a link. */
  quickActions: ChatBubbleQuickAction[];
  navTabs: ChatBubbleNavTab[];
  hideNavTabs: boolean;
  hideInput: boolean;
  hideSendButton: boolean;

  /* Colors */
  gradientFrom: string;
  gradientTo: string;
  /** A solid header color; empty uses the gradient. */
  headerBgColor: string;
  headerTitleColor: string;
  headerSubtitleColor: string;
  visitorBubbleBg: string;
  visitorBubbleText: string;
  agentBubbleBg: string;
  agentBubbleText: string;
  navBarBgColor: string;
  navBarBorderColor: string;
  navTabActiveColor: string;
  navTabInactiveColor: string;
  navTabActiveBgColor: string;

  /* Launcher and window geometry */
  bubbleIcon: string;
  bubbleSize: number;
  bubbleTextColor: string;
  side: ChatBubbleSide;
  sideOffset: number;
  bottomOffset: number;
  /** Viewers may drag the launcher; it snaps to the left or right edge. */
  draggable: boolean;
  windowWidth: number;
  windowHeight: number;

  createdAt: Date;
  updatedAt: Date;
}

const quickActionSchema = new Schema<ChatBubbleQuickAction>(
  {
    label: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false },
);

const navTabSchema = new Schema<ChatBubbleNavTab>(
  {
    label: { type: String, required: true },
    url: { type: String, required: true },
    icon: { type: String },
    enabled: { type: Boolean, default: true },
  },
  { _id: false },
);

const chatBubbleConfigSchema = new Schema<ChatBubbleConfigDoc>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    groupId: { type: String, default: '', index: true },
    enabled: { type: Boolean, default: false },

    title: { type: String, default: 'Chat with us' },
    subtitle: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    statusText: { type: String, default: 'Online' },
    showStatus: { type: Boolean, default: true },
    statusColor: { type: String, default: '#22c55e' },
    agentName: { type: String, default: 'Support' },
    welcomeMessage: { type: String, default: '' },
    successMessage: { type: String, default: '' },
    errorMessage: { type: String, default: '' },
    inputPlaceholder: { type: String, default: 'Type your message…' },

    chatEnabled: { type: Boolean, default: true },
    quickReplies: { type: [String], default: [] },
    quickActions: { type: [quickActionSchema], default: [] },
    navTabs: { type: [navTabSchema], default: [] },
    hideNavTabs: { type: Boolean, default: false },
    hideInput: { type: Boolean, default: false },
    hideSendButton: { type: Boolean, default: false },

    gradientFrom: { type: String, default: '#6366f1' },
    gradientTo: { type: String, default: '#8b5cf6' },
    headerBgColor: { type: String, default: '' },
    headerTitleColor: { type: String, default: '#ffffff' },
    headerSubtitleColor: { type: String, default: '#e0e7ff' },
    visitorBubbleBg: { type: String, default: '#4f46e5' },
    visitorBubbleText: { type: String, default: '#ffffff' },
    agentBubbleBg: { type: String, default: '#f3f4f6' },
    agentBubbleText: { type: String, default: '#111827' },
    navBarBgColor: { type: String, default: '#ffffff' },
    navBarBorderColor: { type: String, default: '#e5e7eb' },
    navTabActiveColor: { type: String, default: '#4f46e5' },
    navTabInactiveColor: { type: String, default: '#6b7280' },
    navTabActiveBgColor: { type: String, default: '#eef2ff' },

    bubbleIcon: { type: String, default: 'chat' },
    bubbleSize: { type: Number, default: 60, min: 40, max: 96 },
    bubbleTextColor: { type: String, default: '#ffffff' },
    side: { type: String, enum: ['right', 'left'], default: 'right' },
    sideOffset: { type: Number, default: 20, min: 0, max: 400 },
    bottomOffset: { type: Number, default: 20, min: 0, max: 600 },
    draggable: { type: Boolean, default: true },
    windowWidth: { type: Number, default: 380, min: 300, max: 640 },
    windowHeight: { type: Number, default: 560, min: 360, max: 900 },
  },
  { timestamps: true },
);

chatBubbleConfigSchema.index({ companyId: 1, groupId: 1 }, { unique: true });

export const ChatBubbleConfig = model<ChatBubbleConfigDoc>('ChatBubbleConfig', chatBubbleConfigSchema);
