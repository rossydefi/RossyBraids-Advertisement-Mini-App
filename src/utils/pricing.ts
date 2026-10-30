import { ADD_ONS_DATA, LOCATION_TIERS, SERVICES_DATA } from '../data/flyerData';

/** Starting price per service. The server recomputes totals from this, never trusting the browser. */
export const SERVICE_BASE_PRICES: Record<string, number> = {
  'wigs-revamping': 25000,
  'boho-braids': 35000,
  dreadlocks: 20000,
  'natural-hairstyling': 18000,
  'african-traditional': 16000,
};
export const DEFAULT_BASE_PRICE = 15000;

export interface PriceSelection {
  serviceId: string;
  subtypeId?: string | null;
  sizeId?: string | null;
  lengthId?: string | null;
  addOnIds?: string[];
  locationType?: 'salon' | 'home_service';
  locationTierId?: string | null;
}

export interface PriceBreakdown {
  base: number;
  subtype: number;
  size: number;
  length: number;
  addOns: number;
  homeFee: number;
  total: number;
}

/** Returns null when the selection references an unknown service, option, add-on or zone. */
export function computeBookingPrice(sel: PriceSelection): PriceBreakdown | null {
  const service = SERVICES_DATA.find((s) => s.id === sel.serviceId);
  if (!service) return null;

  const pick = <T extends { id: string }>(list: T[] | undefined, id?: string | null) => {
    if (!id) return { ok: true, item: undefined as T | undefined };
    const item = list?.find((x) => x.id === id);
    return { ok: !!item, item };
  };

  const subtype = pick(service.typesList, sel.subtypeId);
  const size = pick(service.sizesList, sel.sizeId);
  const length = pick(service.lengthsList, sel.lengthId);
  if (!subtype.ok || !size.ok || !length.ok) return null;

  let addOns = 0;
  for (const id of new Set(sel.addOnIds ?? [])) {
    const addOn = ADD_ONS_DATA.find((a) => a.id === id);
    if (!addOn) return null;
    addOns += addOn.price;
  }

  let homeFee = 0;
  if (sel.locationType === 'home_service') {
    const tier = LOCATION_TIERS.find((t) => t.id === sel.locationTierId);
    if (!tier) return null;
    homeFee = tier.fee;
  }

  const base = SERVICE_BASE_PRICES[service.id] ?? DEFAULT_BASE_PRICE;
  const subtypeFee = subtype.item?.priceModifier ?? 0;
  const sizeFee = size.item?.priceModifier ?? 0;
  const lengthFee = length.item?.priceModifier ?? 0;

  return {
    base,
    subtype: subtypeFee,
    size: sizeFee,
    length: lengthFee,
    addOns,
    homeFee,
    total: base + subtypeFee + sizeFee + lengthFee + addOns + homeFee,
  };
}
