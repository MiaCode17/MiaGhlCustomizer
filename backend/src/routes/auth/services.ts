import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import { HttpError } from '../../middleware/errorHandler';
import { User, UserDoc } from '../../models/User';

export async function login(email: string, password: string): Promise<UserDoc> {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new HttpError(401, 'Invalid email or password');
  }

  return user;
}

export async function getUserById(userId: Types.ObjectId): Promise<UserDoc> {
  const user = await User.findById(userId);
  if (!user) {
    throw new HttpError(401, 'Not authenticated');
  }
  return user;
}
