import React, { useId, useMemo } from 'react';

interface RossyLogoProps {
  /** Colours of the braided mark. */
  variant?: 'gold' | 'dark' | 'white';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** 'stacked': mark above the wordmark (flyer). 'inline': mark beside the wordmark (site header). */
  layout?: 'stacked' | 'inline';
  /** Tailwind text classes for the two halves of the wordmark. Defaults suit a light background. */
  accentClass?: string;
  restClass?: string;
  /** Optional slogan under the wordmark: a dotted leader, then the text starting under the R of BRAIDS. */
  slogan?: string;
  /** Tailwind classes for the slogan's size and colour. */
  sloganClass?: string;
  className?: string;
}

type Pt = { x: number; y: number };

/** The centreline of the letter R: stem, bowl, then a diagonal leg. */
function rCenterline(): Pt[] {
  const pts: Pt[] = [];
  const line = (a: Pt, b: Pt, step: number) => {
    const n = Math.max(1, Math.round(Math.hypot(b.x - a.x, b.y - a.y) / step));
    for (let i = 0; i < n; i++) pts.push({ x: a.x + ((b.x - a.x) * i) / n, y: a.y + ((b.y - a.y) * i) / n });
  };
  const step = 1.2;

  // Stem and bowl are one continuous strand: up the stem, round the bowl, back to the stem.
  line({ x: 30, y: 86 }, { x: 30, y: 16 }, step);
  line({ x: 30, y: 16 }, { x: 54, y: 16 }, step);
  const cx = 54, cy = 32, r = 16;
  const arcSteps = Math.round((Math.PI * r) / step);
  for (let i = 0; i <= arcSteps; i++) {
    const a = -Math.PI / 2 + (Math.PI * i) / arcSteps;
    pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }
  line({ x: 54, y: 48 }, { x: 30, y: 48 }, step);
  return pts;
}

function rLeg(): Pt[] {
  const pts: Pt[] = [];
  const [p0, p1, p2, p3] = [{ x: 44, y: 48 }, { x: 54, y: 62 }, { x: 62, y: 72 }, { x: 76, y: 86 }];
  const n = 40;
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    pts.push({
      x: u ** 3 * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t ** 3 * p3.x,
      y: u ** 3 * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t ** 3 * p3.y,
    });
  }
  return pts;
}

/**
 * Turns a centreline into a three-strand braid. Strands swap sides sinusoidally; when two strands cross,
 * the one whose cosine is positive is in front, so drawing "back" runs before "front" runs gives a true weave.
 */
function braid(center: Pt[], amplitude: number, period: number) {
  const strands: { back: string[]; front: string[] }[] = [0, 1, 2].map(() => ({ back: [], front: [] }));
  let travelled = 0;
  const samples = center.map((p, i) => {
    if (i > 0) travelled += Math.hypot(p.x - center[i - 1].x, p.y - center[i - 1].y);
    const a = center[Math.max(0, i - 1)], b = center[Math.min(center.length - 1, i + 1)];
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    return { p, nx: -(b.y - a.y) / len, ny: (b.x - a.x) / len, phase: (2 * Math.PI * travelled) / period };
  });

  for (let k = 0; k < 3; k++) {
    let run: Pt[] = [];
    let layer: 'back' | 'front' | null = null;
    const flush = () => {
      if (run.length > 1 && layer) strands[k][layer].push('M' + run.map((q) => `${q.x.toFixed(2)} ${q.y.toFixed(2)}`).join('L'));
    };
    for (const s of samples) {
      const angle = s.phase + (k * 2 * Math.PI) / 3;
      const off = amplitude * Math.sin(angle);
      const q = { x: s.p.x + s.nx * off, y: s.p.y + s.ny * off };
      const now = Math.cos(angle) >= 0 ? 'front' : 'back';
      if (now !== layer) {
        const last = run[run.length - 1];
        flush();
        run = last ? [last] : []; // overlap by one point so runs join without gaps
        layer = now;
      }
      run.push(q);
    }
    flush();
  }
  return strands;
}

