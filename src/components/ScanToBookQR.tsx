import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { BRAND_DATA } from '../data/flyerData';
import { Sparkles, MessageCircle } from 'lucide-react';

interface ScanToBookQRProps {
  url?: string;
  size?: number;
  variant?: 'light' | 'dark' | 'glass';
  className?: string;
  compact?: boolean;
}

export const ScanToBookQR: React.FC<ScanToBookQRProps> = ({
  url = `https://wa.me/${BRAND_DATA.whatsappRaw}?text=Hello%20RossyBraids%2C%20I%20saw%20your%20flyer%20and%20would%20like%20to%20book%20an%20appointment!`,
  size = 68,
  variant = 'glass',
  className = '',
  compact = false,
}) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title="Scan with your phone camera or click to chat with RossyBraids on WhatsApp"
      className={`group relative inline-flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-300 ${
        variant === 'dark'
          ? 'bg-[#1E110A]/95 text-[#F5EFEB] border border-[#D4AF37]/50 shadow-xl'
          : variant === 'glass'
          ? 'bg-white/95 backdrop-blur-md text-[#2A1810] border border-[#D4AF37]/45 shadow-lg hover:border-[#D4AF37] hover:shadow-xl'
          : 'bg-white text-[#2A1810] border border-[#DFCEBC] shadow-md'
      } ${className}`}
    >
      {/* Subtle Gold Corner Accents */}
      <div className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-[#D4AF37]" />
      <div className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-[#D4AF37]" />
      <div className="absolute bottom-1 left-1 w-1.5 h-1.5 border-b border-l border-[#D4AF37]" />
      <div className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-[#D4AF37]" />

      {/* Header Tag */}
      <div className="flex items-center gap-1 mb-1">
        <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" />
        <span className="font-cinzel text-[8.5px] md:text-[9.5px] font-bold tracking-[0.18em] uppercase text-[#AA7C11] leading-none">
          Scan to Book
        </span>
      </div>

      {/* High-Resolution SVG QR Code */}
      <div className="p-1 rounded bg-white border border-[#D4AF37]/30 shadow-inner group-hover:scale-105 transition-transform duration-300">
        <QRCodeSVG
          value={url}
          size={size}
          level="M"
          bgColor="#FFFFFF"
          fgColor="#2A1810"
          includeMargin={false}
          imageSettings={{
            src: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg',
            x: undefined,
            y: undefined,
            height: 14,
            width: 14,
            opacity: 1,
            excavate: true,
          }}
        />
      </div>

      {/* Footer info badge */}
      {!compact && (
        <div className="mt-1 flex items-center gap-1 text-[8px] font-sans-modern font-semibold text-[#6C4A32] leading-none">
          <MessageCircle className="w-2.5 h-2.5 text-[#25D366]" />
          <span>WhatsApp Instant</span>
        </div>
      )}
    </a>
  );
};
