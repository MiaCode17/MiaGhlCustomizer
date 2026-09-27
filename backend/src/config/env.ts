import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(8080),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  // Admin frontend origin(s) allowed to call the API with the login cookie, comma-separated.
  // Defaults cover local Vite dev and the deployed admin site.
  CORS_ORIGIN: z
    .string()
    .default('http://localhost:5173,https://miaghlcustomizer-1.onrender.com')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim().replace(/\/+$/, ''))
        .filter(Boolean),
    ),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  // Public origin of this API as seen from GHL (e.g. https://cdn.example.com). Baked into the
  // embed script. Falls back to the request's own host when unset.
  PUBLIC_BASE_URL: z.string().url().optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
