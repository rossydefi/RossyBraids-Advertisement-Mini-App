import React, { useState } from 'react';
import { Clock, MapPin, MessageCircle, Sparkles, Calendar } from 'lucide-react';
import { useSite } from '../api/SiteProvider';
import { BRAND_DATA, SERVICES_DATA } from '../data/flyerData';
import type { Route } from '../utils/router';
import { useI18n } from '../i18n';
import { HeroShowcase } from './HeroShowcase';
import { ReviewForm } from './ReviewForm';
import { TestimonialCarousel } from './TestimonialCarousel';

interface HomePageProps {
  onBookService: (serviceId: string) => void;
  onBook: () => void;
  onNavigate: (route: Route) => void;
}

type PriceBand = 'all' | 'under20' | 'mid' | 'over30';

const priceOf = (startingPrice?: string) => Number((startingPrice ?? '').replace(/[^\d]/g, '')) || 0;

const inBand = (price: number, band: PriceBand) =>
  band === 'all' || (band === 'under20' ? price < 20000 : band === 'mid' ? price >= 20000 && price <= 30000 : price > 30000);

export const HomePage: React.FC<HomePageProps> = ({ onBookService, onBook, onNavigate }) => {
  const { t } = useI18n();
  const { config } = useSite();
  const [band, setBand] = useState<PriceBand>('all');

  const bands: { id: PriceBand; label: string }[] = [
    { id: 'all', label: t('filterAll') },
    { id: 'under20', label: t('filterUnder20') },
    { id: 'mid', label: t('filterMid') },
    { id: 'over30', label: t('filterOver30') },
  ];
  const services = SERVICES_DATA.filter((s) => inBand(priceOf(s.startingPrice), band));
  const whatsappUrl = `https://wa.me/${BRAND_DATA.whatsappRaw}?text=${encodeURIComponent('Hello RossyBraids, I would like to make an inquiry.')}`;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-14">
      {config?.banner && (
        <p role="status" className="text-center text-sm px-4 py-2.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F5E6A3]">
          {config.banner}
        </p>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-[#D4AF37]/30 bg-[#1E110A]" aria-labelledby="hero-title">
        <HeroShowcase onNavigate={onNavigate} />
        <div className="relative z-[5] px-6 sm:px-12 pt-14 pb-24 sm:py-24 max-w-2xl space-y-5 pointer-events-none [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
          <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] font-semibold text-[#D4AF37]">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" /> {t('heroKicker')}
          </span>
          <h1 id="hero-title" className="font-serif-luxury text-4xl sm:text-6xl font-bold text-[#FAF6F0] leading-tight">
            {t('heroTitle')}
          </h1>
          <p className="text-base sm:text-lg text-[#DFCEBC] font-sans-modern">{t('heroText')}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={onBook}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F5E6A3] text-[#2A1810] font-sans-modern font-bold text-sm hover:brightness-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" aria-hidden="true" /> {t('ctaBook')}
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full border border-[#25D366]/60 text-[#25D366] font-sans-modern font-semibold text-sm hover:bg-[#25D366]/10 transition-colors flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" /> {t('ctaWhatsApp')}
            </a>
          </div>
        </div>
      </section>

      {/* Services */}
      <section aria-labelledby="services-title" className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="services-title" className="font-cinzel text-2xl sm:text-3xl font-bold text-[#F5E6A3]">
            {t('servicesTitle')}
          </h2>
          <div role="group" aria-label={t('servicesFilter')} className="flex flex-wrap gap-2">
            {bands.map((b) => (
              <button
                key={b.id}
                type="button"
                aria-pressed={band === b.id}
                onClick={() => setBand(b.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-sans-modern font-semibold border transition-colors cursor-pointer ${
                  band === b.id
                    ? 'bg-[#D4AF37] border-[#D4AF37] text-[#2A1810]'
                    : 'border-[#D4AF37]/40 text-[#DFCEBC] hover:bg-white/5'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {services.length === 0 ? (
          <p className="text-sm text-[#DFCEBC]">{t('noServices')}</p>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((service) => (
              <li key={service.id} className="rounded-2xl overflow-hidden bg-[#1E110A] border border-[#D4AF37]/20 flex flex-col">
                <img src={service.image} alt={service.name} loading="lazy" className="h-52 w-full object-cover object-top" />
                <div className="p-5 flex flex-col flex-1 gap-3">
                  <div>
                    <h3 className="font-serif-luxury text-xl font-bold text-[#FAF6F0]">{service.name}</h3>
                    <p className="text-sm text-[#DFCEBC] mt-1">{service.tagline}</p>
                  </div>
                  <p className="text-xs text-[#DFCEBC]/80 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#D4AF37]" aria-hidden="true" />
                    {service.duration} · {t('from')} <strong className="text-[#F5E6A3]">{service.startingPrice}</strong>
                  </p>
                  <button
                    type="button"
                    onClick={() => onBookService(service.id)}
                    className="mt-auto px-4 py-2 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/50 text-[#F5E6A3] text-sm font-semibold hover:bg-[#D4AF37]/25 transition-colors cursor-pointer"
                  >
                    {t('bookThis')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Reviews */}
      <section aria-labelledby="reviews-title" className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <h2 id="reviews-title" className="font-cinzel text-2xl sm:text-3xl font-bold text-[#F5E6A3]">
            {t('reviewsTitle')}
          </h2>
          <TestimonialCarousel theme="mocha-velvet" />
        </div>
        <div className="space-y-4 p-5 rounded-2xl bg-[#1E110A] border border-[#D4AF37]/20">
          <h3 className="font-serif-luxury text-xl font-bold text-[#FAF6F0]">{t('reviewFormTitle')}</h3>
          <ReviewForm />
        </div>
      </section>

      {/* Visit */}
      <section aria-labelledby="visit-title" className="p-6 sm:p-8 rounded-2xl bg-[#1E110A] border border-[#D4AF37]/20 grid sm:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 id="visit-title" className="font-cinzel text-2xl font-bold text-[#F5E6A3]">{t('visitTitle')}</h2>
          <p className="text-sm text-[#DFCEBC] flex items-start gap-2">
            <Clock className="w-4 h-4 mt-0.5 text-[#D4AF37] shrink-0" aria-hidden="true" />
            <span><strong>{t('hours')}:</strong> {config?.openingHours || 'Message us on WhatsApp'}</span>
          </p>
          <p className="text-sm text-[#DFCEBC] flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5 text-[#D4AF37] shrink-0" aria-hidden="true" />
            <span><strong>{t('address')}:</strong> {config?.address || t('contactForAddress')}</span>
          </p>
          {config?.mapUrl && (
            <a href={config.mapUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-sm text-[#F5E6A3] underline hover:text-[#D4AF37]">
              {t('openMap')}
            </a>
          )}
        </div>
        <div className="text-sm text-[#DFCEBC] space-y-2">
          <p>WhatsApp: <a className="text-[#F5E6A3] underline" href={whatsappUrl} target="_blank" rel="noopener noreferrer">{BRAND_DATA.whatsapp}</a></p>
          <p>Instagram: <a className="text-[#F5E6A3] underline" href={`https://instagram.com/${BRAND_DATA.instagram}`} target="_blank" rel="noopener noreferrer">@{BRAND_DATA.instagram}</a></p>
        </div>
      </section>
    </div>
  );
};
