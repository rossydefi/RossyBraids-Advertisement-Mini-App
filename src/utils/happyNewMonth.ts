import { BRAND_DATA } from '../data/flyerData';

export interface NewMonthCelebrationData {
  eligible: boolean;
  clientName: string;
  monthName: string;
  year: number;
  message: string;
  perkTitle: string;
  perkDescription: string;
  couponCode: string;
  sourceType: 'booking' | 'product_order' | 'both' | 'none';
}

const MONTH_BLESSINGS: Record<number, string> = {
  0: 'May this January awaken fresh grace, royal favor, and thriving beauty in your steps.',
  1: 'May this February surround you with deep love, radiant joy, and luscious crown perfection.',
  2: 'May this March bring remarkable blooming, open doors, and effortless elegance to your hair.',
  3: 'May this April shower you with divine peace, abundant sweetness, and renewed strength.',
  4: 'May this May crown every effort with breakthrough, glory, and gleaming mirror shine.',
  5: 'May this June radiate sunshine, celebration, and endless compliments wherever you walk.',
  6: 'May this July mark perfection, peace of mind, and divine elevation for you and your household.',
  7: 'May this August unfold new beginnings, fruitful harvests, and boundless happiness.',
  8: 'May this September usher in fulfillment, divine favor, and flawless hair protection.',
  9: 'May this October yield double honor, royal splendor, and exquisite blessings for you.',
  10: 'May this November wrap you in divine gratitude, answered prayers, and radiant beauty.',
  11: 'May this December crown your entire year with majesty, celebrations, and royal bliss.',
};

/**
 * Checks whether the visitor has ever booked an appointment or purchased a product.
 */
export function checkNewMonthEligibility(): NewMonthCelebrationData {
  const now = new Date();
  const currentMonthIdx = now.getMonth();
  const monthName = now.toLocaleString('en-US', { month: 'long' });
  const year = now.getFullYear();

  let hasBooking = false;
  let hasProductOrder = false;
  let clientName = 'Beloved Queen';

  try {
    const bookingsRaw = localStorage.getItem('rossybraids_bookings');
    if (bookingsRaw) {
      const bookings = JSON.parse(bookingsRaw);
      if (Array.isArray(bookings) && bookings.length > 0) {
        hasBooking = true;
        // Grab client name from latest booking
        const latest = bookings[0];
        if (latest && latest.clientName && latest.clientName.trim() && latest.clientName !== 'Demo Client') {
          clientName = latest.clientName.trim();
        }
      }
    }

    const ordersRaw = localStorage.getItem('rossybraids_orders');
    if (ordersRaw) {
      const orders = JSON.parse(ordersRaw);
      if (Array.isArray(orders) && orders.length > 0) {
        hasProductOrder = true;
        const latestOrder = orders[0];
        if (clientName === 'Beloved Queen' && latestOrder?.customerName?.trim()) {
          clientName = latestOrder.customerName.trim();
        }
      }
    }
  } catch {
    // Ignore storage parsing errors
  }

  const eligible = hasBooking || hasProductOrder;
  const sourceType =
    hasBooking && hasProductOrder ? 'both' : hasBooking ? 'booking' : hasProductOrder ? 'product_order' : 'none';

  const seasonalBlessing = MONTH_BLESSINGS[currentMonthIdx] || MONTH_BLESSINGS[8];

  const message =
    `Happy New Month, ${clientName}! 👑✨\n\n` +
    `As we step gracefully into ${monthName} ${year}, the entire RossyBraids family sends you our warmest royal love, gratitude, and heartfelt blessings. ` +
    `Thank you for trusting us to crown your beauty with artisan care, tension-free comfort, and salon excellence.\n\n` +
    `${seasonalBlessing} May your edges flourish, your scalp stay refreshed, and your crown radiate majesty every single day of this new month!\n\n` +
    `With royal affection,\nRose Iyaji & The RossyBraids Team`;

  const couponCode = `ROSSY-${monthName.slice(0, 3).toUpperCase()}${year}`;

  return {
    eligible,
    clientName,
    monthName,
    year,
    message,
    perkTitle: `Exclusive ${monthName} Royal Appreciation Gift`,
    perkDescription:
      'Complimentary Organic Scalp Detox & Peppermint Steam with your next booking, or 10% off salon hair products!',
    couponCode,
    sourceType,
  };
}

/**
 * Checks if the user has already acknowledged the current month's greeting.
 */
export function hasSeenCurrentMonthGreeting(): boolean {
  try {
    const now = new Date();
    const key = `rossybraids_hnm_${now.getFullYear()}_${now.getMonth()}`;
    return localStorage.getItem(key) === 'seen';
  } catch {
    return false;
  }
}

/**
 * Marks the current month's greeting as seen.
 */
export function markCurrentMonthGreetingSeen(): void {
  try {
    const now = new Date();
    const key = `rossybraids_hnm_${now.getFullYear()}_${now.getMonth()}`;
    localStorage.setItem(key, 'seen');
  } catch {
    // Ignore
  }
}

/**
 * Resets the seen state (for testing or re-viewing).
 */
export function resetCurrentMonthGreetingSeen(): void {
  try {
    const now = new Date();
    const key = `rossybraids_hnm_${now.getFullYear()}_${now.getMonth()}`;
    localStorage.removeItem(key);
  } catch {
    // Ignore
  }
}

/**
 * Generates WhatsApp URL to claim Happy New Month perk.
 */
export function generateNewMonthClaimWhatsAppUrl(data: NewMonthCelebrationData): string {
  const text = encodeURIComponent(
    `Hello Rose / RossyBraids! 👑🌸\n` +
      `Happy New Month of ${data.monthName}! Thank you so much for the sweet new month royal greeting & blessing.\n\n` +
      `• Client Name: ${data.clientName}\n` +
      `• Royal Code: ${data.couponCode}\n` +
      `• Gift: ${data.perkDescription}\n\n` +
      `I would love to apply this perk to my next hair session / order. Wishing you a blessed and prosperous new month!`
  );

  return `https://wa.me/${BRAND_DATA.whatsappRaw}?text=${text}`;
}
