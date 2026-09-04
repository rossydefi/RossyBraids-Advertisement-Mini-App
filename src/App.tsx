import React, { useRef, useState } from 'react';
import { FlyerCanvas } from './components/FlyerCanvas';
import { FlyerControls } from './components/FlyerControls';
import { ServiceDetailModal } from './components/ServiceDetailModal';
import { BRAND_DATA, SERVICES_DATA } from './data/flyerData';
import { FlyerFormat, FlyerTheme, ServiceItem } from './types';
import {
  Sparkles,
  Phone,
  Instagram,
  Facebook,
  Award,
  CheckCircle2,
  Calendar,
  Layers,
  Info,
} from 'lucide-react';

export default function App() {
  const [format, setFormat] = useState<FlyerFormat>('portrait');
  const [theme, setTheme] = useState<FlyerTheme>('nude-luxury');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [showBrandSpecs, setShowBrandSpecs] = useState(false);
  const flyerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="min-h-screen bg-[#140D08] text-[#FAF6F0] flex flex-col justify-between selection:bg-[#D4AF37]/30 selection:text-white">
      {/* Top Luxury Navigation / Campaign Header (No-print) */}
      <header className="no-print border-b border-[#D4AF37]/20 bg-[#1E110A]/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Brand Mark */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-[#D4AF37]/60 bg-black/40 flex items-center justify-center text-[#D4AF37] font-cinzel font-bold text-base shadow-sm">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-cinzel text-base tracking-[0.2em] uppercase font-bold text-[#F5E6A3]">
                  RossyBraids
                </span>
                <span className="text-[10px] uppercase font-sans-modern font-semibold px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                  Official Ad Flyer
                </span>
              </div>
              <p className="text-[11px] text-[#DFCEBC] italic font-serif-luxury">
                “Where Beauty Meets Craft.”
              </p>
            </div>
          </div>

          {/* Direct Quick Contact Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            <a
              href={`https://wa.me/${BRAND_DATA.whatsappRaw}?text=Hello%20RossyBraids%2C%20I%20would%20like%20to%20book%20an%20appointment%20or%20make%20an%20inquiry!`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] transition-all font-sans-modern font-semibold"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp:</span>
              <span>{BRAND_DATA.whatsapp}</span>
            </a>

            <a
              href="https://instagram.com/rossy.braids"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E1306C]/15 hover:bg-[#E1306C]/25 border border-[#E1306C]/40 text-[#FFAEC9] transition-all font-sans-modern font-semibold"
            >
              <Instagram className="w-3.5 h-3.5 text-[#E1306C]" />
              <span className="hidden md:inline italic">{BRAND_DATA.instagram}</span>
            </a>

            <a
              href="https://www.facebook.com/search/top?q=Rose%20Iyaji"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1877F2]/15 hover:bg-[#1877F2]/25 border border-[#1877F2]/40 text-[#99C5FF] transition-all font-sans-modern font-semibold"
            >
              <Facebook className="w-3.5 h-3.5 text-[#1877F2]" />
              <span className="hidden lg:inline">{BRAND_DATA.facebook}</span>
            </a>

            <button
              onClick={() => setShowBrandSpecs(!showBrandSpecs)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[#DFCEBC] hover:text-white transition-all text-xs"
            >
              <Info className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">Brand Specs</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Presentation Stage */}
      <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 lg:p-8">
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
        <div className="no-print flex items-center justify-center gap-2 text-center text-xs text-[#DFCEBC]/80 mt-2">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>
            Click on any hairstyle or product tile above to view detailed service specs and send a pre-filled booking inquiry.
          </span>
        </div>

        {/* Brand Specs & Verification Drawer (Collapsible) */}
        {showBrandSpecs && (
          <div className="no-print w-full max-w-4xl mt-6 p-5 bg-[#1E110A]/90 border border-[#D4AF37]/30 rounded-xl shadow-xl text-xs space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="font-cinzel text-sm font-bold uppercase tracking-wider text-[#F5E6A3]">
                  RossyBraids Commercial Campaign Specifications
                </h3>
              </div>
              <button
                onClick={() => setShowBrandSpecs(false)}
                className="text-[#DFCEBC] hover:text-white"
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
              </div>

              <div className="space-y-1.5 p-3 rounded-lg bg-black/30 border border-white/5">
                <span className="text-[#D4AF37] font-semibold uppercase tracking-wider block">
                  5 Visual Showcase Elements
                </span>
                <p className="text-[#DFCEBC]">1. Medium-length bone-straight sleek silky wig</p>
                <p className="text-[#DFCEBC]">2. Clean, neat professionally installed dreadlocks</p>
                <p className="text-[#DFCEBC]">3. Fluffy healthy natural-hair twists</p>
                <p className="text-[#DFCEBC]">4. Signature feminine boho braids with loose curls</p>
                <p className="text-[#DFCEBC]">5. Hair-care essentials: shampoo, conditioner, creams, scrunchies</p>
              </div>

              <div className="space-y-1.5 p-3 rounded-lg bg-black/30 border border-white/5">
                <span className="text-[#D4AF37] font-semibold uppercase tracking-wider block">
                  Official Contact Details
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
      </div>

      {/* Footer / Copyright bar (No-print) */}
      <footer className="no-print border-t border-[#D4AF37]/15 bg-[#0F0804] py-4 px-4 text-center text-xs text-[#DFCEBC]/70">
        <p className="font-sans-modern">
          © {new Date().getFullYear()} <span className="text-[#D4AF37] font-semibold">RossyBraids</span>. All rights reserved. Where Beauty Meets Craft.
        </p>
      </footer>

      {/* Service Detail Modal */}
      <ServiceDetailModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
      />
    </div>
  );
}
