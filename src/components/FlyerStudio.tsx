import React, { useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { FlyerCanvas } from './FlyerCanvas';
import { FlyerControls } from './FlyerControls';
import { ServiceDetailModal } from './ServiceDetailModal';
import type { FlyerFormat, FlyerTheme, ServiceItem } from '../types';

/** The owner's promotional flyer designer, served at /flyer (not part of the customer navigation). */
const FlyerStudio: React.FC<{ onBookService: (serviceId: string) => void }> = ({ onBookService }) => {
  const [format, setFormat] = useState<FlyerFormat>('portrait');
  const [theme, setTheme] = useState<FlyerTheme>('nude-luxury');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const flyerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="w-full flex flex-col items-center">
      <FlyerControls format={format} setFormat={setFormat} theme={theme} setTheme={setTheme} flyerRef={flyerRef} />

      <div className="w-full flex justify-center items-center my-4 overflow-x-auto pb-4">
        <FlyerCanvas format={format} theme={theme} onSelectService={setSelectedService} flyerRef={flyerRef} />
      </div>

      <div className="no-print flex flex-wrap items-center justify-center gap-2 text-center text-xs text-[#DFCEBC]/80 mt-3 max-w-xl">
        <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" aria-hidden="true" />
        <span>Click any hairstyle or product tile to view details and book.</span>
      </div>

      <ServiceDetailModal service={selectedService} onClose={() => setSelectedService(null)} onBookOnline={onBookService} />
    </div>
  );
};

export default FlyerStudio;
