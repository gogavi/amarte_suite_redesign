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
