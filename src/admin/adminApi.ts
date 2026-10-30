import { ApiError, request, type ServerBooking, type ServerOrder } from '../api/client';

const TOKEN_KEY = 'rossybraids_admin_token';

export const getAdminToken = (): string | null => {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setAdminToken = (token: string | null): void => {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // sessionStorage unavailable; sign-in lasts for this page view only
  }
};

let onUnauthorized: () => void = () => {};
export const setUnauthorizedHandler = (fn: () => void) => {
  onUnauthorized = fn;
};

/** Authenticated call; a 401 clears the token and sends the user back to the login screen. */
export async function adminRequest<T>(method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE', path: string, body?: unknown): Promise<T> {
  try {
    return await request<T>(method, `/admin${path}`, body, getAdminToken());
  } catch (err) {
    if (err instanceof ApiError && err.status === 401 && path !== '/login') {
      setAdminToken(null);
      onUnauthorized();
    }
    throw err;
  }
}

export const errorMessage = (err: unknown): string => (err instanceof Error ? err.message : 'Something went wrong');

export async function downloadCsv(kind: 'bookings' | 'orders'): Promise<void> {
  const res = await fetch(`/api/admin/export/${kind}.csv`, { headers: { Authorization: `Bearer ${getAdminToken()}` } });
  if (res.status === 401) {
    setAdminToken(null);
    onUnauthorized();
    throw new ApiError(401, 'Please sign in again');
  }
  if (!res.ok) throw new ApiError(res.status, 'Export failed');
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement('a');
  a.href = url;
  a.download = `${kind}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ---------------------------------------------------------------- types */

export interface Summary {
  pendingBookings: number;
  todayBookings: number;
  upcomingBookings: number;
  pendingOrders: number;
  pendingReviews: number;
  revenue30d: number;
  bookingRevenue30d: number;
  orderRevenue30d: number;
  paymentsEnabled: boolean;
  smsEnabled: boolean;
  usingDefaultPassword: boolean;
}

export interface AdminReview {
  id: string;
  name: string;
  location: string | null;
  rating: number;
  text: string;
  service_name: string | null;
  verified: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface ProductOverride {
  price?: number;
  inStock?: boolean;
  stock?: number;
}

export interface AdminSettings {
  closedWeekdays: number[];
  blockedDates: string[];
  maxBookingsPerDay: number;
  depositPercent: number;
  requireDeposit: boolean;
  banner: string;
  openingHours: string;
  address: string;
  mapUrl: string;
  productOverrides: Record<string, ProductOverride>;
}

export interface SettingsResponse {
  settings: AdminSettings;
  products: { id: string; name: string; category: string; basePrice: number }[];
}

export interface RemindersResponse {
  tomorrow: string;
  smsEnabled: boolean;
  upcoming: (ServerBooking & { remindedAt: string | null })[];
  maintenanceDue: {
    bookingId: string;
    clientName: string;
    clientPhone: string;
    phone: string | null;
    serviceName: string;
    dueDate: string;
    daysUntilDue: number;
    recommendedActionTitle: string;
  }[];
}

export type { ServerBooking, ServerOrder };
