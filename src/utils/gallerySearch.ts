import type { GalleryItem } from '../api/client';

const STOPWORDS = new Set([
  'a', 'an', 'the', 'i', 'me', 'my', 'we', 'you', 'want', 'need', 'looking', 'look', 'for', 'to', 'of', 'in', 'on', 'with', 'and', 'or', 'like', 'that', 'is', 'it',
  'style', 'styles', 'hair', 'hairstyle', 'hairstyles', 'please', 'show', 'something', 'some', 'get', 'have', 'wanna', 'do', 'can',
]);

/** Words people use for the same thing, mapped to one canonical word. */
const SYNONYMS: Record<string, string> = {
  loc: 'dreadlock', locs: 'dreadlock', dread: 'dreadlock', dreads: 'dreadlock', dreadlocks: 'dreadlock', retwist: 'dreadlock',
  wigs: 'wig', frontal: 'wig', closure: 'wig', unit: 'wig', install: 'wig', revamp: 'wig', revamping: 'wig', lace: 'wig',
  braid: 'braid', braids: 'braid', plait: 'braid', plaits: 'braid', cornrow: 'braid', cornrows: 'braid', box: 'braid', knotless: 'braid', boho: 'braid', bohemian: 'braid',
  twist: 'twist', twists: 'twist', natural: 'natural', afro: 'natural', kinky: 'natural', curly: 'curl', curls: 'curl', coily: 'curl',
  traditional: 'african', threading: 'african', african: 'african',
  straight: 'straight', sleek: 'straight', bone: 'straight', silk: 'straight', press: 'straight',
  long: 'long', short: 'short', bob: 'short', lob: 'short', pixie: 'short',
  wedding: 'bridal', bride: 'bridal', bridal: 'bridal', party: 'bridal', event: 'bridal',
  product: 'product', products: 'product', treatment: 'care', care: 'care', wash: 'care', oil: 'care', shampoo: 'care',
};

const stem = (w: string) => (w.length > 4 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w);

const rawWords = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean).filter((w) => !STOPWORDS.has(w));

export function tokenize(text: string): string[] {
  return rawWords(text).map((w) => SYNONYMS[w] ?? SYNONYMS[stem(w)] ?? stem(w));
}

/** For the text being searched: keep the original words too, so "knot" still finds "knotless". */
const haystack = (text: string): string[] => [...tokenize(text), ...rawWords(text).map(stem)];

/**
 * Natural-language search: "long curly boho braids for a wedding" is split into words, common
 * synonyms are folded together (locs = dreadlocks), and every style is scored by how many of
 * the words appear in its title, keywords, category and description. Best matches first.
 */
export function searchGallery(items: GalleryItem[], query: string): { item: GalleryItem; score: number }[] {
  const words = [...new Set(tokenize(query))];
  if (words.length === 0) return items.map((item) => ({ item, score: 0 }));

  return items
    .map((item) => {
      const title = haystack(item.title);
      const tags = haystack(item.tags.join(' '));
      const category = haystack(item.category);
      const description = haystack(item.description);
      let score = 0;
      for (const w of words) {
        const hit = (list: string[]) => list.some((t) => t === w || (w.length >= 3 && t.startsWith(w)));
        if (hit(title)) score += 3;
        if (hit(tags)) score += 3;
        if (hit(category)) score += 2;
        if (hit(description)) score += 1;
      }
      return { item, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}
