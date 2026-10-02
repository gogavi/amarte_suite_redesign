type AnchorLike = {
  getAttribute: (name: string) => string | null;
  classList: { contains: (token: string) => boolean };
};

export function locationFromWhatsappAnchor(anchor: AnchorLike): string {
  const explicit = anchor.getAttribute('data-wa-location');
  if (explicit && explicit.trim()) return explicit.trim();
  if (anchor.classList.contains('amarte-opt-link')) return 'martina_widget';
  return 'site';
}

export function locationFromTelAnchor(anchor: AnchorLike): string {
  const explicit = anchor.getAttribute('data-tel-location') || anchor.getAttribute('data-wa-location');
  if (explicit && explicit.trim()) return explicit.trim();
  if (anchor.classList.contains('amarte-opt-link')) return 'martina_widget';
  return 'contacto';
}

export function phoneNumberFromTelHref(href: string): string {
  const withoutScheme = href.replace(/^tel:/i, '').split('?')[0] ?? '';
  return withoutScheme.replace(/\D/g, '');
}

/** Quita el mensaje prellenado (`text`) para no mandar datos del cliente al dataLayer. */
export function whatsappLinkUrlForAnalytics(href: string): string {
  const trimmed = href.trim();
  try {
    const url = new URL(trimmed);
    url.searchParams.delete('text');
    url.hash = '';
    return url.toString();
  } catch {
    return trimmed.split('?')[0] || trimmed;
  }
}
