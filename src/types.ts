export type FlyerFormat = 'portrait' | 'square' | 'story';
export type FlyerTheme = 'nude-luxury' | 'mocha-velvet' | 'warm-ivory';
export type ActiveTab = 'flyer' | 'booking' | 'shop' | 'gallery' | 'referral';

export interface StyleSubtype {
  id: string;
  name: string;
  description: string;
  badge?: string;
  priceModifier?: number;
  popular?: boolean;
}

export interface StyleSizeOption {
  id: string;
  name: string;
  label: string;
  priceModifier: number;
}

export interface StyleLengthOption {
  id: string;
  name: string;
  label: string;
  priceModifier: number;
}

export interface ServiceItem {
  id: string;
  name: string;
  tagline: string;
  image: string;
  features?: string[];
  startingPrice?: string;
  duration?: string;
  typesList?: StyleSubtype[];
  sizesList?: StyleSizeOption[];
  lengthsList?: StyleLengthOption[];
}

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface ProductShopItem {
  id: string;
  name: string;
  price: number;
  formattedPrice: string;
  category: 'Wash & Cleansing' | 'Conditioners & Masks' | 'Serums & Oils' | 'Accessories & Silk' | 'Luxury Ready-to-Wear Wigs';
  volume: string;
  image: string;
  description: string;
  benefits: string[];
  inStock: boolean;
  featured?: boolean;
  isWig?: boolean;
  wigLength?: string;
  wigDensity?: string;
  laceType?: string;
}

export interface CartItem {
  product: ProductShopItem;
  quantity: number;
}

export interface AddOnOption {
  id: string;
  name: string;
  price: number;
  formattedPrice: string;
  duration: string;
}

export interface HomeServiceDetails {
  address: string;
  areaZone: string;
  landmark: string;
  socialHandle: string;
  alternateContactName: string;
  alternateContactPhone: string;
  residenceType: string;
  estimatedHomeFee: number;
}

export interface AppointmentBooking {
  id: string;
  serviceId: string;
  serviceName: string;
  stylist: string;
  date: string;
  timeSlot: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  notes?: string;
  selectedSubtype?: string;
  selectedSize?: string;
  selectedLength?: string;
  locationType: 'salon' | 'home_service';
  homeServiceDetails?: HomeServiceDetails;
  addOns: string[];
  totalPrice: number;
  createdAt: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  isMaintenanceScheduled?: boolean;
  lastMaintenanceScheduledDate?: string;
  maintenanceDismissed?: boolean;
  customInspoMedia?: CustomInspoMedia;
  customInspoNotes?: string;
}

export interface CustomInspoMedia {
  type: 'image' | 'video';
  dataUrl: string;
  fileName: string;
  fileSizeBytes?: number;
  notes?: string;
  externalLink?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'client' | 'stylist';
  text: string;
  timestamp: string;
  mediaType?: 'image' | 'video';
  mediaUrl?: string;
  mediaName?: string;
  intentType?: 'style_discussion' | 'inspo_photo' | 'post_hair_review';
  reviewData?: {
    rating: number;
    serviceName?: string;
    clientName?: string;
    feedback?: string;
  };
}

export interface ProductOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  items: { productName: string; quantity: number; price: number }[];
  subtotal: number;
  createdAt: string;
}

export interface MaintenanceScheduleInfo {
  bookingId: string;
  serviceId: string;
  serviceName: string;
  selectedSubtype?: string;
  stylist: string;
  originalAppointmentDate: string;
  formattedOriginalDate: string;
  recommendedServiceId: string;
  recommendedServiceName: string;
  recommendedActionTitle: string;
  cycleWeeks: number;
  cycleDays: number;
  daysElapsed: number;
  daysUntilDue: number;
  isDue: boolean;
  dueDate: string;
  formattedDueDate: string;
  urgency: 'due_now' | 'approaching' | 'fresh' | 'upcoming';
  hairCareGuidance: string;
  recommendedAddOn: string;
  benefitSummary: string;
}

export interface BeforeAfterTransformation {
  id: string;
  title: string;
  category: string;
  serviceId: string;
  beforeImage: string;
  afterImage: string;
  duration: string;
  description: string;
  resultHighlights: string[];
  stylist: string;
  clientFeedback?: string;
}

export interface Testimonial {
  id: string;
  clientName: string;
  location: string;
  rating: number;
  review: string;
  serviceBooked: string;
  date: string;
  verified: boolean;
}

export interface BrandInfo {
  name: string;
  slogan: string;
  whatsapp: string;
  whatsappRaw: string;
  facebook: string;
  instagram: string;
  website: string;
  domain: string;
  services: string[];
}

export interface ReferralProfile {
  referralCode: string;
  referrerName: string;
  referrerPhone?: string;
  createdAt: string;
  totalReferrals: number;
  successfulBookings: number;
}

export interface ReferralDiscountReward {
  id: string;
  code: string;
  recipientType: 'referrer' | 'new_client';
  recipientName: string;
  recipientPhone?: string;
  bookingId: string;
  serviceBookedName: string;
  targetProductType: 'most_expensive_wig';
  targetProductId: string;
  targetProductName: string;
  targetProductOriginalPrice: number;
  discountPercentage: number; // e.g. 25%
  discountAmount: number; // e.g. ₦60,000 off
  createdAt: string;
  expiresAt: string; // Exactly 72 hours (3 days) from creation
  isUsed: boolean;
  usedAt?: string;
  associatedReferralCode: string;
  referrerName: string;
}

export interface ReferralValidationResult {
  valid: boolean;
  error?: string;
  reward?: ReferralDiscountReward;
  discountAmount?: number;
  targetWig?: ProductShopItem;
  timeRemainingFormatted?: string;
  isExpired?: boolean;
}

