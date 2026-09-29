import { trackEvent } from './analytics';
import { locationFromWhatsappAnchor } from './whatsappLocation';

const DEDUPE_MS = 400;
let lastAnchorTrackAt = 0;

export function whatsappAnchorTrackedJustNow(now = Date.now()): boolean {
  return now - lastAnchorTrackAt < DEDUPE_MS;
}

/** Un clic en cualquier `a[href*=wa.me]` del documento, incluidos los del widget. */
export function installWhatsappRedirectTracking(): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  const flagged = window as Window & { __amarteWaClickTracked?: boolean };
  if (flagged.__amarteWaClickTracked) return;
  flagged.__amarteWaClickTracked = true;
  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const anchor = target.closest('a[href*="wa.me"]');
    if (!anchor) return;
    lastAnchorTrackAt = Date.now();
    trackEvent('whatsapp_redirect', { location: locationFromWhatsappAnchor(anchor) });
  }, true);
}
