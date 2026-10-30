/**
 * Privacy-friendly analytics through Plausible. Does nothing unless VITE_PLAUSIBLE_DOMAIN is set at build time.
 * Page views are automatic (Plausible follows history changes); call trackEvent for conversions.
 */
const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined;

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string | number> }) => void;
  }
}

export function initAnalytics(): void {
  if (!domain || document.querySelector('script[data-domain]')) return;
  const script = document.createElement('script');
  script.defer = true;
  script.dataset.domain = domain;
  script.src = 'https://plausible.io/js/script.js';
  document.head.appendChild(script);
}

export function trackEvent(name: string, props?: Record<string, string | number>): void {
  window.plausible?.(name, props ? { props } : undefined);
}
