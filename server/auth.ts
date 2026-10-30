import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { config } from './config';

const b64 = (buf: Buffer | string) => Buffer.from(buf).toString('base64url');
const hmac = (data: string) => crypto.createHmac('sha256', config.sessionSecret).update(data).digest('base64url');

export function signToken(payload: Record<string, unknown>, ttlSeconds: number): string {
  const body = b64(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds }));
  return `${body}.${hmac(body)}`;
}

export function verifyToken<T = Record<string, any>>(token: string | undefined): T | null {
  if (!token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = hmac(body);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    return payload.exp > Date.now() / 1000 ? payload : null;
  } catch {
    return null;
  }
}

export function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export function hashOtp(phone: string, code: string): string {
  return hmac(`otp:${phone}:${code}`);
}

const bearer = (req: Request) => req.headers.authorization?.replace(/^Bearer\s+/i, '');

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const payload = verifyToken<{ role?: string }>(bearer(req));
  if (payload?.role !== 'admin') return res.status(401).json({ error: 'Admin sign-in required' });
  next();
}

export function requireClient(req: Request, res: Response, next: NextFunction) {
  const payload = verifyToken<{ role?: string; phone?: string }>(bearer(req));
  if (payload?.role !== 'client' || !payload.phone) return res.status(401).json({ error: 'Please sign in with your phone number' });
  res.locals.phone = payload.phone;
  next();
}

/**
 * Normalises Nigerian numbers to international digits without "+": 0813... / +234813... / 234813... -> 234813...
 * Other numbers keep their digits as long as the length is plausible.
 */
export function normalizePhone(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  let digits = input.replace(/[^\d]/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (/^0\d{10}$/.test(digits)) digits = '234' + digits.slice(1);
  if (/^[789]\d{9}$/.test(digits)) digits = '234' + digits;
  return digits.length >= 10 && digits.length <= 15 ? digits : null;
}

const hits = new Map<string, number[]>();

/** Tiny in-memory sliding-window limiter, enough to blunt OTP and password guessing. */
export function rateLimit(name: string, max: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${name}:${req.ip}`;
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= max) {
      res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
      return res.status(429).json({ error: 'Too many attempts. Please wait a few minutes and try again.' });
    }
    recent.push(now);
    hits.set(key, recent);
    next();
  };
}
