import { AppointmentBooking, MaintenanceScheduleInfo } from '../types';
import { BRAND_DATA } from '../data/flyerData';

// Maintenance guidelines and benefits specific to each appointment type
interface ServiceMaintenanceProfile {
  recommendedServiceId: string;
  recommendedServiceName: string;
  recommendedActionTitle: string;
  hairCareGuidance: string;
  recommendedAddOn: string;
  benefitSummary: string;
}

const SERVICE_PROFILES: Record<string, ServiceMaintenanceProfile> = {
  dreadlocks: {
    recommendedServiceId: 'dreadlocks',
    recommendedServiceName: 'Dreadlocks Root Retwist & Scalp Detox',
    recommendedActionTitle: '4-Week Loc Retwist & Root Maintenance',
    hairCareGuidance:
      'At 4 weeks, new root growth begins to loosen and stray from the loc core. A precision palm-roll retwist and apple cider vinegar scalp detox secures the root base, stops loc thinning, and prevents adjacent roots from matting together.',
    recommendedAddOn: 'ACV Scalp Detox & Peppermint Oil Infusion',
    benefitSummary: 'Maintains crisp geometric parts, strengthens loc roots, and eliminates lint and buildup.',
  },
  'boho-braids': {
    recommendedServiceId: 'boho-braids',
    recommendedServiceName: 'Perimeter & Front Edge Refresh',
    recommendedActionTitle: '4-Week Hairline Perimeter & Curl Refresh',
    hairCareGuidance:
      'After 4 weeks of protective styling, hairline edges endure the highest natural movement and styling tension. Refreshing the front two rows relieves follicle tension, guards against traction alopecia, and revives the entire look for another month.',
    recommendedAddOn: 'Hairline Tension Relief & Edge Hydration',
    benefitSummary: 'Protects delicate baby hairs and restores buoyant curls without needing a full-head redo.',
  },
  'wigs-revamping': {
    recommendedServiceId: 'wigs-revamping',
    recommendedServiceName: 'Lace Cleanse, Steam Deep Conditioning & Silk Press',
    recommendedActionTitle: '4-Week Unit Deep Spa & Lace Revamp',
    hairCareGuidance:
      'Wigs and frontal installs accumulate makeup oils, sweat, and adhesive residue within 4 weeks. A specialized organic hot-oil bath, lace adhesive dissolution, and bone-straight silk pressing restores silky bounce and extends hair longevity.',
    recommendedAddOn: 'Keratin Gloss & Lace Melt Revamp',
    benefitSummary: 'Dissolves glue buildup, seals cuticle shine, and prevents lace tears or matting.',
  },
  'natural-hairstyling': {
    recommendedServiceId: 'natural-hairstyling',
    recommendedServiceName: 'Coil Steam Hydration & Split-End Trimming',
    recommendedActionTitle: '4-Week Deep Steam Hydration & Ends Dusting',
    hairCareGuidance:
      'Natural coils lose core moisture and develop knotting around week 4. A therapeutic hooded steam session opens the cuticle for raw shea and argan absorption, paired with light dusting of dry split ends to preserve retention.',
    recommendedAddOn: 'Deep Protein Moisture Mask',
    benefitSummary: 'Eliminates dry brittle ends, re-establishes curl definition, and maximizes length retention.',
  },
  'african-traditional': {
    recommendedServiceId: 'african-traditional',
    recommendedServiceName: 'Protective Style Takedown & Scalp Scalp Rejuvenation',
    recommendedActionTitle: '4-Week Style Takedown & Scalp Rebalancing',
    hairCareGuidance:
      'Traditional Didi and African hair threading fulfill their protective cycle at 4 weeks. Taking down the style gently, treating the scalp with herbal botanical oils, and resting the roots prevents fatigue and keeps follicles vigorous.',
    recommendedAddOn: 'Hot Herbal Oil Scalp Rejuvenation',
    benefitSummary: 'Gives follicles a healthy breather, stimulates micro-circulation, and prevents shedding.',
  },
};

