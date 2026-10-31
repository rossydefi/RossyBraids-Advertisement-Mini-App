import { spawn, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const PORT = 3900 + Math.floor(Math.random() * 90);
const BASE = `http://localhost:${PORT}/api`;
let proc: ChildProcess;
let dataDir: string;

async function call(method: string, url: string, body?: unknown, token?: string) {
  const res = await fetch(BASE + url, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, body: (await res.json().catch(() => ({}))) as any };
}

/** A date `offset` days ahead that is not a Sunday (the salon's default closed day). */
function openDate(offset: number) {
  const d = new Date(Date.now() + offset * 86400_000);
  if (d.getUTCDay() === 0) d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

const booking = (over: Record<string, unknown> = {}) => ({
  serviceId: 'dreadlocks',
  addOnIds: ['addon-wash'],
  stylist: 'Rose Iyaji (Master Stylist & Founder)',
  date: openDate(5),
  timeSlot: '09:00 AM - Morning',
  clientName: 'Test Client',
  clientPhone: '08031112222',
  locationType: 'salon',
  ...over,
});

beforeAll(async () => {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rossy-test-'));
  proc = spawn('npx', ['tsx', '--import', './server/register-assets.mjs', 'server/index.ts'], {
    env: { ...process.env, PORT: String(PORT), DATA_DIR: dataDir, ADMIN_PASSWORD: 'test-pass', PAYSTACK_SECRET_KEY: '', TERMII_API_KEY: '', NODE_ENV: 'development' },
    stdio: 'ignore',
    detached: true, // own process group, so teardown can stop npx AND the tsx server it starts
  });
  for (let i = 0; i < 80; i++) {
    try {
      if ((await fetch(BASE + '/health')).ok) return;
    } catch {
      /* server still starting */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('server did not start');
});

afterAll(() => {
  try {
    if (proc?.pid) process.kill(-proc.pid, 'SIGKILL');
  } catch {
    proc?.kill('SIGKILL');
  }
  fs.rmSync(dataDir, { recursive: true, force: true });
});

describe('bookings', () => {
  it('recomputes the price on the server and ignores client totals', async () => {
    const r = await call('POST', '/bookings', booking({ totalPrice: 1, clientPhone: '08030000001', timeSlot: '11:00 AM - Mid-Day' }));
    expect(r.status).toBe(201);
    expect(r.body.booking.totalPrice).toBe(25000); // 20,000 dreadlocks base + 5,000 add-on
    expect(r.body.booking.status).toBe('pending');
  });

  it('rejects an unknown add-on and a bad date', async () => {
    expect((await call('POST', '/bookings', booking({ addOnIds: ['nope'] }))).status).toBe(400);
    expect((await call('POST', '/bookings', booking({ date: '2020-01-01' }))).status).toBe(400);
  });

  it('refuses a double booking of the same stylist and slot', async () => {
    const first = await call('POST', '/bookings', booking({ date: openDate(9), clientPhone: '08030000002' }));
    expect(first.status).toBe(201);
    const second = await call('POST', '/bookings', booking({ date: openDate(9), clientPhone: '08030000003' }));
    expect(second.status).toBe(409);
    const avail = await call('GET', `/availability?date=${openDate(9)}`);
    expect(avail.body.taken).toHaveLength(1);
  });

  it('rejects closed weekdays', async () => {
    const d = new Date(Date.now() + 14 * 86400_000);
    d.setUTCDate(d.getUTCDate() + ((7 - d.getUTCDay()) % 7));
    const r = await call('POST', '/bookings', booking({ date: d.toISOString().slice(0, 10) }));
    expect(r.status).toBe(409);
  });
});

describe('admin', () => {
  it('requires a password and a token', async () => {
    expect((await call('GET', '/admin/bookings')).status).toBe(401);
    expect((await call('POST', '/admin/login', { password: 'wrong' })).status).toBe(401);
    expect((await call('POST', '/admin/login', { password: 'test-pass' })).body.token).toBeTruthy();
  });

  it('can block a date so it can no longer be booked', async () => {
    const { token } = (await call('POST', '/admin/login', { password: 'test-pass' })).body;
    const date = openDate(20);
    expect((await call('PUT', '/admin/settings', { blockedDates: [date] }, token)).status).toBe(200);
    expect((await call('POST', '/bookings', booking({ date }))).status).toBe(409);
  });
});

describe('referral rewards', () => {
  it('only unlocks after confirmation, is bound to the phone, and works once', async () => {
    const profile = await call('POST', '/referrals/profile', { name: 'Ada', phone: '08040000001' });
    const code = profile.body.referralCode;
    expect(code).toMatch(/^ADA-/);

    const own = await call('POST', '/bookings', booking({ date: openDate(6), clientPhone: '08040000001', referralCode: code }));
    expect(own.body.referral.applied).toBe(false); // cannot refer yourself

    const b = await call('POST', '/bookings', booking({ date: openDate(7), clientPhone: '08040000002', referralCode: code }));
    expect(b.body.referral.applied).toBe(true);
    const rewardCode = b.body.reward.code;
    expect(b.body.reward.state).toBe('awaiting_confirmation');

    const wig = (await call('GET', '/config')).body.products.sort((x: any, y: any) => y.price - x.price)[0];
    const order = (phone: string) => ({ customerName: 'Buyer', customerPhone: phone, items: [{ productId: wig.id, quantity: 1 }], discountCode: rewardCode });

    expect((await call('POST', '/orders', order('08040000002'))).status).toBe(400); // not confirmed yet

    const { token } = (await call('POST', '/admin/login', { password: 'test-pass' })).body;
    await call('PATCH', `/admin/bookings/${b.body.booking.id}`, { status: 'confirmed' }, token);

    expect((await call('POST', '/orders', order('08049999999'))).status).toBe(400); // wrong phone
    const ok = await call('POST', '/orders', order('08040000002'));
    expect(ok.status).toBe(201);
    expect(ok.body.order.discount).toBe(Math.round(wig.price * 0.25));
    expect(ok.body.order.total).toBe(wig.price - ok.body.order.discount);
    expect((await call('POST', '/orders', order('08040000002'))).status).toBe(400); // already used
  });
});

describe('orders and stock', () => {
  it('uses server prices, honours admin price overrides and tracked stock', async () => {
    const { token } = (await call('POST', '/admin/login', { password: 'test-pass' })).body;
    const product = (await call('GET', '/config')).body.products.find((p: any) => p.price < 20000);
    await call('PUT', `/admin/products/${product.id}`, { price: 1234, stock: 2 }, token);
    const order = { customerName: 'B', customerPhone: '08050000001', items: [{ productId: product.id, quantity: 2 }] };
    const r = await call('POST', '/orders', { ...order, price: 1 });
    expect(r.body.order.total).toBe(2468);
    expect((await call('POST', '/orders', order)).status).toBe(409); // sold out now
  });
});

describe('client sign-in and reviews', () => {
  it('signs in with an OTP and lists only that phone\'s bookings', async () => {
    const otp = await call('POST', '/auth/otp/request', { phone: '08031112222' });
    expect(otp.body.devCode).toMatch(/^\d{6}$/);
    expect((await call('POST', '/auth/otp/verify', { phone: '08031112222', code: '000000' })).status).toBe(400);
    const { token } = (await call('POST', '/auth/otp/verify', { phone: '08031112222', code: otp.body.devCode })).body;
    const mine = await call('GET', '/me/bookings', undefined, token);
    expect(mine.status).toBe(200);
    expect(mine.body.every((b: any) => b.clientPhone === '08031112222')).toBe(true);
    expect((await call('GET', '/me/bookings')).status).toBe(401);
  });

  it('holds reviews until the owner approves them', async () => {
    await call('POST', '/reviews', { name: 'Zed', rating: 5, text: 'Wonderful braids, truly lovely!' });
    expect((await call('GET', '/reviews')).body).toHaveLength(0);
    const { token } = (await call('POST', '/admin/login', { password: 'test-pass' })).body;
    const pending = (await call('GET', '/admin/reviews?status=pending', undefined, token)).body;
    await call('PATCH', `/admin/reviews/${pending[0].id}`, { status: 'approved' }, token);
    expect((await call('GET', '/reviews')).body).toHaveLength(1);
  });
});

describe('gallery', () => {
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
  const upload = (type: string, token?: string) =>
    fetch(BASE + '/admin/gallery/media', { method: 'POST', headers: { 'Content-Type': type, ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: png });

  it('lets anyone read but only the owner change it', async () => {
    expect((await call('GET', '/gallery')).status).toBe(200);
    expect((await upload('image/png')).status).toBe(401);
    expect((await call('POST', '/admin/gallery', { title: 'x', mediaUrl: '/uploads/a.png' })).status).toBe(401);
    expect((await call('PATCH', '/admin/gallery/abc', { title: 'x' })).status).toBe(401);
    expect((await call('DELETE', '/admin/gallery/abc')).status).toBe(401);
  });

  it('uploads, lists, edits and deletes a style', async () => {
    const { token } = (await call('POST', '/admin/login', { password: 'test-pass' })).body;
    expect((await upload('image/svg+xml', token)).status).toBe(415);
    const up = await (await upload('image/png', token)).json();
    expect(up.url).toMatch(/^\/uploads\/.+\.png$/);

    const made = await call('POST', '/admin/gallery', { title: 'Boho braids', category: 'Boho Braids', tags: 'Knotless, Long', mediaUrl: up.url, serviceId: 'boho-braids' }, token);
    expect(made.status).toBe(201);
    expect(made.body.tags).toEqual(['knotless', 'long']);
    expect((await call('GET', '/gallery')).body).toHaveLength(1);
    expect((await fetch(`http://localhost:${PORT}${up.url}`)).status).toBe(200);

    const edited = await call('PATCH', `/admin/gallery/${made.body.id}`, { title: 'Boho braids (updated)', featured: true }, token);
    expect(edited.body.featured).toBe(true);
    expect((await call('POST', '/admin/gallery', { title: 'bad', mediaUrl: 'https://evil.example/x.png' }, token)).status).toBe(400);

    await call('DELETE', `/admin/gallery/${made.body.id}`, undefined, token);
    expect((await call('GET', '/gallery')).body).toHaveLength(0);
    await new Promise((r) => setTimeout(r, 200));
    // In development a missing file falls through to the Vite page, so check it is no longer the image.
    expect((await fetch(`http://localhost:${PORT}${up.url}`)).headers.get('content-type')).not.toContain('image/png');
  });
});

describe('shop products', () => {
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

  it('only the owner can add or change products', async () => {
    expect((await call('POST', '/admin/shop', { name: 'x' })).status).toBe(401);
    expect((await call('PATCH', '/admin/shop/abc', { price: 1 })).status).toBe(401);
    expect((await call('DELETE', '/admin/shop/abc')).status).toBe(401);
  });

  it('shows owner products to clients, prices them on the server and tracks stock', async () => {
    const { token } = (await call('POST', '/admin/login', { password: 'test-pass' })).body;
    const up = await (await fetch(BASE + '/admin/gallery/media', { method: 'POST', headers: { 'Content-Type': 'image/png', Authorization: `Bearer ${token}` }, body: png })).json();
    const made = await call('POST', '/admin/shop', { name: 'Argan serum', category: 'Serums & Oils', price: 7500, stock: 3, imageUrl: up.url, benefits: 'Shine\nSoftness' }, token);
    expect(made.status).toBe(201);
    expect((await call('POST', '/admin/shop', { name: 'bad', category: 'Nope', price: 1, imageUrl: up.url }, token)).status).toBe(400);

    const cfg = (await call('GET', '/config')).body;
    expect(cfg.catalog).toHaveLength(1);
    expect(cfg.catalog[0].benefits).toEqual(['Shine', 'Softness']);
    expect(cfg.products.map((p: any) => p.id)).toEqual([made.body.id]);

    const order = (q: number) => ({ customerName: 'Buyer', customerPhone: '08060000001', items: [{ productId: made.body.id, quantity: q }], price: 1 });
    const placed = await call('POST', '/orders', order(2));
    expect(placed.body.order.total).toBe(15000); // server price, client "price: 1" ignored
    expect((await call('POST', '/orders', order(2))).status).toBe(409); // only 1 left

    await call('PATCH', `/admin/shop/${made.body.id}`, { price: 9000 }, token);
    expect((await call('POST', '/orders', order(1))).body.order.total).toBe(9000);

    // cancelling puts stock back
    await call('PATCH', `/admin/orders/${placed.body.order.id}`, { status: 'cancelled' }, token);
    expect((await call('GET', '/admin/shop', undefined, token)).body[0].stock).toBe(2);

    await call('DELETE', `/admin/shop/${made.body.id}`, undefined, token);
    expect((await call('GET', '/config')).body.catalog).toBeUndefined();
  });
});
