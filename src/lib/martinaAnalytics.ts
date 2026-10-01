import { trackEvent } from './analytics.ts';
import {
  markPhoneLeadTracked,
  markWhatsappLeadTracked,
  markWhatsappRedirectTracked,
  phoneAnchorTrackedJustNow,
  whatsappAnchorTrackedJustNow,
  whatsappLeadTrackedJustNow,
} from './whatsappTracking.ts';

export type MartinaTrackPayload = {
  event?: unknown;
  method?: unknown;
  location?: unknown;
  interaction_type?: unknown;
  phone_number?: unknown;
  link_url?: unknown;
  [key: string]: unknown;
};

export type MartinaBridgeAction =
  | { kind: 'whatsapp_redirect' }
  | { kind: 'forward'; payload: Record<string, unknown> };

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function plainPayload(payload: MartinaTrackPayload): Record<string, unknown> {
  const copy: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined) copy[key] = value;
  }
  return copy;
}

/**
 * Traduce el aviso del widget.
 * `generate_lead` y `martina_open` se reenvían tal cual.
 * `live_voice_whatsapp_clicked` sigue siendo el `whatsapp_redirect` legacy.
 * Un `generate_lead` de WhatsApp también deja ese legacy, y el despacho lo deduplica.
 */
export function analyticsFromMartinaPayload(
  payload: MartinaTrackPayload | null | undefined,
): MartinaBridgeAction[] {
  if (!payload || typeof payload !== 'object') return [];

  const event = asString(payload.event);
  if (event === 'live_voice_whatsapp_clicked') {
    return [{ kind: 'whatsapp_redirect' }];
  }

  if (event !== 'generate_lead' && event !== 'martina_open') return [];

  const actions: MartinaBridgeAction[] = [{ kind: 'forward', payload: plainPayload(payload) }];
  if (event === 'generate_lead' && payload.method === 'whatsapp') {
    actions.push({ kind: 'whatsapp_redirect' });
  }
  return actions;
}

function pushForward(payload: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}

/** Escribe en dataLayer lo que el widget entregó, sin repetir el clic que la homepage ya midió. */
export function dispatchMartinaTrackPayload(payload: MartinaTrackPayload | null | undefined): void {
  if (!payload || typeof payload !== 'object') return;

  const event = asString(payload.event);
  const method = payload.method;
  if (event === 'generate_lead' && method === 'whatsapp' && whatsappLeadTrackedJustNow()) return;
  if (event === 'generate_lead' && method === 'phone' && phoneAnchorTrackedJustNow()) return;

  for (const action of analyticsFromMartinaPayload(payload)) {
    switch (action.kind) {
      case 'forward':
        pushForward(action.payload);
        if (event === 'generate_lead' && method === 'whatsapp') markWhatsappLeadTracked();
        if (event === 'generate_lead' && method === 'phone') markPhoneLeadTracked();
        break;
      case 'whatsapp_redirect':
        if (whatsappAnchorTrackedJustNow()) break;
        markWhatsappRedirectTracked();
        trackEvent('whatsapp_redirect', { location: 'martina_widget' });
        break;
      default: {
        const exhaustive: never = action;
        void exhaustive;
      }
    }
  }
}
