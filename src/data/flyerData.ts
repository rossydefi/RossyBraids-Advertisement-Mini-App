import heroBoneStraightImg from '../assets/images/bone_straight_luxury_short_1788554755785.jpg';
import heroBoneStraight26Img from '../assets/images/hero_bone_straight_1788551839713.jpg';
import boneStraightBobImg from '../assets/images/bone_straight_shoulder_len_1788553819098.jpg';
import bohoBraidsImg from '../assets/images/boho_braids_model_1788551852269.jpg';
import dreadlocksImg from '../assets/images/dreadlocks_model_1788551865549.jpg';
import fluffyTwistsImg from '../assets/images/natural_twists_peach_dress_1788553835094.jpg';
import hairProductsImg from '../assets/images/hair_accessories_scrunchies_1788553849977.jpg';
import luxuryShampooImg from '../assets/images/luxury_shampoo_bottle_1788558216291.jpg';
import boneStraightSerumImg from '../assets/images/bone_straight_serum_1788558231714.jpg';
import haircareCollageImg from '../assets/images/haircare_products_1788549236305.jpg';
import wigBeforeImg from '../assets/images/wig_before_revamp_1788558082657.jpg';
import locsBeforeImg from '../assets/images/locs_before_retwist_1788558098393.jpg';
import braidsBeforeImg from '../assets/images/braids_before_install_1788558113828.jpg';
import twistsBeforeImg from '../assets/images/twists_before_styling_1788558200716.jpg';
import africanTraditionalImg from '../assets/images/african_traditional_didi_threading_1788563866107.jpg';

import {
  AddOnOption,
  BeforeAfterTransformation,
  BrandInfo,
  ProductShopItem,
  ServiceItem,
  StyleLengthOption,
  StyleSizeOption,
  StyleSubtype,
  Testimonial,
} from '../types';

