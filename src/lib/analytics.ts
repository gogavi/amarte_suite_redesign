/** Eventos de conversión / embudo para GTM → Google Ads / GA4 */
export type AnalyticsEventName =
  | 'pre_reserva_submit'
  | 'whatsapp_redirect'
  | 'checkout_init'
  | 'martina_open'
  | 'martina_chat_start'
  | 'reserva_form_open';

export type AnalyticsEventParams = {
  location?: string;
  suite_name?: string;
  plan_name?: string;
  method?: 'wompi' | 'whatsapp';
  value?: number;
  currency?: string;
  transaction_id?: string;
  interaction_type?: 'text' | 'voice';
  hours?: string;
  estimated_value?: number;
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
  params: AnalyticsEventParams = {}
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
