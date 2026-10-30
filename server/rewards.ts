import crypto from 'node:crypto';
import { getMostExpensiveWig } from '../src/utils/referral';
import { all, get, run } from './db';
import { getProducts } from './catalog';

export const REWARD_PERCENT = 25;
export const REWARD_WINDOW_MS = 72 * 60 * 60 * 1000;

export interface RewardRow {
  code: string;
  recipient_type: 'referrer' | 'new_client';
  recipient_name: string;
  recipient_phone: string;
  booking_id: string;
  referral_code: string;
  product_id: string;
  discount_pct: number;
  created_at: string;
  activated_at: string | null;
  expires_at: string | null;
  used_at: string | null;
}

const suffix = () => crypto.randomBytes(3).toString('hex').toUpperCase();

export function generateReferralCode(name: string): string {
  const clean = name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'VIP';
  return `${clean}-${suffix().slice(0, 4)}`;
}

/** Creates the pair of 25%-off-flagship-wig rewards. They stay dormant until the booking is confirmed. */
export function issueRewardsForBooking(opts: {
  bookingId: string;
  referralCode: string;
  clientName: string;
  clientPhone: string;
  referrerName: string;
  referrerPhone: string;
}): { clientCode: string; referrerCode: string } {
  const wig = getMostExpensiveWig(getProducts());
  const now = new Date().toISOString();
  const insert = (type: 'new_client' | 'referrer', code: string, name: string, phone: string) =>
    run(
      `INSERT INTO rewards(code, recipient_type, recipient_name, recipient_phone, booking_id, referral_code, product_id, discount_pct, created_at)
       VALUES(?,?,?,?,?,?,?,?,?)`,
      code, type, name, phone, opts.bookingId, opts.referralCode, wig.id, REWARD_PERCENT, now
    );
  const clientCode = `REF-WELCOME-${suffix()}`;
  const referrerCode = `REF-REWARD-${suffix()}`;
  insert('new_client', clientCode, opts.clientName, opts.clientPhone);
  insert('referrer', referrerCode, opts.referrerName, opts.referrerPhone);
  return { clientCode, referrerCode };
}

/** Starts the 72-hour clock once the salon has confirmed (or the client has paid for) the booking. */
export function activateRewardsForBooking(bookingId: string): void {
  const now = Date.now();
  run(
    'UPDATE rewards SET activated_at = ?, expires_at = ? WHERE booking_id = ? AND activated_at IS NULL',
    new Date(now).toISOString(),
    new Date(now + REWARD_WINDOW_MS).toISOString(),
    bookingId
  );
}

export function rewardView(r: RewardRow) {
  const product = getProducts().find((p) => p.id === r.product_id);
  const price = product?.price ?? 0;
  return {
    code: r.code,
    recipientType: r.recipient_type,
    productId: r.product_id,
    productName: product?.name ?? 'Flagship wig',
    originalPrice: price,
    discountPercentage: r.discount_pct,
    discountAmount: Math.round((price * r.discount_pct) / 100),
    createdAt: r.created_at,
    activatedAt: r.activated_at,
    expiresAt: r.expires_at,
    usedAt: r.used_at,
    state: r.used_at ? 'used' : !r.activated_at ? 'awaiting_confirmation' : new Date(r.expires_at!) < new Date() ? 'expired' : 'active',
  };
}

export const rewardsForPhone = (phone: string) =>
  all<RewardRow>('SELECT * FROM rewards WHERE recipient_phone = ? ORDER BY created_at DESC', phone).map(rewardView);

export const findReward = (code: string) =>
  get<RewardRow>('SELECT * FROM rewards WHERE code = ?', code.trim().toUpperCase());