export const BRAND_DATA: BrandInfo = {
  name: 'RossyBraids',
  slogan: 'RossyBraids — Where Beauty Meets Craft.',
  whatsapp: '08137989405',
  whatsappRaw: '2348137989405',
  facebook: 'Rose Iyaji',
  instagram: 'rossy.braids',
  services: [
    'Wigs & Revamping',
    'Boho Braids',
    'Dreadlocks',
    'Natural Hairstyling',
    'Other African Hairstyles',
    'Hair Products & Accessories',
  ],
};

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'wigs-revamping',
    name: 'Wigs & Revamping',
    tagline: 'Luxury shorter bone-straight & couture revamping',
    image: heroBoneStraightImg,
    startingPrice: '₦25,000',
    duration: '2.5 - 3 hours',
    features: [
      'Chic shorter collarbone blunt cut with razor-sharp ends',
      'Ultra-expensive liquid-glass shine & thermal couture press',
      'Deep steam conditioning, custom HD lace plucking & melt',
    ],
    typesList: [
      {
        id: 'wig-bone-straight-cut',
        name: 'Razor Blunt Cut Bone-Straight & Liquid Silk Press',
        description: 'Signature shorter collarbone blunt precision cut with mirror-glass thermal shine and fluttery ends.',
        badge: 'Client Obsession',
        priceModifier: 0,
        popular: true,
      },
      {
        id: 'wig-frontal-install',
        name: 'HD Frontal Melt, Pluck & Custom Installation',
        description: 'Micro-plucked hairline, bleached knots, custom skin-tone lace tinting and seamless melt install.',
        badge: 'Flawless Melt',
        priceModifier: 7000,
        popular: true,
      },
      {
        id: 'wig-deep-revamp',
        name: 'Intensive Keratin Steam Bath & Full Wig Revamp',
        description: 'Total resurrection for tangled, tired human hair wigs: clarifying bath, protein rebuild and silk press.',
        badge: 'Revival',
        priceModifier: 5000,
      },
      {
        id: 'wig-bouncy-curls',
        name: 'Hollywood Bouncy Curls & Thermal Roller Styling',
        description: 'Voluminous curtain curls with high-lift volume and long-lasting flexible hold.',
        badge: 'Red Carpet',
        priceModifier: 4000,
      },
      {
        id: 'wig-relace-band',
        name: 'Closure/Frontal Replacement & Band Customization',
        description: 'Sewing in fresh HD closure or frontal and fitting snug adjustable security elastic bands.',
        badge: 'Repair & Fit',
        priceModifier: 8000,
      },
    ],
    sizesList: [
      { id: 'size-w-4x4', name: '4x4 Lace Closure Wig', label: '4x4 Closure', priceModifier: 0 },
      { id: 'size-w-5x5', name: '5x5 HD Lace Closure Wig', label: '5x5 HD Closure', priceModifier: 2000 },
      { id: 'size-w-13x4', name: '13x4 HD Lace Frontal Wig', label: '13x4 HD Frontal', priceModifier: 4000 },
      { id: 'size-w-13x6', name: '13x6 Deep Part Frontal Wig', label: '13x6 Deep Frontal', priceModifier: 6000 },
      { id: 'size-w-360', name: '360 Full Lace Unit', label: '360 Full Lace', priceModifier: 8000 },
    ],
    lengthsList: [
      { id: 'len-w-10-12', name: '10" - 12" Chic Shorter Collarbone Lob', label: '10"-12" Collarbone Blunt', priceModifier: 0 },
      { id: 'len-w-14-16', name: '14" - 16" Classic Shoulder Length', label: '14"-16" Shoulder Length', priceModifier: 3000 },
      { id: 'len-w-18-22', name: '18" - 22" Mid-Back Sleek', label: '18"-22" Mid-Back', priceModifier: 6000 },
      { id: 'len-w-24-30', name: '24" - 30" Waist Length Bone-Straight', label: '24"-30" Waist Length', priceModifier: 9000 },
      { id: 'len-w-32plus', name: '32"+ Ultra-Long Luxury Couture', label: '32"+ Couture Ultra-Long', priceModifier: 14000 },
    ],
  },
  {
    id: 'boho-braids',
    name: 'Boho Braids',
    tagline: 'Neat, stylish & feminine with elegant loose curls',
    image: bohoBraidsImg,
    startingPrice: '₦35,000',
    duration: '4 - 5 hours',
    features: [
      'Signature knotless parting technique',
      'Premium silky human curl blends',
      'Lightweight, tension-free & long-lasting',
    ],
    typesList: [
      {
        id: 'boho-knotless-human',
        name: 'Signature Boho Knotless with Human Hair Curls',
        description: 'Seamless feed-in roots with lightweight 100% human curl leave-outs that never mat or tangle.',
        badge: 'Top Signature',
        priceModifier: 0,
        popular: true,
      },
      {
        id: 'boho-french-curl',
        name: 'French Curl Boho Braids',
        description: 'Silky pre-curled French curl extensions cascading into glossy spiral curls.',
        badge: 'High Fashion',
        priceModifier: 3000,
        popular: true,
      },
      {
        id: 'boho-goddess',
        name: 'Goddess Box Braids',
        description: 'Full-volume wavy strands with curly ends for an effortless bohemian goddess look.',
        badge: 'Full Volume',
        priceModifier: 2000,
      },
      {
        id: 'boho-fulani',
        name: 'Fulani Front with Boho Knotless Back',
        description: 'Intricate tribal cornrows in front with beads/cuffs and bouncy boho braids in the back.',
        badge: 'Hybrid Queen',
        priceModifier: 5000,
      },
      {
        id: 'boho-gypsy',
        name: 'Gypsy Boho Braids (Multi-Length Tendrils)',
        description: 'Artistic multi-level curly tendrils framing the face and shoulders.',
        badge: 'Carefree Glam',
        priceModifier: 4000,
      },
    ],
    sizesList: [
      { id: 'size-micro-b', name: 'Micro / Fine Knotless', label: 'Micro (Extra-fine parts)', priceModifier: 8000 },
      { id: 'size-small-b', name: 'Small Knotless', label: 'Small (Refined & full)', priceModifier: 5000 },
      { id: 'size-smedium-b', name: 'Smedium (Most Popular)', label: 'Smedium (Ideal balance)', priceModifier: 2000 },
      { id: 'size-medium-b', name: 'Medium Signature', label: 'Medium (Standard Classic)', priceModifier: 0 },
      { id: 'size-jumbo-b', name: 'Jumbo Chunky Boho', label: 'Jumbo (Bold & quick)', priceModifier: 0 },
    ],
    lengthsList: [
      { id: 'len-bra-b', name: 'Bra-Strap / Shoulder', label: 'Bra-strap length', priceModifier: 0 },
      { id: 'len-mid-b', name: 'Mid-Back Length', label: 'Mid-back length', priceModifier: 4000 },
      { id: 'len-waist-b', name: 'Waist Length (Popular)', label: 'Waist length', priceModifier: 7000 },
      { id: 'len-butt-b', name: 'Butt / Thigh Length', label: 'Butt / Thigh length', priceModifier: 11000 },
      { id: 'len-knee-b', name: 'Knee Length Ultra', label: 'Knee length dramatic', priceModifier: 16000 },
    ],
  },
  {
    id: 'dreadlocks',
    name: 'Dreadlocks & Loc Care',
    tagline: 'Immaculate sections, micro-locs, starter locs & clean professional locking',
    image: dreadlocksImg,
    startingPrice: '₦20,000',
    duration: '2 - 4 hours',
    features: [
      'Precision interlocking, crochet method & palm rolling',
      'Deep peppermint scalp detox & root nourishment',
      'Luxury wire cuffs & sovereign gold hair accessory detailing',
    ],
    typesList: [
      {
        id: 'loc-traditional',
        name: 'Traditional Palm Roll Retwist & Styling',
        description: 'Clean geometric sectioning, organic wax/gel palm-rolling with barrel rolls or rope twist finish.',
        badge: 'Classic Favorite',
        priceModifier: 0,
        popular: true,
      },
      {
        id: 'loc-interlocking',
        name: 'Interlocking Root Retightening',
        description: 'Tension-free tool interlocking for active lifestyles and maximum longevity between washes.',
        badge: 'Long-Lasting',
        priceModifier: 5000,
      },
      {
        id: 'loc-starter',
        name: 'Instant Starter Locs (Comb Coils / Two-Strand)',
        description: 'Bespoke foundation lock setup with custom grid parting tailored to your head shape.',
        badge: 'New Journey',
        priceModifier: 8000,
      },
      {
        id: 'loc-microlocs',
        name: 'Micro-Locs / Sisterlocks Maintenance',
        description: 'Ultra-fine precision grid tightening for micro-sized locs with delicate care.',
        badge: 'Intricate Detail',
        priceModifier: 12000,
      },
      {
        id: 'loc-softfaux',
        name: 'Boho Soft Locs / Distressed Faux Locs',
        description: 'Bohemian wrapped faux locs with fluffy curly leave-outs and lightweight movement.',
        badge: 'Protective Glam',
        priceModifier: 10000,
      },
      {
        id: 'loc-butterfly',
        name: 'Butterfly Textured Locs',
        description: 'Distinctive distressed loops creating an effortless, stylish, and full-bodied crown.',
        badge: 'Trendy',
        priceModifier: 10000,
      },
      {
        id: 'loc-wicks',
        name: 'Wicks & Congos Retightening / Crocheting',
        description: 'Specialized thick aesthetic loc combination and root reinforcement.',
        badge: 'Specialty',
        priceModifier: 15000,
      },
    ],
    sizesList: [
      { id: 'size-micro', name: 'Micro / Sisterlock size', label: 'Micro (Extra-fine parts)', priceModifier: 6000 },
      { id: 'size-small', name: 'Small / Pencil size', label: 'Small (Pencil diameter)', priceModifier: 3000 },
      { id: 'size-medium', name: 'Medium Signature', label: 'Medium (Standard / Classic)', priceModifier: 0 },
      { id: 'size-large', name: 'Large / Chunky', label: 'Large (Chunky statement)', priceModifier: 0 },
      { id: 'size-jumbo', name: 'Jumbo / Wicks', label: 'Jumbo (Bold & sculptural)', priceModifier: 2000 },
    ],
    lengthsList: [
      { id: 'len-short', name: 'Neck / Chin Length', label: 'Short (Neck length)', priceModifier: 0 },
      { id: 'len-shoulder', name: 'Shoulder Length', label: 'Shoulder length', priceModifier: 2000 },
      { id: 'len-midback', name: 'Mid-Back Length', label: 'Mid-back length', priceModifier: 5000 },
      { id: 'len-waist', name: 'Waist Length', label: 'Waist length', priceModifier: 8000 },
      { id: 'len-hip', name: 'Hip / Floor Length', label: 'Hip / Floor ultra-long', priceModifier: 12000 },
    ],
  },
  {
    id: 'natural-hairstyling',
    name: 'Natural Hairstyling',
    tagline: 'Fluffy twists, healthy volume & rich texture care',
    image: fluffyTwistsImg,
    startingPrice: '₦18,000',
    duration: '2 hours',
    features: [
      'Deep hydration & moisture lock-in',
      'Protective styling for healthy hair growth',
      'Soft, defined bouncy twists & juicy coils',
    ],
    typesList: [
      {
        id: 'nat-juicy-twists',
        name: 'Plump Juicy Two-Strand Natural Twists',
        description: 'Infused with botanical butters for high-shine definition, elongation, and zero shrinkage.',
        badge: 'Moisture Lock',
        priceModifier: 0,
        popular: true,
      },
      {
        id: 'nat-passion-twists',
        name: 'Chunky Passion Twists with Extensions',
        description: 'Textured bohemian twists using silky water-wave blends for a full, protective bohemian aesthetic.',
        badge: 'Boho Favorite',
        priceModifier: 5000,
      },
      {
        id: 'nat-flat-twist-updo',
        name: 'Flat Twist Scalp Crown & Elegant Bun',
        description: 'Tension-free scalp flat twists sweeping up into a royal crown or chignon bun.',
        badge: 'Executive Elegance',
        priceModifier: 2000,
      },
      {
        id: 'nat-silk-press-trim',
        name: 'Botanical Steam Silk Press & Precision Trim',
        description: 'Hydro-mist steam therapy, organic heat defense, and razor split-ends elimination without heat damage.',
        badge: 'Healthy Straight',
        priceModifier: 6000,
      },
    ],
    sizesList: [
      { id: 'size-nat-mini', name: 'Mini / Micro Twists', label: 'Mini / Micro Twists', priceModifier: 5000 },
      { id: 'size-nat-small', name: 'Small Defined Twists', label: 'Small Defined', priceModifier: 3000 },
      { id: 'size-nat-medium', name: 'Medium Signature Twists', label: 'Medium Signature', priceModifier: 0 },
      { id: 'size-nat-chunky', name: 'Chunky Jumbo Twists', label: 'Chunky Jumbo Twists', priceModifier: 0 },
    ],
    lengthsList: [
      { id: 'len-nat-short', name: 'Natural Hair (Above Shoulders)', label: 'Natural (Above shoulder)', priceModifier: 0 },
      { id: 'len-nat-collar', name: 'Collarbone / Shoulder Length', label: 'Collarbone length', priceModifier: 2000 },
      { id: 'len-nat-mid', name: 'Mid-Back Length', label: 'Mid-back length', priceModifier: 4000 },
      { id: 'len-nat-waist', name: 'Extended Waist Length', label: 'Waist length extensions', priceModifier: 7000 },
    ],
  },
  {
    id: 'african-traditional',
    name: 'Other African Hairstyles',
    tagline: 'African hair threading (Kiko), Two-hand (Didi), Shuku & heritage weaving',
    image: africanTraditionalImg,
    startingPrice: '₦16,000',
    duration: '1.5 - 3 hours',
    features: [
      'Traditional African Hair Threading (Irun Kiko) for heatless stretch & artistic geometry',
      'Two-Hand Scalp Weaving / Didi (Underhand inverted cornrows - ultra flat & protective)',
      'Royal Nigerian Heritage styles: Shuku, Koroba, Calabar beaded braids & Bantu knots',
    ],
    typesList: [
      {
        id: 'afro-threading',
        name: 'Traditional African Hair Threading (Irun Kiko)',
        description: 'Artistic Nigerian black thread wrapping. Excellent for heat-free hair stretching, moisture retention, and avant-garde crown styling.',
        badge: 'Heritage & Growth',
        priceModifier: 0,
        popular: true,
      },
      {
        id: 'afro-didi',
        name: 'Two-Hand Scalp Weaving / Didi (Inverted Ghana Weaving)',
        description: 'Authentic underhand inverted cornrow technique that lies completely flat against the scalp with zero friction or hairline tension.',
        badge: 'Painless & Sleek',
        priceModifier: 2000,
        popular: true,
      },
      {
        id: 'afro-shuku',
        name: 'Royal Shuku / Suku High Crown Cornrows',
        description: 'Statuesque Nigerian bridal and festive high-top cornrows converging into an opulent braided crown.',
        badge: 'Bridal Royalty',
        priceModifier: 4000,
      },
      {
        id: 'afro-koroba',
        name: 'Koroba Weaving (Inverted Bucket Style)',
        description: 'Timeless Yoruba protective style with cascading cornrows woven outward and downward from the center.',
        badge: 'Traditional Art',
        priceModifier: 3000,
      },
      {
        id: 'afro-bantu',
        name: 'Bantu Knots with Gold Filigree Accents',
        description: 'Crisp diamond or triangular parting with tightly coiled knots adorned with gold jewelry rings and cuffs.',
        badge: 'Sculptural Chic',
        priceModifier: 2000,
      },
      {
        id: 'afro-calabar',
        name: 'Calabar Royal Beaded & Cowrie Plaits',
        description: 'Intricate tribal sectioning adorned with authentic cowrie shells, wooden beads, and golden wire twists.',
        badge: 'Cultural Festive',
        priceModifier: 6000,
      },
      {
        id: 'afro-patewo',
        name: 'Patewo & Two-Step Didi Hybrid',
        description: 'Two sides clapping together into a central crest, combining traditional Didi with sleek modern partings.',
        badge: 'Intricate',
        priceModifier: 3000,
      },
    ],
    sizesList: [
      { id: 'size-micro-didi', name: 'Micro Precision Lines', label: 'Micro (Extra-slim detailed rows)', priceModifier: 4000 },
      { id: 'size-small-didi', name: 'Small Neat Rows', label: 'Small (Standard detailed)', priceModifier: 2000 },
      { id: 'size-medium-didi', name: 'Medium Signature Rows', label: 'Medium (Classic aesthetic)', priceModifier: 0 },
      { id: 'size-bold-didi', name: 'Bold Chunky Sculptural', label: 'Chunky Statement Rows', priceModifier: 0 },
    ],
    lengthsList: [
      { id: 'len-nat-didi', name: 'Natural Hair Length (No extensions)', label: 'Natural hair length', priceModifier: 0 },
      { id: 'len-sh-didi', name: 'Shoulder Drop Length', label: 'Shoulder length extensions', priceModifier: 2500 },
      { id: 'len-mb-didi', name: 'Mid-Back Length', label: 'Mid-back extensions', priceModifier: 4500 },
      { id: 'len-w-didi', name: 'Waist Length Drape', label: 'Waist length extensions', priceModifier: 7000 },
    ],
  },
  {
    id: 'hair-treatment-products',
    name: 'Products & Accessories',
    tagline: 'Multi-color silk scrunchies, shampoos & luxury hair care',
    image: hairProductsImg,
    startingPrice: '₦4,500',
    duration: 'Instant Dispatch',
    features: [
      'Hydrating organic shampoo & scalp treatment creams',
      'Multi-color satin scrunchies in gold, blush peach, chocolate & sage',
      'Luxury filigree gold cuffs & amber glass bottles',
    ],
  },
];

