import { Router } from 'express';
import { PRODUCTS_SHOP_DATA, SERVICES_DATA, STYLISTS, TIME_SLOTS } from '../src/data/flyerData';
import { getDueMaintenanceNotifications } from '../src/utils/maintenance';
import { normalizePhone, rateLimit, requireAdmin, safeEqual, signToken } from './auth';
import { bookingView, orderView } from './api';
import { config } from './config';
import { restoreStock } from './catalog';
import { galleryAdmin } from './gallery';
import { shopAdmin } from './shop';
import { all, get, getSettings, run, setSetting, transaction, type Settings } from './db';
import { sendSms } from './notify';
import { activateRewardsForBooking } from './rewards';
import { HttpError, isIsoDate, lagosToday, str } from './util';

export const admin = Router();

admin.post('/login', rateLimit('admin-login', 8, 15 * 60_000), (req, res) => {
  if (!safeEqual(str(req.body?.password, 200), config.adminPassword)) throw new HttpError(401, 'Incorrect password');
  res.json({ token: signToken({ role: 'admin' }, 12 * 3600) });
});

admin.use(requireAdmin);

admin.use('/gallery', galleryAdmin);
admin.use('/shop', shopAdmin);

const tomorrow = () => new Date(Date.parse(`${lagosToday()}T00:00:00Z`) + 86400_000).toISOString().slice(0, 10);

admin.get('/summary', (_req, res) => {
  const today = lagosToday();
  const n = (sql: string, ...p: string[]) => get<{ n: number }>(sql, ...p)!.n;
  const since = new Date(Date.now() - 30 * 86400_000).toISOString();
  const bookingRevenue = get<{ s: number | null }>("SELECT SUM(total_price) AS s FROM bookings WHERE status = 'completed' AND created_at >= ?", since)!.s ?? 0;
  const orderRevenue = get<{ s: number | null }>("SELECT SUM(total) AS s FROM orders WHERE status != 'cancelled' AND created_at >= ?", since)!.s ?? 0;
  res.json({
    pendingBookings: n("SELECT COUNT(*) AS n FROM bookings WHERE status = 'pending'"),
    todayBookings: n("SELECT COUNT(*) AS n FROM bookings WHERE date = ? AND status != 'cancelled'", today),
    upcomingBookings: n("SELECT COUNT(*) AS n FROM bookings WHERE date >= ? AND status IN ('pending','confirmed')", today),
    pendingOrders: n("SELECT COUNT(*) AS n FROM orders WHERE status = 'pending'"),
    pendingReviews: n("SELECT COUNT(*) AS n FROM reviews WHERE status = 'pending'"),
    revenue30d: bookingRevenue + orderRevenue,
    bookingRevenue30d: bookingRevenue,
    orderRevenue30d: orderRevenue,
    paymentsEnabled: !!config.paystackSecret,
    smsEnabled: !!config.termiiKey,
    usingDefaultPassword: config.usingDefaultAdminPassword,
  });
});

/* --------------------------------------------------------------- bookings */

admin.get('/bookings', (req, res) => {
  const where: string[] = [];
  const params: string[] = [];
  const status = str(req.query.status, 20);
  if (status) { where.push('status = ?'); params.push(status); }
  const from = str(req.query.from, 10);
  if (isIsoDate(from)) { where.push('date >= ?'); params.push(from); }
  const to = str(req.query.to, 10);
  if (isIsoDate(to)) { where.push('date <= ?'); params.push(to); }
  const q = str(req.query.q, 60);
  if (q) { where.push('(client_name LIKE ? OR client_phone LIKE ? OR id LIKE ?)'); params.push(`%${q}%`, `%${q}%`, `%${q}%`); }
  const rows = all(`SELECT * FROM bookings ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY date DESC, time_slot DESC LIMIT 500`, ...params);
  res.json(rows.map(bookingView));
});

const BOOKING_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

