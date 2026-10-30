import React, { createContext, useContext, useMemo, useState } from 'react';

export type Lang = 'en' | 'pcm' | 'yo' | 'ha';

export const LANGUAGES: { code: Lang; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'pcm', label: 'Pidgin' },
  { code: 'yo', label: 'Yorùbá' },
  { code: 'ha', label: 'Hausa' },
];

const en = {
  navHome: 'Home',
  navBook: 'Book Appointment',
  navShop: 'Hair Care Shop',
  navGallery: 'Before & After',
  navRefer: 'Refer & Earn 25%',
  navBookShort: 'Book',
  navShopShort: 'Shop',
  navGalleryShort: 'Gallery',
  navReferShort: 'Refer',
  heroKicker: 'Luxury hair & beauty',
  heroTitle: 'Where Beauty Meets Craft.',
  heroText: 'Braids, locs, bone-straight wigs and natural styling, in our studio or at your home. Book online in minutes.',
  ctaBook: 'Book your appointment',
  ctaWhatsApp: 'Chat on WhatsApp',
  servicesTitle: 'Our signature services',
  servicesFilter: 'Starting price',
  filterAll: 'All',
  filterUnder20: 'Under ₦20k',
  filterMid: '₦20k – ₦30k',
  filterOver30: '₦30k+',
  from: 'From',
  bookThis: 'Book this style',
  noServices: 'No services in this price range.',
  reviewsTitle: 'Loved by our clients',
  reviewFormTitle: 'Share your experience',
  visitTitle: 'Visit us',
  hours: 'Opening hours',
  address: 'Address',
  contactForAddress: 'Message us on WhatsApp for the studio address.',
  openMap: 'Open in Maps',
  language: 'Language',
} as const;

export type Strings = Record<keyof typeof en, string>;

// Pidgin, Yorùbá and Hausa fall back to English for any key not translated here.
const dictionaries: Record<Lang, Partial<Strings>> = {
  en,
  pcm: {
    navHome: 'Home',
    navBook: 'Book Appointment',
    navShop: 'Hair Shop',
    navRefer: 'Refer & Collect 25%',
    heroKicker: 'Luxury hair & beauty',
    heroText: 'Braids, locs, bone-straight wigs and natural hair styling, for our studio or for your house. Book online sharp-sharp.',
    ctaBook: 'Book your appointment',
    ctaWhatsApp: 'Chat us on WhatsApp',
    servicesTitle: 'Wetin we dey do best',
    servicesFilter: 'Starting price',
    from: 'From',
    bookThis: 'Book this style',
    noServices: 'No service dey for this price range.',
    reviewsTitle: 'Wetin our clients dey talk',
    reviewFormTitle: 'Tell us your experience',
    visitTitle: 'Come see us',
    hours: 'Time we dey open',
    address: 'Address',
    contactForAddress: 'Message us for WhatsApp make we send the studio address.',
    openMap: 'Open for Maps',
    language: 'Language',
  },
  yo: {
    navHome: 'Ilé',
    navBook: 'Ṣe Ìpàdé',
    navShop: 'Ṣọ́ọ̀bù Irun',
    navGallery: 'Ṣáájú àti Lẹ́yìn',
    navRefer: 'Mú Ọ̀rẹ́ Wá, Gba 25%',
    heroText: 'Irun dídì, dírẹ́dì, wigi àti irun àdánidá, ní ilé-iṣẹ́ wa tàbí ní ilé rẹ. Ṣe ìforúkọsílẹ̀ lórí ayélujára.',
    ctaBook: 'Ṣe ìpàdé rẹ',
    ctaWhatsApp: 'Kọ̀wé sí wa lórí WhatsApp',
    servicesTitle: 'Àwọn iṣẹ́ wa',
    from: 'Láti',
    bookThis: 'Yan irun yìí',
    reviewsTitle: 'Ohun tí àwọn oníbàárà wa sọ',
    visitTitle: 'Wá bẹ̀ wá wò',
    hours: 'Àkókò ìṣíṣẹ́',
    address: 'Àdírẹ́sì',
    language: 'Èdè',
  },
  ha: {
    navHome: 'Gida',
    navBook: 'Yi Ajiyar Lokaci',
    navShop: 'Kantin Gyaran Gashi',
    navGallery: 'Kafin da Bayan',
    navRefer: 'Gayyato Aboki, Samu 25%',
    heroText: 'Kitso, dreadlocks, wigs da gyaran gashi na asali, a shagonmu ko a gidanku. Yi ajiya ta intanet.',
    ctaBook: 'Yi ajiyar lokacinku',
    ctaWhatsApp: 'Tuntube mu a WhatsApp',
    servicesTitle: 'Ayyukanmu',
    from: 'Daga',
    bookThis: 'Zabi wannan salo',
    reviewsTitle: 'Abin da abokan cinikinmu ke cewa',
    visitTitle: 'Ku ziyarce mu',
    hours: 'Lokutan buɗewa',
    address: 'Adireshi',
    language: 'Harshe',
  },
};

interface I18nValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: keyof Strings) => string;
}

const I18nContext = createContext<I18nValue | null>(null);
const STORAGE_KEY = 'rossybraids_lang';

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
      return saved && saved in dictionaries ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang: (next) => {
        setLangState(next);
        document.documentElement.lang = next === 'pcm' ? 'en' : next;
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {
          // preference just won't persist
        }
      },
      t: (key) => dictionaries[lang][key] ?? en[key],
    }),
    [lang]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
