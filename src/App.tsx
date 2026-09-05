import React, { useRef, useState, useEffect } from 'react';
import { FlyerCanvas } from './components/FlyerCanvas';
import { FlyerControls } from './components/FlyerControls';
import { ServiceDetailModal } from './components/ServiceDetailModal';
import { BookingAppointments } from './components/BookingAppointments';
import { ProductShop } from './components/ProductShop';
import { BeforeAfterGallery } from './components/BeforeAfterGallery';
import { ReferAFriendModal } from './components/ReferAFriendModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { BRAND_DATA, SERVICES_DATA } from './data/flyerData';
import { ActiveTab, FlyerFormat, FlyerTheme, ServiceItem } from './types';
import { getDueMaintenanceNotifications } from './utils/maintenance';
import {
  Sparkles,
  Phone,
  Instagram,
  Facebook,
  Award,
  Calendar,
  Layers,
  Info,
  ShoppingBag,
  Sparkle,
  Image as ImageIcon,
  CheckCircle2,
  Gift,
  Crown,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('flyer');
  const [format, setFormat] = useState<FlyerFormat>('portrait');
  const [theme, setTheme] = useState<FlyerTheme>('nude-luxury');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [preselectedBookingServiceId, setPreselectedBookingServiceId] = useState<string | undefined>();
  const [showBrandSpecs, setShowBrandSpecs] = useState(false);
  const [showReferModal, setShowReferModal] = useState(false);
  const [shopPrefilledCode, setShopPrefilledCode] = useState<string | undefined>();
  const [shopPreselectedWigId, setShopPreselectedWigId] = useState<string | undefined>();
  const [dueMaintenanceCount, setDueMaintenanceCount] = useState(0);
  const flyerRef = useRef<HTMLDivElement | null>(null);

  // Monitor 4-week maintenance status across the app
  useEffect(() => {
    const checkMaintenance = () => {
      try {
        const stored = localStorage.getItem('rossybraids_bookings');
        if (stored) {
          const bookings = JSON.parse(stored);
          if (Array.isArray(bookings)) {
            const due = getDueMaintenanceNotifications(bookings);
            setDueMaintenanceCount(due.length);
          }
        }
      } catch {
        // Ignore
      }
    };
    checkMaintenance();
    window.addEventListener('storage', checkMaintenance);
    return () => window.removeEventListener('storage', checkMaintenance);
  }, []);

  const handleBookService = (serviceId: string) => {
    setPreselectedBookingServiceId(serviceId);
    setActiveTab('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#140D08] text-[#FAF6F0] flex flex-col justify-between selection:bg-[#D4AF37]/30 selection:text-white pb-16 md:pb-0">
      {/* Top Luxury Navigation / Header (No-print) */}
      <header className="no-print border-b border-[#D4AF37]/20 bg-[#1E110A]/95 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Brand Identity */}
          <div
            onClick={() => setActiveTab('flyer')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full border border-[#D4AF37]/60 bg-black/40 flex items-center justify-center text-[#D4AF37] font-cinzel font-bold text-base shadow-sm group-hover:border-[#D4AF37] transition-colors">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-cinzel text-base sm:text-lg tracking-[0.18em] uppercase font-bold text-[#F5E6A3]">
                  RossyBraids
                </span>
                <span className="hidden sm:inline-block text-[9px] uppercase font-sans-modern font-semibold px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                  Official Salon App
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#DFCEBC] italic font-serif-luxury line-clamp-1">
                “Where Beauty Meets Craft.”
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs (Desktop & Tablet) */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-black/40 border border-[#D4AF37]/30 shadow-inner">
            <button
              onClick={() => setActiveTab('flyer')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-sans-modern font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'flyer'
                  ? 'bg-[#D4AF37] text-[#2A1810] shadow-sm font-bold'
                  : 'text-[#DFCEBC] hover:text-[#FAF6F0] hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ad Flyer</span>
            </button>

            <button
              onClick={() => setActiveTab('booking')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-sans-modern font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'booking'
                  ? 'bg-[#D4AF37] text-[#2A1810] shadow-sm font-bold'
                  : 'text-[#DFCEBC] hover:text-[#FAF6F0] hover:bg-white/5'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
              {dueMaintenanceCount > 0 && (
                <span
                  className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[9px] font-bold animate-pulse"
                  title={`${dueMaintenanceCount} hair maintenance visit(s) due`}
                >
                  {dueMaintenanceCount} Due
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('shop')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-sans-modern font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'shop'
                  ? 'bg-[#D4AF37] text-[#2A1810] shadow-sm font-bold'
                  : 'text-[#DFCEBC] hover:text-[#FAF6F0] hover:bg-white/5'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Hair Care Shop</span>
            </button>

            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-sans-modern font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'gallery'
                  ? 'bg-[#D4AF37] text-[#2A1810] shadow-sm font-bold'
                  : 'text-[#DFCEBC] hover:text-[#FAF6F0] hover:bg-white/5'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Before & After</span>
            </button>
          </nav>

          {/* Quick Contact & PWA Install Button */}
          <div className="flex items-center gap-2 sm:gap-2.5 text-xs">
            {/* VIP Refer a Friend CTA Button */}
            <button
              onClick={() => setShowReferModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F5E6A3] text-[#2A1810] font-sans-modern font-bold hover:brightness-105 active:scale-95 transition-all shadow-sm cursor-pointer"
              title="Refer a friend and both earn 25% off our flagship luxury wig"
            >
              <Gift className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Refer & Earn 25%</span>
              <span className="sm:hidden">Refer</span>
            </button>

            {/* Install App CTA */}
            <PWAInstallButton />

            {/* Direct WhatsApp Call */}
            <a
              href={`https://wa.me/${BRAND_DATA.whatsappRaw}?text=Hello%20RossyBraids%2C%20I%20would%20like%20to%20book%20an%20appointment%20or%20make%20an%20inquiry!`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] transition-all font-sans-modern font-semibold"
              title="Chat on WhatsApp"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{BRAND_DATA.whatsapp}</span>
            </a>

            {/* Brand Specs Drawer Toggle */}
            <button
              onClick={() => setShowBrandSpecs(!showBrandSpecs)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[#DFCEBC] hover:text-white transition-all text-xs cursor-pointer"
              title="Brand Specs & Information"
            >
              <Info className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden xl:inline">Specs</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 flex flex-col items-center justify-start p-3 sm:p-6 lg:p-8">
        {/* VIEW 1: COMMERCIAL AD FLYER */}
        {activeTab === 'flyer' && (
          <div className="w-full flex flex-col items-center">
            {/* Interactive Controls Bar (Format, Theme, Download, Print) */}
            <FlyerControls
              format={format}
              setFormat={setFormat}
              theme={theme}
              setTheme={setTheme}
              flyerRef={flyerRef}
            />

            {/* The Master Commercial Flyer Canvas */}
            <div className="w-full flex justify-center items-center my-4 overflow-x-auto pb-4">
              <FlyerCanvas
                format={format}
                theme={theme}
                onSelectService={(service) => setSelectedService(service)}
                flyerRef={flyerRef}
              />
            </div>

            {/* Quick Tips / Floating helper */}
            <div className="no-print flex flex-wrap items-center justify-center gap-2 text-center text-xs text-[#DFCEBC]/80 mt-3 max-w-xl">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>
                Click on any hairstyle or product tile above to view full details and book an appointment or visit the shop.
              </span>
            </div>
          </div>
        )}

        {/* VIEW 2: ONLINE BOOKING APPOINTMENTS */}
        {activeTab === 'booking' && (
          <div className="w-full py-2">
            <BookingAppointments
              initialServiceId={preselectedBookingServiceId}
              onNavigateToShop={() => {
                setActiveTab('shop');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenReferralModal={() => setShowReferModal(true)}
              onNavigateToShopWithWig={(wigId, discountCode) => {
                setShopPreselectedWigId(wigId);
                setShopPrefilledCode(discountCode);
                setActiveTab('shop');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {/* VIEW 3: PRODUCT ORDER SHOP */}
        {activeTab === 'shop' && (
          <div className="w-full py-2">
            <ProductShop
              onNavigateToBooking={() => {
                setActiveTab('booking');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenReferModal={() => setShowReferModal(true)}
              prefilledDiscountCode={shopPrefilledCode}
              preselectedWigId={shopPreselectedWigId}
            />
          </div>
        )}

        {/* VIEW 4: BEFORE & AFTER GALLERY */}
        {activeTab === 'gallery' && (
          <div className="w-full py-2">
            <BeforeAfterGallery onBookTransformation={handleBookService} />
          </div>
        )}

        {/* Brand Specs & Verification Drawer (Collapsible) */}
        {showBrandSpecs && (
          <div className="no-print w-full max-w-4xl mt-8 p-5 bg-[#1E110A]/95 border border-[#D4AF37]/30 rounded-xl shadow-xl text-xs space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="font-cinzel text-sm font-bold uppercase tracking-wider text-[#F5E6A3]">
                  RossyBraids Official Brand Specifications
                </h3>
              </div>
              <button
                onClick={() => setShowBrandSpecs(false)}
                className="text-[#DFCEBC] hover:text-white cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5 p-3 rounded-lg bg-black/30 border border-white/5">
                <span className="text-[#D4AF37] font-semibold uppercase tracking-wider block">
                  Brand Identity & Hierarchy
                </span>
                <p className="text-[#DFCEBC]">
                  • <strong>Brand Name:</strong> RossyBraids
                </p>
                <p className="text-[#DFCEBC]">
                  • <strong>Slogan:</strong> “RossyBraids — Where Beauty Meets Craft.”
                </p>
                <p className="text-[#DFCEBC]">
                  • <strong>Logo:</strong> Custom vector emblem of intertwined plait braid & feminine silhouette.
                </p>
                <p className="text-[#DFCEBC]">
                  • <strong>PWA App:</strong> Progressive Web App installable on iOS, Android & Desktop.
                </p>
              </div>

              <div className="space-y-1.5 p-3 rounded-lg bg-black/30 border border-white/5">
                <span className="text-[#D4AF37] font-semibold uppercase tracking-wider block">
                  Core App Features
                </span>
                <p className="text-[#DFCEBC]">1. Interactive commercial flyer with PNG & PDF print download</p>
                <p className="text-[#DFCEBC]">2. Online booking calendar with live stylist & add-on selection</p>
                <p className="text-[#DFCEBC]">3. Hair-care product e-shop with cart and instant WhatsApp dispatch</p>
                <p className="text-[#DFCEBC]">4. Interactive Before & After transformation comparison slider</p>
                <p className="text-[#D4AF37] pt-1">★ Verified Client Testimonials Carousel with 5-star ratings</p>
              </div>

              <div className="space-y-1.5 p-3 rounded-lg bg-black/30 border border-white/5">
                <span className="text-[#D4AF37] font-semibold uppercase tracking-wider block">
                  Official Salon Contact
                </span>
                <p className="text-[#DFCEBC]">
                  • <strong>WhatsApp:</strong> 08137989405
                </p>
                <p className="text-[#DFCEBC]">
                  • <strong>Instagram:</strong> <em>rossy.braids</em>
                </p>
                <p className="text-[#DFCEBC]">
                  • <strong>Facebook:</strong> Rose Iyaji
                </p>
                <p className="text-[#DFCEBC]">
                  • <strong>Palette:</strong> Rich Gold, Clean White, Warm Nude, Warm Brown & Soft Beige.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Fixed for phones) */}
      <nav className="no-print fixed bottom-0 left-0 right-0 z-40 bg-[#1A0E08]/95 backdrop-blur-lg border-t border-[#D4AF37]/30 flex md:hidden items-center justify-around py-2 px-1">
        <button
          onClick={() => setActiveTab('flyer')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-sans-modern transition-all cursor-pointer ${
            activeTab === 'flyer' ? 'text-[#D4AF37] font-bold' : 'text-[#DFCEBC]/70'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Flyer</span>
        </button>

        <button
          onClick={() => setActiveTab('booking')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-sans-modern transition-all cursor-pointer ${
            activeTab === 'booking' ? 'text-[#D4AF37] font-bold' : 'text-[#DFCEBC]/70'
          }`}
        >
          <div className="relative">
            <Calendar className="w-4 h-4" />
            {dueMaintenanceCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </div>
          <span>Book</span>
        </button>

        <button
          onClick={() => setActiveTab('shop')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-sans-modern transition-all cursor-pointer ${
            activeTab === 'shop' ? 'text-[#D4AF37] font-bold' : 'text-[#DFCEBC]/70'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Shop</span>
        </button>

        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-sans-modern transition-all cursor-pointer ${
            activeTab === 'gallery' ? 'text-[#D4AF37] font-bold' : 'text-[#DFCEBC]/70'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Gallery</span>
        </button>

        <button
          onClick={() => setShowReferModal(true)}
          className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-sans-modern transition-all cursor-pointer text-[#F5E6A3] hover:text-[#D4AF37]"
        >
          <Gift className="w-4 h-4 text-[#D4AF37]" />
          <span>Refer</span>
        </button>
      </nav>

      {/* Footer (No-print) */}
      <footer className="no-print border-t border-[#D4AF37]/15 bg-[#0F0804] py-4 px-4 text-center text-xs text-[#DFCEBC]/70">
        <p className="font-sans-modern">
          © {new Date().getFullYear()} <span className="text-[#D4AF37] font-semibold">RossyBraids</span>. All rights reserved. Where Beauty Meets Craft.
        </p>
      </footer>

      {/* Service Detail Modal */}
      <ServiceDetailModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
        onBookOnline={handleBookService}
      />

      {/* Refer a Friend Modal */}
      <ReferAFriendModal
        isOpen={showReferModal}
        onClose={() => setShowReferModal(false)}
        onNavigateToShop={(wigId) => {
          setShopPreselectedWigId(wigId);
          setActiveTab('shop');
          setShowReferModal(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
