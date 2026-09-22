import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import {
  buildWompiCheckoutUrl,
  colombianLocalPhone,
  integritySignature,
  isUuid,
  pesosToCents,
  sha256Hex,
} from '../_shared/wompi.ts';

const RATE_WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS_PER_RESERVATION = 5;
const MAX_ATTEMPTS_PER_IP = 30;

type ReservationRow = {
  id: string;
  canal: string;
  forma_pago: string | null;
  precio: string;
  payment_status: string | null;
  correo: string | null;
  nombre: string | null;
  whatsapp: string | null;
  documento: string | null;
};

function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for') ?? '';
  const first = forwarded.split(',')[0]?.trim();
  return first || 'unknown';
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Método no permitido.' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const publicKey = Deno.env.get('WOMPI_PUBLIC_KEY') ?? '';
  const integritySecret = Deno.env.get('WOMPI_INTEGRITY_SECRET') ?? '';
  const redirectUrl = Deno.env.get('WOMPI_REDIRECT_URL') ?? '';

  if (!supabaseUrl || !serviceRoleKey || !publicKey || !integritySecret || !redirectUrl) {
    console.error('create-wompi-payment: missing required env');
    return jsonResponse({ error: 'Pago no disponible.' }, 500);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Solicitud inválida.' }, 400);
  }

  const reservationId = typeof body === 'object' && body && 'reservationId' in body
    ? String((body as { reservationId: unknown }).reservationId ?? '').trim()
    : '';

  if (!isUuid(reservationId)) {
    return jsonResponse({ error: 'Reserva inválida.' }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const ipHash = await sha256Hex(clientIp(req));
  const windowStart = new Date(Date.now() - RATE_WINDOW_MS).toISOString();

  const [byReservation, byIp] = await Promise.all([
    supabase
      .from('wompi_checkout_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('reservation_id', reservationId)
      .gte('created_at', windowStart),
    supabase
      .from('wompi_checkout_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', windowStart),
  ]);

  if (
    (byReservation.count ?? 0) >= MAX_ATTEMPTS_PER_RESERVATION
    || (byIp.count ?? 0) >= MAX_ATTEMPTS_PER_IP
  ) {
    return jsonResponse({ error: 'Demasiados intentos de pago. Espera unos minutos.' }, 429);
  }

  const { error: attemptError } = await supabase.from('wompi_checkout_attempts').insert({
    reservation_id: reservationId,
    ip_hash: ipHash,
  });

  if (attemptError) {
    console.error('create-wompi-payment: rate-limit insert failed');
    return jsonResponse({ error: 'Pago no disponible.' }, 500);
  }

  const { data: reservation, error: readError } = await supabase
    .from('reservations')
    .select('id, canal, forma_pago, precio, payment_status, correo, nombre, whatsapp, documento')
    .eq('id', reservationId)
    .maybeSingle<ReservationRow>();

  if (readError) {
    console.error('create-wompi-payment: reservation read failed');
    return jsonResponse({ error: 'Pago no disponible.' }, 500);
  }

  if (!reservation) {
    return jsonResponse({ error: 'Reserva no encontrada.' }, 404);
  }

  if (reservation.canal !== 'Web Automático' || reservation.forma_pago !== 'Pago total') {
    return jsonResponse({ error: 'Esta reserva no admite pago en línea.' }, 403);
  }

  if (reservation.payment_status === 'approved') {
    return jsonResponse({ error: 'Esta reserva ya está pagada.' }, 409);
  }

  const amountInCents = pesosToCents(reservation.precio);
  if (amountInCents === null) {
    console.error('create-wompi-payment: invalid stored price');
    return jsonResponse({ error: 'El monto de la reserva no es válido.' }, 422);
  }

  const signature = await integritySignature({
    reference: reservation.id,
    amountInCents,
    currency: 'COP',
    integritySecret,
  });

  if (reservation.payment_status !== 'pending') {
    const { error: pendingError } = await supabase
      .from('reservations')
      .update({ payment_status: 'pending' })
      .eq('id', reservation.id)
      .or('payment_status.is.null,payment_status.neq.approved');

    if (pendingError) {
      console.error('create-wompi-payment: could not mark pending');
    }
  }

  const checkoutUrl = buildWompiCheckoutUrl({
    publicKey,
    amountInCents,
    reference: reservation.id,
    integritySignature: signature,
    redirectUrl,
    customerEmail: reservation.correo?.trim() || undefined,
    customerFullName: reservation.nombre?.trim() || undefined,
    customerPhone: colombianLocalPhone(reservation.whatsapp ?? ''),
    customerLegalId: reservation.documento?.replace(/\D/g, '') || undefined,
  });

  console.log('create-wompi-payment: checkout issued', reservation.id);
  return jsonResponse({ checkoutUrl });
});
