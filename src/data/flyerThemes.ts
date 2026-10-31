import type { FlyerTheme } from '../types';

export interface FlyerThemeStyle {
  bg: string;
  panelBg: string;
  panelBorder: string;
  frame: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  /** Footer bar */
  barBg: string;
  /** Logo: colours of the braided mark and the two halves of the wordmark */
  logoVariant: 'gold' | 'dark' | 'white';
  logoAccent: string;
  logoRest: string;
}

export const FLYER_THEMES: Record<FlyerTheme, FlyerThemeStyle> = {
  'nude-luxury': {
    bg: 'bg-gradient-to-b from-[#FAF7F2] via-[#F5EFEB] to-[#ECE2D8]',
    panelBg: 'bg-white/70',
    panelBorder: 'border-[#DFCEBC]',
    frame: 'border-[#D4AF37]/50',
    textPrimary: 'text-[#2D1B11]',
    textSecondary: 'text-[#6C4A32]',
    accent: 'text-[#AA7C11]',
    barBg: 'bg-[#2A1810] text-[#F5EFEB]',
    logoVariant: 'gold',
    logoAccent: 'text-[#C59B27]',
    logoRest: 'text-[#3D2314]',
  },
  'mocha-velvet': {
    bg: 'bg-gradient-to-b from-[#2A1810] via-[#382015] to-[#1E110A]',
    panelBg: 'bg-[#3D2314]/70',
    panelBorder: 'border-[#AA7C11]/40',
    frame: 'border-[#D4AF37]/60',
    textPrimary: 'text-[#FDFBF7]',
    textSecondary: 'text-[#DFCEBC]',
    accent: 'text-[#E6CA65]',
    barBg: 'bg-[#180D07] text-[#F5EFEB]',
    logoVariant: 'gold',
    logoAccent: 'text-[#D4AF37]',
    logoRest: 'text-[#F5E6A3]',
  },
  'warm-ivory': {
    bg: 'bg-gradient-to-b from-[#FFFFFF] via-[#FAF6F0] to-[#F2EAE0]',
    panelBg: 'bg-white',
    panelBorder: 'border-[#E2D4C5]',
    frame: 'border-[#C59B27]/60',
    textPrimary: 'text-[#2A1810]',
    textSecondary: 'text-[#5C3A21]',
    accent: 'text-[#996515]',
    barBg: 'bg-[#321B10] text-white',
    logoVariant: 'gold',
    logoAccent: 'text-[#B8860B]',
    logoRest: 'text-[#2A1810]',
  },
  'rose-blush': {
    bg: 'bg-gradient-to-b from-[#FFF4F2] via-[#FBE6E1] to-[#F4D3CB]',
    panelBg: 'bg-white/70',
    panelBorder: 'border-[#EBC4BA]',
    frame: 'border-[#B76E79]/60',
    textPrimary: 'text-[#3A1F1B]',
    textSecondary: 'text-[#7A4A43]',
    accent: 'text-[#A8505C]',
    barBg: 'bg-[#3A1F1B] text-[#FBE6E1]',
    logoVariant: 'gold',
    logoAccent: 'text-[#B76E79]',
    logoRest: 'text-[#3A1F1B]',
  },
  'noir-gold': {
    bg: 'bg-gradient-to-b from-[#0B0B0B] via-[#151210] to-[#050505]',
    panelBg: 'bg-[#1B1712]/80',
    panelBorder: 'border-[#D4AF37]/30',
    frame: 'border-[#D4AF37]/80',
    textPrimary: 'text-[#FAF6F0]',
    textSecondary: 'text-[#CDBFA6]',
    accent: 'text-[#E6CA65]',
    barBg: 'bg-black text-[#F5EFEB]',
    logoVariant: 'gold',
    logoAccent: 'text-[#D4AF37]',
    logoRest: 'text-[#FAF6F0]',
  },
  'emerald-gold': {
    bg: 'bg-gradient-to-b from-[#06281F] via-[#0B3B2D] to-[#041A14]',
    panelBg: 'bg-[#0F4636]/60',
    panelBorder: 'border-[#D4AF37]/35',
    frame: 'border-[#D4AF37]/70',
    textPrimary: 'text-[#F4EFE2]',
    textSecondary: 'text-[#B9D3C6]',
    accent: 'text-[#E6CA65]',
    barBg: 'bg-[#03130E] text-[#F5EFEB]',
    logoVariant: 'gold',
    logoAccent: 'text-[#D4AF37]',
    logoRest: 'text-[#F4EFE2]',
  },
  'royal-plum': {
    bg: 'bg-gradient-to-b from-[#2A0F3A] via-[#3B1650] to-[#1B0826]',
    panelBg: 'bg-[#4A1D63]/60',
    panelBorder: 'border-[#D4AF37]/35',
    frame: 'border-[#D4AF37]/70',
    textPrimary: 'text-[#FBF3FF]',
    textSecondary: 'text-[#D9C2E8]',
    accent: 'text-[#E6CA65]',
    barBg: 'bg-[#12051B] text-[#F5EFEB]',
    logoVariant: 'gold',
    logoAccent: 'text-[#D4AF37]',
    logoRest: 'text-[#FBF3FF]',
  },
  'midnight-navy': {
    bg: 'bg-gradient-to-b from-[#0A1630] via-[#10234A] to-[#060E20]',
    panelBg: 'bg-[#16305F]/60',
    panelBorder: 'border-[#D4AF37]/35',
    frame: 'border-[#D4AF37]/70',
    textPrimary: 'text-[#F2F6FF]',
    textSecondary: 'text-[#B8C7E6]',
    accent: 'text-[#E6CA65]',
    barBg: 'bg-[#050B18] text-[#F5EFEB]',
    logoVariant: 'gold',
    logoAccent: 'text-[#D4AF37]',
    logoRest: 'text-[#F2F6FF]',
  },
  'terracotta-sun': {
    bg: 'bg-gradient-to-b from-[#FBEADB] via-[#F3CFB0] to-[#E5AE86]',
    panelBg: 'bg-white/55',
    panelBorder: 'border-[#C98A63]/50',
    frame: 'border-[#8A3E1C]/55',
    textPrimary: 'text-[#3B1A0C]',
    textSecondary: 'text-[#6E3B22]',
    accent: 'text-[#9A4A1F]',
    barBg: 'bg-[#3B1A0C] text-[#FBEADB]',
    logoVariant: 'gold',
    logoAccent: 'text-[#A8541F]',
    logoRest: 'text-[#3B1A0C]',
  },
  'bold-gold': {
    bg: 'bg-gradient-to-b from-[#EBCB6A] via-[#D4AF37] to-[#B78A1B]',
    panelBg: 'bg-[#1E1208]/12',
    panelBorder: 'border-[#1E1208]/35',
    frame: 'border-[#1E1208]/60',
    textPrimary: 'text-[#1E1208]',
    textSecondary: 'text-[#4A3410]',
    accent: 'text-[#1E1208]',
    barBg: 'bg-[#1E1208] text-[#F5E6A3]',
    logoVariant: 'dark',
    logoAccent: 'text-[#1E1208]',
    logoRest: 'text-[#1E1208]',
  },
};

/** For the palette picker: label and swatch colour. */
export const FLYER_THEME_OPTIONS: { id: FlyerTheme; label: string; swatch: string }[] = [
  { id: 'nude-luxury', label: 'Chic Nude', swatch: 'bg-[#EADBC8]' },
  { id: 'warm-ivory', label: 'Warm Ivory', swatch: 'bg-white' },
  { id: 'rose-blush', label: 'Rose Blush', swatch: 'bg-[#F4D3CB]' },
  { id: 'terracotta-sun', label: 'Terracotta', swatch: 'bg-[#E5AE86]' },
  { id: 'bold-gold', label: 'Bold Gold', swatch: 'bg-[#D4AF37]' },
  { id: 'mocha-velvet', label: 'Mocha Velvet', swatch: 'bg-[#3D2314]' },
  { id: 'noir-gold', label: 'Noir Gold', swatch: 'bg-[#0B0B0B]' },
  { id: 'emerald-gold', label: 'Emerald', swatch: 'bg-[#0B3B2D]' },
  { id: 'royal-plum', label: 'Royal Plum', swatch: 'bg-[#3B1650]' },
  { id: 'midnight-navy', label: 'Midnight Navy', swatch: 'bg-[#10234A]' },
];
