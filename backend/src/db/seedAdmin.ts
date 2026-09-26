import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { Company } from '../models/Company';
import { User } from '../models/User';

const DEFAULT_COMPANY_NAME = 'My Agency';

/**
 * Creates the first admin user (and the company they belong to) from
 * ADMIN_EMAIL/ADMIN_PASSWORD on first boot. No-op once any user exists.
 */
export async function ensureDefaultAdmin(): Promise<void> {
  const existingUser = await User.findOne();
  if (existingUser) return;

  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    console.warn(
      'No admin user exists yet. Set ADMIN_EMAIL and ADMIN_PASSWORD env vars and redeploy to create one.',
    );
    return;
  }

  let company = await Company.findOne();
  if (!company) {
    company = await Company.create({ name: DEFAULT_COMPANY_NAME });
  }

  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
  await User.create({ email: env.ADMIN_EMAIL.toLowerCase(), passwordHash, companyId: company._id });
  console.log(`Created initial admin user: ${env.ADMIN_EMAIL}`);
}
