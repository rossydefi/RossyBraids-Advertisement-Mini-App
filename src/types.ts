export type FlyerFormat = 'portrait' | 'square' | 'story';
export type FlyerTheme = 'nude-luxury' | 'mocha-velvet' | 'warm-ivory';

export interface ServiceItem {
  id: string;
  name: string;
  tagline: string;
  image: string;
  features?: string[];
}

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface BrandInfo {
  name: string;
  slogan: string;
  whatsapp: string;
  whatsappRaw: string;
  facebook: string;
  instagram: string;
  services: string[];
}
