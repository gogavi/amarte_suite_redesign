import { whatsappLinkUrlForAnalytics } from './whatsappLocation.ts';

/** Eventos de conversión / embudo para GTM → Google Ads / GA4.
 * Los legacy (`pre_reserva_submit`, `whatsapp_redirect`, `purchase`) siguen
 * empujándose: el contenedor publicado los escucha. Los demás se añaden en paralelo.
 */

export type LegacyAnalyticsEventName =
  | 'pre_reserva_submit'
  | 'whatsapp_redirect'
  | 'checkout_init'
  | 'martina_chat_start'
  | 'reserva_form_open';

export type SpecAnalyticsEventName =
  | 'generate_lead'
  | 'martina_open'
  | 'view_item_list'
  | 'begin_checkout'
  | 'add_payment_info'
  | 'purchase';

export type AnalyticsEventName = LegacyAnalyticsEventName | SpecAnalyticsEventName;

export type LeadMethod = 'whatsapp' | 'phone' | 'reserva';
export type TipoPago = 'sin_pago' | 'abono_50' | 'total_100';
export type PaidTipoPago = 'abono_50' | 'total_100';
export type MartinaOpenLocation = 'hero' | 'launcher' | 'seccion';
export type MartinaInteraction = 'text' | 'voice';
export type CheckoutLocation = 'reserva_express' | 'reservas' | 'header';
export type SuiteListLocation = 'www' | 'reservas';
export type ReservationMethod = 'wompi' | 'whatsapp';

export type AnalyticsEventParams = {
  location?: string;
  suite_name?: string;
  plan_name?: string;
  method?: ReservationMethod | LeadMethod;
  value?: number;
  currency?: string;
  transaction_id?: string;
  interaction_type?: MartinaInteraction;
  hours?: string;
  estimated_value?: number;
  tipo_pago?: TipoPago;
  reservation_total?: number;
  link_url?: string;
  phone_number?: string;
  item_list_name?: string;
  payment_type?: 'wompi';
};

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

const GTM_ID_PATTERN = /^GTM-[A-Z0-9]+$/i;

function getGtmId(): string {
  return String(import.meta.env.VITE_GTM_ID || '').trim();
}

/** Inicializa dataLayer y carga el contenedor GTM si hay `VITE_GTM_ID`. */
export function initGoogleTagManager(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  window.dataLayer = window.dataLayer || [];

  const id = getGtmId();
  if (!id || !GTM_ID_PATTERN.test(id)) return;
  if (document.querySelector(`script[data-gtm-id="${id}"]`)) return;

  window.dataLayer.push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js',
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`;
  script.setAttribute('data-gtm-id', id);
  document.head.appendChild(script);

  const noscript = document.createElement('noscript');
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(id)}`;
  iframe.height = '0';
  iframe.width = '0';
  iframe.style.display = 'none';
  iframe.style.visibility = 'hidden';
  iframe.title = 'Google Tag Manager';
  noscript.appendChild(iframe);
  document.body.insertBefore(noscript, document.body.firstChild);
}

/** Empuja un evento al dataLayer para que GTM dispare tags de Ads/GA4. */
export function trackEvent(
  event: AnalyticsEventName,
  params: AnalyticsEventParams = {},
): void {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];

  const payload: Record<string, unknown> = { event };
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      payload[key] = value;
    }
  }

  window.dataLayer.push(payload);
}

export function tipoPagoForReservationMethod(method: ReservationMethod): TipoPago {
  switch (method) {
    case 'wompi':
      return 'total_100';
    case 'whatsapp':
      return 'sin_pago';
    default: {
      const exhaustive: never = method;
      return exhaustive;
    }
  }
}

export function trackGenerateLeadWhatsapp(params: { location: string; linkUrl?: string }): void {
  const location = params.location.trim();
  if (!location) return;
  const linkUrl = params.linkUrl?.trim();
  trackEvent('generate_lead', {
    method: 'whatsapp',
    location,
    link_url: linkUrl ? whatsappLinkUrlForAnalytics(linkUrl) : undefined,
  });
}

export function trackGenerateLeadPhone(params: { location: string; phoneNumber: string }): void {
  const location = params.location.trim();
  const phoneNumber = params.phoneNumber.replace(/\D/g, '');
  if (!location || !phoneNumber) return;
  trackEvent('generate_lead', {
    method: 'phone',
    location,
    phone_number: phoneNumber,
  });
}

export function trackGenerateLeadReserva(params: {
  transactionId: string;
  tipoPago: TipoPago;
}): void {
  const transactionId = params.transactionId.trim();
  if (!transactionId) return;
  trackEvent('generate_lead', {
    method: 'reserva',
    transaction_id: transactionId,
    currency: 'COP',
    value: 0,
    tipo_pago: params.tipoPago,
  });
}

export function trackMartinaOpen(
  params: { location: MartinaOpenLocation; interactionType: MartinaInteraction },
): void {
  trackEvent('martina_open', {
    location: params.location,
    interaction_type: params.interactionType,
  });
}

export function trackViewItemListSuites(location: SuiteListLocation): void {
  trackEvent('view_item_list', {
    item_list_name: 'suites',
    location,
  });
}

export function trackBeginCheckout(location: CheckoutLocation): void {
  trackEvent('begin_checkout', {
    location,
    currency: 'COP',
    value: 0,
  });
}

export function trackAddPaymentInfo(params: {
  transactionId: string;
  value: number;
  tipoPago: PaidTipoPago;
}): void {
  const transactionId = params.transactionId.trim();
  if (!transactionId) return;
  if (!Number.isFinite(params.value) || params.value <= 0) return;
  trackEvent('add_payment_info', {
    transaction_id: transactionId,
    currency: 'COP',
    value: Math.round(params.value),
    tipo_pago: params.tipoPago,
    payment_type: 'wompi',
  });
}
