import crypto from 'node:crypto';
import { config } from './config';
import { get, run } from './db';
import { activateRewardsForBooking } from './rewards';

export const paymentsEnabled = () => !!config.paystackSecret;

const PAYSTACK = 'https://api.paystack.co';

async function paystack(path: string, init?: RequestInit) {
  const res = await fetch(PAYSTACK + path, {
    ...init,
    headers: { Authorization: `Bearer ${config.paystackSecret}`, 'Content-Type': 'application/json' },
  });
  const json = (await res.json()) as any;
  if (!res.ok || !json.status) throw new Error(json.message || `Paystack error ${res.status}`);
  return json.data;
}

export async function initializePayment(opts: {
  kind: 'booking' | 'order';
  targetId: string;
  amountNaira: number;
  email: string;
}): Promise<{ authorizationUrl: string; reference: string }> {
  const reference = `RB-${opts.kind[0].toUpperCase()}-${crypto.randomBytes(6).toString('hex')}`;
  const data = await paystack('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify({
      email: opts.email,
      amount: Math.round(opts.amountNaira * 100),
      currency: 'NGN',
      reference,
      callback_url: `${config.appUrl}/?pay_ref=${reference}`,
      metadata: { kind: opts.kind, targetId: opts.targetId },
    }),
  });
  run(
    'INSERT INTO payments(reference, kind, target_id, amount, created_at) VALUES(?,?,?,?,?)',
    reference,
    opts.kind,
    opts.targetId,
    opts.amountNaira,
    new Date().toISOString()
  );
  return { authorizationUrl: data.authorization_url, reference };
}

/** Confirms a reference with Paystack and marks the booking/order. Safe to call repeatedly. */
export async function settlePayment(reference: string): Promise<{ status: 'success' | 'pending' | 'failed'; kind?: string; targetId?: string }> {
  const payment = get<{ kind: string; target_id: string; amount: number; status: string }>(
    'SELECT * FROM payments WHERE reference = ?',
    reference
  );
  if (!payment) return { status: 'failed' };
  if (payment.status === 'success') return { status: 'success', kind: payment.kind, targetId: payment.target_id };

  const data = await paystack(`/transaction/verify/${encodeURIComponent(reference)}`);
  if (data.status === 'success' && data.amount >= payment.amount * 100) {
    run("UPDATE payments SET status = 'success' WHERE reference = ?", reference);
    if (payment.kind === 'booking') {
      run(
        "UPDATE bookings SET payment_status = 'paid', status = CASE WHEN status = 'pending' THEN 'confirmed' ELSE status END WHERE id = ?",
        payment.target_id
      );
      activateRewardsForBooking(payment.target_id);
    } else {
      run("UPDATE orders SET payment_status = 'paid' WHERE id = ?", payment.target_id);
    }
    return { status: 'success', kind: payment.kind, targetId: payment.target_id };
  }
  if (data.status === 'failed' || data.status === 'abandoned') {
    run("UPDATE payments SET status = 'failed' WHERE reference = ?", reference);
    return { status: 'failed' };
  }
  return { status: 'pending' };
}

export function validWebhookSignature(rawBody: Buffer, signature: string | undefined): boolean {
  if (!signature || !config.paystackSecret) return false;
  const expected = crypto.createHmac('sha512', config.paystackSecret).update(rawBody).digest('hex');
  return expected.length === signature.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
