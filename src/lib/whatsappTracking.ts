import { trackEvent, trackGenerateLeadPhone, trackGenerateLeadWhatsapp } from './analytics.ts';
import { eventsForLeadAnchor } from './leadClicks.ts';

const DEDUPE_MS = 400;
let lastAnchorTrackAt = 0;
let lastPhoneTrackAt = 0;
let lastWhatsappLeadAt = 0;

export function whatsappAnchorTrackedJustNow(now = Date.now()): boolean {
  return now - lastAnchorTrackAt < DEDUPE_MS;
}

export function phoneAnchorTrackedJustNow(now = Date.now()): boolean {
  return now - lastPhoneTrackAt < DEDUPE_MS;
}

export function whatsappLeadTrackedJustNow(now = Date.now()): boolean {
  return now - lastWhatsappLeadAt < DEDUPE_MS;
}

export function markWhatsappRedirectTracked(now = Date.now()): void {
  lastAnchorTrackAt = now;
}

export function markPhoneLeadTracked(now = Date.now()): void {
  lastPhoneTrackAt = now;
}

export function markWhatsappLeadTracked(now = Date.now()): void {
  lastWhatsappLeadAt = now;
}

export function resetLeadClickDedupeForTests(): void {
  lastAnchorTrackAt = 0;
  lastPhoneTrackAt = 0;
  lastWhatsappLeadAt = 0;
}

type MeasuredClick = {
  __amarteMeasuredEvent?: string;
};

export function applyMeasuredLeadClick(anchor: {
  getAttribute: (name: string) => string | null;
  classList: { contains: (token: string) => boolean };
}, nativeEvent?: object): boolean {
  const events = eventsForLeadAnchor(anchor);
  if (!events.length) return false;

  const hasWhatsapp = events.some((item) => item.event === 'whatsapp_redirect');
  const hasWhatsappLead = events.some((item) => item.event === 'generate_lead' && item.method === 'whatsapp');
  const hasPhone = events.some((item) => item.event === 'generate_lead' && item.method === 'phone');
  if (hasWhatsapp) markWhatsappRedirectTracked();
  if (hasWhatsappLead) markWhatsappLeadTracked();
  if (hasPhone) markPhoneLeadTracked();
  if (nativeEvent && (hasWhatsappLead || hasPhone)) {
    (nativeEvent as MeasuredClick).__amarteMeasuredEvent = 'generate_lead';
  }

  for (const item of events) {
    switch (item.event) {
      case 'whatsapp_redirect':
        trackEvent('whatsapp_redirect', { location: item.location });
        break;
      case 'generate_lead':
        if (item.method === 'whatsapp') {
          trackGenerateLeadWhatsapp({ location: item.location, linkUrl: item.link_url });
          break;
        }
        trackGenerateLeadPhone({ location: item.location, phoneNumber: item.phone_number });
        break;
      default: {
        const exhaustive: never = item;
        void exhaustive;
      }
    }
  }

  return true;
}

/** Un clic en WhatsApp o `tel:`, incluidos los del widget. Marca el evento para que el widget no lo repita. */
export function installWhatsappRedirectTracking(): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  const flagged = window as Window & { __amarteWaClickTracked?: boolean };
  if (flagged.__amarteWaClickTracked) return;
  flagged.__amarteWaClickTracked = true;
  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const anchor = target.closest('a');
    if (!anchor) return;
    applyMeasuredLeadClick(anchor, event);
  }, true);
}
