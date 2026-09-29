import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import {
  decideExpressPurchase,
  isUuid,
  isWompiTransactionId,
  parseWompiTransactionPayload,
  type ExpressPurchaseVerdict,
  type StoredReservationPayment,
  type WompiTxView,
} from '../_shared/wompi.ts';

type ReservationRow = {
  id: string;
  canal: string;
  forma_pago: string | null;
  precio: string;
  payment_status: string | null;
  paid_amount: number | string | null;
};

function asCop(value: number | string | null): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function toStored(row: ReservationRow): StoredReservationPayment {
  return {
    id: row.id,
    precio: row.precio,
    paymentStatus: row.payment_status,
    paidAmount: asCop(row.paid_amount),
  };
}

async function fetchWompiTransaction(
  apiBase: string,
  publicKey: string,
  transactionId: string,
): Promise<WompiTxView | null> {
  const url = `${apiBase.replace(/\/$/, '')}/transactions/${encodeURIComponent(transactionId)}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${publicKey}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    console.error('express-purchase-status: transaction fetch failed', response.status);
    return null;
  }

  return parseWompiTransactionPayload(await response.json());
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ ok: false, confirmed: false, error: 'Método no permitido.' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('express-purchase-status: missing supabase env');
    return jsonResponse({ ok: false, confirmed: false, error: 'No pudimos consultar el pago.' }, 500);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ ok: false, confirmed: false, error: 'Solicitud inválida.' }, 400);
  }

  const reservationId = typeof body === 'object' && body && 'reservationId' in body
    ? String((body as { reservationId: unknown }).reservationId ?? '').trim()
    : '';
  const rawTransactionId = typeof body === 'object' && body && 'transactionId' in body
    ? String((body as { transactionId: unknown }).transactionId ?? '').trim()
    : '';

  if (!isUuid(reservationId)) {
    return jsonResponse({ ok: false, confirmed: false, error: 'Reserva inválida.' }, 400);
  }

  const transactionId = rawTransactionId && isWompiTransactionId(rawTransactionId)
    ? rawTransactionId
    : '';

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: reservation, error: readError } = await supabase
    .from('reservations')
    .select('id, canal, forma_pago, precio, payment_status, paid_amount')
    .eq('id', reservationId)
    .maybeSingle<ReservationRow>();

  if (readError) {
    console.error('express-purchase-status: reservation read failed');
    return jsonResponse({ ok: false, confirmed: false, error: 'No pudimos consultar el pago.' }, 500);
  }

  if (!reservation) {
    return jsonResponse({ ok: false, confirmed: false, error: 'Reserva no encontrada.' }, 404);
  }

  if (reservation.canal !== 'Web Automático' || reservation.forma_pago !== 'Pago total') {
    return jsonResponse({ ok: false, confirmed: false, error: 'Esta reserva no admite pago en línea.' }, 403);
  }

  let wompi: WompiTxView | null = null;
  if (reservation.payment_status !== 'approved' && transactionId) {
    const publicKey = Deno.env.get('WOMPI_PUBLIC_KEY') ?? '';
    const apiBase = Deno.env.get('WOMPI_API_BASE') ?? '';
    if (!publicKey || !apiBase) {
      console.error('express-purchase-status: missing wompi env');
      return jsonResponse({ ok: false, confirmed: false, error: 'No pudimos consultar el pago.' }, 500);
    }
    wompi = await fetchWompiTransaction(apiBase, publicKey, transactionId);
  }

  const verdict = decideExpressPurchase(toStored(reservation), wompi);
  return applyVerdict(supabase, reservation, verdict);
});

async function applyVerdict(
  supabase: ReturnType<typeof createClient>,
  reservation: ReservationRow,
  verdict: ExpressPurchaseVerdict,
): Promise<Response> {
  switch (verdict.action) {
    case 'return':
      return jsonResponse({
        ok: true,
        confirmed: true,
        value: verdict.value,
        currency: 'COP',
        transaction_id: verdict.transactionId,
      });
    case 'wait':
      return jsonResponse({
        ok: true,
        confirmed: false,
        payment_status: 'pending',
      });
    case 'approve':
      return writePayment(supabase, reservation.id, {
        payment_status: 'approved',
        payment_reference: verdict.wompiTransactionId,
        paid_amount: verdict.value,
        paid_at: new Date().toISOString(),
      }, {
        confirmedValue: verdict.value,
        transactionId: verdict.transactionId,
      });
    case 'mark_mismatch':
      return writePayment(supabase, reservation.id, {
        payment_status: 'amount_mismatch',
        payment_reference: verdict.wompiTransactionId,
      }, { terminalStatus: 'amount_mismatch' });
    case 'mark_failure':
      return writePayment(supabase, reservation.id, {
        payment_status: verdict.status,
        payment_reference: verdict.wompiTransactionId,
      }, { terminalStatus: verdict.status });
    default: {
      const exhaustive: never = verdict;
      console.error('express-purchase-status: verdict no manejado', exhaustive);
      return jsonResponse({ ok: false, confirmed: false, error: 'No pudimos consultar el pago.' }, 500);
    }
  }
}

async function writePayment(
  supabase: ReturnType<typeof createClient>,
  reservationId: string,
  patch: Record<string, unknown>,
  outcome: { confirmedValue?: number; transactionId?: string; terminalStatus?: string },
): Promise<Response> {
  const { data: updated, error: updateError } = await supabase
    .from('reservations')
    .update(patch)
    .eq('id', reservationId)
    .or('payment_status.is.null,payment_status.neq.approved')
    .select('id, precio, payment_status, paid_amount')
    .maybeSingle<Pick<ReservationRow, 'id' | 'precio' | 'payment_status' | 'paid_amount'>>();

  if (updateError) {
    console.error('express-purchase-status: update failed');
    return jsonResponse({ ok: false, confirmed: false, error: 'No pudimos consultar el pago.' }, 500);
  }

  if (!updated) {
    const { data: current, error: rereadError } = await supabase
      .from('reservations')
      .select('id, precio, payment_status, paid_amount')
      .eq('id', reservationId)
      .maybeSingle<Pick<ReservationRow, 'id' | 'precio' | 'payment_status' | 'paid_amount'>>();

    if (rereadError || !current) {
      console.error('express-purchase-status: reread failed');
      return jsonResponse({ ok: false, confirmed: false, error: 'No pudimos consultar el pago.' }, 500);
    }

    const again = decideExpressPurchase(toStored({
      ...current,
      canal: 'Web Automático',
      forma_pago: 'Pago total',
    }), null);

    if (again.action === 'return') {
      return jsonResponse({
        ok: true,
        confirmed: true,
        value: again.value,
        currency: 'COP',
        transaction_id: again.transactionId,
      });
    }

    return jsonResponse({
      ok: true,
      confirmed: false,
      payment_status: current.payment_status ?? 'pending',
    });
  }

  if (outcome.confirmedValue && outcome.transactionId && updated.payment_status === 'approved') {
    return jsonResponse({
      ok: true,
      confirmed: true,
      value: outcome.confirmedValue,
      currency: 'COP',
      transaction_id: outcome.transactionId,
    });
  }

  return jsonResponse({
    ok: true,
    confirmed: false,
    payment_status: outcome.terminalStatus ?? updated.payment_status ?? 'pending',
  });
}