export interface LocationTier {
  id: string;
  name: string;
  zones: string;
  fee: number;
  formattedFee: string;
  tag?: string;
}

export const LOCATION_TIERS: LocationTier[] = [
  {
    id: 'tier-hub',
    name: 'Local Vicinity / Salon Hub Zone',
    zones: 'Within 5-8km of studio (e.g. immediate neighborhood, close radius)',
    fee: 5000,
    formattedFee: '₦5,000',
    tag: 'Standard Dispatch',
  },
  {
    id: 'tier-mid',
    name: 'Mid-Distance Urban Hub (Mainland / Central)',
    zones: 'e.g. Yaba, Surulere, Maryland, Ikeja GRA, Garki, Wuse, Central Business Hubs',
    fee: 8000,
    formattedFee: '₦8,000',
    tag: 'Popular',
  },
  {
    id: 'tier-island',
    name: 'Extended Zone (Island / Prime Estates)',
    zones: 'e.g. Lekki Phase 1, Victoria Island, Ikoyi, Magodo Phase 2, Gwarinpa, Guzape',
    fee: 12000,
    formattedFee: '₦12,000',
    tag: 'Prime Estates',
  },
  {
    id: 'tier-outer',
    name: 'Outer District / Far Radius',
    zones: 'e.g. Ajah, Sangotedo, Ibeju-Lekki, Ikorodu, Lugbe, Kubwa, Satellite Towns',
    fee: 16000,
    formattedFee: '₦16,000',
    tag: 'Extended Distance',
  },
  {
    id: 'tier-custom',
    name: 'Custom / Out-of-State VIP Booking',
    zones: 'Outside state borders or bespoke full-day booking (To be confirmed on WhatsApp)',
    fee: 25000,
    formattedFee: '₦25,000 (Base)',
    tag: 'VIP Custom',
  },
];

