import React, { useEffect, useRef, useState } from 'react';
import { useShowcase } from '../hooks/useShowcase';
import type { Route } from '../utils/router';

const FADE_MS = 1600; // fade-in and fade-out, overlapping as one slide hands over to the next
const IMAGE_MS = 7000; // how long a photo stays on screen
const VIDEO_MS = 10000; // videos get a little longer

/**
 * Full-bleed background for the home hero. Gallery uploads (photos and videos) and shop products
 * fade in and out on their own, one after another. Nothing needs to be clicked.
 */
export const HeroShowcase: React.FC<{ onNavigate: (route: Route) => void }> = ({ onNavigate }) => {
  const slides = useShowcase();
  const [index, setIndex] = useState(0);
  const [hidden, setHidden] = useState(false);
  const layer = useRef<HTMLDivElement>(null);

  const count = slides.length;
  const current = slides[index % count] ?? slides[0];

  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  useEffect(() => {
    if (count < 2 || hidden) return;
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % count), current.kind === 'video' ? VIDEO_MS : IMAGE_MS);
    return () => window.clearTimeout(timer);
  }, [count, hidden, index, current.kind]);

  // Gentle pointer parallax on desktop.
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !layer.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    layer.current.style.transform = `translate3d(${x * -22}px, ${y * -14}px, 0) scale(1.06)`;
  };
  const onLeave = () => {
    if (layer.current) layer.current.style.transform = '';
  };

  return (
    <div className="absolute inset-0" onPointerMove={onMove} onPointerLeave={onLeave}>
      <div ref={layer} className="absolute -inset-4 transition-transform duration-500 ease-out will-change-transform">
        {/* Every slide stays mounted; only the current one is visible, so they cross-fade. */}
        {slides.map((s, i) => {
          const active = i === index % count;
          return (
            <div
              key={s.id}
              aria-hidden="true"
              className="absolute inset-0 transition-opacity ease-in-out"
              style={{ opacity: active ? 1 : 0, transitionDuration: `${FADE_MS}ms` }}
            >
              {s.kind === 'video' ? (
                <VideoSlide src={s.src} active={active} />
              ) : (
                <img src={s.src} alt="" loading={i < 2 ? 'eager' : 'lazy'} className="h-full w-full object-cover object-top" />
              )}
            </div>
          );
        })}
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#140D08] via-[#140D08]/70 to-[#140D08]/10" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#140D08]/80 to-transparent" />

      {/* What's on screen; tapping it is optional. */}
      <button
        type="button"
        onClick={() => onNavigate(current.route)}
        className="absolute bottom-3 left-4 z-10 max-w-[70%] rounded-full border border-[#D4AF37]/50 bg-black/55 px-3.5 py-2 text-left backdrop-blur-sm transition-colors hover:border-[#D4AF37] hover:bg-black/70 sm:bottom-4 sm:left-6 cursor-pointer"
        aria-label={`${current.label}. ${current.caption}. Open ${current.route === 'shop' ? 'the shop' : 'the gallery'}`}
      >
        <span className="block truncate text-[10px] font-semibold uppercase tracking-wider text-[#D4AF37]">{current.caption}</span>
        <span className="block truncate text-xs font-semibold text-[#FAF6F0]">{current.label}</span>
      </button>
    </div>
  );
};

/** Plays from the start each time it becomes the visible slide, and rests while hidden. */
const VideoSlide: React.FC<{ src: string; active: boolean }> = ({ src, active }) => {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (active) {
      v.currentTime = 0;
      void v.play().catch(() => {});
    } else {
      window.setTimeout(() => v.pause(), FADE_MS);
    }
  }, [active]);
  return <video ref={ref} src={src} muted loop playsInline preload="metadata" className="h-full w-full object-cover object-top" />;
};
