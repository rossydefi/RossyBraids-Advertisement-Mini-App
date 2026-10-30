import { PRODUCTS_SHOP_DATA } from '../src/data/flyerData';
import type { ProductShopItem } from '../src/types';
import { getSettings } from './db';

/** Catalog products with admin price/stock overrides applied. */
export function getProducts(): ProductShopItem[] {
  const { productOverrides } = getSettings();
  return PRODUCTS_SHOP_DATA.map((p) => {
    const o = productOverrides[p.id];
    if (!o) return p;
    const price = o.price ?? p.price;
    const outOfStock = o.inStock === false || (typeof o.stock === 'number' && o.stock <= 0);
    return {
      ...p,
      price,
      formattedPrice: `₦${price.toLocaleString('en-NG')}`,
      inStock: outOfStock ? false : p.inStock,
    };
  });
}
