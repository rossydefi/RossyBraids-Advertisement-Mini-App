import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import path from 'node:path';
import { config } from './config';

export const db = new DatabaseSync(process.env.DB_FILE || path.join(config.dataDir, 'rossybraids.db'));
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

db.exec(`
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  service_id TEXT NOT NULL,
  stylist TEXT NOT NULL,
  date TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  total_price INTEGER NOT NULL,
  deposit_amount INTEGER NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  reminded_at TEXT,
  created_at TEXT NOT NULL,
  data TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_slot
  ON bookings(date, time_slot, stylist) WHERE status != 'cancelled';
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(client_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT,
  items TEXT NOT NULL,
  subtotal INTEGER NOT NULL,
  discount INTEGER NOT NULL DEFAULT 0,
  discount_code TEXT,
  total INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(customer_phone);

CREATE TABLE IF NOT EXISTS referral_profiles (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rewards (
  code TEXT PRIMARY KEY,
  recipient_type TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  booking_id TEXT NOT NULL,
  referral_code TEXT NOT NULL,
  product_id TEXT NOT NULL,
  discount_pct INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  activated_at TEXT,
  expires_at TEXT,
  used_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_rewards_phone ON rewards(recipient_phone);
CREATE INDEX IF NOT EXISTS idx_rewards_booking ON rewards(booking_id);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  rating INTEGER NOT NULL,
  text TEXT NOT NULL,
  service_name TEXT,
  phone TEXT,
  verified INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS gallery (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  media_type TEXT NOT NULL,
  media_url TEXT NOT NULL,
  before_url TEXT,
  service_id TEXT,
  featured INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS shop_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price INTEGER NOT NULL,
  stock INTEGER,
  in_stock INTEGER NOT NULL DEFAULT 1,
  volume TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  benefits TEXT NOT NULL DEFAULT '[]',
  image_url TEXT NOT NULL,
  featured INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS otps (
  phone TEXT PRIMARY KEY,
  code_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS payments (
  reference TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  target_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'initialized',
  created_at TEXT NOT NULL
);
`);

type Row = Record<string, any>;

export const all = <T = Row>(sql: string, ...params: SQLInputValue[]): T[] =>
  db.prepare(sql).all(...params) as unknown as T[];
export const get = <T = Row>(sql: string, ...params: SQLInputValue[]): T | undefined =>
  db.prepare(sql).get(...params) as unknown as T | undefined;
export const run = (sql: string, ...params: SQLInputValue[]) => db.prepare(sql).run(...params);

export function transaction<T>(fn: () => T): T {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export interface Settings {
  /** 0 = Sunday ... 6 = Saturday */
  closedWeekdays: number[];
  blockedDates: string[];
  maxBookingsPerDay: number;
  depositPercent: number;
  requireDeposit: boolean;
  banner: string;
  openingHours: string;
  address: string;
  mapUrl: string;
  /** productId -> admin overrides */
  productOverrides: Record<string, { price?: number; inStock?: boolean; stock?: number }>;
}

export const DEFAULT_SETTINGS: Settings = {
  closedWeekdays: [0],
  blockedDates: [],
  maxBookingsPerDay: 6,
  depositPercent: 30,
  requireDeposit: false,
  banner: '',
  openingHours: 'Mon–Sat, 9:00 AM – 7:00 PM',
  address: '',
  mapUrl: '',
  productOverrides: {},
};

export function getSettings(): Settings {
  const rows = all<{ key: string; value: string }>('SELECT key, value FROM settings');
  const stored: Partial<Settings> = {};
  for (const r of rows) {
    try {
      (stored as Row)[r.key] = JSON.parse(r.value);
    } catch {
      // ignore corrupt row, fall back to default
    }
  }
  return { ...DEFAULT_SETTINGS, ...stored };
}

export function setSetting<K extends keyof Settings>(key: K, value: Settings[K]): void {
  run(
    'INSERT INTO settings(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    key,
    JSON.stringify(value)
  );
}
