import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { IMAGES } from '../data/flyerData';
import type { Route } from '../utils/router';
import { useCatalog } from './useCatalog';

export interface ShowcaseSlide {
  id: string;
  kind: 'image' | 'video';
  src: string;
  label: string;
  caption: string;
  route: Extract<Route, 'gallery' | 'shop'>;
}

/** Styles the owner uploaded to the gallery and products available in the shop, interleaved for the home page background. */
export function useShowcase(max = 12): ShowcaseSlide[] {
  const catalog = useCatalog();
  const [gallery, setGallery] = useState<ShowcaseSlide[]>([]);

  useEffect(() => {
    let alive = true;
    api
      .gallery()
      .then((rows) => {
        if (!alive) return;
        setGallery(
          rows.map((g) => ({
            id: `g-${g.id}`,
            kind: g.mediaType,
            src: g.mediaUrl,
            label: g.title,
            caption: g.category,
            route: 'gallery' as const,
          }))
        );
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return useMemo(() => {
    const products: ShowcaseSlide[] = catalog
      .filter((p) => p.inStock)
      .map((p) => ({ id: `p-${p.id}`, kind: 'image' as const, src: p.image, label: p.name, caption: `In the shop · ${p.formattedPrice}`, route: 'shop' as const }));
    const styles = gallery.map((g) => ({ ...g, caption: `Our work · ${g.caption}` }));
    const slides: ShowcaseSlide[] = [];
    for (let i = 0; slides.length < max && (i < styles.length || i < products.length); i++) {
      if (styles[i]) slides.push(styles[i]);
      if (products[i] && slides.length < max) slides.push(products[i]);
    }
    return slides.length
      ? slides
      : [{ id: 'hero', kind: 'image', src: IMAGES.heroBoneStraight, label: 'Bone-straight luxury wig', caption: 'Our work', route: 'gallery' }];
  }, [catalog, gallery, max]);
}
