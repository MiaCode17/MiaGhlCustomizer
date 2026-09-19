import { Schema, model, Types } from 'mongoose';

export interface UserDoc {
  _id: Types.ObjectId;
  email: string;
  passwordHash: string;
  companyId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDoc>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  },
  { timestamps: true },
);

export const User = model<UserDoc>('User', userSchema);
