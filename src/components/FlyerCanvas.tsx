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
const TILES: { id: string; name: string; image: string; alt: string; pos: string }[] = [
  { id: 'wigs-revamping', name: 'Wigs & Revamping', image: IMAGES.heroBoneStraight, alt: 'Sleek bone-straight luxury wig', pos: '50% 0%' },
  { id: 'boho-braids', name: 'Boho Braids', image: IMAGES.bohoBraids, alt: 'Boho braids with soft curls', pos: '50% 22%' },
  { id: 'dreadlocks', name: 'Dreadlocks', image: IMAGES.dreadlocks, alt: 'Neat dreadlocks with gold cuffs', pos: '50% 22%' },
  { id: 'natural-hairstyling', name: 'Natural Hairstyling', image: IMAGES.fluffyTwists, alt: 'Fluffy natural twists', pos: '50% 25%' },
  { id: 'african-traditional', name: 'African Hairstyles', image: IMAGES.africanTraditional, alt: 'Traditional African hair threading', pos: '50% 20%' },
  { id: 'hair-treatment-products', name: 'Hair Products', image: IMAGES.products, alt: 'Hair care products and satin scrunchies', pos: '50% 65%' },
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

  // Wigs & Revamping is the featured service: a large tile, with the other five around it.
  const gridClass = format === 'story' ? 'grid-cols-2 grid-rows-6' : 'grid-cols-3 grid-rows-3';
  const featuredClass = format === 'story' ? 'col-span-2 row-span-3' : 'col-span-2 row-span-2';
  const lastTileClass = format === 'story' ? 'col-span-2' : '';

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
      <header className="relative z-10 pt-7 md:pt-8 px-6 flex flex-col items-center">
        <RossyLogo
          variant={style.logoVariant}
          size={format === 'square' ? 'sm' : 'md'}
          accentClass={style.logoAccent}
          restClass={style.logoRest}
          slogan="Where Beauty Meets Craft."
          sloganClass={`${format === 'story' ? 'text-[13px]' : 'text-base md:text-[17px]'} ${style.accent}`}
        />
      </header>

      {/* Premium Salon & VIP Home Services: the photos live inside this panel */}
      <main className="relative z-10 px-6 md:px-9 py-3 flex-1 min-h-0 flex flex-col justify-center">
        <section className={`rounded-lg border ${style.panelBorder} ${style.panelBg} p-2.5 md:p-3 flex-1 min-h-0 flex flex-col`}>
          <div className="flex items-center justify-center gap-3 mb-2.5 md:mb-3">
            <span className={`h-px w-6 md:w-14 bg-current ${style.accent}`} />
            <h2
              className={`font-cinzel font-extrabold uppercase whitespace-nowrap ${
                format === 'story' ? 'tracking-[0.12em] text-[13px]' : 'tracking-[0.16em] text-sm md:text-lg'
              } ${style.textPrimary}`}
            >
              Premium <span className={style.accent}>Salon &amp; VIP Home</span> Services
            </h2>
            <span className={`h-px w-6 md:w-14 bg-current ${style.accent}`} />
          </div>
          <div className={`grid ${gridClass} gap-2 md:gap-3 flex-1 min-h-0`}>
            {TILES.map((tile, index) => {
              const featured = index === 0;
              return (
              <button
                key={tile.id}
                type="button"
                onClick={() => {
                  const service = SERVICES_DATA.find((s) => s.id === tile.id);
                  if (service && onSelectService) onSelectService(service);
                }}
                className={`relative group overflow-hidden rounded-md h-full w-full bg-[#1E110A] text-left cursor-pointer ${
                  featured ? `${featuredClass} ring-2 ring-[#D4AF37]` : index === TILES.length - 1 ? lastTileClass : ''
                }`}
                aria-label={tile.name}
              >
                <img
                  src={tile.image}
                  alt={tile.alt}
                  style={{ objectPosition: tile.id === 'wigs-revamping' && format !== 'square' ? '50% 10%' : format === 'story' && tile.id === 'hair-treatment-products' ? '50% 40%' : tile.pos }}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {featured && <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />}
                {featured ? (
                  <div className="absolute bottom-0 inset-x-0 px-2 pb-3 md:pb-5 text-center drop-shadow-md">
                    <span className="block font-serif-luxury font-bold text-[#FFFDF8] leading-tight text-xl md:text-4xl">{tile.name}</span>
                    <span className="mt-1 block font-sans-modern font-semibold uppercase tracking-[0.18em] text-[#F5E6A3] text-[8px] md:text-[11px]">
                      Frontals · Closures · Custom Colour · Revamp
                    </span>
                  </div>
                ) : (
                  <span className={`absolute bottom-0 inset-x-0 bg-black/55 px-2 py-0.5 md:py-1 text-center font-serif-luxury font-bold text-[#FFFDF8] text-xs leading-tight ${format === 'portrait' ? 'md:text-lg' : 'md:text-[15px]'}`}>
                    {tile.name}
                  </span>
                )}
              </button>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer: contacts under "Direct Booking & Enquiries", plus the QR to the website */}
      <footer className="relative z-10 px-6 md:px-9 pb-7 md:pb-8">
        <div className={`rounded-lg px-4 md:px-6 py-2.5 md:py-3 ${style.barBg}`}>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 space-y-2">
              <p className={`font-cinzel font-bold uppercase whitespace-nowrap text-[#F5E6A3] ${format === 'story' ? 'tracking-[0.12em] text-[10px]' : 'tracking-[0.2em] text-[10px] md:text-sm'}`}>
                Direct Booking &amp; Enquiries
              </p>
              <ul className={`${format === 'square' ? 'space-y-0.5' : 'space-y-1.5'} font-sans-modern text-xs md:text-sm`}>
                {CONTACTS.map(({ label, value, Icon, color }) => (
                  <li key={label} className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 ${color}`} aria-hidden="true" />
                    <span className="w-[4.6rem] md:w-20 shrink-0 opacity-90 text-[11px] md:text-xs">{label}</span>
                    <span className="font-semibold">{value}</span>
                  </li>
                ))}
              </ul>
            </div>
            <ScanToBookQR url={BRAND_DATA.website} size={format === 'story' ? 84 : format === 'square' ? 80 : 112} variant="glass" />
          </div>
        </div>
      </footer>
    </div>
  );
};