admin.patch('/bookings/:id', async (req, res) => {
  const row = get<any>('SELECT * FROM bookings WHERE id = ?', req.params.id);
  if (!row) throw new HttpError(404, 'Booking not found');
  const b = req.body ?? {};
  const date = b.date === undefined ? row.date : str(b.date, 10);
  const timeSlot = b.timeSlot === undefined ? row.time_slot : TIME_SLOTS.find((t) => t === b.timeSlot);
  const stylist = b.stylist === undefined ? row.stylist : STYLISTS.find((s) => s.name === b.stylist)?.name;
  const status = b.status === undefined ? row.status : b.status;
  if (!isIsoDate(date) || !timeSlot || !stylist || !BOOKING_STATUSES.includes(status)) throw new HttpError(400, 'Invalid booking update');

  const data = JSON.parse(row.data);
  if (typeof b.adminNote === 'string') data.adminNote = str(b.adminNote, 1000);

  try {
    run('UPDATE bookings SET date = ?, time_slot = ?, stylist = ?, status = ?, data = ? WHERE id = ?', date, timeSlot, stylist, status, JSON.stringify(data), row.id);
  } catch (err: any) {
    if (/UNIQUE/i.test(err.message)) throw new HttpError(409, 'That slot is already booked for this stylist');
    throw err;
  }
  if ((status === 'confirmed' || status === 'completed') && row.status === 'pending') activateRewardsForBooking(row.id);

  const phone = row.client_phone;
  if (status !== row.status && status === 'confirmed') {
    void sendSms(phone, `Hi ${row.client_name}, your RossyBraids appointment (${row.id}) is confirmed for ${date}, ${timeSlot}. See you then!`);
  } else if (status !== row.status && status === 'cancelled') {
    void sendSms(phone, `Hi ${row.client_name}, your RossyBraids appointment (${row.id}) has been cancelled. Message us on WhatsApp to rebook.`);
  } else if (date !== row.date || timeSlot !== row.time_slot) {
    void sendSms(phone, `Hi ${row.client_name}, your RossyBraids appointment (${row.id}) has moved to ${date}, ${timeSlot}.`);
  }
  res.json(bookingView(get('SELECT * FROM bookings WHERE id = ?', row.id)));
});

/* ----------------------------------------------------------------- orders */

const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

admin.get('/orders', (req, res) => {
  const status = str(req.query.status, 20);
  const rows = status ? all('SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC LIMIT 500', status) : all('SELECT * FROM orders ORDER BY created_at DESC LIMIT 500');
  res.json(rows.map(orderView));
});

admin.patch('/orders/:id', (req, res) => {
  const row = get<any>('SELECT * FROM orders WHERE id = ?', req.params.id);
  const status = req.body?.status;
  if (!row) throw new HttpError(404, 'Order not found');
  if (!ORDER_STATUSES.includes(status)) throw new HttpError(400, 'Invalid status');

  transaction(() => {
    run("UPDATE orders SET status = ?, payment_status = CASE WHEN ? = 'paid' THEN 'paid' ELSE payment_status END WHERE id = ?", status, status, row.id);
    if (status === 'cancelled' && row.status !== 'cancelled') {
      if (row.discount_code) run('UPDATE rewards SET used_at = NULL WHERE code = ?', row.discount_code);
      restoreStock(JSON.parse(row.items) as { productId: string; quantity: number }[]);
    }
  });
  res.json(orderView(get('SELECT * FROM orders WHERE id = ?', row.id)));
});

/* ---------------------------------------------------------------- reviews */

admin.get('/reviews', (req, res) => {
  const status = str(req.query.status, 20);
  res.json(status ? all('SELECT * FROM reviews WHERE status = ? ORDER BY created_at DESC', status) : all('SELECT * FROM reviews ORDER BY created_at DESC'));
});

admin.patch('/reviews/:id', (req, res) => {
  const status = req.body?.status;
  if (!['pending', 'approved', 'rejected'].includes(status)) throw new HttpError(400, 'Invalid status');
  run('UPDATE reviews SET status = ? WHERE id = ?', status, req.params.id);
  res.json({ ok: true });
});

admin.delete('/reviews/:id', (req, res) => {
  run('DELETE FROM reviews WHERE id = ?', req.params.id);
  res.json({ ok: true });
});

/* --------------------------------------------------------------- settings */

admin.get('/settings', (_req, res) => {
  res.json({
    settings: getSettings(),
    products: PRODUCTS_SHOP_DATA.map((p) => ({ id: p.id, name: p.name, category: p.category, basePrice: p.price })),
    services: SERVICES_DATA.map((s) => ({ id: s.id, name: s.name })),
  });
});

admin.put('/settings', (req, res) => {
  const b = req.body ?? {};
  const current = getSettings();
  const next: Partial<Settings> = {};

  if (Array.isArray(b.closedWeekdays)) next.closedWeekdays = [...new Set<number>(b.closedWeekdays.map(Number).filter((d: number) => d >= 0 && d <= 6))];
  if (Array.isArray(b.blockedDates)) next.blockedDates = b.blockedDates.filter((d: unknown) => typeof d === 'string' && isIsoDate(d)).sort();
  if (b.maxBookingsPerDay !== undefined) next.maxBookingsPerDay = Math.min(50, Math.max(1, Math.floor(Number(b.maxBookingsPerDay)) || current.maxBookingsPerDay));
  if (b.depositPercent !== undefined) next.depositPercent = Math.min(100, Math.max(5, Math.floor(Number(b.depositPercent)) || current.depositPercent));
  if (typeof b.requireDeposit === 'boolean') next.requireDeposit = b.requireDeposit;
  for (const key of ['banner', 'openingHours', 'address', 'mapUrl'] as const) {
    if (typeof b[key] === 'string') next[key] = str(b[key], key === 'banner' ? 200 : 300);
  }

  for (const [key, value] of Object.entries(next)) setSetting(key as keyof Settings, value as never);
  res.json(getSettings());
});

