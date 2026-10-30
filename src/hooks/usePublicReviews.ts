import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { TESTIMONIALS_DATA } from '../data/flyerData';
import type { Testimonial } from '../types';

/** Approved client reviews from the server; the bundled testimonials only fill in until the first review is approved. */
export function usePublicReviews(): Testimonial[] {
  const [reviews, setReviews] = useState<Testimonial[]>(TESTIMONIALS_DATA);

  useEffect(() => {
    let cancelled = false;
    api
      .reviews()
      .then((live) => {
        if (!cancelled && live.length > 0) setReviews(live);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return reviews;
}
