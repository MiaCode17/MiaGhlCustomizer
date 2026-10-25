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

export interface ChatBubbleConfig {
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
}

export const emptyChatBubbleConfig: ChatBubbleConfig = {
  enabled: false,

  title: 'Chat with us',
  subtitle: '',
  logoUrl: '',
  statusText: 'Online',
  showStatus: true,
  statusColor: '#22c55e',
  agentName: 'Support',
  welcomeMessage: '',
  successMessage: '',
  errorMessage: '',
  inputPlaceholder: 'Type your message…',

  chatEnabled: true,
  quickReplies: [],
  quickActions: [],
  navTabs: [],
  hideNavTabs: false,
  hideInput: false,
  hideSendButton: false,

  gradientFrom: '#6366f1',
  gradientTo: '#8b5cf6',
  headerBgColor: '',
  headerTitleColor: '#ffffff',
  headerSubtitleColor: '#e0e7ff',
  visitorBubbleBg: '#4f46e5',
  visitorBubbleText: '#ffffff',
  agentBubbleBg: '#f3f4f6',
  agentBubbleText: '#111827',
  navBarBgColor: '#ffffff',
  navBarBorderColor: '#e5e7eb',
  navTabActiveColor: '#4f46e5',
  navTabInactiveColor: '#6b7280',
  navTabActiveBgColor: '#eef2ff',

  bubbleIcon: 'chat',
  bubbleSize: 60,
  bubbleTextColor: '#ffffff',
  side: 'right',
  sideOffset: 20,
  bottomOffset: 20,
  draggable: true,
  windowWidth: 380,
  windowHeight: 560,
};

/** Fills in fields an older saved configuration predates. */
export function normalizeChatBubbleConfig(loaded: Partial<ChatBubbleConfig> | null | undefined): ChatBubbleConfig {
  return { ...emptyChatBubbleConfig, ...(loaded ?? {}) };
}
