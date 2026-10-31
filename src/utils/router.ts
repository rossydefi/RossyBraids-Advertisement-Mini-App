import { useCallback, useEffect, useState } from 'react';
import type { ActiveTab } from '../types';

export type Route = ActiveTab | 'admin';

const PATHS: Record<Route, string> = {
  home: '/',
  booking: '/booking',
  shop: '/shop',
  gallery: '/gallery',
  flyer: '/flyer',
  referral: '/',
  admin: '/admin',
};

export const routeToPath = (route: Route): string => PATHS[route];

export function pathToRoute(pathname: string): Route {
  const clean = pathname.replace(/\/+$/, '') || '/';
  const hit = (Object.keys(PATHS) as Route[]).find((r) => r !== 'referral' && PATHS[r] === clean);
  return hit ?? 'home';
}

/** Old shared links used /?tab=shop. Rewrites them to the real path without adding a history entry. */
function upgradeLegacyUrl() {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get('tab');
  if (tab && tab in PATHS) {
    params.delete('tab');
    const query = params.toString();
    window.history.replaceState(null, '', PATHS[tab as Route] + (query ? `?${query}` : '') + window.location.hash);
  }
}

export const ROUTE_META: Record<Route, { title: string; description: string }> = {
  home: {
    title: 'RossyBraids — Hair Salon, Appointments & Shop',
    description: 'Luxury braiding, bone-straight revamps, locs and wigs. Book online, shop hair care and see our before & after portfolio.',
  },
  booking: {
    title: 'Book an Appointment — RossyBraids',
    description: 'Choose your style, stylist and time. Salon visits or VIP home service, with transparent pricing.',
  },
  shop: {
    title: 'Hair Care Shop & Wigs — RossyBraids',
    description: 'Shampoos, serums, silk accessories and luxury ready-to-wear wigs, delivered to you.',
  },
  gallery: {
    title: 'Style Gallery — RossyBraids',
    description: 'Photos and videos of real hair styled by RossyBraids: wigs, locs, boho braids and natural twists.',
  },
  flyer: { title: 'Ad Flyer Designer — RossyBraids', description: 'Design and download RossyBraids promotional flyers.' },
  referral: { title: 'Refer & Earn — RossyBraids', description: 'Refer a friend and both earn 25% off our flagship wig.' },
  admin: { title: 'Admin — RossyBraids', description: 'Salon owner dashboard.' },
};

export function useRoute() {
  const [route, setRoute] = useState<Route>(() => {
    upgradeLegacyUrl();
    return pathToRoute(window.location.pathname);
  });

  useEffect(() => {
    const onPop = () => setRoute(pathToRoute(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    const meta = ROUTE_META[route];
    document.title = meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', meta.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', meta.description);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', `https://rossybraids.com${PATHS[route] === '/' ? '/' : PATHS[route]}`);
  }, [route]);

  const navigate = useCallback((next: Route) => {
    const target = routeToPath(next);
    if (window.location.pathname !== target) window.history.pushState(null, '', target);
    setRoute(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return { route, navigate };
}
