import type { AppointmentBooking, ProductShopItem } from '../types';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const TOKEN_KEY = 'rossybraids_client_token';

export const getClientToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setClientToken = (token: string | null): void => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // storage unavailable (private mode); the session just won't persist
  }
};

export async function request<T>(
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown,
  token?: string | null
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers: {
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'Cannot reach the salon server. Check your connection and try again.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error || `Request failed (${res.status})`);
  return data as T;
}

/* ---------------------------------------------------------------- types */

export interface SiteConfig {
  closedWeekdays: number[];
  blockedDates: string[];
  banner: string;
  openingHours: string;
  address: string;
  mapUrl: string;
  depositPercent: number;
  requireDeposit: boolean;
  paymentsEnabled: boolean;
  products: { id: string; price: number; formattedPrice: string; inStock: boolean }[];
}

export interface Availability {
  date: string;
  closed: boolean;
  reason?: string;
  taken: { timeSlot: string; stylist: string }[];
}

export type RewardState = 'awaiting_confirmation' | 'active' | 'expired' | 'used';

export interface RewardView {
  code: string;
  recipientType: 'referrer' | 'new_client';
  productId: string;
  productName: string;
  originalPrice: number;
  discountPercentage: number;
  discountAmount: number;
  createdAt: string;
  activatedAt: string | null;
  expiresAt: string | null;
  usedAt: string | null;
  state: RewardState;
}

export interface PaymentInit {
  authorizationUrl: string;
  reference: string;
}

export interface BookingPayload {
  serviceId: string;
  subtypeId?: string | null;
  sizeId?: string | null;
  lengthId?: string | null;
  addOnIds: string[];
  stylist: string;
  date: string;
  timeSlot: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  notes?: string;
  locationType: 'salon' | 'home_service';
  homeService?: {
    tierId: string;
    address: string;
    landmark?: string;
    socialHandle: string;
    alternateContactName?: string;
    alternateContactPhone?: string;
    residenceType?: string;
  };
  referralCode?: string;
  inspo?: { dataUrl: string; fileName: string; notes?: string; externalLink?: string };
  payDeposit?: boolean;
}

export type ServerBooking = AppointmentBooking & { paymentStatus?: 'unpaid' | 'paid'; depositAmount?: number; adminNote?: string };

export interface OrderPayload {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress?: string;
  items: { productId: string; quantity: number }[];
  discountCode?: string;
  payNow?: boolean;
}

export interface ServerOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string | null;
  items: { productId: string; productName: string; quantity: number; price: number }[];
  subtotal: number;
  discount: number;
  discountCode: string | null;
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid';
  createdAt: string;
}

export interface PublicReview {
  id: string;
  clientName: string;
  location: string;
  rating: number;
  review: string;
  serviceBooked: string;
  date: string;
  verified: boolean;
}

/* ------------------------------------------------------------- endpoints */

export const api = {
  config: () => request<SiteConfig>('GET', '/config'),
  availability: (date: string) => request<Availability>('GET', `/availability?date=${date}`),

  createBooking: (payload: BookingPayload) =>
    request<{
      booking: ServerBooking;
      referral: { applied: boolean; reason?: string; clientRewardCode?: string };
      reward?: RewardView;
      payment?: PaymentInit;
    }>('POST', '/bookings', payload),

  createOrder: (payload: OrderPayload) =>
    request<{ order: ServerOrder; payment?: PaymentInit }>('POST', '/orders', payload),

  verifyPayment: (reference: string) =>
    request<{ status: 'success' | 'pending' | 'failed'; kind?: 'booking' | 'order'; targetId?: string }>(
      'GET',
      `/payments/verify?reference=${encodeURIComponent(reference)}`
    ),

  referralProfile: (name: string, phone: string) =>
    request<{ referralCode: string; referrerName: string; createdAt: string; totalReferrals: number }>(
      'POST',
      '/referrals/profile',
      { name, phone }
    ),
  checkReferral: (code: string) =>
    request<{ valid: boolean; referrerName?: string }>('GET', `/referrals/check?code=${encodeURIComponent(code)}`),

  checkReward: (code: string, phone: string, productIds: string[]) =>
    request<{ valid: boolean; error?: string; reward?: RewardView; discountAmount?: number }>('POST', '/rewards/check', {
      code,
      phone,
      productIds,
    }),

  reviews: () => request<PublicReview[]>('GET', '/reviews'),
  submitReview: (r: { name: string; location?: string; rating: number; text: string; serviceName?: string; phone?: string }) =>
    request<{ ok: true; message: string }>('POST', '/reviews', r),

  requestOtp: (phone: string) => request<{ ok: true; sent: boolean; devCode?: string }>('POST', '/auth/otp/request', { phone }),
  verifyOtp: (phone: string, code: string) => request<{ token: string; phone: string }>('POST', '/auth/otp/verify', { phone, code }),

  myBookings: (token: string) => request<ServerBooking[]>('GET', '/me/bookings', undefined, token),
  myOrders: (token: string) => request<ServerOrder[]>('GET', '/me/orders', undefined, token),
  myRewards: (token: string) => request<RewardView[]>('GET', '/me/rewards', undefined, token),
  patchMyBooking: (token: string, id: string, patch: Partial<Pick<AppointmentBooking, 'status' | 'maintenanceDismissed' | 'isMaintenanceScheduled' | 'lastMaintenanceScheduledDate'>>) =>
    request<ServerBooking>('PATCH', `/me/bookings/${id}`, patch, token),
};

/** Applies admin price/stock overrides from /api/config onto the bundled catalog. */
export function applyProductOverrides(products: ProductShopItem[], config: SiteConfig | null): ProductShopItem[] {
  if (!config) return products;
  return products.map((p) => {
    const o = config.products.find((x) => x.id === p.id);
    return o ? { ...p, price: o.price, formattedPrice: o.formattedPrice, inStock: o.inStock } : p;
  });
}
