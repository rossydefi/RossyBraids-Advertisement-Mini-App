import { describe, expect, it } from 'vitest';
import type { GalleryItem } from '../api/client';
import { searchGallery } from './gallerySearch';

const item = (id: string, title: string, category: string, tags: string[], description = ''): GalleryItem => ({
  id, title, category, tags, description, mediaType: 'image', mediaUrl: '/x.jpg', featured: false, createdAt: '2026-01-01',
});

const items = [
  item('a', 'Knee-length boho braids', 'Boho Braids', ['knotless', 'long', 'curly'], 'Soft curls through the ends'),
  item('b', 'Neat starter locs', 'Dreadlocks', ['locs', 'starter']),
  item('c', 'Bone-straight lace wig', 'Wigs & Revamping', ['frontal', 'sleek']),
];

describe('searchGallery', () => {
  it('returns everything for an empty query', () => {
    expect(searchGallery(items, '  ')).toHaveLength(3);
  });
  it('understands a descriptive sentence', () => {
    expect(searchGallery(items, 'I want long curly braids for my wedding')[0].item.id).toBe('a');
  });
  it('treats synonyms as the same thing', () => {
    expect(searchGallery(items, 'dreads')[0].item.id).toBe('b');
    expect(searchGallery(items, 'sleek unit')[0].item.id).toBe('c');
  });
  it('matches partial words while typing', () => {
    expect(searchGallery(items, 'knot')[0].item.id).toBe('a');
  });
  it('returns nothing when nothing matches', () => {
    expect(searchGallery(items, 'zzzz')).toHaveLength(0);
  });
});
