import {
  locationFromTelAnchor,
  locationFromWhatsappAnchor,
  phoneNumberFromTelHref,
  whatsappLinkUrlForAnalytics,
} from './whatsappLocation.ts';

type AnchorLike = {
  getAttribute: (name: string) => string | null;
  classList: { contains: (token: string) => boolean };
};

export type LeadClickEvent =
  | { event: 'whatsapp_redirect'; location: string }
  | { event: 'generate_lead'; method: 'whatsapp'; location: string; link_url: string }
  | { event: 'generate_lead'; method: 'phone'; location: string; phone_number: string };

function isWhatsappHref(href: string): boolean {
  return href.includes('wa.me')
    || href.includes('api.whatsapp.com')
    || href.includes('whatsapp.com/send');
}

/** Clic en WhatsApp (legacy + generate_lead) o en tel:. */
export function eventsForLeadAnchor(anchor: AnchorLike): LeadClickEvent[] {
  const href = (anchor.getAttribute('href') ?? '').trim();
  if (!href) return [];

  if (isWhatsappHref(href)) {
    const location = locationFromWhatsappAnchor(anchor);
    return [
      { event: 'whatsapp_redirect', location },
      { event: 'generate_lead', method: 'whatsapp', location, link_url: whatsappLinkUrlForAnalytics(href) },
    ];
  }

  if (/^tel:/i.test(href)) {
    const phoneNumber = phoneNumberFromTelHref(href);
    if (!phoneNumber) return [];
    return [{
      event: 'generate_lead',
      method: 'phone',
      location: locationFromTelAnchor(anchor),
      phone_number: phoneNumber,
    }];
  }

  return [];
}
