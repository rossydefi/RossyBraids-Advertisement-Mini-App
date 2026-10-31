import React from 'react';
import { Facebook, Globe, Instagram, MessageCircle } from 'lucide-react';
import { BRAND_DATA, IMAGES, SERVICES_DATA } from '../data/flyerData';
import { FLYER_THEMES } from '../data/flyerThemes';
import { DARK_FLYER_THEMES, FlyerFormat, FlyerTheme, ServiceItem } from '../types';
import { RossyLogo } from './RossyLogo';
import { ScanToBookQR } from './ScanToBookQR';

interface FlyerCanvasProps {
  format: FlyerFormat;
  theme: FlyerTheme;
  onSelectService?: (service: ServiceItem) => void;
  flyerRef: React.RefObject<HTMLDivElement | null>;
}

/** The six services shown on the flyer: just a photo and a name each. */
const TILES: { id: string; name: string; image: string; alt: string }[] = [
  { id: 'wigs-revamping', name: 'Wigs & Revamping', image: IMAGES.heroBoneStraight, alt: 'Sleek bone-straight luxury wig' },
  { id: 'boho-braids', name: 'Boho Braids', image: IMAGES.bohoBraids, alt: 'Boho braids with soft curls' },
  { id: 'dreadlocks', name: 'Dreadlocks', image: IMAGES.dreadlocks, alt: 'Neat dreadlocks with gold cuffs' },
  { id: 'natural-hairstyling', name: 'Natural Hairstyling', image: IMAGES.fluffyTwists, alt: 'Fluffy natural twists' },
  { id: 'african-traditional', name: 'African Hairstyles', image: IMAGES.africanTraditional, alt: 'Traditional African hair threading' },
  { id: 'hair-treatment-products', name: 'Hair Products', image: IMAGES.products, alt: 'Hair care products and satin scrunchies' },
];

const CONTACTS = [
  { label: 'WhatsApp', value: BRAND_DATA.whatsapp, Icon: MessageCircle, color: 'text-[#25D366]' },
  { label: 'Instagram', value: `@${BRAND_DATA.instagram}`, Icon: Instagram, color: 'text-[#E1306C]' },
  { label: 'Facebook', value: BRAND_DATA.facebook, Icon: Facebook, color: 'text-[#4C8BF5]' },
  { label: 'Website', value: BRAND_DATA.domain, Icon: Globe, color: 'text-[#D4AF37]' },
];

