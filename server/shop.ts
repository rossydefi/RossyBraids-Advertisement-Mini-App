import { Router } from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { config } from './config';
import { SHOP_CATEGORIES, shopItem, type ShopRow } from './catalog';
import { all, get, run } from './db';
import { HttpError, str } from './util';

/** Owner-only product management. Clients only ever read the catalog and place orders. */
export const shopAdmin = Router();

const isOwnUpload = (url: unknown): url is string => typeof url === 'string' && /^\/uploads\/[\w-]+\.(jpg|png|webp|gif)$/.test(url);

const benefitsOf = (v: unknown): string =>
  JSON.stringify((Array.isArray(v) ? v : typeof v === 'string' ? v.split('\n') : []).map((b) => str(b, 160)).filter(Boolean).slice(0, 8));

const money = (v: unknown): number => {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n) || n < 0 || n > 100_000_000) throw new HttpError(400, 'Enter a valid price');
  return n;
};

const stockOf = (v: unknown): number | null => {
  if (v === null || v === '' || v === undefined) return null;
  const n = Math.floor(Number(v));
  if (!Number.isFinite(n) || n < 0) throw new HttpError(400, 'Stock must be 0 or more (or blank if you do not track it)');
  return n;
};

const category = (v: unknown): string => {
  const c = str(v, 60);
  if (!(SHOP_CATEGORIES as string[]).includes(c)) throw new HttpError(400, 'Choose a category');
  return c;
};

const row = (id: string) => get<ShopRow>('SELECT * FROM shop_products WHERE id = ?', id);
const out = (r: ShopRow) => ({ ...shopItem(r), stock: r.stock, inStockFlag: !!r.in_stock });

function cleanupFile(url: string) {
  if (isOwnUpload(url) && !get('SELECT 1 AS x FROM shop_products WHERE image_url = ? LIMIT 1', url) && !get('SELECT 1 AS x FROM gallery WHERE media_url = ? OR before_url = ? LIMIT 1', url, url)) {
    fs.rm(path.join(config.uploadsDir, path.basename(url)), { force: true }, () => {});
  }
}

shopAdmin.get('/', (_req, res) => {
  res.json(all<ShopRow>('SELECT * FROM shop_products ORDER BY featured DESC, created_at DESC').map(out));
});

shopAdmin.post('/', (req, res) => {
  const b = req.body ?? {};
  if (!isOwnUpload(b.imageUrl)) throw new HttpError(400, 'Upload a product photo first');
  const name = str(b.name, 120);
  if (!name) throw new HttpError(400, 'Give the product a name');
  const id = `prod-${crypto.randomBytes(4).toString('hex')}`;
  run(
    'INSERT INTO shop_products(id, name, category, price, stock, in_stock, volume, description, benefits, image_url, featured, created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',
    id, name, category(b.category), money(b.price), stockOf(b.stock), b.inStock === false ? 0 : 1, str(b.volume, 80), str(b.description, 1500),
    benefitsOf(b.benefits), b.imageUrl, b.featured ? 1 : 0, new Date().toISOString()
  );
  res.status(201).json(out(row(id)!));
});

shopAdmin.patch('/:id', (req, res) => {
  const r = row(req.params.id);
  if (!r) throw new HttpError(404, 'Product not found');
  const b = req.body ?? {};
  const name = b.name !== undefined ? str(b.name, 120) : r.name;
  if (!name) throw new HttpError(400, 'Name cannot be empty');
  const image = b.imageUrl !== undefined ? (isOwnUpload(b.imageUrl) ? b.imageUrl : (() => { throw new HttpError(400, 'Invalid photo'); })()) : r.image_url;
  run(
    'UPDATE shop_products SET name=?, category=?, price=?, stock=?, in_stock=?, volume=?, description=?, benefits=?, image_url=?, featured=? WHERE id=?',
    name,
    b.category !== undefined ? category(b.category) : r.category,
    b.price !== undefined ? money(b.price) : r.price,
    b.stock !== undefined ? stockOf(b.stock) : r.stock,
    b.inStock !== undefined ? (b.inStock ? 1 : 0) : r.in_stock,
    b.volume !== undefined ? str(b.volume, 80) : r.volume,
    b.description !== undefined ? str(b.description, 1500) : r.description,
    b.benefits !== undefined ? benefitsOf(b.benefits) : r.benefits,
    image,
    b.featured !== undefined ? (b.featured ? 1 : 0) : r.featured,
    r.id
  );
  if (image !== r.image_url) cleanupFile(r.image_url);
  res.json(out(row(r.id)!));
});

shopAdmin.delete('/:id', (req, res) => {
  const r = row(req.params.id);
  if (!r) throw new HttpError(404, 'Product not found');
  run('DELETE FROM shop_products WHERE id = ?', r.id);
  cleanupFile(r.image_url);
  res.json({ ok: true });
});