const MARK_PX = { xs: 40, sm: 64, md: 88, lg: 120, xl: 150 };
const WORD = { xs: 'text-base sm:text-2xl', sm: 'text-2xl', md: 'text-4xl', lg: 'text-5xl', xl: 'text-6xl' };

/**
 * RossyBraids mark: the letter R woven from a three-strand braid, inside a fine ring.
 * The wordmark is a single bold word, ROSSY in the accent colour and BRAIDS in the base colour.
 */
export const RossyLogo: React.FC<RossyLogoProps> = ({
  variant = 'gold',
  size = 'md',
  layout = 'stacked',
  accentClass = 'text-[#C59B27]',
  restClass = 'text-[#3D2314]',
  slogan,
  sloganClass = '',
  className = '',
}) => {
  const inline = layout === 'inline';
  const TRACK = inline ? 'tracking-[0.08em] sm:tracking-[0.16em]' : 'tracking-[0.16em]';
  const gradientId = `rb-gold-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const paths = useMemo(() => [...braid(rCenterline(), 4.4, 19), ...braid(rLeg(), 4.4, 19)], []);

  const stroke = variant === 'gold' ? `url(#${gradientId})` : variant === 'white' ? '#FFFFFF' : '#3D2314';
  const edge = variant === 'dark' ? '#FAF6F0' : '#24130B';

  const strands = (layer: 'back' | 'front') =>
    paths.flatMap((strand, i) =>
      strand[layer].map((d, j) => (
        <g key={`${layer}-${i}-${j}`}>
          <path d={d} stroke={edge} strokeOpacity="0.85" strokeWidth="5.8" />
          <path d={d} stroke={stroke} strokeWidth="3.8" />
        </g>
      ))
    );

  return (
    <div className={`inline-flex select-none ${inline ? 'flex-row items-center gap-2 sm:gap-3' : 'flex-col items-center'} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        width={MARK_PX[size]}
        height={MARK_PX[size]}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        role="img"
        aria-label="RossyBraids"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F9E9A8" />
            <stop offset="40%" stopColor="#D4AF37" />
            <stop offset="75%" stopColor="#A87A12" />
            <stop offset="100%" stopColor="#E8CB66" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="47" stroke={stroke} strokeWidth="1.4" />
        <circle cx="50" cy="50" r="43.5" stroke={stroke} strokeWidth="0.6" strokeOpacity="0.7" />
        <g transform="translate(-2.5 0)">
          {strands('back')}
          {strands('front')}
        </g>
      </svg>

      <div className={inline ? 'flex flex-col' : 'contents'}>
      {React.createElement(
        inline ? 'div' : 'h1',
        { className: `font-cinzel font-extrabold uppercase leading-none ${TRACK} ${inline ? '' : 'mt-2'} ${WORD[size]}` },
        <span className={accentClass}>Rossy</span>,
        <span className={restClass}>Braids</span>
      )}

      {slogan && (
        <div className={`mt-1 sm:mt-1.5 flex w-0 min-w-full items-center whitespace-nowrap ${sloganClass}`}>
          {/* Invisible copy of "ROSSYB" in the wordmark's type, so the slogan starts exactly under the R of BRAIDS */}
          <div className="relative h-0 shrink-0">
            <span
              aria-hidden="true"
              className={`invisible block h-0 font-cinzel font-extrabold uppercase ${TRACK} ${WORD[size]}`}
            >
              RossyB
            </span>
            <span
              aria-hidden="true"
              className="absolute left-0 right-3 top-0 border-t-2 border-dotted border-current"
              style={{ maskImage: 'linear-gradient(to right, transparent, #000 45%)', WebkitMaskImage: 'linear-gradient(to right, transparent, #000 45%)' }}
            />
          </div>
          <p className="font-serif-luxury italic font-semibold leading-none" style={{ letterSpacing: '0.05em' }}>
            {slogan}
          </p>
        </div>
      )}
      </div>
    </div>
  );
};
