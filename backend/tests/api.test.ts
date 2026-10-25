import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createServer } from '../src/server';
import { clearDb, createTenant, startDb, stopDb } from './helpers';

const app = createServer();

beforeAll(startDb);
afterAll(stopDb);
beforeEach(clearDb);

const banner = { name: 'Sale', type: 'promo', position: 'top', enabled: true, content: 'Big sale' };

describe('health', () => {
  it('responds ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('security headers', () => {
  it('sets hardening headers but keeps resources loadable cross-origin', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['cross-origin-resource-policy']).toBe('cross-origin');
  });
});

describe('auth', () => {
  it('logs in with valid credentials and sets an httpOnly cookie', async () => {
    const t = await createTenant('Acme');
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'acme@example.com', password: t.password });
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('acme@example.com');
    expect(String(res.headers['set-cookie'])).toMatch(/HttpOnly/i);
    expect(JSON.stringify(res.body)).not.toMatch(/passwordHash/);
  });

  it('gives the same error for a wrong password and an unknown email', async () => {
    await createTenant('Acme');
    const bad = await request(app).post('/api/v1/auth/login').send({ email: 'acme@example.com', password: 'wrong' });
    const unknown = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@example.com', password: 'wrong' });
    expect(bad.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(bad.body).toEqual(unknown.body);
  });

  it('rejects malformed login bodies with 400', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email: 'not-an-email' });
    expect(res.status).toBe(400);
  });

  it('requires a session for /me', async () => {
    expect((await request(app).get('/api/v1/auth/me')).status).toBe(401);
    const t = await createTenant('Acme');
    const ok = await request(app).get('/api/v1/auth/me').set('Cookie', t.cookie);
    expect(ok.status).toBe(200);
  });

  it('rejects a garbage session cookie', async () => {
    const res = await request(app).get('/api/v1/auth/me').set('Cookie', 'customizer_token=garbage');
    expect(res.status).toBe(401);
  });
});

describe('banners API', () => {
  it('rejects unauthenticated access to every method', async () => {
    expect((await request(app).get('/api/v1/banners')).status).toBe(401);
    expect((await request(app).post('/api/v1/banners').send(banner)).status).toBe(401);
    expect((await request(app).put('/api/v1/banners/abc').send({})).status).toBe(401);
    expect((await request(app).delete('/api/v1/banners/abc')).status).toBe(401);
  });

  it('creates, lists, updates and deletes', async () => {
    const t = await createTenant('Acme');
    const created = await request(app).post('/api/v1/banners').set('Cookie', t.cookie).send(banner);
    expect(created.status).toBe(201);
    const id = created.body.banner._id;

    const list = await request(app).get('/api/v1/banners').set('Cookie', t.cookie);
    expect(list.body.banners).toHaveLength(1);

    const updated = await request(app).put(`/api/v1/banners/${id}`).set('Cookie', t.cookie).send({ content: 'New' });
    expect(updated.body.banner.content).toBe('New');

    expect((await request(app).delete(`/api/v1/banners/${id}`).set('Cookie', t.cookie)).status).toBe(204);
    expect((await request(app).delete(`/api/v1/banners/${id}`).set('Cookie', t.cookie)).status).toBe(404);
  });

  it('validates input', async () => {
    const t = await createTenant('Acme');
    const bad = await request(app).post('/api/v1/banners').set('Cookie', t.cookie).send({ ...banner, type: 'evil' });
    expect(bad.status).toBe(400);
    const empty = await request(app).post('/api/v1/banners').set('Cookie', t.cookie).send({ ...banner, content: '' });
    expect(empty.status).toBe(400);
  });
});

describe('tenant isolation', () => {
  it('never lets one company read, edit or delete the banners of another', async () => {
    const a = await createTenant('Alpha');
    const b = await createTenant('Beta');
    const created = await request(app).post('/api/v1/banners').set('Cookie', a.cookie).send(banner);
    const id = created.body.banner._id;

    const bList = await request(app).get('/api/v1/banners').set('Cookie', b.cookie);
    expect(bList.body.banners).toHaveLength(0);

    const bPut = await request(app).put(`/api/v1/banners/${id}`).set('Cookie', b.cookie).send({ content: 'hacked' });
    expect(bPut.status).toBe(404);

    const bDel = await request(app).delete(`/api/v1/banners/${id}`).set('Cookie', b.cookie);
    expect(bDel.status).toBe(404);

    const aList = await request(app).get('/api/v1/banners').set('Cookie', a.cookie);
    expect(aList.body.banners[0].content).toBe('Big sale');
  });
});
