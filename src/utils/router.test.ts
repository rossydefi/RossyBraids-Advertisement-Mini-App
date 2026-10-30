import { describe, expect, it } from 'vitest';
import { pathToRoute, routeToPath } from './router';

describe('router paths', () => {
  it('maps every public path to its route and back', () => {
    for (const route of ['home', 'booking', 'shop', 'gallery', 'flyer', 'admin'] as const) {
      expect(pathToRoute(routeToPath(route))).toBe(route);
    }
  });

  it('ignores trailing slashes and falls back to home for unknown paths', () => {
    expect(pathToRoute('/booking/')).toBe('booking');
    expect(pathToRoute('/does-not-exist')).toBe('home');
  });
});
