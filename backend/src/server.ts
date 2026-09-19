import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express } from 'express';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { UPLOADS_DIR } from './middleware/upload';
import { apiRouter } from './routes';

export function createServer(): Express {
  const app = express();

  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  app.use('/uploads', express.static(UPLOADS_DIR));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/v1', apiRouter);

  app.use(errorHandler);

  return app;
}
