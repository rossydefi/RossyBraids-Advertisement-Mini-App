// Converts src/assets/images/*.jpg to resized WebP. Run once: node scripts/optimize-images.mjs
import sharp from 'sharp';
import { readdir, unlink } from 'node:fs/promises';
import path from 'node:path';

const dir = new URL('../src/assets/images/', import.meta.url).pathname;
for (const file of await readdir(dir)) {
  if (!/\.(jpe?g|png)$/i.test(file)) continue;
  const out = path.join(dir, file.replace(/\.(jpe?g|png)$/i, '.webp'));
  await sharp(path.join(dir, file))
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 76 })
    .toFile(out);
  await unlink(path.join(dir, file));
  console.log('converted', file);
}
