import React, { useState } from 'react';
import { FlyerFormat, FlyerTheme } from '../types';
import { BRAND_DATA } from '../data/flyerData';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';
import {
  Download,
  Printer,
  Smartphone,
  Square,
  FileText,
  Palette,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface FlyerControlsProps {
  format: FlyerFormat;
  setFormat: (format: FlyerFormat) => void;
  theme: FlyerTheme;
  setTheme: (theme: FlyerTheme) => void;
  flyerRef: React.RefObject<HTMLDivElement | null>;
}

export const FlyerControls: React.FC<FlyerControlsProps> = ({
  format,
  setFormat,
  theme,
  setTheme,
  flyerRef,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  // High-Resolution Export Handler
  const handleDownloadFlyer = async () => {
    if (!flyerRef.current) return;
    setIsExporting(true);

    try {
      // Export with pixel ratio for crisp commercial resolution
      const dataUrl = await toPng(flyerRef.current, {
        quality: 0.98,
        pixelRatio: 2.5,
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.download = `RossyBraids_Luxury_Flyer_${format}_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      // Confetti effect to celebrate
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#D4AF37', '#DFCEBC', '#C59B27', '#F5E6A3'],
      });
    } catch (err) {
      console.error('Failed to export flyer:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyDetails = () => {
    const text = `ROSSYBRAIDS
“Where Beauty Meets Craft.”

SERVICES:
• Wigs & Revamping
• Dreadlocks
• Natural Hairstyling
• Hair Treatment & Care
• Hair Products & Accessories

CONTACT & BOOKINGS:
• WhatsApp: 08137989405
• Instagram: rossy.braids
• Facebook: Rose Iyaji`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="no-print w-full max-w-4xl mx-auto px-4 py-3 my-4 bg-[#1E110A]/80 backdrop-blur-md rounded-xl border border-[#D4AF37]/30 shadow-xl text-[#F5EFEB]">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Aspect Ratio / Format Switcher */}
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <span className="text-[11px] uppercase tracking-wider text-[#DFCEBC] font-semibold flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-[#D4AF37]" /> Format:
          </span>
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10 w-full sm:w-auto justify-center">
            <button
              onClick={() => setFormat('portrait')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                format === 'portrait'
                  ? 'bg-[#D4AF37] text-[#1E110A] font-bold shadow-sm'
                  : 'text-[#DFCEBC] hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Flyer (4:5)</span>
            </button>
            <button
              onClick={() => setFormat('square')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                format === 'square'
                  ? 'bg-[#D4AF37] text-[#1E110A] font-bold shadow-sm'
                  : 'text-[#DFCEBC] hover:text-white'
              }`}
            >
              <Square className="w-3.5 h-3.5" />
              <span>Square (1:1)</span>
            </button>
            <button
              onClick={() => setFormat('story')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                format === 'story'
                  ? 'bg-[#D4AF37] text-[#1E110A] font-bold shadow-sm'
                  : 'text-[#DFCEBC] hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Status (9:16)</span>
            </button>
          </div>
        </div>

        {/* Theme Palette Switcher */}
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <span className="text-[11px] uppercase tracking-wider text-[#DFCEBC] font-semibold flex items-center gap-1">
            <Palette className="w-3.5 h-3.5 text-[#D4AF37]" /> Palette:
          </span>
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10 w-full sm:w-auto justify-center">
            <button
              onClick={() => setTheme('nude-luxury')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                theme === 'nude-luxury'
                  ? 'bg-[#EADBC8] text-[#2A1810] font-bold shadow-sm'
                  : 'text-[#DFCEBC] hover:text-white'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#EADBC8] border border-[#D4AF37]" />
              <span>Chic Nude</span>
            </button>
            <button
              onClick={() => setTheme('mocha-velvet')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                theme === 'mocha-velvet'
                  ? 'bg-[#3D2314] text-[#F5E6A3] font-bold border border-[#D4AF37]/50 shadow-sm'
                  : 'text-[#DFCEBC] hover:text-white'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#3D2314] border border-[#D4AF37]" />
              <span>Mocha Velvet</span>
            </button>
            <button
              onClick={() => setTheme('warm-ivory')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                theme === 'warm-ivory'
                  ? 'bg-white text-[#2A1810] font-bold shadow-sm'
                  : 'text-[#DFCEBC] hover:text-white'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-white border border-[#D4AF37]" />
              <span>Warm Ivory</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Download High-Res PNG Button */}
          <button
            onClick={handleDownloadFlyer}
            disabled={isExporting}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-gradient-to-r from-[#D4AF37] via-[#E6CA65] to-[#C59B27] text-[#1E110A] font-sans-modern font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
            title="Download high-resolution image for Instagram, WhatsApp, or Print"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Generating...' : 'Download PNG'}</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-[#DFCEBC] hover:text-white transition-colors"
            title="Print commercial flyer"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Copy Details */}
          <button
            onClick={handleCopyDetails}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-[#DFCEBC] hover:text-white transition-colors relative"
            title="Copy caption and brand details"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
