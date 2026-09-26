export interface ConversationStyleConfig {
  enabled: boolean;
  agentBubbleColor: string;
  agentTextColor: string;
  contactBubbleColor: string;
  contactTextColor: string;
  fontFamily: string;
  bubbleRadius: number;
  showTimestamps: boolean;
  showAvatars: boolean;
}

export const emptyConversationStyle: ConversationStyleConfig = {
  enabled: false,
  agentBubbleColor: '#7a1f2b',
  agentTextColor: '#ffffff',
  contactBubbleColor: '#f1f5f9',
  contactTextColor: '#0f172a',
  fontFamily: 'Inter',
  bubbleRadius: 14,
  showTimestamps: true,
  showAvatars: true,
};
