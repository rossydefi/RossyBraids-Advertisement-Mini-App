import React, { useState, useEffect } from 'react';
import {
  SERVICES_DATA,
  ADD_ONS_DATA,
  TIME_SLOTS,
  STYLISTS,
  BRAND_DATA,
  LOCATION_TIERS,
  LocationTier,
} from '../data/flyerData';
import {
  AddOnOption,
  AppointmentBooking,
  CustomInspoMedia,
  HomeServiceDetails,
  ServiceItem,
  StyleLengthOption,
  StyleSizeOption,
  StyleSubtype,
} from '../types';
import confetti from 'canvas-confetti';
import { AppointmentHistory } from './AppointmentHistory';
import { CustomStyleInspoUpload } from './CustomStyleInspoUpload';
import { BookingChatInterface } from './BookingChatInterface';
import { HappyNewMonthModal } from './HappyNewMonthModal';
import { getDueMaintenanceNotifications, getSamplePastAppointments } from '../utils/maintenance';
import {
  checkNewMonthEligibility,
  hasSeenCurrentMonthGreeting,
  markCurrentMonthGreetingSeen,
} from '../utils/happyNewMonth';
import {
  getActiveReferralCode,
  createReferralRewardsOnBooking,
  getTimeRemaining,
  extractReferralCodeFromInput,
} from '../utils/referral';
import { PRODUCTS_SHOP_DATA } from '../data/flyerData';
import { ReferralDiscountReward, ProductShopItem } from '../types';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  CheckCircle2,
  Sparkles,
  Scissors,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Check,
  MessageCircle,
  Pin,
  Home,
  Building2,
  MapPin,
  Instagram,
  AlertCircle,
  Info,
  Layers,
  Ruler,
  Lock,
  Compass,
  Bell,
  History,
  Crown,
  Gift,
  Heart,
  Camera,
  Copy,
  Tag,
} from 'lucide-react';

interface BookingAppointmentsProps {
  initialServiceId?: string;
  onNavigateToShop?: () => void;
  onOpenReferralModal?: () => void;
  onNavigateToShopWithWig?: (wigId: string, discountCode?: string) => void;
}

