import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BRAND_DATA } from './data/flyerData';
import { RossyLogo } from './components/RossyLogo';
import { PWAInstallButton } from './components/PWAInstallButton';
import { HomePage } from './components/HomePage';
import { api } from './api/client';
import { useSite } from './api/SiteProvider';
import { LANGUAGES, useI18n } from './i18n';
import { getActiveReferralCode } from './utils/referral';
import { getDueMaintenanceNotifications } from './utils/maintenance';
import { useRoute, type Route } from './utils/router';
import { trackEvent } from './utils/analytics';
import { confettiBurst } from './utils/confetti';
import {
  Calendar,
  CheckCircle2,
  Gift,
  Globe,
  Home as HomeIcon,
  Image as ImageIcon,
  ShoppingBag,
} from 'lucide-react';

const BookingAppointments = lazy(() => import('./components/BookingAppointments').then((m) => ({ default: m.BookingAppointments })));
const ProductShop = lazy(() => import('./components/ProductShop').then((m) => ({ default: m.ProductShop })));
const BeforeAfterGallery = lazy(() => import('./components/BeforeAfterGallery').then((m) => ({ default: m.BeforeAfterGallery })));
const ReferAFriendModal = lazy(() => import('./components/ReferAFriendModal').then((m) => ({ default: m.ReferAFriendModal })));
const FlyerStudio = lazy(() => import('./components/FlyerStudio'));
const AdminApp = lazy(() => import('./admin/AdminApp'));

const Loading: React.FC = () => (
  <div role="status" className="py-24 text-center text-sm text-[#DFCEBC]">
    Loading…
  </div>
);

export default function App() {
  const { route, navigate } = useRoute();
  if (route === 'admin') {
    return (
      <Suspense fallback={<Loading />}>
        <AdminApp />
      </Suspense>
    );
  }
  return <SiteShell route={route} navigate={navigate} />;
}

type PaymentBanner = { tone: 'success' | 'info' | 'error'; text: string } | null;