export const FlyerCanvas: React.FC<FlyerCanvasProps> = ({ format, theme, onSelectService, flyerRef }) => {
  const style = FLYER_THEMES[theme];
  const isDark = DARK_FLYER_THEMES.includes(theme);

  const formatClass = {
    // Every format keeps its exact proportions (Instagram 4:5, square, story 9:16) and the photos stretch to fill the space.
    // min-w stops them being squashed on phones, where the flyer scrolls sideways instead.
    portrait: 'w-full max-w-[780px] min-w-[600px] aspect-[4/5]',
    square: 'w-full max-w-[760px] min-w-[600px] aspect-square',
    story: 'w-full max-w-[540px] min-w-[420px] aspect-[9/16]',
  }[format];

  const gridClass = format === 'story' ? 'grid-cols-2 grid-rows-3' : 'grid-cols-3 grid-rows-2';

  return (
    <div
      ref={flyerRef}
      id="rossybraids-flyer"
      className={`print-flyer relative overflow-hidden transition-all duration-300 shadow-2xl flex flex-col justify-between ${formatClass} ${style.bg} select-none`}
      style={{
        boxShadow: isDark
          ? '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 35px rgba(212, 175, 55, 0.15)'
          : '0 25px 50px -12px rgba(45, 27, 17, 0.18), 0 0 30px rgba(212, 175, 55, 0.12)',
      }}
    >
      {/* Single clean frame */}
      <div className={`absolute inset-3 md:inset-4 border-2 ${style.frame} pointer-events-none z-20`} />

      {/* Header: logo with the slogan beneath it */}
      <header className="relative z-10 pt-9 md:pt-11 px-6 flex flex-col items-center">
        <RossyLogo
          variant={style.logoVariant}
          size={format === 'story' ? 'md' : 'lg'}
          accentClass={style.logoAccent}
          restClass={style.logoRest}
        />
        <div className="mt-3 md:mt-4 flex items-center justify-center gap-3 md:gap-4">
          <span className={`h-px w-8 md:w-16 bg-gradient-to-r from-transparent to-current ${style.accent}`} />
          <span className={`text-[8px] leading-none ${style.accent}`} aria-hidden="true">◆</span>
          <p
            className={`font-serif-luxury italic font-semibold leading-none whitespace-nowrap ${
              format === 'story' ? 'text-base' : 'text-xl md:text-[26px]'
            } ${style.accent}`}
            style={{ letterSpacing: '0.06em' }}
          >
            Where Beauty Meets Craft.
          </p>
          <span className={`text-[8px] leading-none ${style.accent}`} aria-hidden="true">◆</span>
          <span className={`h-px w-8 md:w-16 bg-gradient-to-l from-transparent to-current ${style.accent}`} />
        </div>
      </header>

      {/* Our Premium Services: the photos live inside this panel */}
      <main className="relative z-10 px-6 md:px-9 py-4 flex-1 min-h-0 flex flex-col justify-center">
        <section className={`rounded-lg border ${style.panelBorder} ${style.panelBg} p-3 md:p-4 flex-1 min-h-0 flex flex-col`}>
          <div className="flex items-center justify-center gap-3 mb-3 md:mb-4">
            <span className={`h-px w-6 md:w-14 bg-current ${style.accent}`} />
            <h2
              className={`font-cinzel font-extrabold uppercase whitespace-nowrap ${
                format === 'story' ? 'tracking-[0.14em] text-xs' : 'tracking-[0.2em] text-sm md:text-lg'
              } ${style.textPrimary}`}
            >
              Our Premium Services
            </h2>
            <span className={`h-px w-6 md:w-14 bg-current ${style.accent}`} />
          </div>
          <p className={`-mt-2 mb-3 md:mb-4 text-center font-sans-modern font-bold uppercase text-[9px] md:text-[11px] tracking-[0.28em] ${style.accent}`}>
            Salon &amp; VIP Home Service
          </p>

          <div className={`grid ${gridClass} gap-2 md:gap-3 flex-1 min-h-0`}>
            {TILES.map((tile) => (
              <button
                key={tile.id}
                type="button"
                onClick={() => {
                  const service = SERVICES_DATA.find((s) => s.id === tile.id);
                  if (service && onSelectService) onSelectService(service);
                }}
                className={`relative group overflow-hidden rounded-md h-full w-full bg-[#1E110A] text-left cursor-pointer`}
                aria-label={tile.name}
              >
                <img
                  src={tile.image}
                  alt={tile.alt}
                  className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <span className="absolute bottom-0 inset-x-0 px-2 pb-2 md:pb-3 text-center font-serif-luxury font-bold text-[#FFFDF8] text-sm md:text-xl leading-tight drop-shadow-md">
                  {tile.name}
                </span>
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* Footer: contacts under "Direct Booking & Enquiries", plus the QR to the website */}
      <footer className="relative z-10 px-6 md:px-9 pb-8 md:pb-10">
        <div className={`rounded-lg px-4 md:px-6 py-4 md:py-5 ${style.barBg}`}>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 space-y-2.5">
              <p className={`font-cinzel font-bold uppercase whitespace-nowrap text-[#F5E6A3] ${format === 'story' ? 'tracking-[0.12em] text-[10px]' : 'tracking-[0.2em] text-[10px] md:text-sm'}`}>
                Direct Booking &amp; Enquiries
              </p>
              <ul className="space-y-1.5 font-sans-modern text-xs md:text-sm">
                {CONTACTS.map(({ label, value, Icon, color }) => (
                  <li key={label} className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 ${color}`} aria-hidden="true" />
                    <span className="w-[4.6rem] md:w-20 shrink-0 opacity-70 text-[11px] md:text-xs">{label}</span>
                    <span className="font-semibold">{value}</span>
                  </li>
                ))}
              </ul>
            </div>
            <ScanToBookQR url={BRAND_DATA.website} size={format === 'story' ? 84 : 112} variant="glass" />
          </div>
        </div>
      </footer>
    </div>
  );
};