export const PRODUCTS_SHOP_DATA: ProductShopItem[] = [
  {
    id: 'prod-wig-cambodian-26',
    name: 'Raw Cambodian Silk Press Bone-Straight Luxury Wig (26-inch)',
    price: 240000,
    formattedPrice: '₦240,000',
    category: 'Luxury Ready-to-Wear Wigs',
    volume: '26" • 13x6 HD Frontal (300g)',
    image: heroBoneStraight26Img,
    description:
      'Our pinnacle salon flagship unit: 100% single-donor raw Cambodian hair with razor-straight liquid-glass sheen, micro-plucked ultra-thin HD swiss lace, and heavy 300g double drawn fullness from root to ends.',
    benefits: [
      '100% Single-donor raw virgin hair lasting 3+ years',
      'Melted skin-like HD lace with bleached micro-knots',
      'Super double-drawn 300g density with mirror shine',
      'Strictly eligible for the exclusive 3-day referral discount!',
    ],
    inStock: true,
    featured: true,
    isWig: true,
    wigLength: '26 inches',
    wigDensity: '300% Ultra Dense',
    laceType: '13x6 HD Swiss Frontal',
  },
  {
    id: 'prod-wig-vietnamese-lob-12',
    name: 'Raw Vietnamese Bone-Straight Razor Blunt Cut Lob Wig (12-inch)',
    price: 185000,
    formattedPrice: '₦185,000',
    category: 'Luxury Ready-to-Wear Wigs',
    volume: '12" • 13x4 HD Frontal (250g)',
    image: heroBoneStraightImg,
    description:
      'Precision collarbone blunt perimeter cut with breathtaking liquid-glass shine. Signature salon look tailored for sophisticated executives and luxury events.',
    benefits: [
      'Precision razor cut that never frays or tangles',
      'Pre-plucked natural hairline with baby hairs',
      'Zero shedding with reinforced double weft stitching',
      'Silky smooth movement with thermal heat protection',
    ],
    inStock: true,
    featured: true,
    isWig: true,
    wigLength: '12 inches',
    wigDensity: '250% Heavy Density',
    laceType: '13x4 HD Swiss Frontal',
  },
  {
    id: 'prod-wig-glueless-bob-10',
    name: 'Glueless Silk Press HD Closure Ready-to-Wear Bob Wig (10-inch)',
    price: 135000,
    formattedPrice: '₦135,000',
    category: 'Luxury Ready-to-Wear Wigs',
    volume: '10" • 5x5 HD Closure',
    image: boneStraightBobImg,
    description:
      'Everyday effortless elegance. Wear-and-go glueless construction with pre-cut HD lace and snug adjustable elastic security band.',
    benefits: [
      '100% glueless - install or remove in under 30 seconds',
      'Zero glue or spray needed on delicate natural hairline',
      'Pre-cut lace with silicone anti-slip comfort band',
    ],
    inStock: true,
    featured: false,
    isWig: true,
    wigLength: '10 inches',
    wigDensity: '200% Full Density',
    laceType: '5x5 HD Swiss Closure',
  },
  {
    id: 'prod-shampoo',
    name: 'Organic Moisture Replenish Shampoo',
    price: 9500,
    formattedPrice: '₦9,500',
    category: 'Wash & Cleansing',
    volume: '500ml',
    image: luxuryShampooImg,
    description:
      'Sulfate-free botanical shampoo enriched with organic tea tree, aloe vera, and argan oil to deeply cleanse and clarify without stripping natural oils.',
    benefits: [
      'Sulfate-free & gentle on color-treated or virgin hair',
      'Clarifies buildup from braids, locs, and lace adhesives',
      'Infused with scalp-calming botanicals and mint',
    ],
    inStock: true,
    featured: true,
  },
  {
    id: 'prod-serum',
    name: 'Virgin Bone-Straight Liquid-Glass Serum',
    price: 12000,
    formattedPrice: '₦12,000',
    category: 'Serums & Oils',
    volume: '100ml',
    image: boneStraightSerumImg,
    description:
      'Ultra-lightweight thermal shine elixir delivering high-refraction mirror gloss, anti-humidity humidity shield, and silk-press longevity.',
    benefits: [
      'Heat protection up to 450°F (230°C)',
      'Leaves zero greasy residue or heavy buildup',
      'Locks in straightness for days, even in humid weather',
    ],
    inStock: true,
    featured: true,
  },
  {
    id: 'prod-scrunchies',
    name: 'Luxury 4-Piece Mulberry Satin Scrunchies',
    price: 6500,
    formattedPrice: '₦6,500',
    category: 'Accessories & Silk',
    volume: 'Pack of 4',
    image: hairProductsImg,
    description:
      'Handcrafted high-grade mulberry satin scrunchies in four designer salon colors: Champagne Gold, Blush Peach, Chocolate Mocha, and Sage Olive.',
    benefits: [
      'Zero hair snagging, pulling, or braid friction',
      'Prevents crown breakage while sleeping or styling',
      'Elegant accessory for wrists and high buns',
    ],
    inStock: true,
    featured: true,
  },
  {
    id: 'prod-conditioner',
    name: 'Silk Peptide Intensive Deep Conditioner',
    price: 11000,
    formattedPrice: '₦11,000',
    category: 'Conditioners & Masks',
    volume: '500ml',
    image: haircareCollageImg,
    description:
      'Fortified with hydrolyzed silk protein, shea butter, and ceramides to revive tired curls, soften brittle ends, and give weaves sensational slip.',
    benefits: [
      'Restores elasticity to 4C natural curls and weaves',
      'Melt-away detangling slip in under 5 minutes',
      'Rich nourishing formula for weekly deep conditioning',
    ],
    inStock: true,
  },
  {
    id: 'prod-cuffs',
    name: 'Sovereign Gold Filigree Hair Cuffs & Beads',
    price: 4500,
    formattedPrice: '₦4,500',
    category: 'Accessories & Silk',
    volume: '20 Pieces Set',
    image: dreadlocksImg,
    description:
      'High-polish tarnish-resistant metallic gold hair cuffs with delicate filigree engravings for dreadlocks, boho braids, and protective twists.',
    benefits: [
      'Easy adjustable clip-on design (fits all braid widths)',
      'Non-tarnishing high-luster gold finish',
      'Instantly elevates any protective hairstyle to royal status',
    ],
    inStock: true,
  },
  {
    id: 'prod-pomade',
    name: 'Botanical Scalp Pomade & Sleek Edge Glaze',
    price: 7500,
    formattedPrice: '₦7,500',
    category: 'Serums & Oils',
    volume: '250g',
    image: haircareCollageImg,
    description:
      'Non-flaking, all-day stronghold edge control and scalp balm formulated with rosemary extract and castor oil for healthy edges.',
    benefits: [
      '24-hour humidity-proof edge control',
      'Zero white flaking or crusty residue',
      'Encourages hairline density and edge regrowth',
    ],
    inStock: true,
  },
];

