import { ProductShopItem, ReferralProfile } from '../types';
import { PRODUCTS_SHOP_DATA } from '../data/flyerData';

// Referral codes and rewards are issued and redeemed by the server (server/rewards.ts).
// This module only keeps a local cache of the visitor's own profile and a few pure helpers
// that the server also imports, so it must stay free of browser-only top-level code.
const PROFILE_STORAGE_KEY = 'rossybraids_referral_profile';
const SESSION_REF_KEY = 'rossybraids_active_ref_code';

/**
 * Finds the single most expensive wig at the current time.
 * Dynamically evaluates inventory so it always points to the highest-priced wig unit.
 */
export function getMostExpensiveWig(products: ProductShopItem[] = PRODUCTS_SHOP_DATA): ProductShopItem {
  const wigs = products.filter(
    (p) =>
      p.isWig === true ||
      p.category === 'Luxury Ready-to-Wear Wigs' ||
      p.name.toLowerCase().includes('wig')
  );

  const pool = wigs.length > 0 ? wigs : products;
  const sorted = [...pool].sort((a, b) => b.price - a.price);
  return sorted[0];
}

/**
 * Generates full shareable URL with referral parameter
 * Default production domain is rossybraids.com
 */
export function getReferralShareUrl(code: string): string {
  return `https://rossybraids.com/?ref=${encodeURIComponent(code)}`;
}

/**
 * Loads current user's personal referral profile from storage
 */
export function getStoredReferralProfile(): ReferralProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Saves or creates user's personal referral profile
 */
export function saveReferralProfile(profile: ReferralProfile): void {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore storage issues
  }
}

/**
 * Forgets the cached profile (used by "Switch user")
 */
export function clearReferralProfile(): void {
  try {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
  } catch {
    // Ignore storage issues
  }
}

/**
 * Retrieves active referral code from URL query parameter or session storage
 */
export function getActiveReferralCode(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const refParam = urlParams.get('ref') || urlParams.get('referral');

    if (refParam && refParam.trim().length > 0) {
      const code = refParam.trim().toUpperCase();
      sessionStorage.setItem(SESSION_REF_KEY, code);
      return code;
    }

    return sessionStorage.getItem(SESSION_REF_KEY);
  } catch {
    return null;
  }
}

/**
 * Extracts referral code from text or URL string
 */
export function extractReferralCodeFromInput(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();

  // If user pasted a URL with ?ref=
  if (trimmed.includes('ref=')) {
    try {
      const match = trimmed.match(/[?&]ref=([^&#\s]+)/i);
      if (match && match[1]) {
        return decodeURIComponent(match[1]).trim().toUpperCase();
      }
    } catch {
      // Fall through
    }
  }

  return trimmed.toUpperCase();
}

/**
 * Manually registers an active referral code in the session
 */
export function setActiveReferralCode(code: string): void {
  try {
    sessionStorage.setItem(SESSION_REF_KEY, code.trim().toUpperCase());
  } catch {
    // Ignore
  }
}

/**
 * Calculates remaining time for a 3-day discount reward
 */
export function getTimeRemaining(expiresAt: string): {
  formatted: string;
  totalMs: number;
  isExpired: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const expiryTime = new Date(expiresAt).getTime();
  const now = Date.now();
  const totalMs = expiryTime - now;

  if (totalMs <= 0 || isNaN(totalMs)) {
    return {
      formatted: 'Expired',
      totalMs: 0,
      isExpired: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((totalMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((totalMs % (1000 * 60)) / 1000);

  let formatted = '';
  if (days > 0) {
    formatted = `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    formatted = `${hours}h ${minutes}m ${seconds}s`;
  } else {
    formatted = `${minutes}m ${seconds}s`;
  }

  return {
    formatted,
    totalMs,
    isExpired: false,
    days,
    hours,
    minutes,
    seconds,
  };
}
