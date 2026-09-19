import { Schema, model, Types } from 'mongoose';

export interface BookACallDoc {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  groupId: string;
  enabled: boolean;
  buttonLabel: string;
  bookingUrl: string;
  backgroundColor: string;
  textColor: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookACallSchema = new Schema<BookACallDoc>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    groupId: { type: String, default: '', index: true },
    enabled: { type: Boolean, default: false },
    buttonLabel: { type: String, default: 'Book a Call' },
    bookingUrl: { type: String, default: '' },
    backgroundColor: { type: String, default: '#6366f1' },
    textColor: { type: String, default: '#ffffff' },
  },
  { timestamps: true },
);

bookACallSchema.index({ companyId: 1, groupId: 1 }, { unique: true });

export const BookACall = model<BookACallDoc>('BookACall', bookACallSchema);
