import { Schema, model, Types } from 'mongoose';

export interface ConversationStyleDoc {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  groupId: string;
  enabled: boolean;
  agentBubbleColor: string;
  agentTextColor: string;
  contactBubbleColor: string;
  contactTextColor: string;
  fontFamily: string;
  bubbleRadius: number;
  showTimestamps: boolean;
  showAvatars: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const conversationStyleSchema = new Schema<ConversationStyleDoc>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    groupId: { type: String, default: '', index: true },
    enabled: { type: Boolean, default: false },
    agentBubbleColor: { type: String, default: '#7a1f2b' },
    agentTextColor: { type: String, default: '#ffffff' },
    contactBubbleColor: { type: String, default: '#f1f5f9' },
    contactTextColor: { type: String, default: '#0f172a' },
    fontFamily: { type: String, default: 'Inter' },
    bubbleRadius: { type: Number, default: 14 },
    showTimestamps: { type: Boolean, default: true },
    showAvatars: { type: Boolean, default: true },
  },
  { timestamps: true },
);

conversationStyleSchema.index({ companyId: 1, groupId: 1 }, { unique: true });

export const ConversationStyle = model<ConversationStyleDoc>(
  'ConversationStyle',
  conversationStyleSchema,
);
