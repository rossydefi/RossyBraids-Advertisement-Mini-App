import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express, { Router } from 'express';
import { ADD_ONS_DATA, LOCATION_TIERS, SERVICES_DATA, STYLISTS, TIME_SLOTS } from '../src/data/flyerData';
import { computeBookingPrice } from '../src/utils/pricing';
import { hashOtp, normalizePhone, rateLimit, requireClient, signToken } from './auth';
import { getProducts } from './catalog';
import { config } from './config';
import { all, get, getSettings, run, setSetting, transaction } from './db';
import { notifyOwner, sendSms } from './notify';
import { initializePayment, paymentsEnabled, settlePayment, validWebhookSignature } from './payments';
import { findReward, generateReferralCode, issueRewardsForBooking, rewardsForPhone, rewardView, type RewardRow } from './rewards';
import { HttpError, isIsoDate, lagosToday, str } from './util';

export const api = Router();

/* ----------------------------------------------------------------- views */

export function bookingView(row: any) {
  return {
    ...JSON.parse(row.data),
    id: row.id,
    status: row.status,
    date: row.date,
    timeSlot: row.time_slot,
    stylist: row.stylist,
    totalPrice: row.total_price,
    depositAmount: row.deposit_amount,
    paymentStatus: row.payment_status,
  };
}

export function orderView(row: any) {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    deliveryAddress: row.delivery_address,
    items: JSON.parse(row.items),
    subtotal: row.subtotal,
    discount: row.discount,
    discountCode: row.discount_code,
    total: row.total,
    status: row.status,
    paymentStatus: row.payment_status,
    createdAt: row.created_at,
  };
}

/* ---------------------------------------------------------------- public */

api.get('/health', (_req, res) => res.json({ ok: true }));

api.get('/config', (_req, res) => {
  const s = getSettings();
  res.json({
    closedWeekdays: s.closedWeekdays,
    blockedDates: s.blockedDates.filter((d) => d >= lagosToday()),
    banner: s.banner,
    openingHours: s.openingHours,
    address: s.address,
    mapUrl: s.mapUrl,
    depositPercent: s.depositPercent,
    requireDeposit: s.requireDeposit && paymentsEnabled(),
    paymentsEnabled: paymentsEnabled(),
    products: getProducts().map((p) => ({ id: p.id, price: p.price, formattedPrice: p.formattedPrice, inStock: p.inStock })),
  });
});

function dayStatus(date: string): { closed: boolean; reason?: string } {
  const s = getSettings();
  if (s.blockedDates.includes(date)) return { closed: true, reason: 'The salon is not taking bookings on this date.' };
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
  if (s.closedWeekdays.includes(weekday)) return { closed: true, reason: 'The salon is closed on this day of the week.' };
  const count = get<{ n: number }>("SELECT COUNT(*) AS n FROM bookings WHERE date = ? AND status != 'cancelled'", date)!.n;
  if (count >= s.maxBookingsPerDay) return { closed: true, reason: 'This day is fully booked.' };
  return { closed: false };
}

api.get('/availability', (req, res) => {
  const date = str(req.query.date, 10);
  if (!isIsoDate(date)) throw new HttpError(400, 'A valid date (YYYY-MM-DD) is required');
  const taken = all<{ time_slot: string; stylist: string }>(
    "SELECT time_slot, stylist FROM bookings WHERE date = ? AND status != 'cancelled'",
    date
  );
  res.json({ date, ...dayStatus(date), taken: taken.map((t) => ({ timeSlot: t.time_slot, stylist: t.stylist })) });
});

/* -------------------------------------------------------------- bookings */

const INSPO_TYPES: Record<string, string> = {
  'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif',
  'video/mp4': 'mp4', 'video/quicktime': 'mov', 'video/webm': 'webm',
};

function saveInspo(inspo: any) {
  const match = /^data:([\w/+.-]+);base64,(.+)$/s.exec(typeof inspo?.dataUrl === 'string' ? inspo.dataUrl : '');
  const ext = match && INSPO_TYPES[match[1]];
  if (!match || !ext) throw new HttpError(400, 'Unsupported inspiration file type');
  const file = `${crypto.randomUUID()}.${ext}`;
  fs.writeFileSync(path.join(config.uploadsDir, file), Buffer.from(match[2], 'base64'));
  return {
    type: match[1].startsWith('video') ? 'video' : 'image',
    dataUrl: `/uploads/${file}`,
    fileName: str(inspo.fileName, 120) || file,
    notes: str(inspo.notes, 1000) || undefined,
    externalLink: str(inspo.externalLink, 500) || undefined,
  };
}

