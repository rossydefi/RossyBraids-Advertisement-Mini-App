import React, { useState } from 'react';
import { BEFORE_AFTER_DATA } from '../data/flyerData';
import { BeforeAfterTransformation } from '../types';
import {
  Sparkles,
  Scissors,
  Clock,
  User,
  ArrowRight,
  CheckCircle2,
  Sliders,
  Columns,
  Quote,
} from 'lucide-react';

interface BeforeAfterGalleryProps {
  onBookTransformation: (serviceId: string) => void;
}

export const BeforeAfterGallery: React.FC<BeforeAfterGalleryProps> = ({
  onBookTransformation,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');
  const [sliderPositions, setSliderPositions] = useState<{ [id: string]: number }>({
    'trans-1': 50,
    'trans-2': 50,
    'trans-3': 50,
    'trans-4': 50,
  });

  const categories = [
    'All',
    'Wig Transformation',
    'Dreadlocks Care',
    'Braids & Plaits',
    'Natural Hair Care',
  ];

  const filteredTransformations = BEFORE_AFTER_DATA.filter((item) => {
    return selectedCategory === 'All' || item.category === selectedCategory;
  });

  const handleSliderChange = (id: string, value: number) => {
    setSliderPositions((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in text-[#2D1B11]">
      {/* Gallery Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#8F6A1E] text-xs font-sans-modern font-semibold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          Verified Salon Results
        </div>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D1B11] tracking-tight">
          Client Transformations: Before & After
        </h1>
        <p className="font-sans-modern text-sm sm:text-base text-[#6C4A32] max-w-2xl mx-auto">
          Witness real hair transformations crafted by Rose Iyaji. Slide the interactive divider to
          compare the original condition with the finished luxury result.
        </p>
      </div>

      {/* Control Bar: Categories + View Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-[#DFCEBC] shadow-sm">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-sans-modern font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#2D1B11] text-[#D4AF37] shadow-sm'
                  : 'bg-white text-[#6C4A32] border border-[#DFCEBC] hover:border-[#D4AF37]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#F5EFEB] border border-[#DFCEBC]">
          <button
            onClick={() => setViewMode('slider')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-sans-modern font-semibold rounded-md transition-all cursor-pointer ${
              viewMode === 'slider'
                ? 'bg-[#2D1B11] text-[#FAF7F2] shadow-sm'
                : 'text-[#6C4A32] hover:text-[#2D1B11]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Interactive Slider</span>
          </button>
          <button
            onClick={() => setViewMode('side-by-side')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-sans-modern font-semibold rounded-md transition-all cursor-pointer ${
              viewMode === 'side-by-side'
                ? 'bg-[#2D1B11] text-[#FAF7F2] shadow-sm'
                : 'text-[#6C4A32] hover:text-[#2D1B11]'
            }`}
          >
            <Columns className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Side-by-Side</span>
          </button>
        </div>
      </div>

      {/* Transformations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredTransformations.map((trans) => {
          const sliderPos = sliderPositions[trans.id] ?? 50;

          return (
            <div
              key={trans.id}
              className="bg-white/95 backdrop-blur-sm rounded-2xl border border-[#DFCEBC] overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* IMAGE COMPARISON AREA */}
              <div className="relative w-full aspect-[4/3] bg-[#1C130D] overflow-hidden select-none">
                {viewMode === 'slider' ? (
                  // INTERACTIVE DRAGGABLE SLIDER MODE
                  <div className="relative w-full h-full">
                    {/* AFTER IMAGE (Background / Full Width) */}
                    <img
                      src={trans.afterImage}
                      alt={`${trans.title} - After`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* BEFORE IMAGE (Clipped with clip-path based on slider position) */}
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ width: `${sliderPos}%` }}
                    >
                      <img
                        src={trans.beforeImage}
                        alt={`${trans.title} - Before`}
                        className="absolute inset-0 w-full h-full object-cover max-w-none"
                        style={{ width: '100%', minWidth: '100%' }}
                      />
                    </div>

                    {/* Divider Line */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.8)] pointer-events-none"
                      style={{ left: `${sliderPos}%` }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#2D1B11] border-2 border-[#D4AF37] text-[#D4AF37] flex items-center justify-center shadow-lg text-xs font-bold font-sans-modern">
                        ⇄
                      </div>
                    </div>

                    {/* Floating Labels */}
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-white text-[10px] font-sans-modern font-semibold uppercase tracking-wider border border-white/20 pointer-events-none">
                      Before
                    </span>
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-[#D4AF37] text-[#2A1810] text-[10px] font-sans-modern font-bold uppercase tracking-wider shadow pointer-events-none">
                      After (RossyBraids)
                    </span>

                    {/* Range Input Overlay for Seamless Dragging */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderPos}
                      onChange={(e) => handleSliderChange(trans.id, Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                      aria-label="Drag to compare before and after"
                    />
                  </div>
                ) : (
                  // SIDE BY SIDE MODE
                  <div className="grid grid-cols-2 w-full h-full">
                    <div className="relative h-full border-r border-[#D4AF37]/50">
                      <img
                        src={trans.beforeImage}
                        alt="Before"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-sans-modern font-semibold uppercase tracking-wider">
                        Before
                      </span>
                    </div>
                    <div className="relative h-full">
                      <img
                        src={trans.afterImage}
                        alt="After"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-[#D4AF37] text-[#2A1810] text-[10px] font-sans-modern font-bold uppercase tracking-wider">
                        After
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Slider Prompt Hint */}
              {viewMode === 'slider' && (
                <div className="px-4 py-1.5 bg-[#F5EFEB] border-y border-[#DFCEBC] flex items-center justify-between text-[11px] text-[#6C4A32] font-sans-modern">
                  <span>← Drag slider horizontally to reveal transformation →</span>
                  <span className="font-bold text-[#8F6A1E]">{sliderPos}%</span>
                </div>
              )}

              {/* TRANSFORMATION DETAILS */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-[#8F6A1E] font-sans-modern font-bold">
                      {trans.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#6C4A32] font-sans-modern">
                      <Clock className="w-3.5 h-3.5 text-[#8F6A1E]" /> {trans.duration}
                    </span>
                  </div>

                  <h3 className="font-serif-luxury text-xl font-bold text-[#2D1B11]">
                    {trans.title}
                  </h3>

                  <p className="text-xs text-[#553823] font-sans-modern leading-relaxed">
                    {trans.description}
                  </p>
                </div>

                {/* Key Technique Points */}
                <div className="space-y-1.5 p-3 rounded-lg bg-[#FAF7F2] border border-[#DFCEBC]">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#2D1B11] block font-sans-modern">
                    Couture Techniques Applied:
                  </span>
                  {trans.resultHighlights.map((point, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-[#6C4A32] font-sans-modern">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>

                {/* Client Quote */}
                {trans.clientFeedback && (
                  <div className="flex items-start gap-2 text-xs italic text-[#553823] bg-[#F5EFEB] p-3 rounded-lg border-l-2 border-[#D4AF37]">
                    <Quote className="w-4 h-4 text-[#D4AF37] shrink-0 not-italic" />
                    <p className="font-sans-modern">{trans.clientFeedback}</p>
                  </div>
                )}

                {/* Stylist & Booking CTA */}
                <div className="pt-3 border-t border-[#DFCEBC] flex items-center justify-between">
                  <div className="text-[11px] text-[#6C4A32] font-sans-modern">
                    <span>Artist: </span>
                    <strong className="text-[#2D1B11]">{trans.stylist}</strong>
                  </div>

                  <button
                    onClick={() => onBookTransformation(trans.serviceId)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#2D1B11] text-[#F9E498] text-xs font-sans-modern font-semibold hover:bg-[#442718] active:scale-95 transition-all cursor-pointer shadow-sm"
                  >
                    <span>Book This Look</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
