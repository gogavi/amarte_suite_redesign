import { supabase } from '../lib/supabaseClient';

const DEFAULT_WHATSAPP_NUMBER = '573007416683';
const WOMPI_CHECKOUT_ORIGIN = 'https://checkout.wompi.co/';

export type WompiCheckoutResult = {
  checkoutUrl: string;
};

/** Crea un Web Checkout Wompi firmado en servidor para la reserva ya insertada. */
export async function createWompiCheckout(
  reservationId: string,
): Promise<WompiCheckoutResult> {
  const { data, error } = await supabase.functions.invoke('create-wompi-payment', {
    body: { reservationId },
  });

  if (error) {
    throw new Error('No se pudo iniciar el pago. Intenta de nuevo.');
  }

  const checkoutUrl = typeof data?.checkoutUrl === 'string' ? data.checkoutUrl.trim() : '';
  if (!checkoutUrl.startsWith(WOMPI_CHECKOUT_ORIGIN)) {
    throw new Error('No se pudo iniciar el pago. Intenta de nuevo.');
  }

  return { checkoutUrl };
}

/** Línea de WhatsApp reservas — indicada para el botón de WhatsApp del formulario. */
export function getWhatsappReservasNumber(): string {
  const fromEnv = String(import.meta.env.VITE_WHATSAPP_RESERVAS || '').trim().replace(/\D/g, '');
  return fromEnv || DEFAULT_WHATSAPP_NUMBER;
}

export function buildWhatsappReservasUrl(message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${getWhatsappReservasNumber()}?text=${encoded}`;
}

export type WhatsappReservationPayload = {
  name: string;
  document?: string;
  clientWhatsapp: string;
  email?: string;
  suiteName: string;
  packName: string;
  dateIso: string;
  timeLabel: string;
  price: number;
};

function formatDateForWhatsapp(dateIso: string): string {
  const [year, month, day] = dateIso.split('-').map(Number);
  if (!year || !month || !day) return dateIso;

  const date = new Date(year, month - 1, day);
  const formatted = new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);

  return `${formatted} (${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year})`;
}

function formatPriceForWhatsapp(price: number): string {
  return `$${Math.round(price).toLocaleString('es-CO')} COP`;
}

/** Mensaje claro con todos los datos del formulario para atención de la reserva. */
export function buildWhatsappReservationMessage(payload: WhatsappReservationPayload): string {
  const lines = [
    '🪐 *NUEVA PRE-RESERVA WEB — AMARTE SUITE*',
    '',
    '*Datos del cliente*',
    `• Nombre: ${payload.name.trim()}`,
    `• WhatsApp del cliente: ${payload.clientWhatsapp.trim()}`,
  ];

  const document = payload.document?.trim();
  if (document) {
    lines.push(`• Cédula: ${document}`);
  }

  const email = payload.email?.trim();
  if (email) {
    lines.push(`• Correo: ${email}`);
  }

  lines.push(
    '',
    '*Detalle de la reserva*',
    `• Suite: ${payload.suiteName}`,
    `• Pack / estadía: ${payload.packName}`,
    `• Fecha: ${formatDateForWhatsapp(payload.dateIso)}`,
    `• Hora aproximada: ${payload.timeLabel}`,
    `• Valor estimado: ${formatPriceForWhatsapp(payload.price)}`,
    '',
    '*Canal:* Web Automático',
    '',
    'Por favor confirmen disponibilidad y guía de pago. Gracias.',
  );

  return lines.join('\n');
}
