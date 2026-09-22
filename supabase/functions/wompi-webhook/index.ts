import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';
import {
  eventChecksum,
  isUuid,
  pesosToCents,
  timingSafeEqualHex,
} from '../_shared/wompi.ts';

type WompiEvent = {
  event?: string;
  environment?: string;
  timestamp?: number;
  data?: unknown;
  signature?: {
    properties?: unknown;
    checksum?: string;
  };
};

type WompiTransaction = {
  id: string;
  status: string;
  amount_in_cents: number;
  reference: string;
  currency?: string;
};

const FINAL_FAILURE = new Set(['declined', 'voided', 'error']);

function providedChecksum(req: Request, payload: WompiEvent): string {
  const header = req.headers.get('x-event-checksum')?.trim() ?? '';
  const body = typeof payload.signature?.checksum === 'string'
    ? payload.signature.checksum.trim()
    : '';

  if (header && body && !timingSafeEqualHex(header, body)) {
    return '';
  }

  return header || body;
}

function asPropertyList(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  if (!value.every((item) => typeof item === 'string' && item.length > 0)) return null;
  return value;
}

async function fetchWompiTransaction(
  apiBase: string,
  publicKey: string,
  transactionId: string,
): Promise<WompiTransaction | null> {
  const url = `${apiBase.replace(/\/$/, '')}/transactions/${encodeURIComponent(transactionId)}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${publicKey}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    console.error('wompi-webhook: transaction fetch failed', response.status);
    return null;
  }

  const json = await response.json() as { data?: Partial<WompiTransaction> };
  const data = json.data;
  if (
    !data
    || typeof data.id !== 'string'
    || typeof data.status !== 'string'
    || typeof data.reference !== 'string'
    || typeof data.amount_in_cents !== 'number'
  ) {
    return null;
  }

  return {
    id: data.id,
    status: data.status,
    amount_in_cents: data.amount_in_cents,
    reference: data.reference,
    currency: data.currency,
  };
}

async function markEvent(
  supabase: SupabaseClient,
  eventId: number | null,
  note: string,
): Promise<void> {
  if (eventId === null) return;
  await supabase
    .from('wompi_webhook_events')
    .update({ processing_note: note })
    .eq('id', eventId);
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200 });
  }

  if (req.method !== 'POST') {
    return new Response('method not allowed', { status: 405 });
  }

  const eventsSecret = Deno.env.get('WOMPI_EVENTS_SECRET') ?? '';
  const publicKey = Deno.env.get('WOMPI_PUBLIC_KEY') ?? '';
  const apiBase = Deno.env.get('WOMPI_API_BASE') ?? '';
  const expectedEnv = Deno.env.get('WOMPI_ENV') ?? '';
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  if (!eventsSecret || !publicKey || !apiBase || !expectedEnv || !supabaseUrl || !serviceRoleKey) {
    console.error('wompi-webhook: missing required env');
    return new Response('misconfigured', { status: 500 });
  }

  let payload: WompiEvent;
  try {
    payload = await req.json() as WompiEvent;
  } catch {
    return new Response('invalid json', { status: 400 });
  }

  const properties = asPropertyList(payload.signature?.properties);
  const timestamp = payload.timestamp;
  const checksum = providedChecksum(req, payload);

  if (!properties || typeof timestamp !== 'number' || !checksum) {
    return new Response('invalid signature', { status: 401 });
  }

  const computed = await eventChecksum({
    data: payload.data,
    properties,
    timestamp,
    eventsSecret,
  });

  if (!computed || !timingSafeEqualHex(computed, checksum)) {
    return new Response('invalid signature', { status: 401 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const txPreview = payload.data && typeof payload.data === 'object'
    ? (payload.data as { transaction?: Record<string, unknown> }).transaction
    : undefined;

  const insertRow = {
    checksum: checksum.toLowerCase(),
    event_name: payload.event ?? null,
    environment: payload.environment ?? null,
    transaction_id: typeof txPreview?.id === 'string' ? txPreview.id : null,
    transaction_status: typeof txPreview?.status === 'string' ? txPreview.status : null,
    reference: typeof txPreview?.reference === 'string' ? txPreview.reference : null,
    amount_in_cents: typeof txPreview?.amount_in_cents === 'number' ? txPreview.amount_in_cents : null,
    payload,
    processing_note: 'received',
  };

  const { data: inserted, error: insertError } = await supabase
    .from('wompi_webhook_events')
    .insert(insertRow)
    .select('id, processing_note')
    .single<{ id: number; processing_note: string | null }>();

  let eventId: number | null = inserted?.id ?? null;
  let alreadyApplied = false;

  if (insertError) {
    if (insertError.code !== '23505') {
      console.error('wompi-webhook: audit insert failed');
      return new Response('audit failed', { status: 500 });
    }

    const { data: existing } = await supabase
      .from('wompi_webhook_events')
      .select('id, processing_note')
      .eq('checksum', insertRow.checksum)
      .maybeSingle<{ id: number; processing_note: string | null }>();

    if (!existing) {
      return new Response('ok', { status: 200 });
    }

    eventId = existing.id;
    if (existing.processing_note === 'applied') {
      alreadyApplied = true;
    }
  }

  if (alreadyApplied) {
    return new Response('ok', { status: 200 });
  }

  if (payload.event !== 'transaction.updated') {
    await markEvent(supabase, eventId, 'ignored_event_type');
    return new Response('ok', { status: 200 });
  }

  if (payload.environment !== expectedEnv) {
    console.log('wompi-webhook: environment mismatch', payload.environment);
    await markEvent(supabase, eventId, 'ignored_environment');
    return new Response('ok', { status: 200 });
  }

  const signedId = typeof txPreview?.id === 'string' ? txPreview.id : '';
  if (!signedId) {
    await markEvent(supabase, eventId, 'missing_transaction_id');
    return new Response('ok', { status: 200 });
  }

  const transaction = await fetchWompiTransaction(apiBase, publicKey, signedId);
  if (!transaction) {
    await markEvent(supabase, eventId, 'fetch_failed');
    return new Response('upstream failed', { status: 500 });
  }

  if (!isUuid(transaction.reference)) {
    await markEvent(supabase, eventId, 'invalid_reference');
    return new Response('ok', { status: 200 });
  }

  const { data: reservation, error: readError } = await supabase
    .from('reservations')
    .select('id, precio, payment_status')
    .eq('id', transaction.reference)
    .maybeSingle<{ id: string; precio: string; payment_status: string | null }>();

  if (readError) {
    console.error('wompi-webhook: reservation read failed');
    await markEvent(supabase, eventId, 'reservation_read_failed');
    return new Response('db failed', { status: 500 });
  }

  if (!reservation) {
    console.log('wompi-webhook: reservation not found', transaction.reference);
    await markEvent(supabase, eventId, 'reservation_not_found');
    return new Response('ok', { status: 200 });
  }

  const status = transaction.status.toUpperCase();
  console.log('wompi-webhook: transaction', transaction.reference, status);

  if (reservation.payment_status === 'approved') {
    await markEvent(supabase, eventId, 'applied');
    return new Response('ok', { status: 200 });
  }

  if (status === 'APPROVED') {
    const expectedCents = pesosToCents(reservation.precio);
    if (expectedCents === null || expectedCents !== transaction.amount_in_cents) {
      const { error: mismatchError } = await supabase
        .from('reservations')
        .update({
          payment_status: 'amount_mismatch',
          payment_reference: transaction.id,
        })
        .eq('id', reservation.id)
        .or('payment_status.is.null,payment_status.neq.approved');

      if (mismatchError) {
        await markEvent(supabase, eventId, 'update_failed');
        return new Response('db failed', { status: 500 });
      }

      await markEvent(supabase, eventId, 'amount_mismatch');
      return new Response('ok', { status: 200 });
    }

    const paidAmount = expectedCents / 100;
    const { error: approveError } = await supabase
      .from('reservations')
      .update({
        payment_status: 'approved',
        payment_reference: transaction.id,
        paid_amount: paidAmount,
        paid_at: new Date().toISOString(),
      })
      .eq('id', reservation.id)
      .or('payment_status.is.null,payment_status.neq.approved');

    if (approveError) {
      console.error('wompi-webhook: approve update failed');
      await markEvent(supabase, eventId, 'update_failed');
      return new Response('db failed', { status: 500 });
    }

    await markEvent(supabase, eventId, 'applied');
    return new Response('ok', { status: 200 });
  }

  const lowered = status.toLowerCase();
  if (FINAL_FAILURE.has(lowered)) {
    const { error: failError } = await supabase
      .from('reservations')
      .update({
        payment_status: lowered,
        payment_reference: transaction.id,
      })
      .eq('id', reservation.id)
      .or('payment_status.is.null,payment_status.neq.approved');

    if (failError) {
      await markEvent(supabase, eventId, 'update_failed');
      return new Response('db failed', { status: 500 });
    }

    await markEvent(supabase, eventId, 'applied');
    return new Response('ok', { status: 200 });
  }

  await markEvent(supabase, eventId, `ignored_status_${lowered}`);
  return new Response('ok', { status: 200 });
});