admin.put('/products/:id', (req, res) => {
  if (!PRODUCTS_SHOP_DATA.some((p) => p.id === req.params.id)) throw new HttpError(404, 'Product not found');
  const b = req.body ?? {};
  const settings = getSettings();
  const o = { ...settings.productOverrides[req.params.id] };

  // null clears an override, a value sets it, undefined leaves it alone.
  if (b.price === null) delete o.price;
  else if (b.price !== undefined) o.price = Math.max(0, Math.round(Number(b.price)) || 0);
  if (b.stock === null) delete o.stock;
  else if (b.stock !== undefined) o.stock = Math.max(0, Math.floor(Number(b.stock)) || 0);
  if (typeof b.inStock === 'boolean') o.inStock = b.inStock;
  else if (typeof o.stock === 'number') o.inStock = o.stock > 0;

  if (Object.keys(o).length) settings.productOverrides[req.params.id] = o;
  else delete settings.productOverrides[req.params.id];
  setSetting('productOverrides', settings.productOverrides);
  res.json(settings.productOverrides[req.params.id] ?? {});
});

/* -------------------------------------------------------------- reminders */

export function maintenanceDue() {
  const rows = all("SELECT * FROM bookings WHERE status IN ('confirmed','completed')").map(bookingView);
  return getDueMaintenanceNotifications(rows);
}

admin.get('/reminders', (_req, res) => {
  const upcoming = all("SELECT * FROM bookings WHERE date = ? AND status IN ('pending','confirmed') ORDER BY time_slot", tomorrow()).map((r) => ({
    ...bookingView(r),
    remindedAt: r.reminded_at,
  }));
  const due = maintenanceDue().map(({ booking, maintenance }) => ({
    bookingId: booking.id,
    clientName: booking.clientName,
    clientPhone: booking.clientPhone,
    phone: normalizePhone(booking.clientPhone),
    serviceName: booking.serviceName,
    dueDate: maintenance.formattedDueDate,
    daysUntilDue: maintenance.daysUntilDue,
    recommendedActionTitle: maintenance.recommendedActionTitle,
  }));
  res.json({ tomorrow: tomorrow(), upcoming, maintenanceDue: due, smsEnabled: !!config.termiiKey });
});

admin.post('/reminders/:id/send', async (req, res) => {
  const row = get<any>('SELECT * FROM bookings WHERE id = ?', req.params.id);
  if (!row) throw new HttpError(404, 'Booking not found');
  if (!config.termiiKey) throw new HttpError(501, 'SMS is not configured. Use the WhatsApp button instead.');
  const ok = await sendSms(row.client_phone, `Hi ${row.client_name}, a reminder of your RossyBraids appointment on ${row.date}, ${row.time_slot}. Reply on WhatsApp if you need to reschedule.`);
  if (ok) run('UPDATE bookings SET reminded_at = ? WHERE id = ?', new Date().toISOString(), row.id);
  res.json({ sent: ok });
});

/* ----------------------------------------------------------------- export */

const csv = (rows: Record<string, unknown>[]) => {
  if (!rows.length) return '';
  const cols = Object.keys(rows[0]);
  // Prefix cells that spreadsheets would execute as formulas (=, +, -, @).
  const cell = (v: unknown) => {
    const text = String(v ?? '');
    return `"${(/^[=+\-@]/.test(text) ? "'" + text : text).replace(/"/g, '""')}"`;
  };
  return [cols.join(','), ...rows.map((r) => cols.map((c) => cell(r[c])).join(','))].join('\n');
};

admin.get('/export/:kind.csv', (req, res) => {
  const kind = req.params.kind;
  if (kind !== 'bookings' && kind !== 'orders') throw new HttpError(404, 'Unknown export');
  const rows =
    kind === 'bookings'
      ? all('SELECT id, date, time_slot, stylist, service_id, client_name, client_phone, status, payment_status, total_price, deposit_amount, created_at FROM bookings ORDER BY date DESC')
      : all('SELECT id, customer_name, customer_phone, delivery_address, subtotal, discount, discount_code, total, status, payment_status, created_at FROM orders ORDER BY created_at DESC');
  res.type('text/csv').attachment(`${kind}.csv`).send(csv(rows));
});
