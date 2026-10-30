import 'express-async-errors';
import express, { type NextFunction, type Request, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { admin } from './admin';
import { api, paystackWebhook } from './api';
import { config } from './config';
import { startReminderJob } from './reminders';
import { HttpError } from './util';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

// Paystack signs the raw body, so this must come before the JSON parser.
app.post('/api/payments/webhook', express.raw({ type: '*/*', limit: '1mb' }), paystackWebhook);

// POST /api/bookings carries inspiration uploads and sets its own larger body limit.
const json = express.json({ limit: '1mb' });
app.use('/api', (req, res, next) => (req.method === 'POST' && req.path === '/bookings' ? next() : json(req, res, next)));

app.use('/uploads', express.static(config.uploadsDir, { maxAge: '7d', index: false, setHeaders: (res) => res.setHeader('Content-Disposition', 'inline') }));
app.use('/api/admin', admin);
app.use('/api', api);
app.use('/api', (_req, _res, next) => next(new HttpError(404, 'Not found')));

async function mountFrontend() {
  if (config.isProd) {
    const dist = path.resolve('dist');
    if (!fs.existsSync(dist)) throw new Error('dist/ not found. Run "npm run build" before "npm start".');
    app.use(express.static(dist, { index: false, maxAge: '1h' }));
    app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  }
}

app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) return next(err);
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  if ((err as any)?.type === 'entity.too.large') return res.status(413).json({ error: 'That upload is too large' });
  if (err instanceof SyntaxError) return res.status(400).json({ error: 'Malformed request' });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

await mountFrontend();
app.listen(config.port, '0.0.0.0', () => {
  console.log(`RossyBraids running at http://localhost:${config.port} (${config.isProd ? 'production' : 'development'})`);
  if (config.usingDefaultAdminPassword) console.warn('Admin password is the default "rossy-admin". Set ADMIN_PASSWORD in .env.');
  startReminderJob();
});