api.post('/bookings', express.json({ limit: '40mb' }), rateLimit('booking', 12, 15 * 60_000), async (req, res) => {
  const b = req.body ?? {};
  const clientName = str(b.clientName, 80);
  const phone = normalizePhone(b.clientPhone);
  if (!clientName || !phone) throw new HttpError(400, 'Please enter your name and a valid phone number');

  const stylist = STYLISTS.find((s) => s.name === b.stylist)?.name;
  const timeSlot = TIME_SLOTS.find((t) => t === b.timeSlot);
  if (!stylist || !timeSlot) throw new HttpError(400, 'Please choose a valid stylist and time slot');

  const date = str(b.date, 10);
  const today = lagosToday();
  const horizon = new Date(Date.now() + 120 * 86400_000).toISOString().slice(0, 10);
  if (!isIsoDate(date) || date < today || date > horizon) throw new HttpError(400, 'Please choose a valid appointment date');

  const locationType = b.locationType === 'home_service' ? 'home_service' : 'salon';
  const home = b.homeService ?? {};
  const price = computeBookingPrice({
    serviceId: b.serviceId,
    subtypeId: b.subtypeId,
    sizeId: b.sizeId,
    lengthId: b.lengthId,
    addOnIds: Array.isArray(b.addOnIds) ? b.addOnIds : [],
    locationType,
    locationTierId: home.tierId,
  });
  if (!price) throw new HttpError(400, 'Your style selection is no longer valid. Please review it and try again.');
  const service = SERVICES_DATA.find((s) => s.id === b.serviceId)!;

  if (locationType === 'home_service' && (!str(home.address, 300) || !str(home.socialHandle, 80))) {
    throw new HttpError(400, 'Home service needs your address and social media handle for stylist safety');
  }

  const settings = getSettings();
  const wantsDeposit = !!b.payDeposit && paymentsEnabled();
  if (settings.requireDeposit && paymentsEnabled() && !wantsDeposit) {
    throw new HttpError(400, `A ${settings.depositPercent}% deposit is required to secure your slot`);
  }
  const depositAmount = wantsDeposit ? Math.round((price.total * settings.depositPercent) / 100) : 0;

  const id = `RB-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const subtype = service.typesList?.find((t) => t.id === b.subtypeId);
  const size = service.sizesList?.find((t) => t.id === b.sizeId);
  const length = service.lengthsList?.find((t) => t.id === b.lengthId);
  const tier = LOCATION_TIERS.find((t) => t.id === home.tierId);
  const inspo = b.inspo ? saveInspo(b.inspo) : undefined;
  const createdAt = new Date().toISOString();

  const booking = {
    serviceId: service.id,
    serviceName: service.name,
    clientName,
    clientPhone: str(b.clientPhone, 30),
    clientEmail: str(b.clientEmail, 120) || undefined,
    notes: str(b.notes, 1000) || undefined,
    selectedSubtype: subtype?.name,
    selectedSize: size?.name,
    selectedLength: length?.name,
    locationType,
    homeServiceDetails:
      locationType === 'home_service'
        ? {
            address: str(home.address, 300),
            areaZone: tier?.name ?? '',
            landmark: str(home.landmark, 200),
            socialHandle: str(home.socialHandle, 80),
            alternateContactName: str(home.alternateContactName, 80),
            alternateContactPhone: str(home.alternateContactPhone, 30),
            residenceType: str(home.residenceType, 80),
            estimatedHomeFee: tier?.fee ?? 0,
          }
        : undefined,
    addOns: [...new Set<string>(b.addOnIds ?? [])].map((i) => ADD_ONS_DATA.find((a) => a.id === i)!.name),
    createdAt,
    customInspoMedia: inspo,
    customInspoNotes: inspo?.notes,
  };

  // Referral: only genuinely new clients, never the referrer themselves, and only for codes we issued.
  let referral: { applied: boolean; reason?: string; clientRewardCode?: string } = { applied: false };
  const refCode = str(b.referralCode, 40).toUpperCase();

  transaction(() => {
    if (dayStatus(date).closed) throw new HttpError(409, dayStatus(date).reason || 'That date is unavailable');
    try {
      run(
        `INSERT INTO bookings(id, service_id, stylist, date, time_slot, client_name, client_phone, status, total_price, deposit_amount, created_at, data)
         VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,
        id, service.id, stylist, date, timeSlot, clientName, phone, 'pending', price.total, depositAmount, createdAt, JSON.stringify(booking)
      );
    } catch (err: any) {
      if (/UNIQUE/i.test(err.message)) throw new HttpError(409, 'Sorry, that time slot with this stylist was just taken. Please pick another.');
      throw err;
    }

    if (refCode) {
      const referrer = get<{ name: string; phone: string }>('SELECT name, phone FROM referral_profiles WHERE code = ?', refCode);
      const priorBookings = get<{ n: number }>("SELECT COUNT(*) AS n FROM bookings WHERE client_phone = ? AND id != ?", phone, id)!.n;
      if (!referrer) referral = { applied: false, reason: 'That referral code was not recognised.' };
      else if (referrer.phone === phone) referral = { applied: false, reason: 'You cannot use your own referral code.' };
      else if (priorBookings > 0) referral = { applied: false, reason: 'Referral rewards are for first-time clients only.' };
      else {
        const codes = issueRewardsForBooking({
          bookingId: id, referralCode: refCode, clientName, clientPhone: phone,
          referrerName: referrer.name, referrerPhone: referrer.phone,
        });
        referral = { applied: true, clientRewardCode: codes.clientCode };
      }
    }
  });

  notifyOwner(`New booking ${id}: ${clientName} (${phone}) - ${service.name}, ${date} ${timeSlot}. Total N${price.total.toLocaleString()}`);

  let payment: { authorizationUrl: string; reference: string } | undefined;
  if (wantsDeposit) {
    try {
      payment = await initializePayment({
        kind: 'booking', targetId: id, amountNaira: depositAmount,
        email: booking.clientEmail || `${phone}@clients.rossybraids.com`,
      });
    } catch (err) {
      console.error('[payments] initialize failed', err);
    }
  }

  const row = get('SELECT * FROM bookings WHERE id = ?', id);
  const reward = referral.clientRewardCode ? findReward(referral.clientRewardCode) : undefined;
  res.status(201).json({
    booking: bookingView(row),
    referral,
    reward: reward ? rewardView(reward) : undefined,
    payment,
  });
});