export const BookingAppointments: React.FC<BookingAppointmentsProps> = ({
  initialServiceId,
  onNavigateToShop,
  onOpenReferralModal,
  onNavigateToShopWithWig,
}) => {
  // Available dates: next 14 days
  const today = new Date();
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() + i + 1);
    return {
      iso: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      full: d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      }),
    };
  });

  // Main Service State
  const [selectedService, setSelectedService] = useState<ServiceItem>(() => {
    if (initialServiceId) {
      const found = SERVICES_DATA.find((s) => s.id === initialServiceId);
      if (found) return found;
    }
    // Default to dreadlocks or wigs
    return SERVICES_DATA.find((s) => s.id === 'dreadlocks') || SERVICES_DATA[0];
  });

  // Pinned Subtype, Size, and Length State
  const [pinnedSubtype, setPinnedSubtype] = useState<StyleSubtype | null>(() => {
    return selectedService.typesList && selectedService.typesList.length > 0
      ? selectedService.typesList[0]
      : null;
  });

  const [selectedSize, setSelectedSize] = useState<StyleSizeOption | null>(() => {
    return selectedService.sizesList && selectedService.sizesList.length > 0
      ? selectedService.sizesList.find((s) => s.priceModifier === 0) || selectedService.sizesList[0]
      : null;
  });

  const [selectedLength, setSelectedLength] = useState<StyleLengthOption | null>(() => {
    return selectedService.lengthsList && selectedService.lengthsList.length > 0
      ? selectedService.lengthsList.find((l) => l.priceModifier === 0) || selectedService.lengthsList[0]
      : null;
  });

  // Service Location Mode: Salon vs Home Service
  const [locationType, setLocationType] = useState<'salon' | 'home_service'>('salon');
  const [selectedLocationTier, setSelectedLocationTier] = useState<LocationTier>(LOCATION_TIERS[1]);

  // Home Service Safety & Verification Form State
  const [homeAddress, setHomeAddress] = useState<string>('');
  const [homeLandmark, setHomeLandmark] = useState<string>('');
  const [socialHandle, setSocialHandle] = useState<string>('');
  const [residenceType, setResidenceType] = useState<string>('Gated Residential Estate');
  const [altContactName, setAltContactName] = useState<string>('');
  const [altContactPhone, setAltContactPhone] = useState<string>('');
  const [safetyTermsAccepted, setSafetyTermsAccepted] = useState<boolean>(true);

  // Stylist, Timing, and Add-ons
  const [selectedStylist, setSelectedStylist] = useState<string>(STYLISTS[0].name);
  const [selectedDate, setSelectedDate] = useState<string>(availableDates[0].iso);
  const [selectedTime, setSelectedTime] = useState<string>(TIME_SLOTS[0]);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOnOption[]>([]);

  // Client Details
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [hairNotes, setHairNotes] = useState<string>('');

  // Referral Reward Program State
  const [referralCodeInput, setReferralCodeInput] = useState<string>(() => {
    return getActiveReferralCode() || '';
  });
  const [referralInputActive, setReferralInputActive] = useState<boolean>(() => {
    return !!getActiveReferralCode();
  });
  const [earnedReferralReward, setEarnedReferralReward] = useState<{
    clientReward: ReferralDiscountReward;
    referrerReward: ReferralDiscountReward;
    mostExpensiveWig: ProductShopItem;
  } | null>(null);
  const [copiedRewardCode, setCopiedRewardCode] = useState<string | null>(null);
  const [rewardCountdown, setRewardCountdown] = useState<string>('');

  // Update referral timer if reward is earned
  useEffect(() => {
    if (!earnedReferralReward) return;

    const updateTimer = () => {
      const remaining = getTimeRemaining(earnedReferralReward.clientReward.expiresAt);
      if (remaining.isExpired) {
        setRewardCountdown('Expired');
      } else {
        setRewardCountdown(remaining.formatted);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [earnedReferralReward]);

  // Sub-navigation: Book Appointment vs Live Chat vs Appointment History & Maintenance
  const [activeSubTab, setActiveSubTab] = useState<'book' | 'chat' | 'history'>('book');
  const [maintenanceToast, setMaintenanceToast] = useState<string | null>(null);

  // Custom Style Inspiration Media (Photo or Video uploaded by client)
  const [customInspoMedia, setCustomInspoMedia] = useState<CustomInspoMedia | null>(null);

  // Automated Sweet Happy New Month Engine (for anyone who has booked or bought)
  const newMonthData = checkNewMonthEligibility();
  const [showNewMonthModal, setShowNewMonthModal] = useState<boolean>(false);

  useEffect(() => {
    // If client is eligible and has not seen this month's greeting yet, automatically pop it up gently
    if (newMonthData.eligible && !hasSeenCurrentMonthGreeting()) {
      const timer = setTimeout(() => {
        setShowNewMonthModal(true);
        markCurrentMonthGreetingSeen();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [newMonthData.eligible]);

  // Confirmation & Saved Bookings
  const [confirmedBooking, setConfirmedBooking] = useState<AppointmentBooking | null>(null);
  const [pastBookings, setPastBookings] = useState<AppointmentBooking[]>([]);

  // When selected service changes, update the pinned subtype, sizes, and lengths
  const handleServiceChange = (service: ServiceItem) => {
    setSelectedService(service);
    if (service.typesList && service.typesList.length > 0) {
      setPinnedSubtype(service.typesList[0]);
    } else {
      setPinnedSubtype(null);
    }
    if (service.sizesList && service.sizesList.length > 0) {
      const defaultSize =
        service.sizesList.find((s) => s.priceModifier === 0) || service.sizesList[0];
      setSelectedSize(defaultSize);
    } else {
      setSelectedSize(null);
    }
    if (service.lengthsList && service.lengthsList.length > 0) {
      const defaultLength =
        service.lengthsList.find((l) => l.priceModifier === 0) || service.lengthsList[0];
      setSelectedLength(defaultLength);
    } else {
      setSelectedLength(null);
    }
  };

  // Load bookings from localStorage (or populate sample past appointments for immediate testing)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('rossybraids_bookings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPastBookings(parsed);
        } else {
          const sample = getSamplePastAppointments();
          setPastBookings(sample);
          localStorage.setItem('rossybraids_bookings', JSON.stringify(sample));
        }
      } else {
        const sample = getSamplePastAppointments();
        setPastBookings(sample);
        localStorage.setItem('rossybraids_bookings', JSON.stringify(sample));
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleUpdatePastBookings = (updated: AppointmentBooking[]) => {
    setPastBookings(updated);
    try {
      localStorage.setItem('rossybraids_bookings', JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const handleScheduleMaintenanceFromHistory = (
    serviceId: string,
    notes?: string,
    prefillClientName?: string,
    prefillClientPhone?: string,
    pinnedSubtypeName?: string
  ) => {
    const targetService = SERVICES_DATA.find((s) => s.id === serviceId);
    if (targetService) {
      handleServiceChange(targetService);
      if (pinnedSubtypeName && targetService.typesList) {
        const matchingSub = targetService.typesList.find(
          (t) => t.name.toLowerCase() === pinnedSubtypeName.toLowerCase()
        );
        if (matchingSub) {
          setPinnedSubtype(matchingSub);
        }
      }
    }

    if (prefillClientName) setClientName(prefillClientName);
    if (prefillClientPhone) setClientPhone(prefillClientPhone);
    if (notes) setHairNotes(notes);

    setActiveSubTab('book');
    setMaintenanceToast(
      `4-Week Maintenance session pre-selected for ${targetService?.name || 'your style'}. Please choose your date & time.`
    );
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  // Automated 4-Week Maintenance notifications
  const dueMaintenanceList = getDueMaintenanceNotifications(pastBookings);
  const dueMaintenanceCount = dueMaintenanceList.length;

  // Compute Base and Dynamic Pricing
  const serviceBasePrice =
    selectedService.id === 'wigs-revamping'
      ? 25000
      : selectedService.id === 'boho-braids'
      ? 35000
      : selectedService.id === 'dreadlocks'
      ? 20000
      : selectedService.id === 'natural-hairstyling'
      ? 18000
      : selectedService.id === 'african-traditional'
      ? 16000
      : 15000;

  const subtypeModifier = pinnedSubtype?.priceModifier || 0;
  const sizeModifier = selectedSize?.priceModifier || 0;
  const lengthModifier = selectedLength?.priceModifier || 0;
  const addOnsTotal = selectedAddOns.reduce((acc, curr) => acc + curr.price, 0);
  const homeServiceFee = locationType === 'home_service' ? selectedLocationTier.fee : 0;

  const estimatedTotal =
    serviceBasePrice +
    subtypeModifier +
    sizeModifier +
    lengthModifier +
    addOnsTotal +
    homeServiceFee;

  const toggleAddOn = (addon: AddOnOption) => {
    if (selectedAddOns.some((item) => item.id === addon.id)) {
      setSelectedAddOns(selectedAddOns.filter((item) => item.id !== addon.id));
    } else {
      setSelectedAddOns([...selectedAddOns, addon]);
    }
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) {
      return;
    }

    if (locationType === 'home_service') {
      if (!homeAddress.trim() || !socialHandle.trim()) {
        alert('Please provide your residential address and social media handle for home service stylist safety verification.');
        return;
      }
    }

    const homeDetails: HomeServiceDetails | undefined =
      locationType === 'home_service'
        ? {
            address: homeAddress.trim(),
            areaZone: selectedLocationTier.name,
            landmark: homeLandmark.trim(),
            socialHandle: socialHandle.trim(),
            alternateContactName: altContactName.trim(),
            alternateContactPhone: altContactPhone.trim(),
            residenceType: residenceType,
            estimatedHomeFee: selectedLocationTier.fee,
          }
        : undefined;

    const newBooking: AppointmentBooking = {
      id: `RB-${Date.now().toString().slice(-6)}`,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      stylist: selectedStylist,
      date: selectedDate,
      timeSlot: selectedTime,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientEmail: clientEmail.trim(),
      notes: hairNotes.trim(),
      selectedSubtype: pinnedSubtype?.name,
      selectedSize: selectedSize?.name,
      selectedLength: selectedLength?.name,
      locationType,
      homeServiceDetails: homeDetails,
      addOns: selectedAddOns.map((a) => a.name),
      totalPrice: estimatedTotal,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
      customInspoMedia: customInspoMedia || undefined,
      customInspoNotes: customInspoMedia?.notes || undefined,
    };

    const updated = [newBooking, ...pastBookings];
    setPastBookings(updated);
    try {
      localStorage.setItem('rossybraids_bookings', JSON.stringify(updated));
    } catch {
      // Ignore
    }

    setConfirmedBooking(newBooking);

    // Process referral reward generation if referral code entered
    let generatedReferralResult: {
      clientReward: ReferralDiscountReward;
      referrerReward: ReferralDiscountReward;
      mostExpensiveWig: ProductShopItem;
    } | null = null;

    const rawRefCode = extractReferralCodeFromInput(referralCodeInput);
    if (rawRefCode) {
      const result = createReferralRewardsOnBooking({
        bookingId: newBooking.id,
        serviceName: newBooking.serviceName,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        referralCodeUsed: rawRefCode,
        products: PRODUCTS_SHOP_DATA,
      });
      if (result) {
        generatedReferralResult = result;
        setEarnedReferralReward(result);
      }
    }

    // Celebratory confetti
    confetti({
      particleCount: 85,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#FAF7F2', '#2D1B11', '#E5C158'],
    });

    // Prepare rich WhatsApp confirmation message
    const formattedDate =
      availableDates.find((d) => d.iso === selectedDate)?.full || selectedDate;
    const addOnsText =
      selectedAddOns.length > 0
        ? `\n• Scalp & Hair Add-ons: ${selectedAddOns.map((a) => a.name).join(', ')}`
        : '';
    const notesText = hairNotes ? `\n• Special Hair Notes: ${hairNotes}` : '';

    const customInspoText = customInspoMedia
      ? `\n\n📸 *BESPOKE CUSTOM INSPIRATION ATTACHED:*\n` +
        `• Media Type: ${customInspoMedia.type.toUpperCase()} (${customInspoMedia.fileName})\n` +
        (customInspoMedia.notes ? `• Custom Style Notes: ${customInspoMedia.notes}\n` : '') +
        (customInspoMedia.externalLink ? `• Inspo Link: ${customInspoMedia.externalLink}\n` : '') +
        `• (I will also share this media in our direct WhatsApp chat)`
      : '';

    const referralText = generatedReferralResult
      ? `\n\n👑 *VIP REFERRAL REWARD ACTIVATED (Strict 3-Day Window):*\n` +
        `• Booked using Referral Code: ${rawRefCode}\n` +
        `• Welcome Client Reward Code (25% OFF): ${generatedReferralResult.clientReward.code}\n` +
        `• Referrer Royalty Reward Code (25% OFF): ${generatedReferralResult.referrerReward.code}\n` +
        `• Strictly for Flagship Wig: ${generatedReferralResult.mostExpensiveWig.name}\n` +
        `• Expiry: Strictly valid for 72 hours (3 days)`
      : '';

    const styleDetailText = `\n• Hairstyle: ${selectedService.name}${
      pinnedSubtype ? `\n  - Pinned Exact Type: ${pinnedSubtype.name}` : ''
    }${selectedSize ? `\n  - Size: ${selectedSize.name}` : ''}${
      selectedLength ? `\n  - Desired Length: ${selectedLength.name}` : ''
    }`;

    const locationText =
      locationType === 'home_service'
        ? `\n\n🏡 *VIP HOME SERVICE DETAILS (Stylist Safety & Verification):*\n` +
          `• Delivery: Mobile Stylist to Residence\n` +
          `• Address: ${homeAddress}\n` +
          `• Area / Zone: ${selectedLocationTier.name} (+${selectedLocationTier.formattedFee})\n` +
          `• Landmark / Gate info: ${homeLandmark || 'N/A'}\n` +
          `• Residence Type: ${residenceType}\n` +
          `• Client Social Media Handle: ${socialHandle}\n` +
          (altContactName ? `• Emergency Alt Contact: ${altContactName} (${altContactPhone})\n` : '') +
          `• Home Service Fee: ${selectedLocationTier.formattedFee} (Subject to final location confirmation)`
        : `\n• Appointment Location: RossyBraids Salon Studio`;

    const message = encodeURIComponent(
      `Hello Rose / RossyBraids! 👑✨\nI would like to confirm my hair booking:\n\n` +
        `• Booking Reference: ${newBooking.id}\n` +
        `• Client Name: ${clientName}\n` +
        `• WhatsApp / Phone: ${clientPhone}\n` +
        styleDetailText +
        customInspoText +
        `\n• Assigned Stylist: ${selectedStylist}\n` +
        `• Date: ${formattedDate}\n` +
        `• Time Slot: ${selectedTime}` +
        locationText +
        addOnsText +
        notesText +
        referralText +
        `\n\n💰 *Total Estimated Investment:* ₦${estimatedTotal.toLocaleString()}\n` +
        `Please confirm your availability for this session. Thank you!`
    );

    window.open(`https://wa.me/${BRAND_DATA.whatsappRaw}?text=${message}`, '_blank');
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in text-[#2D1B11]">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#8F6A1E] text-xs font-sans-modern font-semibold uppercase tracking-widest">
          <CalendarIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
          Direct Salon & VIP Mobile Appointments
        </div>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D1B11] tracking-tight">
          Book Your VIP Hair Experience
        </h1>
        <p className="font-sans-modern text-sm sm:text-base text-[#6C4A32] max-w-2xl mx-auto">
          Browse through bespoke sizes and types for dreadlocks, African traditional styles, boho braids,
          and wigs. Choose salon appointments or book our verified VIP home service.
        </p>
      </div>

      {/* Automated Sweet Happy New Month Banner (Prompts whoever has booked or purchased) */}
      {newMonthData.eligible && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#2D1B11] via-[#4A2C1A] to-[#2D1B11] text-white border-2 border-[#D4AF37] shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F5E6A3] text-[#2D1B11] flex items-center justify-center shrink-0 shadow-sm">
              <Crown className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#F9E498]">
                  Royal Client Appreciation
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F9E498]">
                  Automated New Month Blessing
                </span>
              </div>
              <h4 className="font-serif-luxury text-base sm:text-lg font-bold text-white">
                Happy New Month, {newMonthData.clientName}! 👑✨
              </h4>
              <p className="text-xs text-[#DFCEBC] font-sans-modern">
                Wishing you flourishing beauty and peace in {newMonthData.monthName}. Your complimentary VIP scalp steam & massage blessing is ready.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <button
              type="button"
              onClick={() => setShowNewMonthModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F5E6A3] to-[#D4AF37] text-[#2D1B11] text-xs font-sans-modern font-bold hover:brightness-105 active:scale-95 transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <Gift className="w-4 h-4" />
              <span>Open Blessing & Gift</span>
            </button>
          </div>
        </div>
      )}

      {/* VIP Referral Reward Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#24130A] via-[#351C0E] to-[#24130A] border border-[#D4AF37]/50 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#F5E6A3] text-[#2A1810] flex items-center justify-center shrink-0 shadow-sm">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#F5E6A3]">
                Double Reward Referral Program
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                3-Day Strictly Enforced Window
              </span>
            </div>
            <p className="text-xs sm:text-sm font-serif-luxury font-bold text-white">
              Book with a Friend's Referral Link or Share Yours!
            </p>
            <p className="text-[11px] text-[#DFCEBC]">
              When you complete a booking using a referral code, both of you unlock 25% OFF our flagship luxury wig!
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center w-full sm:w-auto">
          {onOpenReferralModal && (
            <button
              type="button"
              onClick={onOpenReferralModal}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5E6A3] text-[#2A1810] text-xs font-sans-modern font-bold hover:brightness-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Crown className="w-3.5 h-3.5 fill-current" />
              <span>Referral Dashboard</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-navigation: Book New Appointment vs Real-time Chat vs My History & Maintenance Hub */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <div className="inline-flex p-1.5 rounded-full bg-white/95 backdrop-blur-sm border border-[#DFCEBC] shadow-sm gap-1 flex-wrap justify-center">
          <button
            type="button"
            onClick={() => setActiveSubTab('book')}
            className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-sans-modern font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'book'
                ? 'bg-[#2D1B11] text-[#F9E498] shadow-sm'
                : 'text-[#6C4A32] hover:text-[#2D1B11] hover:bg-black/5'
            }`}
          >
            <CalendarIcon className="w-4 h-4 text-[#D4AF37]" />
            <span>Book New Appointment</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('chat')}
            className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-sans-modern font-bold transition-all cursor-pointer flex items-center gap-2 relative ${
              activeSubTab === 'chat'
                ? 'bg-[#2D1B11] text-[#F9E498] shadow-sm'
                : 'text-[#6C4A32] hover:text-[#2D1B11] hover:bg-black/5'
            }`}
          >
            <MessageCircle className="w-4 h-4 text-[#D4AF37]" />
            <span>Chat with Stylist</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Stylist is online" />
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('history')}
            className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-sans-modern font-bold transition-all cursor-pointer flex items-center gap-2 relative ${
              activeSubTab === 'history'
                ? 'bg-[#2D1B11] text-[#F9E498] shadow-sm'
                : 'text-[#6C4A32] hover:text-[#2D1B11] hover:bg-black/5'
            }`}
          >
            <History className="w-4 h-4 text-[#D4AF37]" />
            <span>My History & Maintenance</span>
            {dueMaintenanceCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {dueMaintenanceCount} Due
              </span>
            )}
          </button>
        </div>

        {/* Quick button to preview Happy New Month blessing for all visitors */}
        {!newMonthData.eligible && (
          <button
            type="button"
            onClick={() => setShowNewMonthModal(true)}
            className="text-[11px] font-sans-modern text-[#8F6A1E] hover:text-[#2D1B11] bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 px-3 py-1.5 rounded-full border border-[#D4AF37]/30 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Crown className="w-3 h-3 text-[#D4AF37]" />
            <span>Preview Happy New Month Blessing</span>
          </button>
        )}
      </div>

      {/* Sub-view switcher */}
      {activeSubTab === 'history' ? (
        <AppointmentHistory
          bookings={pastBookings}
          onScheduleMaintenance={handleScheduleMaintenanceFromHistory}
          onUpdateBookings={handleUpdatePastBookings}
          onSwitchToBookingTab={() => setActiveSubTab('book')}
        />
      ) : activeSubTab === 'chat' ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white/90 rounded-xl border border-[#DFCEBC] shadow-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveSubTab('book')}
                className="text-xs font-sans-modern font-bold text-[#8F6A1E] hover:underline flex items-center gap-1 cursor-pointer"
              >
                ← Return to Appointment Booking
              </button>
            </div>
            <div className="text-xs text-[#6C4A32] font-sans-modern">
              Currently Selected Style:{' '}
              <strong className="text-[#2D1B11]">{selectedService.name}</strong>
              {pinnedSubtype && ` (${pinnedSubtype.name})`}
            </div>
          </div>

          <BookingChatInterface
            currentClientName={clientName}
            currentClientPhone={clientPhone}
            selectedServiceName={selectedService.name}
            onClose={() => setActiveSubTab('book')}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active 4-Week Maintenance Alert Banner inside Booking Form view */}
          {dueMaintenanceCount > 0 && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#2D1B11] via-[#3D2517] to-[#2D1B11] text-white border-2 border-[#D4AF37] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37] text-[#2D1B11] flex items-center justify-center shrink-0 animate-pulse">
                  <Bell className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-sans-modern font-bold block">
                    Automated Maintenance System Prompt
                  </span>
                  <p className="text-xs sm:text-sm text-[#F9E498] font-serif-luxury font-bold">
                    4-Week Maintenance Due: {dueMaintenanceList[0].booking.serviceName}
                  </p>
                  <p className="text-[11px] text-[#DFCEBC] font-sans-modern">
                    {dueMaintenanceList[0].maintenance.recommendedActionTitle} is recommended now to protect your roots and hair health.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const first = dueMaintenanceList[0];
                    handleScheduleMaintenanceFromHistory(
                      first.maintenance.recommendedServiceId,
                      `4-Week Maintenance Visit for ${first.booking.serviceName}.`,
                      first.booking.clientName,
                      first.booking.clientPhone,
                      first.booking.selectedSubtype
                    );
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#F5E6A3] text-[#2D1B11] text-xs font-sans-modern font-bold hover:brightness-105 transition-all cursor-pointer shadow-xs"
                >
                  Quick-Book Maintenance
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSubTab('history')}
                  className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#DFCEBC] text-xs font-sans-modern transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>View History ({pastBookings.length})</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Maintenance Pre-fill Notification Toast */}
          {maintenanceToast && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-sans-modern flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>{maintenanceToast}</span>
              </div>
              <button
                type="button"
                onClick={() => setMaintenanceToast(null)}
                className="text-amber-800 hover:text-amber-950 font-bold px-1.5 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Confirmation Banner if just booked */}
      {confirmedBooking && (
        <div className="p-6 rounded-xl bg-gradient-to-r from-[#2D1B11] via-[#3A2417] to-[#2D1B11] text-white border-2 border-[#D4AF37] shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#D4AF37] text-[#2D1B11] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-sans-modern font-semibold">
                Appointment Requested Successfully
              </span>
              <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold text-[#F9E498]">
                Reference: {confirmedBooking.id}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-sans-modern bg-black/30 p-3.5 rounded-lg border border-white/10">
            <div>
              <span className="text-[#DFCEBC] block">Service & Pinned Type:</span>
              <strong className="text-white text-sm block truncate">{confirmedBooking.serviceName}</strong>
              {confirmedBooking.selectedSubtype && (
                <span className="text-[#D4AF37] text-[11px] block truncate">
                  Pinned: {confirmedBooking.selectedSubtype}
                </span>
              )}
            </div>
            <div>
              <span className="text-[#DFCEBC] block">Location Mode:</span>
              <strong className="text-white text-sm">
                {confirmedBooking.locationType === 'home_service'
                  ? '🏡 VIP Home Service'
                  : '🏬 Salon Studio'}
              </strong>
              {confirmedBooking.homeServiceDetails && (
                <span className="text-[#DFCEBC] text-[10px] block truncate">
                  {confirmedBooking.homeServiceDetails.areaZone}
                </span>
              )}
            </div>
            <div>
              <span className="text-[#DFCEBC] block">Date & Time:</span>
              <strong className="text-white text-sm">
                {confirmedBooking.date} • {confirmedBooking.timeSlot}
              </strong>
            </div>
            <div>
              <span className="text-[#DFCEBC] block">Estimated Total:</span>
              <strong className="text-[#D4AF37] text-base font-bold">
                ₦{confirmedBooking.totalPrice.toLocaleString()}
              </strong>
            </div>
          </div>

          <p className="text-xs text-[#E6D7C8] font-sans-modern">
            A confirmation message has been initiated via WhatsApp to{' '}
            <strong>{BRAND_DATA.whatsapp}</strong>. You will receive a direct response once our master stylist
            verifies and secures your slot.
          </p>

          {/* Unlocked Referral Rewards Card (Strict 3-Day Window) */}
          {earnedReferralReward && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#1C0E07] via-[#2A1509] to-[#1C0E07] border-2 border-[#D4AF37] text-white shadow-2xl space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D4AF37]/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F5E6A3] text-[#2A1810] flex items-center justify-center shrink-0">
                    <Crown className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#F5E6A3] block">
                      VIP Referral Unlocked • Double Reward
                    </span>
                    <h4 className="font-serif-luxury text-base sm:text-lg font-bold text-white">
                      25% OFF Flagship Luxury Wig Active!
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs font-semibold self-start sm:self-center">
                  <Clock className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>Strict 3-Day Window: {rewardCountdown || '72 Hours'}</span>
                </div>
              </div>

              {/* Target Flagship Wig info */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-[#D4AF37]/30">
                <img
                  src={earnedReferralReward.mostExpensiveWig.image}
                  alt={earnedReferralReward.mostExpensiveWig.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-lg object-cover border border-[#D4AF37]/40 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold">
                    Eligible Flagship Product
                  </div>
                  <div className="text-xs font-bold text-white truncate">
                    {earnedReferralReward.mostExpensiveWig.name}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="line-through text-[#DFCEBC]/70">
                      ₦{earnedReferralReward.mostExpensiveWig.price.toLocaleString()}
                    </span>
                    <span className="text-emerald-400 font-bold">
                      ₦{(earnedReferralReward.mostExpensiveWig.price * 0.75).toLocaleString()}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                      Save ₦{(earnedReferralReward.mostExpensiveWig.price * 0.25).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Two codes: Client & Referrer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Client's Code */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <span className="text-[11px] text-[#DFCEBC] block font-semibold">
                    Your Welcome Discount Code (New Client):
                  </span>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/50 border border-[#D4AF37]/40 font-mono text-xs font-bold text-[#F5E6A3]">
                    <span>{earnedReferralReward.clientReward.code}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(earnedReferralReward.clientReward.code);
                        setCopiedRewardCode(earnedReferralReward.clientReward.code);
                        setTimeout(() => setCopiedRewardCode(null), 2500);
                      }}
                      className="p-1 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
                    >
                      {copiedRewardCode === earnedReferralReward.clientReward.code ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span className="text-[10px]">
                        {copiedRewardCode === earnedReferralReward.clientReward.code ? 'Copied' : 'Copy'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Referrer's Code */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <span className="text-[11px] text-[#DFCEBC] block font-semibold">
                    Your Friend's Unlocked Reward Code:
                  </span>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/50 border border-[#D4AF37]/40 font-mono text-xs font-bold text-[#F5E6A3]">
                    <span>{earnedReferralReward.referrerReward.code}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(earnedReferralReward.referrerReward.code);
                        setCopiedRewardCode(earnedReferralReward.referrerReward.code);
                        setTimeout(() => setCopiedRewardCode(null), 2500);
                      }}
                      className="p-1 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
                    >
                      {copiedRewardCode === earnedReferralReward.referrerReward.code ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span className="text-[10px]">
                        {copiedRewardCode === earnedReferralReward.referrerReward.code ? 'Copied' : 'Copy'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2.5 pt-1">
                {onNavigateToShopWithWig ? (
                  <button
                    type="button"
                    onClick={() =>
                      onNavigateToShopWithWig(
                        earnedReferralReward.mostExpensiveWig.id,
                        earnedReferralReward.clientReward.code
                      )
                    }
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5E6A3] text-[#2A1810] font-sans-modern font-bold text-xs hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Crown className="w-4 h-4 fill-current" />
                    <span>Shop Flagship Wig & Apply 25% Off</span>
                  </button>
                ) : onNavigateToShop ? (
                  <button
                    type="button"
                    onClick={onNavigateToShop}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5E6A3] text-[#2A1810] font-sans-modern font-bold text-xs hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Crown className="w-4 h-4 fill-current" />
                    <span>Go to Wig Boutique</span>
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => {
                    const notifyMsg = encodeURIComponent(
                      `Hey babe! 👑✨ I just booked my appointment at RossyBraids using your referral link!\n\n` +
                        `As promised, you've unlocked your exclusive 25% discount code for RossyBraids' most expensive luxury wig (${earnedReferralReward.mostExpensiveWig.name}):\n\n` +
                        `🎟️ Your Code: ${earnedReferralReward.referrerReward.code}\n` +
                        `⏳ Strict Expiry: Valid for 72 hours (3 days) only!\n\n` +
                        `Check out the salon & boutique here: ${window.location.origin}`
                    );
                    window.open(`https://wa.me/?text=${notifyMsg}`, '_blank');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-sans-modern font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Notify Friend on WhatsApp</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setConfirmedBooking(null)}
              className="px-4 py-2 rounded-lg bg-[#D4AF37] text-[#2A1810] text-xs font-sans-modern font-bold hover:bg-[#E5C158] transition-colors cursor-pointer shadow-xs"
            >
              Book Another Appointment
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('chat')}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-[#F9E498] border border-[#D4AF37]/50 text-xs font-sans-modern font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Discuss Booking or Send Post-Hair Review</span>
            </button>
          </div>
        </div>
      )}

      {/* Live Consultation Callout Banner before booking steps */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-[#F5EFEB] border border-[#DFCEBC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] text-[#8F6A1E] flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5 text-[#8F6A1E]" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-serif-luxury font-bold text-[#2D1B11]">
              Need styling advice before booking? Chat with Rose in real-time!
            </h4>
            <p className="text-[11.5px] text-[#6C4A32] font-sans-modern">
              Send inspiration photos, clarify hair textures, or drop your picture/video review after your hair is done.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setActiveSubTab('chat')}
          className="px-3.5 py-1.5 rounded-lg bg-[#2D1B11] text-[#F9E498] text-xs font-sans-modern font-bold hover:bg-[#3D2517] transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-center cursor-pointer shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Open Live Chat</span>
        </button>
      </div>

      {/* Main Interactive Form */}
      <form onSubmit={handleConfirmBooking} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Steps (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">

          {/* STEP 0: Choose Service Location Mode (Salon vs VIP Home Service) */}
          <div className="bg-white/95 backdrop-blur-sm p-5 sm:p-6 rounded-xl border border-[#DFCEBC] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DFCEBC]/60">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-[#2D1B11] text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="font-serif-luxury text-lg sm:text-xl font-bold text-[#2D1B11]">
                  Choose Service Location
                </h2>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#8F6A1E] font-semibold font-sans-modern">
                Flexible Service
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Salon Studio Button */}
              <div
                onClick={() => setLocationType('salon')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 relative ${
                  locationType === 'salon'
                    ? 'border-[#D4AF37] bg-[#F5EFEB] shadow-md ring-1 ring-[#D4AF37]'
                    : 'border-[#EAE1D7] bg-white hover:border-[#D4AF37]/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center text-[#8F6A1E]">
                    <Building2 className="w-5 h-5" />
                  </div>
                  {locationType === 'salon' && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#8F6A1E] bg-[#D4AF37]/20 px-2 py-0.5 rounded-full font-sans-modern">
                      <Check className="w-3 h-3" /> Selected
                    </span>
                  )}
                </div>
                <h3 className="font-serif-luxury text-sm sm:text-base font-bold text-[#2D1B11]">
                  Salon Studio Visit
                </h3>
                <p className="text-xs text-[#6C4A32] mt-1 font-sans-modern">
                  Experience our tranquil luxury studio atmosphere with specialized wash basins and equipment.
                </p>
                <div className="mt-3 text-[11px] font-semibold text-[#8F6A1E] font-sans-modern">
                  No additional logistics fee
                </div>
              </div>

              {/* VIP Home Service Button */}
              <div
                onClick={() => setLocationType('home_service')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 relative ${
                  locationType === 'home_service'
                    ? 'border-[#D4AF37] bg-[#F5EFEB] shadow-md ring-1 ring-[#D4AF37]'
                    : 'border-[#EAE1D7] bg-white hover:border-[#D4AF37]/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-lg bg-[#8F6A1E]/15 flex items-center justify-center text-[#8F6A1E]">
                    <Home className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#D4AF37] text-[#2D1B11] font-sans-modern">
                    VIP Mobile
                  </span>
                </div>
                <h3 className="font-serif-luxury text-sm sm:text-base font-bold text-[#2D1B11]">
                  VIP Home Service
                </h3>
                <p className="text-xs text-[#6C4A32] mt-1 font-sans-modern">
                  We bring our master stylist, sterilized tools, and luxury products right to your doorstep.
                </p>
                <div className="mt-3 text-[11px] font-semibold text-[#B84E1A] flex items-center gap-1 font-sans-modern">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>Additional fee applies based on location</span>
                </div>
              </div>
            </div>

            {/* If Home Service is selected: Safety & Location Details */}
            {locationType === 'home_service' && (
              <div className="mt-4 p-4 sm:p-5 rounded-xl bg-[#FAF7F2] border border-[#D4AF37]/40 space-y-4 animate-fade-in">
                {/* Security and Safety Header */}
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-xs text-[#52331B] font-sans-modern">
                  <ShieldCheck className="w-5 h-5 text-[#8F6A1E] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#2D1B11] font-bold">
                      Stylist Safety & Identity Verification Policy:
                    </strong>
                    To safeguard our travelling stylists carrying high-grade equipment, home appointments require
                    address details, residential type, and social media verification before final dispatch.
                  </div>
                </div>

                {/* Location Zone & Fee Selection */}
                <div>
                  <label className="block text-xs font-semibold text-[#2D1B11] uppercase tracking-wider mb-1 font-sans-modern">
                    Select Your Area / Zone (Determines Additional Home Service Fee) *
                  </label>
                  <p className="text-[11px] text-[#6C4A32] mb-2 font-sans-modern">
                    Transport & dispatch fee covers safe mobility, kit logistics, and sanitized equipment setup.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {LOCATION_TIERS.map((tier) => {
                      const isSelected = selectedLocationTier.id === tier.id;
                      return (
                        <div
                          key={tier.id}
                          onClick={() => setSelectedLocationTier(tier)}
                          className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#D4AF37] bg-white shadow-sm ring-1 ring-[#D4AF37]'
                              : 'border-[#DFCEBC] bg-white/60 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-bold text-[#2D1B11] font-serif-luxury">
                              {tier.name}
                            </h5>
                            <span className="text-xs font-bold text-[#8F6A1E] font-sans-modern">
                              +{tier.formattedFee}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#6C4A32] mt-1 font-sans-modern line-clamp-2">
                            {tier.zones}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Address & Verification Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#6C4A32] mb-1 font-sans-modern">
                      Detailed Residential Address (House/Flat No., Street, Estate) *
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3 top-3 text-[#8F6A1E]" />
                      <textarea
                        rows={2}
                        required={locationType === 'home_service'}
                        placeholder="e.g. Flat 4B, Sunflower Court, Plot 14 Admiralty Way, Lekki Phase 1"
                        value={homeAddress}
                        onChange={(e) => setHomeAddress(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#DFCEBC] bg-white focus:outline-none focus:border-[#D4AF37] resize-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#6C4A32] mb-1 font-sans-modern">
                      Nearest Landmark / Estate Gate Protocol
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Opposite Genesis Cinema, gate code required"
                      value={homeLandmark}
                      onChange={(e) => setHomeLandmark(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#DFCEBC] bg-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#6C4A32] mb-1 font-sans-modern">
                      Type of Residence
                    </label>
                    <select
                      value={residenceType}
                      onChange={(e) => setResidenceType(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#DFCEBC] bg-white focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="Gated Residential Estate">Gated Residential Estate</option>
                      <option value="Private Serviced Apartment">Private Serviced Apartment</option>
                      <option value="Standalone Residential House">Standalone Residential House</option>
                      <option value="Luxury Hotel Suite">Luxury Hotel Suite</option>
                      <option value="Corporate / Studio Space">Corporate / Studio Space</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#6C4A32] mb-1 font-sans-modern">
                      Your Social Media Handle (Instagram or Facebook) *
                    </label>
                    <div className="relative">
                      <Instagram className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8F6A1E]" />
                      <input
                        type="text"
                        required={locationType === 'home_service'}
                        placeholder="e.g. @amara_kalu or facebook.com/amara"
                        value={socialHandle}
                        onChange={(e) => setSocialHandle(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#DFCEBC] bg-white focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <span className="text-[10px] text-[#8F6A1E] font-sans-modern mt-0.5 block">
                      Used strictly for stylist identity verification prior to arrival.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#6C4A32] mb-1 font-sans-modern">
                      Emergency Alternate Contact (Name & Phone)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Spouse / Roommate Name"
                        value={altContactName}
                        onChange={(e) => setAltContactName(e.target.value)}
                        className="w-1/2 px-3 py-2 text-xs rounded-lg border border-[#DFCEBC] bg-white focus:outline-none focus:border-[#D4AF37]"
                      />
                      <input
                        type="tel"
                        placeholder="Contact Phone"
                        value={altContactPhone}
                        onChange={(e) => setAltContactPhone(e.target.value)}
                        className="w-1/2 px-3 py-2 text-xs rounded-lg border border-[#DFCEBC] bg-white focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* STEP 1: Select Main Hair Service */}
          <div className="bg-white/95 backdrop-blur-sm p-5 sm:p-6 rounded-xl border border-[#DFCEBC] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DFCEBC]/60">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-[#2D1B11] text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="font-serif-luxury text-lg sm:text-xl font-bold text-[#2D1B11]">
                  Select Hairstyle Category
                </h2>
              </div>
              <span className="text-xs text-[#6C4A32] font-sans-modern">
                Includes Traditional & Modern Craft
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SERVICES_DATA.filter((s) => s.id !== 'hair-treatment-products').map((service) => {
                const isSelected = selectedService.id === service.id;
                return (
                  <div
                    key={service.id}
                    onClick={() => handleServiceChange(service)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#D4AF37] bg-[#F5EFEB] shadow-md ring-1 ring-[#D4AF37]'
                        : 'border-[#EAE1D7] bg-white/70 hover:border-[#D4AF37]/50'
                    }`}
                  >
                    <div className="flex gap-3">
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-14 h-14 rounded-md object-cover object-top shrink-0 border border-black/10"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-serif-luxury text-xs sm:text-sm font-bold text-[#2D1B11] truncate">
                            {service.name}
                          </h4>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />}
                        </div>
                        <p className="text-[10.5px] text-[#6C4A32] line-clamp-2 font-sans-modern mt-0.5">
                          {service.tagline}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-[#DFCEBC]/40 flex items-center justify-between text-[10px] text-[#8F6A1E] font-medium font-sans-modern">
                      <span>From {service.startingPrice || '₦20,000'}</span>
                      <span>{service.duration || '2-3 hrs'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Browse & PIN Exact Type / Subtype (Requested feature for Dreadlocks and all styles) */}
          {selectedService.typesList && selectedService.typesList.length > 0 && (
            <div className="bg-white/95 backdrop-blur-sm p-5 sm:p-6 rounded-xl border-2 border-[#D4AF37]/60 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#DFCEBC]/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-[#2D1B11] text-xs font-bold flex items-center justify-center">
                    <Pin className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <div>
                    <h2 className="font-serif-luxury text-lg sm:text-xl font-bold text-[#2D1B11]">
                      Browse & Pin Your Exact Style Type
                    </h2>
                    <p className="text-[11px] text-[#6C4A32] font-sans-modern">
                      Choose from {selectedService.typesList.length} specialized variants for{' '}
                      <strong>{selectedService.name}</strong> and pin your preferred look.
                    </p>
                  </div>
                </div>
                {pinnedSubtype && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#D4AF37] text-[#2D1B11] font-sans-modern">
                    <Pin className="w-3 h-3 fill-current" /> Pinned
                  </span>
                )}
              </div>

              {/* Grid of style variants */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedService.typesList.map((type) => {
                  const isPinned = pinnedSubtype?.id === type.id;
                  return (
                    <div
                      key={type.id}
                      onClick={() => setPinnedSubtype(type)}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200 relative flex flex-col justify-between ${
                        isPinned
                          ? 'border-[#D4AF37] bg-gradient-to-br from-[#F5EFEB] to-[#FAF7F2] shadow-md ring-2 ring-[#D4AF37]/50'
                          : 'border-[#EAE1D7] bg-white hover:border-[#D4AF37]/50 hover:bg-[#FAF7F2]/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-serif-luxury text-sm font-bold text-[#2D1B11] leading-snug">
                            {type.name}
                          </h4>
                          {type.badge && (
                            <span
                              className={`text-[9.5px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full shrink-0 font-sans-modern ${
                                isPinned
                                  ? 'bg-[#D4AF37] text-[#2D1B11]'
                                  : 'bg-[#D4AF37]/15 text-[#8F6A1E]'
                              }`}
                            >
                              {type.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#6C4A32] font-sans-modern mt-1.5 leading-relaxed">
                          {type.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-[#DFCEBC]/40 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-[#8F6A1E] font-sans-modern">
                          {type.priceModifier && type.priceModifier > 0
                            ? `+₦${type.priceModifier.toLocaleString()}`
                            : 'Standard Included'}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPinnedSubtype(type);
                          }}
                          className={`inline-flex items-center gap-1 text-xs font-sans-modern font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                            isPinned
                              ? 'bg-[#2D1B11] text-[#F9E498]'
                              : 'bg-[#D4AF37]/15 text-[#8F6A1E] hover:bg-[#D4AF37] hover:text-[#2D1B11]'
                          }`}
                        >
                          <Pin className={`w-3 h-3 ${isPinned ? 'fill-current' : ''}`} />
                          <span>{isPinned ? 'Pinned Look' : 'Pin This Type'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2B: Upload Photos or Videos of Desired Style (If not found in Browse & Pin) */}
          <CustomStyleInspoUpload
            currentInspo={customInspoMedia}
            onInspoChange={setCustomInspoMedia}
            serviceName={selectedService.name}
          />

          {/* STEP 3: Customize Size & Desired Length */}
          {((selectedService.sizesList && selectedService.sizesList.length > 0) ||
            (selectedService.lengthsList && selectedService.lengthsList.length > 0)) && (
            <div className="bg-white/95 backdrop-blur-sm p-5 sm:p-6 rounded-xl border border-[#DFCEBC] shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#DFCEBC]/60">
                <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-[#2D1B11] text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h2 className="font-serif-luxury text-lg sm:text-xl font-bold text-[#2D1B11]">
                  Customize Size & Desired Length
                </h2>
              </div>

              {/* Sizes Pill Selector */}
              {selectedService.sizesList && selectedService.sizesList.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2D1B11] font-sans-modern">
                    <Layers className="w-3.5 h-3.5 text-[#8F6A1E]" />
                    <span>Select Size / Parting Diameter:</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {selectedService.sizesList.map((size) => {
                      const isSelected = selectedSize?.id === size.id;
                      return (
                        <button
                          type="button"
                          key={size.id}
                          onClick={() => setSelectedSize(size)}
                          className={`p-2 rounded-lg text-center border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#D4AF37] bg-[#2D1B11] text-[#FAF7F2] shadow-sm'
                              : 'border-[#DFCEBC] bg-white text-[#2D1B11] hover:border-[#D4AF37]/60'
                          }`}
                        >
                          <span className="block text-xs font-bold font-sans-modern truncate">
                            {size.name}
                          </span>
                          <span className="block text-[10px] opacity-80 font-sans-modern">
                            {size.priceModifier > 0
                              ? `+₦${size.priceModifier.toLocaleString()}`
                              : 'Base Price'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Lengths Pill Selector */}
              {selectedService.lengthsList && selectedService.lengthsList.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#DFCEBC]/40">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2D1B11] font-sans-modern">
                    <Ruler className="w-3.5 h-3.5 text-[#8F6A1E]" />
                    <span>Select Desired Hair Length:</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {selectedService.lengthsList.map((len) => {
                      const isSelected = selectedLength?.id === len.id;
                      return (
                        <button
                          type="button"
                          key={len.id}
                          onClick={() => setSelectedLength(len)}
                          className={`p-2 rounded-lg text-center border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#D4AF37] bg-[#2D1B11] text-[#FAF7F2] shadow-sm'
                              : 'border-[#DFCEBC] bg-white text-[#2D1B11] hover:border-[#D4AF37]/60'
                          }`}
                        >
                          <span className="block text-xs font-bold font-sans-modern truncate">
                            {len.name}
                          </span>
                          <span className="block text-[10px] opacity-80 font-sans-modern">
                            {len.priceModifier > 0
                              ? `+₦${len.priceModifier.toLocaleString()}`
                              : 'Standard'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Choose Stylist */}
          <div className="bg-white/95 backdrop-blur-sm p-5 sm:p-6 rounded-xl border border-[#DFCEBC] shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#DFCEBC]/60">
              <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-[#2D1B11] text-xs font-bold flex items-center justify-center">
                4
              </span>
              <h2 className="font-serif-luxury text-lg sm:text-xl font-bold text-[#2D1B11]">
                Choose Your Artisan Stylist
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STYLISTS.map((stylist) => {
                const isSelected = selectedStylist === stylist.name;
                return (
                  <div
                    key={stylist.id}
                    onClick={() => setSelectedStylist(stylist.name)}
                    className={`p-3.5 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-[#D4AF37] bg-[#F5EFEB] shadow-sm ring-1 ring-[#D4AF37]'
                        : 'border-[#EAE1D7] bg-white/70 hover:border-[#D4AF37]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif-luxury text-sm font-bold text-[#2D1B11]">
                        {stylist.name}
                      </h4>
                      {isSelected && <Check className="w-4 h-4 text-[#D4AF37]" />}
                    </div>
                    <p className="text-xs text-[#6C4A32] font-sans-modern mt-0.5">{stylist.role}</p>
                    <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#8F6A1E] font-sans-modern font-semibold">
                      {stylist.experience}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 5: Date & Time Slot Selection */}
          <div className="bg-white/95 backdrop-blur-sm p-5 sm:p-6 rounded-xl border border-[#DFCEBC] shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#DFCEBC]/60">
              <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-[#2D1B11] text-xs font-bold flex items-center justify-center">
                5
              </span>
              <h2 className="font-serif-luxury text-lg sm:text-xl font-bold text-[#2D1B11]">
                Select Preferred Date & Time
              </h2>
            </div>

            {/* Date Scroller */}
            <div>
              <label className="block text-xs font-semibold text-[#6C4A32] uppercase tracking-wider mb-2 font-sans-modern">
                Upcoming Appointment Dates
              </label>
              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                {availableDates.map((item) => {
                  const isSelected = selectedDate === item.iso;
                  return (
                    <button
                      type="button"
                      key={item.iso}
                      onClick={() => setSelectedDate(item.iso)}
                      className={`shrink-0 w-16 py-2.5 px-1 rounded-lg text-center border-2 transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'border-[#D4AF37] bg-[#2D1B11] text-[#FAF7F2] shadow-md'
                          : 'border-[#DFCEBC] bg-white text-[#2D1B11] hover:border-[#D4AF37]/60'
                      }`}
                    >
                      <span className="block text-[10px] font-sans-modern uppercase font-bold opacity-80">
                        {item.dayName}
                      </span>
                      <span className="block font-serif-luxury text-lg font-bold">
                        {item.dayNumber}
                      </span>
                      <span className="block text-[9px] font-sans-modern opacity-70">
                        {item.month}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slot Picker */}
            <div>
              <label className="block text-xs font-semibold text-[#6C4A32] uppercase tracking-wider mb-2 font-sans-modern">
                Available Time Slots
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TIME_SLOTS.map((slot) => {
                  const isSelected = selectedTime === slot;
                  return (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={`py-2 px-3 rounded-lg text-xs font-sans-modern font-medium border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#D4AF37] bg-[#D4AF37] text-[#2D1B11] font-bold shadow-sm'
                          : 'border-[#DFCEBC] bg-white text-[#2D1B11] hover:bg-[#F5EFEB]'
                      }`}
                    >
                      <Clock className="w-3 h-3 inline mr-1 text-[#8F6A1E]" />
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* STEP 6: Add-On Spa Treatments */}
          <div className="bg-white/95 backdrop-blur-sm p-5 sm:p-6 rounded-xl border border-[#DFCEBC] shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#DFCEBC]/60">
              <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-[#2D1B11] text-xs font-bold flex items-center justify-center">
                6
              </span>
              <h2 className="font-serif-luxury text-lg sm:text-xl font-bold text-[#2D1B11]">
                Scalp Detox & Luxury Add-Ons (Optional)
              </h2>
            </div>

            <div className="space-y-2.5">
              {ADD_ONS_DATA.map((addon) => {
                const isSelected = selectedAddOns.some((i) => i.id === addon.id);
                return (
                  <div
                    key={addon.id}
                    onClick={() => toggleAddOn(addon)}
                    className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#D4AF37] bg-[#F5EFEB]'
                        : 'border-[#EAE1D7] bg-white/70 hover:border-[#D4AF37]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                          isSelected
                            ? 'bg-[#D4AF37] border-[#D4AF37] text-[#2D1B11]'
                            : 'border-[#DFCEBC] bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#2D1B11] font-sans-modern">
                          {addon.name}
                        </h4>
                        <span className="text-[11px] text-[#6C4A32] font-sans-modern">
                          {addon.duration}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#8F6A1E] font-sans-modern">
                      +{addon.formattedPrice}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 7: Client Contact Details */}
          <div className="bg-white/95 backdrop-blur-sm p-5 sm:p-6 rounded-xl border border-[#DFCEBC] shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#DFCEBC]/60">
              <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-[#2D1B11] text-xs font-bold flex items-center justify-center">
                7
              </span>
              <h2 className="font-serif-luxury text-lg sm:text-xl font-bold text-[#2D1B11]">
                Your Primary Contact Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#6C4A32] mb-1 font-sans-modern">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8F6A1E]" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amara Kalu"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#DFCEBC] bg-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6C4A32] mb-1 font-sans-modern">
                  WhatsApp / Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8F6A1E]" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0812 345 6789"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#DFCEBC] bg-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#6C4A32] mb-1 font-sans-modern">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#DFCEBC] bg-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#6C4A32] mb-1 font-sans-modern">
                  Special Notes or Texture Details (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. My hair is natural 4C with tender scalp. Please bring extra gold cuffs and organic oil."
                  value={hairNotes}
                  onChange={(e) => setHairNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#DFCEBC] bg-white focus:outline-none focus:border-[#D4AF37] resize-none"
                />
              </div>

              {/* Step 7 Referral Code Input */}
              <div className="sm:col-span-2 pt-3 border-t border-[#DFCEBC]/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2D1B11] font-sans-modern flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Friend's Referral Link or Code (Optional)</span>
                  </label>
                  <span className="text-[10px] text-emerald-600 font-bold">
                    Unlocks 25% Off Flagship Luxury Wig!
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Gift className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8F6A1E]" />
                    <input
                      type="text"
                      placeholder="e.g. REF-AMARA-XXXX or paste referral link"
                      value={referralCodeInput}
                      onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#DFCEBC] bg-white font-mono uppercase focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  {onOpenReferralModal && (
                    <button
                      type="button"
                      onClick={onOpenReferralModal}
                      className="px-3 py-2 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#8F6A1E] text-xs font-bold border border-[#D4AF37]/40 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Program Info
                    </button>
                  )}
                </div>

                {referralCodeInput ? (
                  <p className="text-[11px] text-emerald-700 flex items-center gap-1 font-sans-modern">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      VIP Referral Active! When this booking is confirmed, both you and your friend will instantly receive a 25% discount code strictly valid for 3 days on our most expensive wig.
                    </span>
                  </p>
                ) : (
                  <p className="text-[10.5px] text-[#8F6A1E] font-sans-modern">
                    Have a friend who recommended RossyBraids? Enter their code above to unlock mutual luxury rewards.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Summary & Instant Booking CTA (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="sticky top-24 bg-[#2D1B11] text-[#FAF7F2] p-5 sm:p-6 rounded-xl border border-[#D4AF37]/50 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-serif-luxury text-lg font-bold text-[#F9E498]">
                Appointment Summary
              </h3>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-semibold font-sans-modern">
                VIP Reservation
              </span>
            </div>

            {/* Selected Service Card */}
            <div className="flex gap-3 items-center p-2.5 rounded-lg bg-black/40 border border-white/5">
              <img
                src={selectedService.image}
                alt={selectedService.name}
                className="w-12 h-12 rounded object-cover object-top shrink-0 border border-[#D4AF37]/40"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-serif-luxury text-xs font-bold text-white truncate">
                  {selectedService.name}
                </h4>
                <p className="text-[10px] text-[#DFCEBC] font-sans-modern">
                  Base: ₦{serviceBasePrice.toLocaleString()}
                </p>
                <p className="text-[10px] text-[#D4AF37] font-sans-modern truncate">
                  Stylist: {selectedStylist.split('(')[0]}
                </p>
              </div>
            </div>

            {/* Pinned Subtype, Size & Length Details */}
            <div className="p-3 rounded-lg bg-black/25 border border-white/5 text-xs space-y-1.5 font-sans-modern">
              {pinnedSubtype && (
                <div className="flex items-start justify-between text-[#DFCEBC]">
                  <span className="flex items-center gap-1">
                    <Pin className="w-3 h-3 text-[#D4AF37] fill-current shrink-0" />
                    <span className="text-[11px]">Pinned Look:</span>
                  </span>
                  <span className="text-right font-medium text-[#F9E498] text-[11px] max-w-[170px] truncate">
                    {pinnedSubtype.name}
                  </span>
                </div>
              )}

              {selectedSize && (
                <div className="flex items-center justify-between text-[#DFCEBC] text-[11px]">
                  <span>Size / Grid:</span>
                  <strong className="text-white">{selectedSize.name}</strong>
                </div>
              )}

              {selectedLength && (
                <div className="flex items-center justify-between text-[#DFCEBC] text-[11px]">
                  <span>Length:</span>
                  <strong className="text-white">{selectedLength.name}</strong>
                </div>
              )}

              <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[#DFCEBC] text-[11px]">
                <span>Appointment Mode:</span>
                <strong className={locationType === 'home_service' ? 'text-[#D4AF37]' : 'text-white'}>
                  {locationType === 'home_service' ? '🏡 VIP Home Service' : '🏬 Salon Studio Visit'}
                </strong>
              </div>

              {locationType === 'home_service' && (
                <div className="flex items-center justify-between text-[#DFCEBC] text-[11px]">
                  <span>Home Logistics Zone:</span>
                  <span className="text-[#F9E498] font-medium">{selectedLocationTier.name.split('(')[0]}</span>
                </div>
              )}

              {/* Custom Inspiration Media indicator */}
              {customInspoMedia && (
                <div className="pt-2 border-t border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Inspo Attached ({customInspoMedia.type.toUpperCase()})</span>
                  </div>
                  <p className="text-[10px] text-[#DFCEBC] truncate">
                    {customInspoMedia.fileName}
                  </p>
                </div>
              )}
            </div>

            {/* Date & Time Confirmation */}
            <div className="p-3 rounded-lg bg-black/25 border border-white/5 text-xs space-y-1.5 font-sans-modern">
              <div className="flex items-center justify-between text-[#DFCEBC]">
                <span>Date:</span>
                <strong className="text-white">
                  {availableDates.find((d) => d.iso === selectedDate)?.full || selectedDate}
                </strong>
              </div>
              <div className="flex items-center justify-between text-[#DFCEBC]">
                <span>Time Slot:</span>
                <strong className="text-white">{selectedTime}</strong>
              </div>
            </div>

            {/* Add-ons line items */}
            {selectedAddOns.length > 0 && (
              <div className="p-3 rounded-lg bg-black/25 border border-white/5 text-xs space-y-1 font-sans-modern">
                <span className="text-[#D4AF37] font-semibold text-[11px] block">Selected Add-ons:</span>
                {selectedAddOns.map((addon) => (
                  <div key={addon.id} className="flex items-center justify-between text-[11px] text-[#DFCEBC]">
                    <span className="truncate mr-2">• {addon.name}</span>
                    <span className="shrink-0 font-medium text-white">{addon.formattedPrice}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Fee Breakdown items */}
            <div className="p-3 rounded-lg bg-black/35 border border-white/5 text-xs space-y-1 font-sans-modern">
              <div className="flex items-center justify-between text-[#DFCEBC]">
                <span>Base Style Price:</span>
                <span>₦{serviceBasePrice.toLocaleString()}</span>
              </div>
              {subtypeModifier > 0 && (
                <div className="flex items-center justify-between text-[#DFCEBC]">
                  <span>Pinned Variant Mod:</span>
                  <span>+₦{subtypeModifier.toLocaleString()}</span>
                </div>
              )}
              {sizeModifier > 0 && (
                <div className="flex items-center justify-between text-[#DFCEBC]">
                  <span>Size Adjustment:</span>
                  <span>+₦{sizeModifier.toLocaleString()}</span>
                </div>
              )}
              {lengthModifier > 0 && (
                <div className="flex items-center justify-between text-[#DFCEBC]">
                  <span>Length Adjustment:</span>
                  <span>+₦{lengthModifier.toLocaleString()}</span>
                </div>
              )}
              {addOnsTotal > 0 && (
                <div className="flex items-center justify-between text-[#DFCEBC]">
                  <span>Scalp Care & Add-ons:</span>
                  <span>+₦{addOnsTotal.toLocaleString()}</span>
                </div>
              )}
              {locationType === 'home_service' && (
                <div className="flex items-center justify-between text-[#D4AF37] font-semibold">
                  <span>Home Service Dispatch Fee:</span>
                  <span>+{selectedLocationTier.formattedFee}</span>
                </div>
              )}
            </div>

            {/* Pricing Total */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#DFCEBC] block font-sans-modern">
                  Estimated Total
                </span>
                <span className="font-serif-luxury text-2xl font-bold text-[#D4AF37]">
                  ₦{estimatedTotal.toLocaleString()}
                </span>
              </div>
              <span className="text-[10px] text-right text-[#DFCEBC] font-sans-modern">
                Transparent pricing
                <br />
                Pay after service
              </span>
            </div>

            {/* Submit / Confirm WhatsApp Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-[#D4AF37] via-[#F5E6A3] to-[#D4AF37] text-[#2D1B11] font-sans-modern font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Confirm & Dispatch on WhatsApp</span>
            </button>

            {/* Quick Live Chat Action */}
            <button
              type="button"
              onClick={() => setActiveSubTab('chat')}
              className="w-full py-2 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-[#DFCEBC] hover:text-white text-xs font-sans-modern flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Message Rose in Real-Time Chat</span>
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-[#DFCEBC] font-sans-modern text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Direct verification with Rose Iyaji • 08137989405</span>
            </div>
          </div>

          {/* Need Hair Care Products? CTA */}
          {onNavigateToShop && (
            <div className="p-4 rounded-xl bg-[#F5EFEB] border border-[#DFCEBC] text-center space-y-2">
              <Sparkles className="w-5 h-5 text-[#D4AF37] mx-auto" />
              <h4 className="font-serif-luxury text-sm font-bold text-[#2D1B11]">
                Need Hair Care Products For Home?
              </h4>
              <p className="text-xs text-[#6C4A32] font-sans-modern">
                Shop our organic moisture shampoos, bone-straight serum, and silk scrunchies.
              </p>
              <button
                type="button"
                onClick={onNavigateToShop}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8F6A1E] hover:text-[#2D1B11] transition-colors cursor-pointer"
              >
                Visit Hair Boutique <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </form>
        </div>
      )}

      {/* Automated Sweet Happy New Month Modal */}
      <HappyNewMonthModal
        isOpen={showNewMonthModal}
        onClose={() => setShowNewMonthModal(false)}
      />
    </div>
  );
};
