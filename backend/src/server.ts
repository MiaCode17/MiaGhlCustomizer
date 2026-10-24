import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { UPLOADS_DIR } from './middleware/upload';
import { apiRouter } from './routes';
import { cdnRouter, runtimeRouter } from './routes/runtime/routes';

// Slows password guessing: 10 attempts per 15 minutes per IP. Skipped under test.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, try again later' },
  skip: () => env.NODE_ENV === 'test',
});

export function createServer(): Express {
  const app = express();
  // Behind Render/other proxies, so req.protocol reflects https for the embed script's API base.
  app.set('trust proxy', 1);

  // Public runtime surface, called from inside GHL on each agency's own white-label domain,
  // so it gets open CORS and no cookies. Mounted before the credentialed CORS below.
  const publicCors = cors({ origin: '*', credentials: false });
  // Embed script, uploads and the runtime API are loaded cross-origin from agencies' portals,
  // so helmet's default same-origin resource policy has to be relaxed.
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use('/cdn', publicCors, cdnRouter);
  app.use('/api/v1/runtime', publicCors, runtimeRouter);

  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  app.use('/uploads', express.static(UPLOADS_DIR));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/v1/auth/login', loginLimiter);
  app.use('/api/v1', apiRouter);

  app.use(errorHandler);

  return app;
}
