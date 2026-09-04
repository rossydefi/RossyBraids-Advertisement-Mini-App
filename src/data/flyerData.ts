import heroBohoImg from '../assets/images/hero_boho_braids_1788549184335.jpg';
import boneStraightWigImg from '../assets/images/bone_straight_wig_1788549197544.jpg';
import dreadlocksImg from '../assets/images/neat_dreadlocks_1788549211226.jpg';
import fluffyTwistsImg from '../assets/images/fluffy_hair_twists_1788549222906.jpg';
import hairProductsImg from '../assets/images/haircare_products_1788549236305.jpg';
import { BrandInfo, ServiceItem } from '../types';

export const BRAND_DATA: BrandInfo = {
  name: 'RossyBraids',
  slogan: 'RossyBraids — Where Beauty Meets Craft.',
  whatsapp: '08137989405',
  whatsappRaw: '2348137989405',
  facebook: 'Rose Iyaji',
  instagram: 'rossy.braids',
  services: [
    'Wigs & Revamping',
    'Dreadlocks',
    'Natural Hairstyling',
    'Hair Treatment & Care',
    'Hair Products & Accessories',
  ],
};

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'boho-braids',
    name: 'Boho Braids',
    tagline: 'Neat, stylish & feminine with loose curls',
    image: heroBohoImg,
    features: ['Signature knotless parting', 'Premium silky human curl blends', 'Lightweight & tension-free'],
  },
  {
    id: 'wigs-revamping',
    name: 'Wigs & Revamping',
    tagline: 'Medium-length bone-straight & custom styling',
    image: boneStraightWigImg,
    features: ['Deep wash & steam treatment', 'Flawless thermal bone-straight press', 'Lace customization & plucking'],
  },
  {
    id: 'dreadlocks',
    name: 'Dreadlocks',
    tagline: 'Immaculate sections & clean professional locking',
    image: dreadlocksImg,
    features: ['Precision interlocking & palm rolling', 'Detox & scalp nourishment', 'Luxury wire & cuff accessories'],
  },
  {
    id: 'natural-hairstyling',
    name: 'Natural Hairstyling',
    tagline: 'Fluffy twists, healthy volume & texture care',
    image: fluffyTwistsImg,
    features: ['Deep moisture lock-in', 'Protective styling techniques', 'Defined bouncy twists & coils'],
  },
  {
    id: 'hair-treatment-products',
    name: 'Products & Accessories',
    tagline: 'Shampoos, conditioners, creams & luxury scrunchies',
    image: hairProductsImg,
    features: ['Organic hydrating shampoo & conditioner', 'Growth boosting scalp creams', 'Silk scrunchies & elegant accessories'],
  },
];

export const IMAGES = {
  heroBoho: heroBohoImg,
  boneStraight: boneStraightWigImg,
  dreadlocks: dreadlocksImg,
  fluffyTwists: fluffyTwistsImg,
  products: hairProductsImg,
};
