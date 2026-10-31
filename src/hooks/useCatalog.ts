import { useMemo } from 'react';
import { applyProductOverrides } from '../api/client';
import { useSite } from '../api/SiteProvider';
import { PRODUCTS_SHOP_DATA } from '../data/flyerData';
import type { ProductShopItem } from '../types';

/** The shop catalog: the owner's uploaded products, or the bundled samples (with her price/stock changes) until she adds some. */
export function useCatalog(): ProductShopItem[] {
  const { config } = useSite();
  return useMemo(() => config?.catalog ?? applyProductOverrides(PRODUCTS_SHOP_DATA, config), [config]);
}
