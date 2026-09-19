export interface ChatBubbleQuickAction {
  label: string;
  url: string;
}

export interface ChatBubbleConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  gradientFrom: string;
  gradientTo: string;
  welcomeMessage: string;
  successMessage: string;
  errorMessage: string;
  quickActions: ChatBubbleQuickAction[];
}

export const emptyChatBubbleConfig: ChatBubbleConfig = {
  enabled: false,
  title: 'Chat with us',
  subtitle: '',
  gradientFrom: '#6366f1',
  gradientTo: '#8b5cf6',
  welcomeMessage: '',
  successMessage: '',
  errorMessage: '',
  quickActions: [],
};
