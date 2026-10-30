import crypto from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';

describe('Paystack webhook signature', () => {
  it('accepts only a correct HMAC-SHA512 of the raw body', async () => {
    vi.stubEnv('PAYSTACK_SECRET_KEY', 'sk_test_secret');
    vi.stubEnv('DATA_DIR', '/tmp/rossy-payments-test');
    const { validWebhookSignature } = await import('./payments');

    const body = Buffer.from(JSON.stringify({ event: 'charge.success' }));
    const good = crypto.createHmac('sha512', 'sk_test_secret').update(body).digest('hex');

    expect(validWebhookSignature(body, good)).toBe(true);
    expect(validWebhookSignature(body, good.replace(/.$/, good.endsWith('0') ? '1' : '0'))).toBe(false);
    expect(validWebhookSignature(Buffer.from('tampered'), good)).toBe(false);
    expect(validWebhookSignature(body, undefined)).toBe(false);
  });
});