/* ----------------------------------------------------------------- orders */

api.post('/orders', rateLimit('order', 20, 15 * 60_000), async (req, res) => {
  const b = req.body ?? {};
  const customerName = str(b.customerName, 80);
  const phone = normalizePhone(b.customerPhone);
  if (!customerName || !phone) throw new HttpError(400, 'Please enter your name and a valid phone number');
  if (!Array.isArray(b.items) || b.items.length === 0 || b.items.length > 30) throw new HttpError(400, 'Your cart is empty');

  const products = getProducts();
  const lines: { productId: string; productName: string; quantity: number; price: number }[] = [];
  for (const item of b.items) {
    const product = products.find((p) => p.id === item.productId);
    const quantity = Math.floor(Number(item.quantity));
    if (!product || !(quantity >= 1 && quantity <= 20)) throw new HttpError(400, 'One of the items in your cart is invalid');
    if (!product.inStock) throw new HttpError(409, `${product.name} is currently out of stock`);
    const existing = lines.find((l) => l.productId === product.id);
    if (existing) existing.quantity += quantity;
    else lines.push({ productId: product.id, productName: product.name, quantity, price: product.price });
  }
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

  const id = `ORD-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const createdAt = new Date().toISOString();
  let discount = 0;
  let discountCode: string | null = null;

  transaction(() => {
    const code = str(b.discountCode, 40).toUpperCase();
    if (code) {
      const reward = findReward(code);
      if (!reward || reward.recipient_phone !== phone) throw new HttpError(400, 'This discount code is not valid for this phone number');
      if (reward.used_at) throw new HttpError(400, 'This discount code has already been redeemed');
      if (!reward.activated_at) throw new HttpError(400, 'This reward unlocks once the salon confirms your booking');
      if (new Date(reward.expires_at!) < new Date()) throw new HttpError(400, 'This discount code has expired (codes last 72 hours)');
      const target = lines.find((l) => l.productId === reward.product_id);
      if (!target) {
        const wig = products.find((p) => p.id === reward.product_id);
        throw new HttpError(400, `This code only applies to ${wig?.name ?? 'the flagship wig'}. Add it to your cart to redeem.`);
      }
      discount = Math.round((target.price * reward.discount_pct) / 100);
      discountCode = reward.code;
      run('UPDATE rewards SET used_at = ? WHERE code = ?', createdAt, reward.code);
    }

    // Decrement tracked stock; flip to out-of-stock at zero.
    const settings = getSettings();
    let changed = false;
    for (const line of lines) {
      const o = settings.productOverrides[line.productId];
      if (typeof o?.stock === 'number') {
        if (o.stock < line.quantity) throw new HttpError(409, `Only ${o.stock} of ${line.productName} left in stock`);
        o.stock -= line.quantity;
        if (o.stock === 0) o.inStock = false;
        changed = true;
      }
    }
    if (changed) setSetting('productOverrides', settings.productOverrides);

    run(
      `INSERT INTO orders(id, customer_name, customer_phone, delivery_address, items, subtotal, discount, discount_code, total, created_at)
       VALUES(?,?,?,?,?,?,?,?,?,?)`,
      id, customerName, phone, str(b.deliveryAddress, 300) || null, JSON.stringify(lines), subtotal, discount, discountCode, subtotal - discount, createdAt
    );
  });

  notifyOwner(`New order ${id}: ${customerName} (${phone}) - N${(subtotal - discount).toLocaleString()}`);

  let payment: { authorizationUrl: string; reference: string } | undefined;
  if (b.payNow && paymentsEnabled()) {
    try {
      payment = await initializePayment({
        kind: 'order', targetId: id, amountNaira: subtotal - discount,
        email: str(b.customerEmail, 120) || `${phone}@clients.rossybraids.com`,
      });
    } catch (err) {
      console.error('[payments] initialize failed', err);
    }
  }
  res.status(201).json({ order: orderView(get('SELECT * FROM orders WHERE id = ?', id)), payment });
});

/* --------------------------------------------------------------- payments */

api.get('/payments/verify', rateLimit('verify', 30, 5 * 60_000), async (req, res) => {
  if (!paymentsEnabled()) throw new HttpError(503, 'Online payments are not enabled');
  res.json(await settlePayment(str(req.query.reference, 80)));
});

export async function paystackWebhook(req: express.Request, res: express.Response) {
  if (!validWebhookSignature(req.body, req.headers['x-paystack-signature'] as string | undefined)) return res.sendStatus(401);
  try {
    const event = JSON.parse(req.body.toString('utf8'));
    if (event.event === 'charge.success' && event.data?.reference) await settlePayment(event.data.reference);
  } catch (err) {
    console.error('[payments] webhook error', err);
  }
  res.sendStatus(200);
}

/* --------------------------------------------------------------- referrals */

api.post('/referrals/profile', rateLimit('referral', 15, 15 * 60_000), (req, res) => {
  const name = str(req.body?.name, 80);
  const phone = normalizePhone(req.body?.phone);
  if (!name || !phone) throw new HttpError(400, 'Please enter your name and a valid phone number');
  let profile = get<{ code: string; name: string; created_at: string }>('SELECT * FROM referral_profiles WHERE phone = ?', phone);
  if (!profile) {
    let code = generateReferralCode(name);
    while (get('SELECT 1 FROM referral_profiles WHERE code = ?', code)) code = generateReferralCode(name);
    run('INSERT INTO referral_profiles(code, name, phone, created_at) VALUES(?,?,?,?)', code, name, phone, new Date().toISOString());
    profile = get('SELECT * FROM referral_profiles WHERE phone = ?', phone)!;
  }
  const referrals = get<{ n: number }>("SELECT COUNT(*) AS n FROM rewards WHERE referral_code = ? AND recipient_type = 'new_client'", profile.code)!.n;
  res.json({ referralCode: profile.code, referrerName: profile.name, createdAt: profile.created_at, totalReferrals: referrals });
});

api.get('/referrals/check', (req, res) => {
  const p = get<{ name: string }>('SELECT name FROM referral_profiles WHERE code = ?', str(req.query.code, 40).toUpperCase());
  res.json({ valid: !!p, referrerName: p?.name });
});

/* ---------------------------------------------------------------- reviews */

api.get('/reviews', (_req, res) => {
  const rows = all("SELECT * FROM reviews WHERE status = 'approved' ORDER BY created_at DESC LIMIT 50");
  res.json(
    rows.map((r) => ({
      id: r.id, clientName: r.name, location: r.location || 'Nigeria', rating: r.rating, review: r.text,
      serviceBooked: r.service_name || 'RossyBraids service', date: new Date(r.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
      verified: !!r.verified,
    }))
  );
});

api.post('/reviews', rateLimit('review', 5, 60 * 60_000), (req, res) => {
  const b = req.body ?? {};
  const name = str(b.name, 60);
  const text = str(b.text, 1000);
  const rating = Math.floor(Number(b.rating));
  if (!name || text.length < 10 || !(rating >= 1 && rating <= 5)) throw new HttpError(400, 'Please add your name, a star rating and a short review');
  const phone = normalizePhone(b.phone);
  const verified = phone ? !!get("SELECT 1 FROM bookings WHERE client_phone = ? AND status = 'completed'", phone) : false;
  run(
    'INSERT INTO reviews(id, name, location, rating, text, service_name, phone, verified, created_at) VALUES(?,?,?,?,?,?,?,?,?)',
    crypto.randomUUID(), name, str(b.location, 80) || null, rating, text, str(b.serviceName, 80) || null, phone, verified ? 1 : 0, new Date().toISOString()
  );
  res.status(201).json({ ok: true, message: 'Thank you! Your review will appear once the salon approves it.' });
});

/* ------------------------------------------------------- client sign-in (OTP) */

api.post('/auth/otp/request', rateLimit('otp-request', 5, 10 * 60_000), async (req, res) => {
  const phone = normalizePhone(req.body?.phone);
  if (!phone) throw new HttpError(400, 'Please enter a valid phone number');
  const code = String(crypto.randomInt(100000, 1000000));
  run(
    'INSERT INTO otps(phone, code_hash, expires_at, attempts) VALUES(?,?,?,0) ON CONFLICT(phone) DO UPDATE SET code_hash = excluded.code_hash, expires_at = excluded.expires_at, attempts = 0',
    phone, hashOtp(phone, code), Date.now() + 10 * 60_000
  );
  const sent = await sendSms(phone, `Your RossyBraids code is ${code}. It expires in 10 minutes.`);
  // Without an SMS provider, hand the code back in development so the flow can be tried locally.
  res.json({ ok: true, sent, devCode: !sent && !config.isProd ? code : undefined });
});

api.post('/auth/otp/verify', rateLimit('otp-verify', 15, 10 * 60_000), (req, res) => {
  const phone = normalizePhone(req.body?.phone);
  const code = str(req.body?.code, 6);
  const row = phone ? get<{ code_hash: string; expires_at: number; attempts: number }>('SELECT * FROM otps WHERE phone = ?', phone) : undefined;
  if (!phone || !row || row.expires_at < Date.now() || row.attempts >= 5) throw new HttpError(400, 'That code has expired. Please request a new one.');
  if (hashOtp(phone, code) !== row.code_hash) {
    run('UPDATE otps SET attempts = attempts + 1 WHERE phone = ?', phone);
    throw new HttpError(400, 'Incorrect code');
  }
  run('DELETE FROM otps WHERE phone = ?', phone);
  res.json({ token: signToken({ role: 'client', phone }, 30 * 86400), phone });
});

/* ----------------------------------------------------------- signed-in client */

api.get('/me/bookings', requireClient, (_req, res) => {
  res.json(all('SELECT * FROM bookings WHERE client_phone = ? ORDER BY date DESC, created_at DESC', res.locals.phone).map(bookingView));
});

api.get('/me/orders', requireClient, (_req, res) => {
  res.json(all('SELECT * FROM orders WHERE customer_phone = ? ORDER BY created_at DESC', res.locals.phone).map(orderView));
});

api.get('/me/rewards', requireClient, (_req, res) => {
  res.json(rewardsForPhone(res.locals.phone));
});

api.patch('/me/bookings/:id', requireClient, (req, res) => {
  const row = get<any>('SELECT * FROM bookings WHERE id = ? AND client_phone = ?', req.params.id, res.locals.phone);
  if (!row) throw new HttpError(404, 'Booking not found');
  const body = req.body ?? {};

  if (body.status === 'cancelled') {
    if (!['pending', 'confirmed'].includes(row.status)) throw new HttpError(400, 'This booking can no longer be cancelled');
    if (row.date <= lagosToday()) throw new HttpError(400, 'Same-day cancellations need a call or WhatsApp to the salon');
    run("UPDATE bookings SET status = 'cancelled' WHERE id = ?", row.id);
    notifyOwner(`Booking ${row.id} (${row.client_name}) was cancelled by the client.`);
  }

  const data = JSON.parse(row.data);
  for (const key of ['maintenanceDismissed', 'isMaintenanceScheduled'] as const) {
    if (typeof body[key] === 'boolean') data[key] = body[key];
  }
  if (typeof body.lastMaintenanceScheduledDate === 'string') data.lastMaintenanceScheduledDate = str(body.lastMaintenanceScheduledDate, 40);
  run('UPDATE bookings SET data = ? WHERE id = ?', JSON.stringify(data), row.id);
  res.json(bookingView(get('SELECT * FROM bookings WHERE id = ?', row.id)));
});

export type { RewardRow };
