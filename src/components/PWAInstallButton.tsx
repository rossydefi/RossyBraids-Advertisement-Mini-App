import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share, PlusSquare, Check, X, Smartphone } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { canInstall, isInstalled, isIOS, installPWA } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  if (isInstalled) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F5E6A3] text-xs font-sans-modern">
        <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
        <span className="font-medium">App Installed</span>
      </div>
    );
  }

  const handleClick = () => {
    if (isIOS) {
      setShowIOSModal(true);
    } else {
      installPWA();
    }
  };

  return (
    <>
      <button
        id="btn-install-pwa"
        onClick={handleClick}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B89228] text-[#2A1810] font-sans-modern font-semibold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all duration-200 cursor-pointer"
        title="Install RossyBraids mobile app"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>

      {/* iOS Installation Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-[#1C130D] border border-[#D4AF37]/40 rounded-xl p-5 shadow-2xl text-[#FAF7F2]">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-[#DFCEBC] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif-luxury text-lg font-bold text-[#F9E498]">
                  Install RossyBraids App
                </h3>
                <p className="text-xs text-[#DFCEBC] font-sans-modern">
                  Add to your iPhone / iPad Home Screen
                </p>
              </div>
            </div>

            <div className="space-y-3 font-sans-modern text-xs text-[#E6D7C8] mb-5">
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-black/40 border border-white/5">
                <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-[#2A1810] flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </div>
                <p>
                  Tap the <strong className="text-white">Share</strong> icon{' '}
                  <Share className="inline w-3.5 h-3.5 text-[#D4AF37] mx-0.5" /> in Safari's bottom menu bar.
                </p>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-black/40 border border-white/5">
                <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-[#2A1810] flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </div>
                <p>
                  Scroll down the share sheet and select{' '}
                  <strong className="text-white">"Add to Home Screen"</strong>{' '}
                  <PlusSquare className="inline w-3.5 h-3.5 text-[#D4AF37] mx-0.5" />.
                </p>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-black/40 border border-white/5">
                <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-[#2A1810] flex items-center justify-center font-bold text-xs shrink-0">
                  3
                </div>
                <p>
                  Tap <strong className="text-[#D4AF37]">Add</strong> in the top right corner. RossyBraids will appear on your home screen!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-lg bg-[#D4AF37] text-[#2A1810] font-sans-modern font-bold text-xs hover:bg-[#E5C158] transition-colors cursor-pointer"
            >
              Got It!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
