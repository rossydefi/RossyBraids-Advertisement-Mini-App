import React, { useState, useEffect, useRef } from 'react';
import { usePublicReviews } from '../hooks/usePublicReviews';
import { Testimonial, FlyerTheme } from '../types';
import { Star, CheckCircle2, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface TestimonialCarouselProps {
  theme: FlyerTheme;
  className?: string;
  autoPlay?: boolean;
  interval?: number;
}

export const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({
  theme,
  className = '',
  autoPlay = true,
  interval = 5500,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const testimonials = usePublicReviews();
  const current: Testimonial = testimonials[currentIndex % testimonials.length];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    if (!autoPlay || isPaused) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, autoPlay, isPaused, interval]);

  const isDark = theme === 'mocha-velvet';

  return (
    <div
      className={`relative overflow-hidden rounded-md border transition-all duration-300 ${
        isDark
          ? 'bg-[#1E110A]/80 border-[#D4AF37]/35 text-[#FDFBF7]'
          : 'bg-white/85 backdrop-blur-sm border-[#D4AF37]/30 text-[#2D1B11]'
      } p-2.5 sm:p-3 shadow-sm ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Client reviews"
    >
      {/* Header Bar: Trust Header + Rating summary + Navigation */}
      <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-[#D4AF37]/20">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center text-[#D4AF37]">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
            ))}
          </div>
          <span className="font-cinzel text-[10px] md:text-[11px] font-bold tracking-wider uppercase text-[#AA7C11] dark:text-[#E6CA65]">
            Client Reviews
          </span>
        </div>

        {/* Arrow Controls & Dots */}
        <div className="flex items-center gap-1.5 no-print">
          <div className="flex items-center gap-1 mr-1">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentIndex
                    ? 'w-3.5 h-1.5 bg-[#D4AF37]'
                    : 'w-1.5 h-1.5 bg-[#D4AF37]/30 hover:bg-[#D4AF37]/60'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
          <button
            onClick={prevSlide}
            aria-label="Previous testimonial"
            className="w-5 h-5 rounded flex items-center justify-center bg-[#D4AF37]/10 hover:bg-[#D4AF37]/25 text-[#AA7C11] dark:text-[#E6CA65] transition-colors"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next testimonial"
            className="w-5 h-5 rounded flex items-center justify-center bg-[#D4AF37]/10 hover:bg-[#D4AF37]/25 text-[#AA7C11] dark:text-[#E6CA65] transition-colors"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Review Body with Smooth Fade Effect */}
      <div className="relative min-h-[44px] flex flex-col justify-center">
        <div className="flex items-start gap-2">
          <Quote className="w-3.5 h-3.5 text-[#D4AF37]/60 shrink-0 mt-0.5" />
          <p
            className={`font-serif-luxury text-xs sm:text-[13px] leading-relaxed italic ${
              isDark ? 'text-[#F5EFEB]' : 'text-[#3D2517]'
            }`}
          >
            “{current.review}”
          </p>
        </div>

        {/* Client Metadata & Service */}
        <div className="flex flex-wrap items-center justify-between gap-1 mt-1.5 pt-1 pl-5.5 text-[9px] sm:text-[9.5px]">
          <div className="flex items-center gap-1.5">
            <span className="font-sans-modern font-bold tracking-wide text-[#2A1810] dark:text-white">
              {current.clientName}
            </span>
            <span className="text-[#8C6D53] dark:text-[#BFA997]">• {current.location}</span>
            {current.verified && (
              <span className="inline-flex items-center gap-0.5 text-[#25D366] font-semibold">
                <CheckCircle2 className="w-2.5 h-2.5" /> Verified
              </span>
            )}
          </div>
          <span className="font-sans-modern font-medium text-[#AA7C11] dark:text-[#E6CA65] bg-[#D4AF37]/10 px-1.5 py-0.5 rounded text-[8.5px]">
            Booked: {current.serviceBooked}
          </span>
        </div>
      </div>
    </div>
  );
};