const DEFAULT_PROFILE: ServiceMaintenanceProfile = {
  recommendedServiceId: 'dreadlocks',
  recommendedServiceName: 'Hair & Scalp Health Maintenance Visit',
  recommendedActionTitle: '4-Week Professional Maintenance Touch-up',
  hairCareGuidance:
    'A professional 4-week salon maintenance visit inspects scalp balance, removes product residues, tightens loose sections, and refreshes hair health for sustained beauty.',
  recommendedAddOn: 'Organic Scalp Detox & Moisture Mask',
  benefitSummary: 'Preserves hair vitality, maintains salon-fresh appearance, and promotes root growth.',
};

/**
 * Calculates the automated 4-week maintenance status for any appointment booking.
 */
export function calculateMaintenanceStatus(
  booking: AppointmentBooking,
  currentDate: Date = new Date()
): MaintenanceScheduleInfo {
  const aptDate = new Date(booking.date);
  // Default to today if date is invalid
  const validAptDate = isNaN(aptDate.getTime()) ? new Date() : aptDate;

  // 4 weeks = 28 days
  const CYCLE_DAYS = 28;
  const CYCLE_WEEKS = 4;

  const dueDateTime = new Date(validAptDate.getTime() + CYCLE_DAYS * 24 * 60 * 60 * 1000);
  const dueDateStr = dueDateTime.toISOString().split('T')[0];

  // Calculate elapsed days
  const diffTime = currentDate.getTime() - validAptDate.getTime();
  const daysElapsed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const daysUntilDue = CYCLE_DAYS - daysElapsed;

  const isDue = daysElapsed >= CYCLE_DAYS;

  let urgency: 'due_now' | 'approaching' | 'fresh' | 'upcoming';
  if (daysElapsed < 0) {
    urgency = 'upcoming';
  } else if (daysElapsed >= CYCLE_DAYS) {
    urgency = 'due_now';
  } else if (daysElapsed >= 21) {
    urgency = 'approaching';
  } else {
    urgency = 'fresh';
  }

  const profile = SERVICE_PROFILES[booking.serviceId] || DEFAULT_PROFILE;

  const formattedOriginalDate = validAptDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedDueDate = dueDateTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    bookingId: booking.id,
    serviceId: booking.serviceId,
    serviceName: booking.serviceName,
    selectedSubtype: booking.selectedSubtype,
    stylist: booking.stylist,
    originalAppointmentDate: booking.date,
    formattedOriginalDate,
    recommendedServiceId: profile.recommendedServiceId,
    recommendedServiceName: profile.recommendedServiceName,
    recommendedActionTitle: profile.recommendedActionTitle,
    cycleWeeks: CYCLE_WEEKS,
    cycleDays: CYCLE_DAYS,
    daysElapsed,
    daysUntilDue,
    isDue,
    dueDate: dueDateStr,
    formattedDueDate,
    urgency,
    hairCareGuidance: profile.hairCareGuidance,
    recommendedAddOn: profile.recommendedAddOn,
    benefitSummary: profile.benefitSummary,
  };
}

/**
 * Filters and groups bookings to find the latest appointment for each appointment type.
 * Returns automated maintenance info for the user's latest appointment of each type.
 */
export function getLatestAppointmentsByType(
  bookings: AppointmentBooking[]
): Map<string, { booking: AppointmentBooking; maintenance: MaintenanceScheduleInfo }> {
  const map = new Map<string, { booking: AppointmentBooking; maintenance: MaintenanceScheduleInfo }>();

  // Sort by date descending (most recent first)
  const sorted = [...bookings].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  for (const booking of sorted) {
    const key = booking.serviceId;
    if (!map.has(key)) {
      const maintenance = calculateMaintenanceStatus(booking);
      map.set(key, { booking, maintenance });
    }
  }

  return map;
}

/**
 * Returns all active maintenance notifications that are DUE NOW (>= 4 weeks) or APPROACHING (21+ days).
 */