export const BEFORE_AFTER_DATA: BeforeAfterTransformation[] = [
  {
    id: 'trans-1',
    title: 'Bone-Straight Human Hair Wig Revamp',
    category: 'Wig Transformation',
    serviceId: 'wigs-revamping',
    beforeImage: wigBeforeImg,
    afterImage: heroBoneStraightImg,
    duration: '2.5 Hours',
    stylist: 'Rose Iyaji (Master Stylist)',
    description:
      'A matte, tangled human hair wig with split ends revitalized into a razor-sharp, shorter blunt lob with sensational liquid-glass shine and silk-press fluidity.',
    resultHighlights: [
      'Deep clarifying bath & keratin steam treatment',
      'Precision collarbone blunt perimeter cut',
      'Micro-thin thermal press with liquid gold serum',
    ],
    clientFeedback:
      '“I honestly thought I would have to throw this wig away! Rossy made it look brand new and 10x more expensive than when I bought it!” — Amara K.',
  },
  {
    id: 'trans-2',
    title: 'Precision Loc Retwist & Crown Gold Detailing',
    category: 'Dreadlocks Care',
    serviceId: 'dreadlocks',
    beforeImage: locsBeforeImg,
    afterImage: dreadlocksImg,
    duration: '3 Hours',
    stylist: 'Rose Iyaji',
    description:
      'Transforming 4 months of fuzzy, overgrown new growth into crisp, geometrically parted locs nourished with peppermint tea-tree oils and sovereign gold cuffs.',
    resultHighlights: [
      'Scalp detox wash with organic mint steam',
      'Razor-clean interlocking & palm rolling',
      'Metallic gold cuffs and filigree wire styling',
    ],
    clientFeedback:
      '“The cleanest dreadlock retwist in town. Zero scalp tension and the parts look so symmetrical!” — Zainab M.',
  },
  {
    id: 'trans-3',
    title: 'Signature Waist-Length Boho Knotless Braids',
    category: 'Braids & Plaits',
    serviceId: 'boho-braids',
    beforeImage: braidsBeforeImg,
    afterImage: bohoBraidsImg,
    duration: '4.5 Hours',
    stylist: 'Senior Braid Artisan',
    description:
      'From blown-out natural 4C texture to head-turning waist-length knotless braids laced with luscious curly tendrils that drape gracefully over the shoulders.',
    resultHighlights: [
      'Tension-free knotless root feed-in technique',
      'Premium lightweight human curly curl additions',
      'Dipped in hot moisture seal for featherweight movement',
    ],
    clientFeedback:
      '“I have tender scalp and this was completely pain-free! Plus, the curls don’t tangle at all!” — Chidinma O.',
  },
  {
    id: 'trans-4',
    title: '4C Afro Hydration to Defined Juicy Twists',
    category: 'Natural Hair Care',
    serviceId: 'natural-hairstyling',
    beforeImage: twistsBeforeImg,
    afterImage: fluffyTwistsImg,
    duration: '2 Hours',
    stylist: 'Rose Iyaji',
    description:
      'Rescuing dry, brittle natural coils with a 7-step moisture infusion followed by plump, defined two-strand twists that highlight natural volume and bounce.',
    resultHighlights: [
      'Maximum hydration steam pre-poo and detangling',
      'Botanical butter & ceramide moisture lock-in',
      'Uniform plump twists that can be worn down or twisted up',
    ],
    clientFeedback:
      '“My hair has never felt this soft! The moisture lasted for over two weeks!” — Tolani A.',
  },
];

