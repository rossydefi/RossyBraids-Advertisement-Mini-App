import React, { useState } from 'react';
import { FlyerFormat, FlyerTheme } from '../types';
import { FLYER_THEME_OPTIONS } from '../data/flyerThemes';
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

  // Native share sheet (WhatsApp, Instagram, etc.) where the browser can share image files.
  const handleShareFlyer = async () => {
    if (!flyerRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(flyerRef.current, { quality: 0.95, pixelRatio: 2, cacheBust: true });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `RossyBraids_${format}.png`, { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'RossyBraids', text: 'Where Beauty Meets Craft. Book at rossybraids.com' });
      }
    } catch (err) {
      if ((err as DOMException)?.name !== 'AbortError') console.error('Failed to share flyer:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const canShareFiles = typeof navigator !== 'undefined' && typeof navigator.canShare === 'function';

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
    <div className="no-print w-full max-w-5xl mx-auto px-4 py-3 my-4 bg-[#1E110A]/80 backdrop-blur-md rounded-xl border border-[#D4AF37]/30 shadow-xl text-[#F5EFEB]">
      <div className="flex flex-wrap items-center justify-between gap-4">
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
        <div className="order-last flex flex-col sm:flex-row items-center gap-2 w-full md:justify-center">
          <span className="text-[11px] uppercase tracking-wider text-[#DFCEBC] font-semibold flex items-center gap-1">
            <Palette className="w-3.5 h-3.5 text-[#D4AF37]" /> Palette:
          </span>
          <div role="group" aria-label="Flyer palette" className="flex flex-wrap items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10 w-full sm:w-auto justify-center">
            {FLYER_THEME_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTheme(opt.id)}
                aria-pressed={theme === opt.id}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  theme === opt.id ? 'bg-white/15 ring-1 ring-[#D4AF37] text-white font-bold' : 'text-[#DFCEBC] hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full border border-[#D4AF37] ${opt.swatch}`} aria-hidden="true" />
                <span>{opt.label}</span>
              </button>
            ))}
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

          {canShareFiles && (
            <button
              type="button"
              onClick={handleShareFlyer}
              disabled={isExporting}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-[#DFCEBC] hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
              title="Share flyer to WhatsApp, Instagram and more"
              aria-label="Share flyer"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}

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