export function getDueMaintenanceNotifications(
  bookings: AppointmentBooking[]
): { booking: AppointmentBooking; maintenance: MaintenanceScheduleInfo }[] {
  const latestMap = getLatestAppointmentsByType(bookings);
  const dueList: { booking: AppointmentBooking; maintenance: MaintenanceScheduleInfo }[] = [];

  latestMap.forEach((item) => {
    // Only include if not dismissed and not already marked as maintenance scheduled
    if (!item.booking.maintenanceDismissed && !item.booking.isMaintenanceScheduled) {
      if (item.maintenance.isDue || item.maintenance.urgency === 'approaching') {
        dueList.push(item);
      }
    }
  });

  return dueList;
}

/**
 * Prepares an automated WhatsApp booking message tailored for a 4-week maintenance visit.
 */
export function generateMaintenanceWhatsAppUrl(
  booking: AppointmentBooking,
  maintenance: MaintenanceScheduleInfo
): string {
  const message = encodeURIComponent(
    `Hello Rose / RossyBraids! 👑✨\n` +
      `I am following up on my 4-WEEK MAINTENANCE VISIT reminder for my hair:\n\n` +
      `• Previous Booking Ref: ${booking.id}\n` +
      `• Original Hairstyle: ${booking.serviceName}${booking.selectedSubtype ? ` (${booking.selectedSubtype})` : ''}\n` +
      `• Original Date: ${maintenance.formattedOriginalDate} (${maintenance.daysElapsed} days ago / 4+ weeks)\n` +
      `• Recommended Maintenance: ${maintenance.recommendedActionTitle}\n` +
      `• Recommended Add-on: ${maintenance.recommendedAddOn}\n` +
      `• Client Name: ${booking.clientName}\n` +
      `• Phone: ${booking.clientPhone}\n\n` +
      `Please let me know your earliest opening to schedule this 4-week maintenance session. Thank you!`
  );

  return `https://wa.me/${BRAND_DATA.whatsappRaw}?text=${message}`;
}

/**
 * Generates initial demo / sample past appointments so users can immediately test
 * and experience the automated 4-week notification prompt without waiting.
 */
export function getSamplePastAppointments(): AppointmentBooking[] {
  const now = new Date();

  // Booking 1: 30 days ago (4+ weeks ago) -> DUE NOW
  const date30DaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  // Booking 2: 12 days ago (< 4 weeks) -> FRESH (16 days remaining)
  const date12DaysAgo = new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  return [
    {
      id: 'RB-984210',
      serviceId: 'dreadlocks',
      serviceName: 'Dreadlocks & Reloc',
      selectedSubtype: 'Palm Roll Retwist & Scalp Treatment',
      selectedSize: 'Medium Classic',
      selectedLength: 'Mid-Back Length',
      stylist: 'Rose Iyaji (Master Artisan)',
      date: date30DaysAgo,
      timeSlot: '11:30 AM',
      clientName: 'Amara Kalu',
      clientPhone: '08123456789',
      clientEmail: 'amara@example.com',
      locationType: 'salon',
      addOns: ['ACV Detox Scalp Wash & Peppermint Steam'],
      totalPrice: 24500,
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'confirmed',
      notes: 'Client loves peppermint oil finish.',
    },
    {
      id: 'RB-983115',
      serviceId: 'boho-braids',
      serviceName: 'Boho Braids & Island Curls',
      selectedSubtype: 'French Curl Goddess Braids',
      selectedSize: 'Medium (Standard Part)',
      selectedLength: 'Waist Length',
      stylist: 'Rose Iyaji (Master Artisan)',
      date: date12DaysAgo,
      timeSlot: '02:00 PM',
      clientName: 'Amara Kalu',
      clientPhone: '08123456789',
      clientEmail: 'amara@example.com',
      locationType: 'salon',
      addOns: ['Organic Argan Oil Scalp Shield'],
      totalPrice: 42000,
      createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'confirmed',
      notes: 'Use golden clips at the crown.',
    },
  ];
}
