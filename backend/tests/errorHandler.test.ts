import express from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { asyncHandler } from '../src/middleware/asyncHandler';
import { errorHandler, HttpError } from '../src/middleware/errorHandler';

function appThrowing(fn: () => unknown) {
  const app = express();
  app.get(
    '/',
    asyncHandler(async () => fn()),
  );
  app.use(errorHandler);
  return app;
}

describe('errorHandler', () => {
  it('maps HttpError to its status and message', async () => {
    const res = await request(
      appThrowing(() => {
        throw new HttpError(404, 'nope');
      }),
    ).get('/');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'nope' });
  });

  it('maps ZodError to 400 with field details', async () => {
    const res = await request(appThrowing(() => z.object({ a: z.string() }).parse({}))).get('/');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(res.body.details.a).toBeDefined();
  });

  it('hides internal error details behind a generic 500', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await request(
      appThrowing(() => {
        throw new Error('secret db detail');
      }),
    ).get('/');
    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain('secret');
    spy.mockRestore();
  });
});
