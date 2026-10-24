export type FeedbackRatingType = 'stars' | 'ten' | 'emoji';
export type FeedbackCommentMode = 'off' | 'optional' | 'required';
export type FeedbackPlacement = 'right' | 'left' | 'bottom-right' | 'bottom-left' | 'header';
export type FeedbackKind = 'rating' | 'chat' | 'cancellation';

export interface CancelFlowConfig {
  enabled: boolean;
  required: boolean;
  title: string;
  message: string;
  reasons: string[];
  commentPlaceholder: string;
}

export interface FeedbackConfig {
  enabled: boolean;
  ratingType: FeedbackRatingType;
  buttonText: string;
  icon: string;
  placement: FeedbackPlacement;
  backgroundColor: string;
  textColor: string;
  title: string;
  commentMode: FeedbackCommentMode;
  commentPlaceholder: string;
  thanksMessage: string;
  cooldownHours: number;
  draggable: boolean;
  askAfterChat: boolean;
  cancel: CancelFlowConfig;
}

export const DEFAULT_CANCEL_REASONS = [
  'Too expensive',
  'Missing features I need',
  'Switching to a different tool',
  'Not using it enough',
  'Technical issues or bugs',
  'Other',
];

export const emptyFeedbackConfig: FeedbackConfig = {
  enabled: false,
  ratingType: 'stars',
  buttonText: 'Feedback',
  icon: 'star',
  placement: 'right',
  backgroundColor: '#4f46e5',
  textColor: '#ffffff',
  title: 'How was your experience?',
  commentMode: 'optional',
  commentPlaceholder: 'Tell us more (optional)',
  thanksMessage: 'Thank you for your feedback!',
  cooldownHours: 24,
  draggable: false,
  askAfterChat: false,
  cancel: {
    enabled: false,
    required: false,
    title: 'Before you go…',
    message: 'Help us understand why you are cancelling.',
    reasons: [...DEFAULT_CANCEL_REASONS],
    commentPlaceholder: 'Anything else you would like to share? (optional)',
  },
};

export function normalizeFeedbackConfig(c: Partial<FeedbackConfig> | null | undefined): FeedbackConfig {
  return {
    ...emptyFeedbackConfig,
    ...(c ?? {}),
    cancel: { ...emptyFeedbackConfig.cancel, ...(c?.cancel ?? {}) },
  };
}

export interface FeedbackResponse {
  id: string;
  kind: FeedbackKind;
  ratingType: FeedbackRatingType | null;
  rating: number | null;
  comment: string;
  reasons: string[];
  userName: string;
  userEmail: string;
  locationId: string;
  ticketId: string | null;
  createdAt: string;
}

export interface FeedbackStats {
  total: number;
  rating: { count: number; average: number | null; distribution: number[] };
  chat: { count: number; average: number | null };
  cancellation: { count: number; reasons: { reason: string; count: number }[] };
  byDay: { date: string; count: number }[];
}

export interface FeedbackFilters {
  kind: FeedbackKind | 'all';
  minRating?: number;
  maxRating?: number;
  search?: string;
  from?: string;
  to?: string;
}
