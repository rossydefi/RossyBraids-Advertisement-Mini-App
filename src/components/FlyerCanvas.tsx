import React from 'react';
import { Globe, Instagram, Phone } from 'lucide-react';
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

export const FlyerCanvas: React.FC<FlyerCanvasProps> = ({ format, theme, onSelectService, flyerRef }) => {
  const style = FLYER_THEMES[theme];
  const isDark = DARK_FLYER_THEMES.includes(theme);

  const formatClass = {
    portrait: 'w-full max-w-[780px] min-h-[960px]',
    square: 'w-full max-w-[760px] min-h-[760px]',
    story: 'w-full max-w-[540px] min-h-[960px]',
  }[format];

  const gridClass = format === 'story' ? 'grid-cols-2' : 'grid-cols-3';
  const tileAspect = format === 'portrait' ? 'aspect-[7/8]' : format === 'square' ? 'aspect-[6/5]' : 'aspect-[16/11]';

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

      {/* Header: the logo and nothing else */}
      <header className="relative z-10 pt-9 md:pt-11 px-6 flex justify-center">
        <RossyLogo
          variant={style.logoVariant}
          size={format === 'story' ? 'md' : 'lg'}
          accentClass={style.logoAccent}
          restClass={style.logoRest}
        />
      </header>

      {/* Our Premium Services: the photos live inside this panel */}
      <main className="relative z-10 px-6 md:px-9 py-5 flex-1 flex flex-col justify-center">
        <section className={`rounded-lg border ${style.panelBorder} ${style.panelBg} p-3 md:p-4`}>
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

          <div className={`grid ${gridClass} gap-2 md:gap-3`}>
            {TILES.map((tile) => (
              <button
                key={tile.id}
                type="button"
                onClick={() => {
                  const service = SERVICES_DATA.find((s) => s.id === tile.id);
                  if (service && onSelectService) onSelectService(service);
                }}
                className={`relative group overflow-hidden rounded-md ${tileAspect} bg-[#1E110A] text-left cursor-pointer`}
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

      {/* Footer: slogan, three contacts, QR */}
      <footer className="relative z-10 px-6 md:px-9 pb-8 md:pb-10">
        <div className={`rounded-lg px-4 md:px-6 py-4 md:py-5 ${style.barBg}`}>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 space-y-2.5">
              <p className="font-serif-luxury italic font-semibold text-lg md:text-2xl text-[#F5E6A3] leading-tight">
                Where Beauty Meets Craft.
              </p>
              <ul className="space-y-1 font-sans-modern font-semibold text-xs md:text-sm">
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#25D366] shrink-0" aria-hidden="true" />
                  {BRAND_DATA.whatsapp}
                </li>
                <li className="flex items-center gap-2">
                  <Instagram className="w-3.5 h-3.5 text-[#E1306C] shrink-0" aria-hidden="true" />@{BRAND_DATA.instagram}
                </li>
                <li className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" aria-hidden="true" />
                  {BRAND_DATA.domain}
                </li>
              </ul>
            </div>
            <ScanToBookQR url={BRAND_DATA.website} size={format === 'story' ? 64 : 76} variant="glass" />
          </div>
        </div>
      </footer>
    </div>
  );
};
