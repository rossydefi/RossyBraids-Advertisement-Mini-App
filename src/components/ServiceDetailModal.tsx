import React from 'react';
import { ServiceItem } from '../types';
import { BRAND_DATA } from '../data/flyerData';
import { X, Check, Calendar, Phone, Sparkles } from 'lucide-react';
import { useModalA11y } from '../hooks/useModalA11y';

interface ServiceDetailModalProps {
  service: ServiceItem | null;
  onClose: () => void;
  onBookOnline?: (serviceId: string) => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service,
  onClose,
  onBookOnline,
}) => {
  const dialogRef = useModalA11y(!!service, onClose);

  if (!service) return null;

  const whatsappMessage = encodeURIComponent(
    `Hello RossyBraids, I am interested in your "${service.name}" service from the flyer. Could you please share availability and pricing details?`
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={service.name}
        className="relative w-full max-w-lg bg-[#FAF7F2] border border-[#D4AF37]/50 rounded-lg shadow-2xl overflow-hidden text-[#2A1810]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Image */}
        <div className="relative h-60 w-full overflow-hidden bg-[#2D1B11]">
          <img
            src={service.image}
            alt={service.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAF7F2] via-transparent to-black/30" />
          <div className="absolute bottom-3 left-4 right-4">
            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-[#AA7C11] bg-[#FAF7F2]/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-[#D4AF37]/40 mb-1">
              <Sparkles className="w-3 h-3" /> RossyBraids Signature
            </span>
            <h3 className="font-serif-luxury text-2xl md:text-3xl font-bold text-[#2A1810]">
              {service.name}
            </h3>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          <p className="text-sm font-serif-luxury italic text-[#6C4A32]">
            {service.tagline}
          </p>

          {service.features && (
            <div className="space-y-2 pt-2 border-t border-[#DFCEBC]">
              <h4 className="font-cinzel text-xs font-semibold uppercase tracking-wider text-[#AA7C11]">
                Craftsmanship & Key Highlights
              </h4>
              <ul className="space-y-1.5 text-xs text-[#4A2E1B]">
                {service.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-[#D4AF37] mt-0.5 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Direct CTA */}
          <div className="pt-3 border-t border-[#DFCEBC] flex flex-col sm:flex-row gap-2.5">
            {onBookOnline && (
              <button
                onClick={() => {
                  onBookOnline(service.id);
                  onClose();
                }}
                className="flex-1 py-2.5 px-4 rounded bg-[#2D1B11] text-[#F9E498] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#442718] transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#D4AF37]" /> Book Appointment Online
              </button>
            )}
            <a
              href={`https://wa.me/${BRAND_DATA.whatsappRaw}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-4 rounded bg-gradient-to-r from-[#D4AF37] via-[#C59B27] to-[#AA7C11] text-[#1E110A] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:brightness-110 active:scale-98 transition-all"
            >
              <Phone className="w-4 h-4" /> WhatsApp Inquiry
            </a>
            <button
              onClick={onClose}
              className="py-2.5 px-3 rounded border border-[#DFCEBC] text-xs font-semibold text-[#6C4A32] hover:bg-black/5 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
