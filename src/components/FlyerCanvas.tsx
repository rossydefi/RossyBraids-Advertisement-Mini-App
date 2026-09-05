import React from 'react';
import { BRAND_DATA, IMAGES, SERVICES_DATA } from '../data/flyerData';
import { FlyerFormat, FlyerTheme, ServiceItem } from '../types';
import { RossyLogo } from './RossyLogo';
import { ScanToBookQR } from './ScanToBookQR';
import { TestimonialCarousel } from './TestimonialCarousel';
import {
  Phone,
  Instagram,
  Facebook,
  Sparkles,
  CheckCircle2,
  Award,
  Calendar,
  ArrowRight,
} from 'lucide-react';

interface FlyerCanvasProps {
  format: FlyerFormat;
  theme: FlyerTheme;
  onSelectService?: (service: ServiceItem) => void;
  flyerRef: React.RefObject<HTMLDivElement | null>;
}

export const FlyerCanvas: React.FC<FlyerCanvasProps> = ({
  format,
  theme,
  onSelectService,
  flyerRef,
}) => {
  // Dimension and proportion configurations
  const formatStyles = {
    portrait: 'w-full max-w-[780px] min-h-[960px]',
    square: 'w-full max-w-[760px] min-h-[760px]',
    story: 'w-full max-w-[540px] min-h-[960px]',
  };

  // Theme style configurations
  const themeStyles = {
    'nude-luxury': {
      bg: 'bg-gradient-to-b from-[#FAF7F2] via-[#F5EFEB] to-[#ECE2D8]',
      cardBg: 'bg-white/85 backdrop-blur-sm',
      cardBorder: 'border-[#DFCEBC]',
      heroFrameBorder: 'border-[#D4AF37]/60',
      textPrimary: 'text-[#2D1B11]',
      textSecondary: 'text-[#6C4A32]',
      accentGold: 'text-[#AA7C11]',
      badgeBg: 'bg-[#3D2314] text-[#F5EFEB]',
      contactBarBg: 'bg-[#2A1810] text-[#F5EFEB]',
      hairBorder: 'border-[#EADBC8]',
    },
    'mocha-velvet': {
      bg: 'bg-gradient-to-b from-[#2A1810] via-[#382015] to-[#1E110A]',
      cardBg: 'bg-[#3D2314]/85 backdrop-blur-sm',
      cardBorder: 'border-[#AA7C11]/30',
      heroFrameBorder: 'border-[#D4AF37]/80',
      textPrimary: 'text-[#FDFBF7]',
      textSecondary: 'text-[#DFCEBC]',
      accentGold: 'text-[#E6CA65]',
      badgeBg: 'bg-[#D4AF37] text-[#2A1810]',
      contactBarBg: 'bg-[#180D07] text-[#F5EFEB]',
      hairBorder: 'border-[#AA7C11]/40',
    },
    'warm-ivory': {
      bg: 'bg-gradient-to-b from-[#FFFFFF] via-[#FAF6F0] to-[#F2EAE0]',
      cardBg: 'bg-white/95 backdrop-blur-sm shadow-sm',
      cardBorder: 'border-[#E2D4C5]',
      heroFrameBorder: 'border-[#C59B27]/70',
      textPrimary: 'text-[#2A1810]',
      textSecondary: 'text-[#5C3A21]',
      accentGold: 'text-[#996515]',
      badgeBg: 'bg-[#5C3A21] text-white',
      contactBarBg: 'bg-[#321B10] text-white',
      hairBorder: 'border-[#DFCEBC]',
    },
  }[theme];

  const isDark = theme === 'mocha-velvet';

  return (
    <div
      ref={flyerRef}
      id="rossybraids-flyer"
      className={`print-flyer relative overflow-hidden transition-all duration-300 shadow-2xl flex flex-col justify-between ${formatStyles[format]} ${themeStyles.bg} text-[#2A1810] select-none`}
      style={{
        boxShadow: isDark
          ? '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 35px rgba(212, 175, 55, 0.15)'
          : '0 25px 50px -12px rgba(45, 27, 17, 0.18), 0 0 30px rgba(212, 175, 55, 0.12)',
      }}
    >
      {/* Refined Gold Border & Decorative Hairline Frame */}
      <div className="absolute inset-2 md:inset-3.5 border border-[#D4AF37]/35 pointer-events-none z-20" />
      <div className="absolute inset-2.5 md:inset-4 border border-[#D4AF37]/15 pointer-events-none z-20" />

      {/* Decorative Corner Accents */}
      <div className="absolute top-2.5 left-2.5 md:top-4 md:left-4 w-3.5 h-3.5 border-t-2 border-l-2 border-[#D4AF37] pointer-events-none z-20" />
      <div className="absolute top-2.5 right-2.5 md:top-4 md:right-4 w-3.5 h-3.5 border-t-2 border-r-2 border-[#D4AF37] pointer-events-none z-20" />
      <div className="absolute bottom-2.5 left-2.5 md:bottom-4 md:left-4 w-3.5 h-3.5 border-b-2 border-l-2 border-[#D4AF37] pointer-events-none z-20" />
      <div className="absolute bottom-2.5 right-2.5 md:bottom-4 md:right-4 w-3.5 h-3.5 border-b-2 border-r-2 border-[#D4AF37] pointer-events-none z-20" />

      {/* Subtle Luxury Pattern Accent */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none z-0"
        style={{
          backgroundImage: `radial-gradient(#D4AF37 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* ========================================================================= */}
      {/* 1. TOP HEADER SECTION: LOGO + BRAND NAME + SLOGAN                         */}
      {/* ========================================================================= */}
      <header className="relative z-10 pt-5 md:pt-7 px-5 md:px-8 text-center">
        {/* Top Gold Ornament Bar */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="h-[1px] w-10 md:w-16 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
          <span className="text-[#D4AF37] text-[10px] tracking-[0.3em] uppercase font-sans-modern font-semibold flex items-center gap-1.5">
            <Sparkles className="w-2.5 h-2.5" /> Haute Coiffure & Luxury Hair
          </span>
          <div className="h-[1px] w-10 md:w-16 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
        </div>

        {/* Custom RossyBraids Logo */}
        <div className="flex justify-center mb-1">
          <RossyLogo
            variant={isDark ? 'gold' : 'gold'}
            size={format === 'story' ? 'sm' : 'md'}
            showSubtext={false}
          />
        </div>

        {/* Brand Slogan */}
        <div className="mt-1 flex flex-col items-center">
          <p
            className={`font-serif-luxury text-sm md:text-base italic tracking-wide ${themeStyles.textSecondary}`}
            style={{ letterSpacing: '0.04em' }}
          >
            “RossyBraids — Where Beauty Meets Craft.”
          </p>
          <div className="w-16 md:w-24 h-[1.5px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mt-1.5" />
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN VISUAL COLLAGE: BONE-STRAIGHT HERO + 4 COLLAGE TILES              */}
      {/* ========================================================================= */}
      <main className="relative z-10 px-4 md:px-7 py-2 md:py-3 flex-1 flex flex-col justify-center gap-3">
        <div className="grid grid-cols-12 gap-2.5 md:gap-3.5 items-stretch">
          {/* HERO FOCAL POINT: Very Attractive Bone-Straight Wig */}
          <div
            className={`col-span-12 ${
              format === 'square' ? 'sm:col-span-5' : 'sm:col-span-6 md:col-span-5'
            } relative group cursor-pointer overflow-hidden rounded-md border ${
              themeStyles.heroFrameBorder
            } shadow-lg`}
            onClick={() => onSelectService && onSelectService(SERVICES_DATA[0])}
            title="Click to view Bone-Straight Wigs & Revamping"
          >
            <div className="relative w-full h-full min-h-[220px] sm:min-h-[290px] overflow-hidden bg-[#2D1B11]">
              <img
                src={IMAGES.heroBoneStraight}
                alt="RossyBraids Featured Style: Ultra-Luxury Shorter Bone-Straight Hair with liquid-glass shine"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

              {/* Gold Ribbon Badge */}
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 text-[9px] md:text-[10px] uppercase font-sans-modern font-bold px-2 py-0.5 rounded-full bg-[#D4AF37] text-[#2A1810] shadow-md tracking-wider">
                  <Award className="w-2.5 h-2.5" /> Featured Style
                </span>
              </div>

              {/* Title & Craftsmanship Overlay */}
              <div className="absolute bottom-2.5 left-3 right-3 text-white">
                <p className="font-sans-modern text-[9.5px] tracking-widest uppercase text-[#F5E6A3] font-semibold flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" /> Wigs & Revamping
                </p>
                <h3 className="font-serif-luxury text-xl md:text-2xl font-bold leading-tight drop-shadow-md text-[#FFFDF8]">
                  Bone-Straight Hair
                </h3>
                <p className="text-[10px] md:text-[11px] text-[#DFCEBC] font-sans-modern line-clamp-1">
                  Shorter blunt collarbone cut, liquid-glass shine & couture thermal press
                </p>
              </div>
            </div>
          </div>

          {/* SECONDARY GALLERY COLLAGE (4 Real Diverse Models & Products) */}
          <div
            className={`col-span-12 ${
              format === 'square' ? 'sm:col-span-7' : 'sm:col-span-6 md:col-span-7'
            } grid grid-cols-2 gap-2 md:gap-2.5`}
          >
            {/* Tile 1: Boho Braids (Deep Chocolate Complexion, Mocha Halter) */}
            <div
              className={`relative group cursor-pointer overflow-hidden rounded-md border ${themeStyles.cardBorder} ${themeStyles.cardBg} transition-all duration-300 hover:border-[#D4AF37] hover:shadow-md`}
              onClick={() => onSelectService && onSelectService(SERVICES_DATA[1])}
              title="Click to view Boho Braids"
            >
              <div className="aspect-[4/3] w-full overflow-hidden relative bg-[#1E110A]">
                <img
                  src={IMAGES.bohoBraids}
                  alt="Neat Boho braids with soft curly strands on stunning deep chocolate complexion model"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
                <span className="absolute bottom-1.5 left-2 text-[9px] uppercase font-sans-modern font-semibold px-1.5 py-0.5 rounded bg-black/60 text-[#F5E6A3] backdrop-blur-xs">
                  Loose Curls
                </span>
              </div>
              <div className="p-1.5 md:p-2">
                <h4
                  className={`font-serif-luxury font-bold text-xs md:text-sm leading-snug ${themeStyles.textPrimary}`}
                >
                  Boho Braids
                </h4>
                <p className="text-[9px] md:text-[10px] text-[#8C6D53] dark:text-[#C4AC90] line-clamp-1">
                  Neat, stylish & feminine curls
                </p>
              </div>
            </div>

            {/* Tile 2: Dreadlocks (Warm Chestnut Skin, Chic Minimalist Olive Top) */}
            <div
              className={`relative group cursor-pointer overflow-hidden rounded-md border ${themeStyles.cardBorder} ${themeStyles.cardBg} transition-all duration-300 hover:border-[#D4AF37] hover:shadow-md`}
              onClick={() => onSelectService && onSelectService(SERVICES_DATA[2])}
              title="Click to view Dreadlocks"
            >
              <div className="aspect-[4/3] w-full overflow-hidden relative bg-[#1E110A]">
                <img
                  src={IMAGES.dreadlocks}
                  alt="Immaculate professionally installed dreadlocks with gold cuffs on warm chestnut skin"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
                <span className="absolute bottom-1.5 left-2 text-[9px] uppercase font-sans-modern font-semibold px-1.5 py-0.5 rounded bg-black/60 text-[#F5E6A3] backdrop-blur-xs">
                  Clean Parting
                </span>
              </div>
              <div className="p-1.5 md:p-2">
                <h4
                  className={`font-serif-luxury font-bold text-xs md:text-sm leading-snug ${themeStyles.textPrimary}`}
                >
                  Dreadlocks
                </h4>
                <p className="text-[9px] md:text-[10px] text-[#8C6D53] dark:text-[#C4AC90] line-clamp-1">
                  Immaculate locking & detailing
                </p>
              </div>
            </div>

            {/* Tile 3: Natural Hairstyling (Glowing Espresso Skin, Light-Peach Dress) */}
            <div
              className={`relative group cursor-pointer overflow-hidden rounded-md border ${themeStyles.cardBorder} ${themeStyles.cardBg} transition-all duration-300 hover:border-[#D4AF37] hover:shadow-md`}
              onClick={() => onSelectService && onSelectService(SERVICES_DATA[3])}
              title="Click to view Natural Hairstyling"
            >
              <div className="aspect-[4/3] w-full overflow-hidden relative bg-[#1E110A]">
                <img
                  src={IMAGES.fluffyTwists}
                  alt="Fluffy, healthy natural-hair twists on radiant model wearing an understated light-peach off-shoulder dress"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
                <span className="absolute bottom-1.5 left-2 text-[9px] uppercase font-sans-modern font-semibold px-1.5 py-0.5 rounded bg-black/60 text-[#F5E6A3] backdrop-blur-xs">
                  Natural Texture
                </span>
              </div>
              <div className="p-1.5 md:p-2">
                <h4
                  className={`font-serif-luxury font-bold text-xs md:text-sm leading-snug ${themeStyles.textPrimary}`}
                >
                  Natural Hairstyling
                </h4>
                <p className="text-[9px] md:text-[10px] text-[#8C6D53] dark:text-[#C4AC90] line-clamp-1">
                  Fluffy twists & volume care
                </p>
              </div>
            </div>

            {/* Tile 4: Other African Hairstyles (Didi, Threading, Shuku) */}
            <div
              className={`relative group cursor-pointer overflow-hidden rounded-md border ${themeStyles.cardBorder} ${themeStyles.cardBg} transition-all duration-300 hover:border-[#D4AF37] hover:shadow-md`}
              onClick={() => {
                const s = SERVICES_DATA.find((item) => item.id === 'african-traditional');
                if (s && onSelectService) onSelectService(s);
              }}
              title="Click to view Other African Hairstyles (Didi, Threading, etc.)"
            >
              <div className="aspect-[4/3] w-full overflow-hidden relative bg-[#1E110A]">
                <img
                  src={IMAGES.africanTraditional}
                  alt="African traditional hairstyle showcasing precision two-hand Didi weaving and hair threading"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
                <span className="absolute bottom-1.5 left-2 text-[9px] uppercase font-sans-modern font-semibold px-1.5 py-0.5 rounded bg-black/60 text-[#F5E6A3] backdrop-blur-xs">
                  Heritage Craft
                </span>
              </div>
              <div className="p-1.5 md:p-2">
                <h4
                  className={`font-serif-luxury font-bold text-xs md:text-sm leading-snug ${themeStyles.textPrimary}`}
                >
                  African Hairstyles
                </h4>
                <p className="text-[9px] md:text-[10px] text-[#8C6D53] dark:text-[#C4AC90] line-clamp-1">
                  Threading, Didi, Shuku & Knots
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. SERVICES LIST & VALUE PILLARS                                          */}
        {/* ========================================================================= */}
        <div
          className={`rounded-md p-2.5 md:p-3 border ${themeStyles.cardBorder} ${themeStyles.cardBg}`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
              <h4
                className={`font-cinzel text-xs md:text-sm font-semibold tracking-wider uppercase ${themeStyles.textPrimary}`}
              >
                Our Premium Services & Home Care
              </h4>
            </div>
            <span className="text-[9px] md:text-[10px] uppercase font-sans-modern font-semibold text-[#D4AF37] tracking-wider">
              Salon & VIP Home Service
            </span>
          </div>

          {/* Distinct Service Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5">
            {BRAND_DATA.services.map((service) => (
              <div
                key={service}
                onClick={() => {
                  if (onSelectService) {
                    if (service.includes('Wigs')) onSelectService(SERVICES_DATA.find(s => s.id === 'wigs-revamping')!);
                    else if (service.includes('Boho')) onSelectService(SERVICES_DATA.find(s => s.id === 'boho-braids')!);
                    else if (service.includes('Dreadlocks')) onSelectService(SERVICES_DATA.find(s => s.id === 'dreadlocks')!);
                    else if (service.includes('Natural')) onSelectService(SERVICES_DATA.find(s => s.id === 'natural-hairstyling')!);
                    else if (service.includes('African')) onSelectService(SERVICES_DATA.find(s => s.id === 'african-traditional')!);
                    else if (service.includes('Products')) onSelectService(SERVICES_DATA.find(s => s.id === 'hair-treatment-products')!);
                  }
                }}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-left transition-colors hover:bg-[#D4AF37]/20 cursor-pointer"
              >
                <CheckCircle2 className="w-3 h-3 text-[#D4AF37] shrink-0" />
                <span
                  className={`font-sans-modern text-[10px] md:text-[11px] font-semibold leading-tight ${themeStyles.textPrimary}`}
                >
                  {service}
                </span>
              </div>
            ))}
          </div>

          {/* Products & Accessories Highlight */}
          <div className="mt-2 pt-2 border-t border-[#D4AF37]/20 flex flex-wrap items-center justify-between gap-1.5 text-[9px] md:text-[10px]">
            <span className={`font-semibold ${themeStyles.accentGold}`}>
              HAIR-CARE ESSENTIALS AVAILABLE:
            </span>
            <span className={`font-sans-modern ${themeStyles.textSecondary}`}>
              Shampoo • Bone-Straight Serum • Hair Creams • Multi-Color Satin Scrunchies • Gold Hair Cuffs
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. VERIFIED CLIENT TESTIMONIALS CAROUSEL (BUILD TRUST)                   */}
        {/* ========================================================================= */}
        <TestimonialCarousel theme={theme} className="w-full" />
      </main>

      {/* ========================================================================= */}
      {/* 5. CONTACT BAR WITH INTEGRATED 'SCAN TO BOOK' QR CODE IN CORNER           */}
      {/* ========================================================================= */}
      <footer className="relative z-10 px-3 md:px-5 pb-3 md:pb-4 pt-1">
        <div
          className={`rounded-md p-3 md:p-3.5 shadow-xl border border-[#D4AF37]/35 ${themeStyles.contactBarBg}`}
        >
          {/* Booking Callout */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pb-2 mb-2 border-b border-white/10">
            <div className="text-center sm:text-left">
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#D4AF37] font-semibold font-sans-modern">
                Direct Booking & Inquiries
              </span>
              <p className="font-serif-luxury text-sm md:text-base text-white font-medium">
                Experience the luxury of tailored hair perfection
              </p>
            </div>
            <a
              href={`https://wa.me/${BRAND_DATA.whatsappRaw}?text=Hello%20RossyBraids%2C%20I%20saw%20your%20flyer%20and%20would%20like%20to%20book%20an%20appointment%20or%20make%20an%20inquiry!`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-[#1A0F08] font-sans-modern font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition-transform"
            >
              <Calendar className="w-3.5 h-3.5" /> Book Appointment
            </a>
          </div>

          {/* Bottom Layout: Contact Cards + Corner 'Scan to Book' QR Component */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* 3 Contact Social Links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 w-full text-xs">
              {/* WhatsApp */}
              <a
                href={`https://wa.me/${BRAND_DATA.whatsappRaw}?text=Hello%20RossyBraids!`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded bg-white/5 border border-white/10 hover:border-[#D4AF37]/60 hover:bg-white/10 transition-all group"
              >
                <div className="w-7 h-7 rounded-full bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5 text-[#25D366]" />
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#DFCEBC] block font-semibold">
                    WhatsApp
                  </span>
                  <span className="font-sans-modern font-bold text-white text-xs tracking-wide group-hover:text-[#D4AF37] transition-colors">
                    {BRAND_DATA.whatsapp}
                  </span>
                </div>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com/rossy.braids"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded bg-white/5 border border-white/10 hover:border-[#D4AF37]/60 hover:bg-white/10 transition-all group"
              >
                <div className="w-7 h-7 rounded-full bg-[#E1306C]/20 border border-[#E1306C]/40 flex items-center justify-center shrink-0">
                  <Instagram className="w-3.5 h-3.5 text-[#E1306C]" />
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#DFCEBC] block font-semibold">
                    Instagram
                  </span>
                  <span className="font-sans-modern font-bold text-white text-xs tracking-wide italic group-hover:text-[#D4AF37] transition-colors">
                    {BRAND_DATA.instagram}
                  </span>
                </div>
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/search/top?q=Rose%20Iyaji"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded bg-white/5 border border-white/10 hover:border-[#D4AF37]/60 hover:bg-white/10 transition-all group"
              >
                <div className="w-7 h-7 rounded-full bg-[#1877F2]/20 border border-[#1877F2]/40 flex items-center justify-center shrink-0">
                  <Facebook className="w-3.5 h-3.5 text-[#1877F2]" />
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#DFCEBC] block font-semibold">
                    Facebook
                  </span>
                  <span className="font-sans-modern font-bold text-white text-xs tracking-wide group-hover:text-[#D4AF37] transition-colors">
                    {BRAND_DATA.facebook}
                  </span>
                </div>
              </a>
            </div>

            {/* Corner 'Scan to Book' SVG QR Code Component */}
            <div className="shrink-0 flex items-center justify-center">
              <ScanToBookQR
                url={`https://wa.me/${BRAND_DATA.whatsappRaw}?text=Hello%20RossyBraids%2C%20I%20saw%20your%20flyer%20and%20would%20like%20to%20book%20an%20appointment!`}
                size={58}
                variant="glass"
                className="scale-95 sm:scale-100"
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
