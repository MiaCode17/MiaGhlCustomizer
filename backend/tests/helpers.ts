import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Company } from '../src/models/Company';
import { User } from '../src/models/User';
import { AUTH_COOKIE_NAME, signAuthToken } from '../src/utils/jwt';

let mongod: MongoMemoryServer | undefined;

export async function startDb(): Promise<void> {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
}

export async function stopDb(): Promise<void> {
  await mongoose.disconnect();
  await mongod?.stop();
}

export async function clearDb(): Promise<void> {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
}

export async function createTenant(name: string, password = 'password123') {
  const company = await Company.create({ name });
  const user = await User.create({
    email: `${name.toLowerCase()}@example.com`,
    passwordHash: await bcrypt.hash(password, 4),
    companyId: company._id,
  });
  const token = signAuthToken({ userId: String(user._id), companyId: String(company._id) });
  return { company, user, password, cookie: `${AUTH_COOKIE_NAME}=${token}` };
}
