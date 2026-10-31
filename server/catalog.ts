import { PRODUCTS_SHOP_DATA } from '../src/data/flyerData';
import type { ProductShopItem } from '../src/types';
import { all, get, getSettings, run, setSetting } from './db';
import { HttpError } from './util';

export const SHOP_CATEGORIES: ProductShopItem['category'][] = [
  'Luxury Ready-to-Wear Wigs',
  'Wash & Cleansing',
  'Conditioners & Masks',
  'Serums & Oils',
  'Accessories & Silk',
];

export interface ShopRow {
  id: string; name: string; category: string; price: number; stock: number | null; in_stock: number;
  volume: string; description: string; benefits: string; image_url: string; featured: number; created_at: string;
}

export const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

export function shopItem(r: ShopRow): ProductShopItem {
  let benefits: string[] = [];
  try {
    benefits = JSON.parse(r.benefits);
  } catch {
    /* ignore corrupt value */
  }
  const category = (SHOP_CATEGORIES as string[]).includes(r.category) ? (r.category as ProductShopItem['category']) : 'Accessories & Silk';
  return {
    id: r.id,
    name: r.name,
    price: r.price,
    formattedPrice: naira(r.price),
    category,
    volume: r.volume,
    image: r.image_url,
    description: r.description,
    benefits,
    inStock: !!r.in_stock && (r.stock === null || r.stock > 0),
    featured: !!r.featured,
    isWig: category === 'Luxury Ready-to-Wear Wigs',
  };
}

/** Products the owner has uploaded. */
export const getCustomProducts = (): ProductShopItem[] =>
  all<ShopRow>('SELECT * FROM shop_products ORDER BY featured DESC, created_at DESC').map(shopItem);

/**
 * What clients can buy: the owner's own products once she has added any, otherwise the sample
 * catalog that ships with the app (with her price/stock overrides applied).
 */
export function getProducts(): ProductShopItem[] {
  const custom = getCustomProducts();
  if (custom.length) return custom;
  const { productOverrides } = getSettings();
  return PRODUCTS_SHOP_DATA.map((p) => {
    const o = productOverrides[p.id];
    if (!o) return p;
    const price = o.price ?? p.price;
    const outOfStock = o.inStock === false || (typeof o.stock === 'number' && o.stock <= 0);
    return { ...p, price, formattedPrice: naira(price), inStock: outOfStock ? false : p.inStock };
  });
}

/** Take stock for an order (throws if there isn't enough). Call inside a transaction. */
export function reserveStock(lines: { productId: string; productName: string; quantity: number }[]) {
  const settings = getSettings();
  let changed = false;
  for (const line of lines) {
    const custom = get<ShopRow>('SELECT * FROM shop_products WHERE id = ?', line.productId);
    if (custom) {
      if (custom.stock !== null) {
        if (custom.stock < line.quantity) throw new HttpError(409, `Only ${custom.stock} of ${line.productName} left in stock`);
        run('UPDATE shop_products SET stock = stock - ? WHERE id = ?', line.quantity, custom.id);
      }
      continue;
    }
    const o = settings.productOverrides[line.productId];
    if (typeof o?.stock === 'number') {
      if (o.stock < line.quantity) throw new HttpError(409, `Only ${o.stock} of ${line.productName} left in stock`);
      o.stock -= line.quantity;
      if (o.stock === 0) o.inStock = false;
      changed = true;
    }
  }
  if (changed) setSetting('productOverrides', settings.productOverrides);
}

/** Put stock back when an order is cancelled. */
export function restoreStock(items: { productId: string; quantity: number }[]) {
  const settings = getSettings();
  for (const item of items) {
    const custom = get<ShopRow>('SELECT * FROM shop_products WHERE id = ?', item.productId);
    if (custom) {
      if (custom.stock !== null) run('UPDATE shop_products SET stock = stock + ? WHERE id = ?', item.quantity, custom.id);
      continue;
    }
    const o = settings.productOverrides[item.productId];
    if (typeof o?.stock === 'number') {
      o.stock += item.quantity;
      o.inStock = true;
    }
  }
  setSetting('productOverrides', settings.productOverrides);
}