function SiteShell({ route, navigate }: { route: Route; navigate: (r: Route) => void }) {
  const { t, lang, setLang } = useI18n();
  const { refreshConfig } = useSite();
  const [preselectedBookingServiceId, setPreselectedBookingServiceId] = useState<string | undefined>();
  const [showReferModal, setShowReferModal] = useState(false);
  const [shopPrefilledCode, setShopPrefilledCode] = useState<string | undefined>();
  const [shopPreselectedWigId, setShopPreselectedWigId] = useState<string | undefined>();
  const [dueMaintenanceCount, setDueMaintenanceCount] = useState(0);
  const [paymentBanner, setPaymentBanner] = useState<PaymentBanner>(null);

  // Remember a ?ref= code for the whole visit, even if the visitor browses before booking.
  useEffect(() => {
    getActiveReferralCode();
  }, []);

  // Returning from Paystack: confirm the payment with the server, then tidy the URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get('pay_ref');
    if (!reference) return;
    params.delete('pay_ref');
    params.delete('trxref');
    params.delete('reference');
    const query = params.toString();
    window.history.replaceState(null, '', window.location.pathname + (query ? `?${query}` : ''));

    api
      .verifyPayment(reference)
      .then((res) => {
        if (res.status === 'success') {
          trackEvent('Payment', { kind: res.kind ?? 'unknown' });
          setPaymentBanner({
            tone: 'success',
            text:
              res.kind === 'booking'
                ? 'Payment received. Your deposit is confirmed and your appointment is secured.'
                : 'Payment received. Thank you, we will prepare your order.',
          });
          void refreshConfig();
        } else if (res.status === 'pending') {
          setPaymentBanner({ tone: 'info', text: 'Your payment is still processing. We will confirm it as soon as it clears.' });
        } else {
          setPaymentBanner({ tone: 'error', text: 'The payment was not completed. You can try again from your booking or cart.' });
        }
      })
      .catch(() =>
        setPaymentBanner({ tone: 'info', text: 'We could not confirm your payment right now. If you were charged, message us on WhatsApp.' })
      );
  }, [refreshConfig]);

  // Show the "maintenance due" badge from this device's saved bookings.
  useEffect(() => {
    try {
      const stored = localStorage.getItem('rossybraids_bookings');
      const bookings = stored ? JSON.parse(stored) : [];
      setDueMaintenanceCount(Array.isArray(bookings) ? getDueMaintenanceNotifications(bookings).length : 0);
    } catch {
      setDueMaintenanceCount(0);
    }
  }, [route]);

  const handleBookService = (serviceId: string) => {
    setPreselectedBookingServiceId(serviceId);
    navigate('booking');
  };

  /** Confetti first, then the refer window a beat later so the burst is seen before the dialog covers it. */
  const openReferWithBurst = (button: HTMLElement) => {
    if (confettiBurst(button)) window.setTimeout(() => setShowReferModal(true), 450);
    else setShowReferModal(true);
  };

  const navItems: { route: Route; label: string; short: string; icon: React.ReactNode }[] = [
    { route: 'home', label: t('navHome'), short: t('navHome'), icon: <HomeIcon className="w-3.5 h-3.5" aria-hidden="true" /> },
    { route: 'booking', label: t('navBook'), short: t('navBookShort'), icon: <Calendar className="w-3.5 h-3.5" aria-hidden="true" /> },
    { route: 'shop', label: t('navShop'), short: t('navShopShort'), icon: <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" /> },
    { route: 'gallery', label: t('navGallery'), short: t('navGalleryShort'), icon: <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" /> },
  ];

  return (
    <div className="min-h-screen bg-[#140D08] text-[#FAF6F0] flex flex-col justify-between selection:bg-[#D4AF37]/30 selection:text-white pb-16 md:pb-0">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-full focus:bg-[#D4AF37] focus:text-[#2A1810] focus:font-bold"
      >
        Skip to content
      </a>

      <header className="no-print border-b border-[#D4AF37]/20 bg-[#1E110A]/95 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <button type="button" onClick={() => navigate('home')} className="flex items-center gap-2.5 cursor-pointer group text-left" aria-label="RossyBraids home">
            <RossyLogo
              layout="inline"
              size="xs"
              variant="gold"
              accentClass="text-[#D4AF37]"
              restClass="text-[#F5E6A3]"
              slogan="Where Beauty Meets Craft."
              sloganClass="max-sm:hidden text-[10px] text-[#D4AF37]"
            />
            <span className="hidden 2xl:inline-block text-[9px] uppercase font-sans-modern font-semibold px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
              Official Salon App
            </span>
          </button>

          <nav aria-label="Main" className="hidden md:flex items-center gap-1 p-1 rounded-full bg-black/40 border border-[#D4AF37]/30 shadow-inner">
            {navItems.map((item) => (
              <button
                key={item.route}
                type="button"
                onClick={() => navigate(item.route)}
                aria-current={route === item.route ? 'page' : undefined}
                className={`px-3 xl:px-4 py-1.5 rounded-full text-xs font-sans-modern font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  route === item.route ? 'bg-[#D4AF37] text-[#2A1810] shadow-sm font-bold' : 'text-[#DFCEBC] hover:text-[#FAF6F0] hover:bg-white/5'
                }`}
              >
                <span className="hidden lg:inline-flex">{item.icon}</span>
                <span className="xl:hidden">{item.short}</span>
                <span className="hidden xl:inline">{item.label}</span>
                {item.route === 'booking' && dueMaintenanceCount > 0 && (
                  <span className="px-1.5 rounded-full bg-amber-500 text-black text-[9px] font-bold" title={`${dueMaintenanceCount} hair maintenance visit(s) due`}>
                    {dueMaintenanceCount} Due
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2.5 text-xs">
            <button
              type="button"
              onClick={(e) => openReferWithBurst(e.currentTarget)}
              className="gift-btn relative flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-[#F5E6A3] via-[#D4AF37] to-[#AA7C11] text-[#2D1B11] shadow-[0_0_14px_rgba(212,175,55,0.45)] hover:brightness-110 active:scale-90 transition-all cursor-pointer"
              title="Refer a friend and both earn 25% off our flagship luxury wig"
              aria-label={t('navRefer')}
            >
              <Gift className="w-[18px] h-[18px]" aria-hidden="true" />
            </button>

            <label className="hidden lg:flex items-center gap-1 text-[#DFCEBC]">
              <span className="sr-only">{t('language')}</span>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as typeof lang)}
                className="bg-black/40 border border-[#D4AF37]/30 rounded-full px-2 py-1.5 text-xs text-[#DFCEBC] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] cursor-pointer"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </label>

            <PWAInstallButton />
          </div>
        </div>
      </header>

      {paymentBanner && (
        <div
          role="status"
          className={`no-print mx-3 sm:mx-6 mt-3 px-4 py-3 rounded-xl text-sm flex items-center justify-between gap-3 border ${
            paymentBanner.tone === 'success'
              ? 'bg-emerald-900/40 border-emerald-500/40 text-emerald-100'
              : paymentBanner.tone === 'error'
              ? 'bg-red-900/40 border-red-500/40 text-red-100'
              : 'bg-amber-900/30 border-amber-500/40 text-amber-100'
          }`}
        >
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            {paymentBanner.text}
          </span>
          <button type="button" onClick={() => setPaymentBanner(null)} className="font-semibold underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      <main id="main" className="flex-1 flex flex-col items-center justify-start p-3 sm:p-6 lg:p-8">
        <Suspense fallback={<Loading />}>
          {route === 'home' || route === 'referral' ? (
            <HomePage onBookService={handleBookService} onBook={() => navigate('booking')} onNavigate={navigate} />
          ) : null}

          {route === 'flyer' && <FlyerStudio onBookService={handleBookService} />}

          {route === 'booking' && (
            <div className="w-full py-2">
              <BookingAppointments
                initialServiceId={preselectedBookingServiceId}
                onNavigateToShop={() => navigate('shop')}
                onOpenReferralModal={() => setShowReferModal(true)}
                onNavigateToShopWithWig={(wigId, discountCode) => {
                  setShopPreselectedWigId(wigId);
                  setShopPrefilledCode(discountCode);
                  navigate('shop');
                }}
              />
            </div>
          )}

          {route === 'shop' && (
            <div className="w-full py-2">
              <ProductShop
                onNavigateToBooking={() => navigate('booking')}
                onOpenReferModal={() => setShowReferModal(true)}
                prefilledDiscountCode={shopPrefilledCode}
                preselectedWigId={shopPreselectedWigId}
              />
            </div>
          )}

          {route === 'gallery' && (
            <div className="w-full py-2">
              <BeforeAfterGallery onBookTransformation={handleBookService} />
            </div>
          )}
        </Suspense>
      </main>

      <nav aria-label="Main (mobile)" className="no-print fixed bottom-0 left-0 right-0 z-40 bg-[#1A0E08]/95 backdrop-blur-lg border-t border-[#D4AF37]/30 flex md:hidden items-center justify-around py-2 px-1">
        {navItems.map((item) => (
          <button
            key={item.route}
            type="button"
            onClick={() => navigate(item.route)}
            aria-current={route === item.route ? 'page' : undefined}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[11px] font-sans-modern transition-all cursor-pointer ${
              route === item.route ? 'text-[#D4AF37] font-bold' : 'text-[#DFCEBC]/80'
            }`}
          >
            <span className="relative">
              {item.icon}
              {item.route === 'booking' && dueMaintenanceCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400" aria-label="maintenance due" />
              )}
            </span>
            <span>{item.short}</span>
          </button>
        ))}
        <button
          type="button"
          onClick={(e) => openReferWithBurst(e.currentTarget)}
          className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[11px] font-sans-modern cursor-pointer text-[#F5E6A3] hover:text-[#D4AF37]"
        >
          <Gift className="w-3.5 h-3.5 text-[#D4AF37]" aria-hidden="true" />
          <span>{t('navReferShort')}</span>
        </button>
      </nav>

      <footer className="no-print border-t border-[#D4AF37]/15 bg-[#0F0804] py-5 px-4 text-center text-xs text-[#DFCEBC]/80 space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a href={BRAND_DATA.website} target="_blank" rel="noopener noreferrer" className="text-[#F5E6A3] hover:text-[#D4AF37] font-semibold transition-colors flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-[#D4AF37]" aria-hidden="true" />
            <span>{BRAND_DATA.domain}</span>
          </a>
          <span aria-hidden="true" className="text-[#DFCEBC]/30">•</span>
          <span>WhatsApp: {BRAND_DATA.whatsapp}</span>
          <span aria-hidden="true" className="text-[#DFCEBC]/30">•</span>
          <span>Instagram: @{BRAND_DATA.instagram}</span>
          <span aria-hidden="true" className="text-[#DFCEBC]/30">•</span>
          <button type="button" onClick={() => navigate('flyer')} className="underline hover:text-[#F5E6A3] cursor-pointer">
            Promo flyer
          </button>
        </div>
        <p className="font-sans-modern text-[11px]">
          © {new Date().getFullYear()} <span className="text-[#D4AF37] font-semibold">{BRAND_DATA.name}</span>. All rights reserved. Where Beauty Meets Craft.
        </p>
      </footer>

      {showReferModal && (
        <Suspense fallback={null}>
          <ReferAFriendModal
            isOpen={showReferModal}
            onClose={() => setShowReferModal(false)}
            onNavigateToShop={(wigId) => {
              setShopPreselectedWigId(wigId);
              setShowReferModal(false);
              navigate('shop');
            }}
          />
        </Suspense>
      )}
    </div>
  );
}
