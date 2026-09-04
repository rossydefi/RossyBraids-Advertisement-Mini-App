import React from 'react';

interface RossyLogoProps {
  variant?: 'gold' | 'dark' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtext?: boolean;
  className?: string;
}

export const RossyLogo: React.FC<RossyLogoProps> = ({
  variant = 'gold',
  size = 'md',
  showSubtext = true,
  className = '',
}) => {
  // Dimension sizing
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const titleSizes = {
    sm: 'text-sm tracking-[0.2em]',
    md: 'text-lg tracking-[0.25em]',
    lg: 'text-2xl md:text-3xl tracking-[0.3em]',
    xl: 'text-3xl md:text-4xl tracking-[0.35em]',
  };

  const subtextSizes = {
    sm: 'text-[8px] tracking-[0.25em]',
    md: 'text-[10px] tracking-[0.35em]',
    lg: 'text-xs tracking-[0.4em]',
    xl: 'text-sm tracking-[0.45em]',
  };

  const strokeColor =
    variant === 'gold' ? '#D4AF37' : variant === 'white' ? '#FFFFFF' : '#3D2314';

  const secondaryColor =
    variant === 'gold' ? '#C59B27' : variant === 'white' ? '#F5EFEB' : '#5C3A21';

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      {/* Custom Refined Vector Insignia: Intertwined Braid Plait & Feminine Flow Silhouette */}
      <div className="relative flex items-center justify-center mb-1">
        <svg
          viewBox="0 0 100 100"
          className={`${iconSizes[size]} drop-shadow-sm transition-transform duration-300 hover:scale-105`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`goldGrad-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5E6A3" />
              <stop offset="35%" stopColor="#D4AF37" />
              <stop offset="70%" stopColor="#AA7C11" />
              <stop offset="100%" stopColor="#E6CA65" />
            </linearGradient>
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Fine Geometric Ring */}
          <circle
            cx="50"
            cy="50"
            r="46"
            stroke={variant === 'gold' ? `url(#goldGrad-${variant})` : strokeColor}
            strokeWidth="1.2"
            strokeDasharray="2 2"
            opacity="0.6"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke={variant === 'gold' ? `url(#goldGrad-${variant})` : strokeColor}
            strokeWidth="0.8"
            opacity="0.85"
          />

          {/* Elegant Stylized Braid Loop & Flowing Hair Strands */}
          {/* Loop 1: Left Plait Curve */}
          <path
            d="M50 18 C38 26, 32 38, 38 48 C42 55, 49 59, 50 67 C51 75, 43 83, 38 86"
            stroke={variant === 'gold' ? `url(#goldGrad-${variant})` : strokeColor}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Loop 2: Right Interlocking Plait Curve */}
          <path
            d="M50 18 C62 26, 68 38, 62 48 C58 55, 51 59, 50 67 C49 75, 57 83, 62 86"
            stroke={variant === 'gold' ? `url(#goldGrad-${variant})` : secondaryColor}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Central Elegant Weave Tie */}
          <path
            d="M44 32 C48 35, 52 35, 56 32 M43 47 C48 50, 52 50, 57 47 M46 62 C48 64, 52 64, 54 62"
            stroke={variant === 'gold' ? `url(#goldGrad-${variant})` : strokeColor}
            strokeWidth="1.6"
            strokeLinecap="round"
          />

          {/* Graceful Crown / Sparkle Accent of Craftsmanship */}
          <path
            d="M50 10 L52 15 L57 17 L52 19 L50 24 L48 19 L43 17 L48 15 Z"
            fill={variant === 'gold' ? `url(#goldGrad-${variant})` : strokeColor}
            opacity="0.9"
          />

          {/* Delicate Side Accents */}
          <circle cx="28" cy="50" r="1.5" fill={variant === 'gold' ? `url(#goldGrad-${variant})` : strokeColor} />
          <circle cx="72" cy="50" r="1.5" fill={variant === 'gold' ? `url(#goldGrad-${variant})` : strokeColor} />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="text-center">
        <h1
          className={`font-cinzel font-semibold uppercase leading-none ${titleSizes[size]} ${
            variant === 'gold'
              ? 'text-[#C59B27] drop-shadow-sm'
              : variant === 'white'
              ? 'text-white'
              : 'text-[#3D2314]'
          }`}
          style={{
            letterSpacing: '0.22em',
          }}
        >
          <span className={variant === 'gold' ? 'gold-text-sheen font-bold' : ''}>Rossy</span>
          <span className={variant === 'gold' ? 'text-[#3D2314] dark:text-[#EADBC8]' : ''}>Braids</span>
        </h1>

        {showSubtext && (
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="h-[0.5px] w-3 bg-[#D4AF37]/50" />
            <span
              className={`font-sans-modern font-semibold uppercase ${subtextSizes[size]} ${
                variant === 'white' ? 'text-[#DFCEBC]' : 'text-[#8C6D53]'
              }`}
            >
              Luxury Hair & Beauty
            </span>
            <span className="h-[0.5px] w-3 bg-[#D4AF37]/50" />
          </div>
        )}
      </div>
    </div>
  );
};
