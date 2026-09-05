import { CartItem, ProductShopItem, ReferralDiscountReward, ReferralProfile, ReferralValidationResult } from '../types';
import { PRODUCTS_SHOP_DATA } from '../data/flyerData';

const REWARDS_STORAGE_KEY = 'rossybraids_discount_rewards';
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
 * Generates a memorable, unique VIP referral code based on client name
 */
export function generateUniqueReferralCode(userName: string): string {
  const cleanName = userName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8) || 'VIP';

  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${cleanName}-${randomSuffix}`;
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
 * Retrieves all discount rewards stored in localStorage
 */
export function getAllStoredDiscountRewards(): ReferralDiscountReward[] {
  try {
    const raw = localStorage.getItem(REWARDS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
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

/**
 * Generates both referrer and new client discount codes upon confirmed booking.
 * Strictly binds the reward to the most expensive wig at the time, valid for 3 days (72 hours).
 */
export function createReferralRewardsOnBooking(params: {
  bookingId: string;
  serviceName: string;
  clientName: string;
  clientPhone?: string;
  referralCodeUsed: string;
  products?: ProductShopItem[];
}): {
  clientReward: ReferralDiscountReward;
  referrerReward: ReferralDiscountReward;
  mostExpensiveWig: ProductShopItem;
} {
  const { bookingId, serviceName, clientName, clientPhone, referralCodeUsed, products } = params;
  const mostExpensiveWig = getMostExpensiveWig(products);

  // Exact 3 days = 72 hours from current timestamp
  const now = new Date();
  const expiresAtDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const expiresAt = expiresAtDate.toISOString();
  const createdAt = now.toISOString();

  // 25% discount specifically on the most expensive wig
  const discountPercentage = 25;
  const discountAmount = Math.round(mostExpensiveWig.price * (discountPercentage / 100));

  const randA = Math.random().toString(36).substring(2, 6).toUpperCase();
  const randB = Math.random().toString(36).substring(2, 6).toUpperCase();

  // 1. New Client's Welcome Reward Code
  const clientReward: ReferralDiscountReward = {
    id: `REW-CLI-${Date.now()}-${randA}`,
    code: `REF-WELCOME-${randA}`,
    recipientType: 'new_client',
    recipientName: clientName.trim() || 'New Client',
    recipientPhone: clientPhone,
    bookingId,
    serviceBookedName: serviceName,
    targetProductType: 'most_expensive_wig',
    targetProductId: mostExpensiveWig.id,
    targetProductName: mostExpensiveWig.name,
    targetProductOriginalPrice: mostExpensiveWig.price,
    discountPercentage,
    discountAmount,
    createdAt,
    expiresAt,
    isUsed: false,
    associatedReferralCode: referralCodeUsed,
    referrerName: referralCodeUsed.split('-')[0] || 'Friend',
  };

  // 2. Referrer's Royalty Reward Code
  const referrerReward: ReferralDiscountReward = {
    id: `REW-REF-${Date.now()}-${randB}`,
    code: `REF-REWARD-${randB}`,
    recipientType: 'referrer',
    recipientName: referralCodeUsed.split('-')[0] || 'Referrer',
    bookingId,
    serviceBookedName: serviceName,
    targetProductType: 'most_expensive_wig',
    targetProductId: mostExpensiveWig.id,
    targetProductName: mostExpensiveWig.name,
    targetProductOriginalPrice: mostExpensiveWig.price,
    discountPercentage,
    discountAmount,
    createdAt,
    expiresAt,
    isUsed: false,
    associatedReferralCode: referralCodeUsed,
    referrerName: referralCodeUsed.split('-')[0] || 'Referrer',
  };

  try {
    const existing = getAllStoredDiscountRewards();
    localStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify([clientReward, referrerReward, ...existing]));

    // Update referrer profile if the user on this browser owns this referral code
    const profile = getStoredReferralProfile();
    if (profile && profile.referralCode === referralCodeUsed) {
      profile.successfulBookings = (profile.successfulBookings || 0) + 1;
      saveReferralProfile(profile);
    }
  } catch {
    // Ignore
  }

  return { clientReward, referrerReward, mostExpensiveWig };
}

/**
 * Validates a discount code entered at checkout.
 * STRICT ENFORCEMENT:
 * 1. Must not be expired (strictly within 3 days).
 * 2. Must not already be used.
 * 3. STRICTLY APPLIES ONLY TO THE MOST EXPENSIVE WIG AT THE TIME!
 */
export function validateDiscountCodeForCart(
  inputCode: string,
  cart: CartItem[],
  products: ProductShopItem[] = PRODUCTS_SHOP_DATA
): ReferralValidationResult {
  const code = inputCode.trim().toUpperCase();
  if (!code) {
    return { valid: false, error: 'Please enter a discount code.' };
  }

  const mostExpensiveWig = getMostExpensiveWig(products);
  const allRewards = getAllStoredDiscountRewards();
  const reward = allRewards.find((r) => r.code.toUpperCase() === code);

  // If no stored reward matches, check if it is a demo/universal test reward
  if (!reward) {
    return {
      valid: false,
      error: `Invalid discount code. Ensure you entered the exact code received from your referral reward.`,
    };
  }

  // 1. Check if already used
  if (reward.isUsed) {
    return {
      valid: false,
      error: `This discount code (${reward.code}) has already been redeemed and cannot be reused.`,
      reward,
    };
  }

  // 2. Check 3-day expiry constraint
  const expiryCheck = getTimeRemaining(reward.expiresAt);
  if (expiryCheck.isExpired) {
    return {
      valid: false,
      error: `This discount code has expired. Referral discount codes strictly expire after 3 days (72 hours).`,
      reward,
      isExpired: true,
    };
  }

  // 3. STRICT ENFORCEMENT: Is the most expensive wig in the cart?
  const hasTargetWig = cart.some(
    (item) =>
      item.product.id === mostExpensiveWig.id ||
      item.product.id === reward.targetProductId
  );

  if (!hasTargetWig) {
    return {
      valid: false,
      error: `Strict Referral Restriction: This 3-day discount code applies strictly to our most expensive wig at the time: "${mostExpensiveWig.name}" (${mostExpensiveWig.formattedPrice}). Please add this wig to your cart to redeem your ${reward.discountPercentage}% discount!`,
      reward,
      targetWig: mostExpensiveWig,
      timeRemainingFormatted: expiryCheck.formatted,
    };
  }

  // Calculation strictly for the most expensive wig
  const discountAmount = Math.round(mostExpensiveWig.price * (reward.discountPercentage / 100));

  return {
    valid: true,
    reward,
    discountAmount,
    targetWig: mostExpensiveWig,
    timeRemainingFormatted: expiryCheck.formatted,
  };
}

/**
 * Marks a discount code as redeemed
 */
export function markDiscountRewardUsed(code: string): void {
  try {
    const all = getAllStoredDiscountRewards();
    const updated = all.map((r) =>
      r.code.toUpperCase() === code.trim().toUpperCase()
        ? { ...r, isUsed: true, usedAt: new Date().toISOString() }
        : r
    );
    localStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }
}
