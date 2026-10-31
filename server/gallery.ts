import express, { Router } from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { SERVICES_DATA } from '../src/data/flyerData';
import { config } from './config';
import { all, get, run } from './db';
import { HttpError, str } from './util';

/** Only the salon owner can add, edit or delete gallery items; everyone can read them. */

const MEDIA_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
  'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov',
};

interface GalleryRow {
  id: string; title: string; category: string; tags: string; description: string;
  media_type: string; media_url: string; before_url: string | null; service_id: string | null;
  featured: number; created_at: string;
}

const view = (r: GalleryRow) => ({
  id: r.id,
  title: r.title,
  category: r.category,
  tags: r.tags ? r.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
  description: r.description,
  mediaType: r.media_type as 'image' | 'video',
  mediaUrl: r.media_url,
  beforeUrl: r.before_url ?? undefined,
  serviceId: r.service_id ?? undefined,
  featured: !!r.featured,
  createdAt: r.created_at,
});

const cleanTags = (v: unknown): string => {
  const list = Array.isArray(v) ? v : typeof v === 'string' ? v.split(',') : [];
  return list.map((t) => str(t, 30).toLowerCase()).filter(Boolean).slice(0, 15).join(',');
};

const isOwnUpload = (url: unknown): url is string => typeof url === 'string' && /^\/uploads\/[\w-]+\.\w+$/.test(url);

/** Delete an uploaded file once no gallery row points at it any more. */
function cleanupFile(url: string | null | undefined) {
  if (!url || !isOwnUpload(url)) return;
  const used = get('SELECT 1 AS x FROM gallery WHERE media_url = ? OR before_url = ? LIMIT 1', url, url) || get('SELECT 1 AS x FROM shop_products WHERE image_url = ? LIMIT 1', url);
  if (!used) fs.rm(path.join(config.uploadsDir, path.basename(url)), { force: true }, () => {});
}

/* ----------------------------------------------------------------- public */

export const galleryPublic = Router();

galleryPublic.get('/', (_req, res) => {
  res.json(all<GalleryRow>('SELECT * FROM gallery ORDER BY featured DESC, created_at DESC').map(view));
});

/* ------------------------------------------------------------------ admin */

export const galleryAdmin = Router();

// Raw upload (no multipart dependency): the file is the request body, its type is the Content-Type header.
galleryAdmin.post('/media', express.raw({ type: Object.keys(MEDIA_TYPES), limit: '150mb' }), (req, res) => {
  const type = String(req.headers['content-type'] ?? '').split(';')[0].trim();
  const ext = MEDIA_TYPES[type];
  if (!ext) throw new HttpError(415, 'Unsupported file type. Use JPG, PNG, WebP, GIF, MP4, WebM or MOV.');
  if (!Buffer.isBuffer(req.body) || req.body.length === 0) throw new HttpError(400, 'Empty file');
  const file = `${crypto.randomUUID()}.${ext}`;
  fs.writeFileSync(path.join(config.uploadsDir, file), req.body);
  res.json({ url: `/uploads/${file}`, mediaType: type.startsWith('video') ? 'video' : 'image' });
});

galleryAdmin.get('/', (_req, res) => {
  res.json(all<GalleryRow>('SELECT * FROM gallery ORDER BY featured DESC, created_at DESC').map(view));
});

const serviceId = (v: unknown) => {
  const id = str(v, 60);
  return SERVICES_DATA.some((s) => s.id === id) ? id : null;
};

galleryAdmin.post('/', (req, res) => {
  const b = req.body ?? {};
  const mediaUrl = b.mediaUrl;
  if (!isOwnUpload(mediaUrl)) throw new HttpError(400, 'Upload a photo or video first');
  const mediaType = /\.(mp4|webm|mov)$/.test(mediaUrl) ? 'video' : 'image';
  const title = str(b.title, 100);
  if (!title) throw new HttpError(400, 'Give this style a title');
  const id = crypto.randomUUID();
  run(
    'INSERT INTO gallery(id, title, category, tags, description, media_type, media_url, before_url, service_id, featured, created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)',
    id, title, str(b.category, 50) || 'Other', cleanTags(b.tags), str(b.description, 1000), mediaType, mediaUrl,
    isOwnUpload(b.beforeUrl) ? b.beforeUrl : null, serviceId(b.serviceId), b.featured ? 1 : 0, new Date().toISOString()
  );
  res.status(201).json(view(get<GalleryRow>('SELECT * FROM gallery WHERE id = ?', id)!));
});

galleryAdmin.patch('/:id', (req, res) => {
  const row = get<GalleryRow>('SELECT * FROM gallery WHERE id = ?', req.params.id);
  if (!row) throw new HttpError(404, 'Not found');
  const b = req.body ?? {};
  const title = b.title !== undefined ? str(b.title, 100) : row.title;
  if (!title) throw new HttpError(400, 'Title cannot be empty');
  const before = b.beforeUrl === null ? null : isOwnUpload(b.beforeUrl) ? b.beforeUrl : row.before_url;
  run(
    'UPDATE gallery SET title = ?, category = ?, tags = ?, description = ?, before_url = ?, service_id = ?, featured = ? WHERE id = ?',
    title,
    b.category !== undefined ? str(b.category, 50) || 'Other' : row.category,
    b.tags !== undefined ? cleanTags(b.tags) : row.tags,
    b.description !== undefined ? str(b.description, 1000) : row.description,
    before,
    b.serviceId !== undefined ? serviceId(b.serviceId) : row.service_id,
    b.featured !== undefined ? (b.featured ? 1 : 0) : row.featured,
    row.id
  );
  if (before !== row.before_url) cleanupFile(row.before_url);
  res.json(view(get<GalleryRow>('SELECT * FROM gallery WHERE id = ?', row.id)!));
});

galleryAdmin.delete('/:id', (req, res) => {
  const row = get<GalleryRow>('SELECT * FROM gallery WHERE id = ?', req.params.id);
  if (!row) throw new HttpError(404, 'Not found');
  run('DELETE FROM gallery WHERE id = ?', row.id);
  cleanupFile(row.media_url);
  cleanupFile(row.before_url);
  res.json({ ok: true });
});
