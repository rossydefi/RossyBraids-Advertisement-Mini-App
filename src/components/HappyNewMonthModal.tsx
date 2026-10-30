import React, { useEffect } from 'react';
import { NewMonthCelebrationData, generateNewMonthClaimWhatsAppUrl } from '../utils/happyNewMonth';
import confetti from 'canvas-confetti';
import { useModalA11y } from '../hooks/useModalA11y';
import {
  Sparkles,
  Heart,
  Gift,
  X,
  MessageCircle,
  Calendar,
  Crown,
  CheckCircle2,
  Copy,
} from 'lucide-react';

interface HappyNewMonthModalProps {
  data: NewMonthCelebrationData;
  isOpen: boolean;
  onClose: () => void;
  onBookAppointment: () => void;
}

export const HappyNewMonthModal: React.FC<HappyNewMonthModalProps> = ({
  data,
  isOpen,
  onClose,
  onBookAppointment,
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#FAF7F2', '#E5C158', '#B84E1A', '#FFD700'],
      });
    }
  }, [isOpen]);

  const dialogRef = useModalA11y(isOpen, onClose);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(data.couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Happy New Month greeting"
        className="relative w-full max-w-lg bg-gradient-to-b from-[#2D1B11] via-[#3A2215] to-[#25160E] text-white rounded-3xl border-2 border-[#D4AF37] shadow-2xl p-6 sm:p-8 space-y-5 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative corner glows */}
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#D4AF37]/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-[#D4AF37]/20 blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#DFCEBC] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close message"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Ribbon & Crown */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#F9E498] text-xs font-sans-modern font-semibold uppercase tracking-widest">
            <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Royal Appreciation To Our Valued Client</span>
          </div>

          <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#F9E498] tracking-tight leading-tight">
            Happy New Month, {data.clientName}! 👑✨
          </h2>

          <p className="text-xs text-[#DFCEBC] font-sans-modern">
            Welcome to glorious {data.monthName} {data.year}
          </p>
        </div>

        {/* Heartfelt Note Box */}
        <div className="bg-black/35 rounded-2xl p-4 sm:p-5 border border-white/10 text-xs font-sans-modern leading-relaxed text-[#FAF7F2] space-y-3">
          <p className="text-[13px] text-[#F5E6A3] font-serif-luxury italic">
            &ldquo;Because you have ever trusted RossyBraids with your hair care journey, we send you our
            sweetest love, deepest gratitude, and royal blessings.&rdquo;
          </p>

          <p className="text-xs text-[#DFCEBC] leading-relaxed whitespace-pre-line">
            {data.message.split('\n\n')[1]}
          </p>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-[#D4AF37]">
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 fill-current text-rose-400" />
              <span>With Love, Rose Iyaji & Team</span>
            </span>
            <span className="text-[#DFCEBC]">Always Your Hair Sanctuary</span>
          </div>
        </div>

        {/* Sweet Gift Voucher Card */}
        <div className="rounded-2xl p-4 bg-gradient-to-r from-[#D4AF37]/20 via-[#D4AF37]/30 to-[#D4AF37]/20 border border-[#D4AF37]/60 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-[#F9E498]" />
              <span className="text-xs font-bold text-[#F9E498] font-serif-luxury">
                {data.perkTitle}
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-wider font-bold bg-[#D4AF37] text-[#2D1B11] px-2 py-0.5 rounded-full">
              Client VIP
            </span>
          </div>

          <p className="text-[11.5px] text-[#DFCEBC] font-sans-modern leading-snug">
            {data.perkDescription}
          </p>

          {/* Coupon Code Pill */}
          <div className="pt-2 flex items-center justify-between bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
            <div>
              <span className="text-[9.5px] text-[#DFCEBC] uppercase font-mono block">Promo Code:</span>
              <span className="font-mono text-xs font-bold text-[#F9E498] tracking-wider">
                {data.couponCode}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="text-[11px] px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-[#FAF7F2] flex items-center gap-1 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-[#D4AF37]" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <a
            href={generateNewMonthClaimWhatsAppUrl(data)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-sans-modern font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Claim Gift on WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={() => {
              onClose();
              onBookAppointment();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5E6A3] hover:brightness-105 text-[#2D1B11] text-xs font-sans-modern font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Calendar className="w-4 h-4 text-[#2D1B11]" />
            <span>Book New Style Session</span>
          </button>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] text-[#DFCEBC]/70 hover:text-white underline cursor-pointer"
          >
            Thank you, close for now
          </button>
        </div>
      </div>
    </div>
  );
};