export const ADD_ONS_DATA: AddOnOption[] = [
  {
    id: 'addon-wash',
    name: 'Clarifying Wash & Deep Steam Moisture Mask',
    price: 5000,
    formattedPrice: '₦5,000',
    duration: '+30 mins',
  },
  {
    id: 'addon-scalp',
    name: 'Peppermint Scalp Detox & High-Frequency Treatment',
    price: 6500,
    formattedPrice: '₦6,500',
    duration: '+25 mins',
  },
  {
    id: 'addon-cuffs',
    name: 'Sovereign Gold Filigree Cuffs & Hair Rings Styling',
    price: 3500,
    formattedPrice: '₦3,500',
    duration: '+15 mins',
  },
  {
    id: 'addon-kit',
    name: 'RossyBraids Satin Sleep Bonnet & Edge Care Kit',
    price: 8000,
    formattedPrice: '₦8,000',
    duration: 'Take-home pack',
  },
];

export const TIME_SLOTS = [
  '09:00 AM - Morning',
  '11:00 AM - Mid-Day',
  '01:30 PM - Afternoon',
  '03:30 PM - Late Afternoon',
  '05:30 PM - Evening Glow',
];

export const STYLISTS = [
  {
    id: 'rose-iyaji',
    name: 'Rose Iyaji (Master Stylist & Founder)',
    role: 'Wig Couture, Locs & Creative Direction',
    experience: '8+ years mastery',
  },
  {
    id: 'senior-braider',
    name: 'Senior Braid Artisan (Rossy Team)',
    role: 'Boho Braids, Knotless & Natural Twists',
    experience: '5+ years mastery',
  },
];

