import { Schema, model, Types } from 'mongoose';

export interface ChatBubbleQuickAction {
  label: string;
  url: string;
}

export interface ChatBubbleConfigDoc {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  groupId: string;
  enabled: boolean;
  title: string;
  subtitle: string;
  gradientFrom: string;
  gradientTo: string;
  welcomeMessage: string;
  successMessage: string;
  errorMessage: string;
  quickActions: ChatBubbleQuickAction[];
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

const chatBubbleConfigSchema = new Schema<ChatBubbleConfigDoc>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    groupId: { type: String, default: '', index: true },
    enabled: { type: Boolean, default: false },
    title: { type: String, default: 'Chat with us' },
    subtitle: { type: String, default: '' },
    gradientFrom: { type: String, default: '#6366f1' },
    gradientTo: { type: String, default: '#8b5cf6' },
    welcomeMessage: { type: String, default: '' },
    successMessage: { type: String, default: '' },
    errorMessage: { type: String, default: '' },
    quickActions: { type: [quickActionSchema], default: [] },
  },
  { timestamps: true },
);

chatBubbleConfigSchema.index({ companyId: 1, groupId: 1 }, { unique: true });

export const ChatBubbleConfig = model<ChatBubbleConfigDoc>('ChatBubbleConfig', chatBubbleConfigSchema);
