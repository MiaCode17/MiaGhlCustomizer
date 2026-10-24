import crypto from 'crypto';
import { env } from '../config/env';

/**
 * Authenticated encryption (AES-256-GCM) for credentials stored in the database,
 * such as a company's GHL API token. The key comes from SECRETS_KEY, falling
 * back to JWT_SECRET; changing it makes previously stored secrets unreadable
 * (decryptSecret returns null and the credential must be re-entered).
 */
function key(): Buffer {
  return crypto.createHash('sha256').update(env.SECRETS_KEY ?? env.JWT_SECRET).digest();
}

export function encryptSecret(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const data = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((b) => b.toString('base64')).join('.');
}

export function decryptSecret(stored: string): string | null {
  try {
    const [iv, tag, data] = stored.split('.').map((p) => Buffer.from(p, 'base64'));
    const decipher = crypto.createDecipheriv('aes-256-gcm', key(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
  } catch {
    return null;
  }
}