export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: 'test-1',
    clientName: 'Amara Kalu',
    location: 'Victoria Island, Lagos',
    rating: 5,
    review:
      'The bone-straight revamping is pure perfection! It looks so expensive, silky, and has that liquid glass shine. Rossy is truly a master of luxury hair.',
    serviceBooked: 'Bone-Straight Revamp & Styling',
    date: 'Verified Client • 2 weeks ago',
    verified: true,
  },
  {
    id: 'test-2',
    clientName: 'Chidinma Okafor',
    location: 'Maitama, Abuja',
    rating: 5,
    review:
      'My boho braids lasted 8 full weeks without tension or frizz. The parting lines are razor clean, lightweight, and so feminine. Countless compliments!',
    serviceBooked: 'Signature Boho Braids',
    date: 'Verified Client • 3 weeks ago',
    verified: true,
  },
  {
    id: 'test-3',
    clientName: 'Zainab Mohammed',
    location: 'GRA, Port Harcourt',
    rating: 5,
    review:
      'Finding someone who genuinely respects loc health and clean interlocking is so rare. My dreadlocks look immaculate and the scalp treatment felt heavenly.',
    serviceBooked: 'Dreadlocks Detailing & Spa',
    date: 'Verified Client • 1 month ago',
    verified: true,
  },
  {
    id: 'test-4',
    clientName: 'Tolani Adeleke',
    location: 'Lekki Phase 1, Lagos',
    rating: 5,
    review:
      'The fluffy twists gave my natural hair unbelievable bounce and moisture. Plus, their peach & champagne satin scrunchies are my absolute daily staple!',
    serviceBooked: 'Natural Twists & Accessories',
    date: 'Verified Client • Just recently',
    verified: true,
  },
];

export const IMAGES = {
  heroBoneStraight: heroBoneStraightImg,
  bohoBraids: bohoBraidsImg,
  dreadlocks: dreadlocksImg,
  fluffyTwists: fluffyTwistsImg,
  africanTraditional: africanTraditionalImg,
  products: hairProductsImg,
  luxuryShampoo: luxuryShampooImg,
  boneStraightSerum: boneStraightSerumImg,
  wigBefore: wigBeforeImg,
  locsBefore: locsBeforeImg,
  braidsBefore: braidsBeforeImg,
  twistsBefore: twistsBeforeImg,
};

