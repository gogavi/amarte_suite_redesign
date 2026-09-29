export type MartinaTrackPayload = {
  event?: unknown;
};

export function analyticsFromMartinaPayload(
  payload: MartinaTrackPayload | null | undefined,
): { event: 'whatsapp_redirect'; location: 'martina_widget' } | null {
  if (!payload || payload.event !== 'live_voice_whatsapp_clicked') return null;
  return { event: 'whatsapp_redirect', location: 'martina_widget' };
}
