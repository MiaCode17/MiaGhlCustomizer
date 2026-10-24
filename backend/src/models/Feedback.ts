import { Schema, model, Types } from 'mongoose';

export type FeedbackRatingType = 'stars' | 'ten' | 'emoji';
export type FeedbackCommentMode = 'off' | 'optional' | 'required';
export type FeedbackPlacement = 'right' | 'left' | 'bottom-right' | 'bottom-left' | 'header';

/** Options for the popup shown when someone cancels their subscription in GHL. */
export interface CancelFlowConfig {
  enabled: boolean;
  /** true = they must pick a reason (or write one) before the cancellation goes through. */
  required: boolean;
  title: string;
  message: string;
  reasons: string[];
  commentPlaceholder: string;
}

export interface FeedbackConfigDoc {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  groupId: string;
  /** The floating "Feedback" button with a rating. */
  enabled: boolean;
  ratingType: FeedbackRatingType;
  buttonText: string;
  icon: string;
  placement: FeedbackPlacement;
  backgroundColor: string;
  textColor: string;
  /** The question above the rating. */
  title: string;
  commentMode: FeedbackCommentMode;
  commentPlaceholder: string;
  thanksMessage: string;
  /** After sending feedback, hide the button for this many hours (0 = never hide it). */
  cooldownHours: number;
  draggable: boolean;
  /** Ask for a rating when a support chat ends. */
  askAfterChat: boolean;
  cancel: CancelFlowConfig;
  createdAt: Date;
  updatedAt: Date;
}

/** What the cancellation popup offers until the agency writes its own list. */
export const DEFAULT_CANCEL_REASONS = [
  'Too expensive',
  'Missing features I need',
  'Switching to a different tool',
  'Not using it enough',
  'Technical issues or bugs',
  'Other',
];

const cancelSchema = new Schema<CancelFlowConfig>(
  {
    enabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    title: { type: String, default: 'Before you go…' },
    message: { type: String, default: 'Help us understand why you are cancelling.' },
    reasons: { type: [String], default: () => [...DEFAULT_CANCEL_REASONS] },
    commentPlaceholder: { type: String, default: 'Anything else you would like to share? (optional)' },
  },
  { _id: false },
);

const feedbackConfigSchema = new Schema<FeedbackConfigDoc>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    groupId: { type: String, default: '', index: true },
    enabled: { type: Boolean, default: false },
    ratingType: { type: String, enum: ['stars', 'ten', 'emoji'], default: 'stars' },
    buttonText: { type: String, default: 'Feedback' },
    icon: { type: String, default: 'star' },
    placement: { type: String, enum: ['right', 'left', 'bottom-right', 'bottom-left', 'header'], default: 'right' },
    backgroundColor: { type: String, default: '#4f46e5' },
    textColor: { type: String, default: '#ffffff' },
    title: { type: String, default: 'How was your experience?' },
    commentMode: { type: String, enum: ['off', 'optional', 'required'], default: 'optional' },
    commentPlaceholder: { type: String, default: 'Tell us more (optional)' },
    thanksMessage: { type: String, default: 'Thank you for your feedback!' },
    cooldownHours: { type: Number, default: 24, min: 0, max: 720 },
    draggable: { type: Boolean, default: false },
    askAfterChat: { type: Boolean, default: false },
    cancel: { type: cancelSchema, default: () => ({}) },
  },
  { timestamps: true },
);

feedbackConfigSchema.index({ companyId: 1, groupId: 1 }, { unique: true });

export const FeedbackConfig = model<FeedbackConfigDoc>('FeedbackConfig', feedbackConfigSchema);

export type FeedbackKind = 'rating' | 'chat' | 'cancellation';

export interface FeedbackResponseDoc {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  locationId: string;
  kind: FeedbackKind;
  ratingType: FeedbackRatingType | null;
  /** stars 1-5, ten 1-10, emoji 1-5 (very unhappy to very happy); null for cancellations. */
  rating: number | null;
  comment: string;
  /** Cancellation reasons the person ticked. */
  reasons: string[];
  userName: string;
  userEmail: string;
  /** The GHL user id the browser reported. Informational only: it is not verified. */
  userId: string;
  /** The support chat this rates (kind = chat). */
  ticketId: Types.ObjectId | null;
  createdAt: Date;
}

const feedbackResponseSchema = new Schema<FeedbackResponseDoc>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    locationId: { type: String, default: '' },
    kind: { type: String, enum: ['rating', 'chat', 'cancellation'], required: true },
    ratingType: { type: String, enum: ['stars', 'ten', 'emoji', null], default: null },
    rating: { type: Number, default: null },
    comment: { type: String, default: '' },
    reasons: { type: [String], default: [] },
    userName: { type: String, default: '' },
    userEmail: { type: String, default: '' },
    userId: { type: String, default: '' },
    ticketId: { type: Schema.Types.ObjectId, ref: 'SupportTicket', default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

feedbackResponseSchema.index({ companyId: 1, createdAt: -1 });
feedbackResponseSchema.index({ companyId: 1, kind: 1, createdAt: -1 });
feedbackResponseSchema.index({ ticketId: 1 }, { sparse: true });

export const FeedbackResponse = model<FeedbackResponseDoc>('FeedbackResponse', feedbackResponseSchema);
