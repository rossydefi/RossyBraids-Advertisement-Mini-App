import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const isProd = process.env.NODE_ENV === 'production';
const dataDir = path.resolve(process.env.DATA_DIR || 'data');
fs.mkdirSync(path.join(dataDir, 'uploads'), { recursive: true });

// Persist a generated secret so sessions survive restarts when SESSION_SECRET isn't set.
function resolveSecret(): string {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  const file = path.join(dataDir, '.session-secret');
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    const secret = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(file, secret, { mode: 0o600 });
    return secret;
  }
}

if (isProd && !process.env.ADMIN_PASSWORD) {
  throw new Error('ADMIN_PASSWORD must be set when NODE_ENV=production');
}

export const config = {
  isProd,
  port: Number(process.env.PORT) || 3000,
  dataDir,
  uploadsDir: path.join(dataDir, 'uploads'),
  appUrl: (process.env.APP_URL || `http://localhost:${Number(process.env.PORT) || 3000}`).replace(/\/$/, ''),
  adminPassword: process.env.ADMIN_PASSWORD || 'rossy-admin',
  usingDefaultAdminPassword: !process.env.ADMIN_PASSWORD,
  sessionSecret: resolveSecret(),
  paystackSecret: process.env.PAYSTACK_SECRET_KEY || '',
  termiiKey: process.env.TERMII_API_KEY || '',
  termiiSender: process.env.TERMII_SENDER_ID || 'RossyBraids',
  ownerPhone: process.env.OWNER_PHONE || '',
};
