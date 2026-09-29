import { supabase } from '../lib/supabaseClient';
import { shouldRetryPurchaseStatus } from '../lib/thanksReturn';

export type ExpressPurchaseResult =
  | {
    ok: true;
    confirmed: true;
    value: number;
    currency: 'COP';
    transactionId: string;
    retry: false;
  }
  | {
    ok: true;
    confirmed: false;
    paymentStatus: string;
    retry: boolean;
  }
  | {
    ok: false;
    confirmed: false;
    retry: boolean;
    error: string;
  };

type PurchaseStatusBody = {
  ok?: unknown;
  confirmed?: unknown;
  value?: unknown;
  currency?: unknown;
  transaction_id?: unknown;
  payment_status?: unknown;
  error?: unknown;
};

function asPositiveNumber(value: unknown): number | null {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

/**
 * Pregunta a `express-purchase-status` si el pago de Reserva Express ya está aprobado.
 * No recibe datos personales.
 */
export async function fetchExpressPurchaseStatus(
  reservationId: string,
  wompiTransactionId: string | null,
): Promise<ExpressPurchaseResult> {
  const body: { reservationId: string; transactionId?: string } = { reservationId };
  if (wompiTransactionId) body.transactionId = wompiTransactionId;

  const { data, error } = await supabase.functions.invoke('express-purchase-status', { body });

  if (error) {
    const status = typeof error === 'object' && error && 'context' in error
      ? Number((error as { context?: { status?: number } }).context?.status)
      : Number.NaN;
    const retry = status !== 400 && status !== 403 && status !== 404;
    return {
      ok: false,
      confirmed: false,
      retry,
      error: 'No pudimos consultar el pago.',
    };
  }

  const payload = (data ?? {}) as PurchaseStatusBody;
  if (payload.ok !== true) {
    return {
      ok: false,
      confirmed: false,
      retry: false,
      error: typeof payload.error === 'string' && payload.error.trim()
        ? payload.error
        : 'No pudimos consultar el pago.',
    };
  }

  const transactionId = typeof payload.transaction_id === 'string' ? payload.transaction_id.trim() : '';
  const value = asPositiveNumber(payload.value);
  if (payload.confirmed === true && transactionId && value !== null && payload.currency === 'COP') {
    return {
      ok: true,
      confirmed: true,
      value,
      currency: 'COP',
      transactionId,
      retry: false,
    };
  }

  const paymentStatus = typeof payload.payment_status === 'string' && payload.payment_status.trim()
    ? payload.payment_status.trim()
    : 'pending';

  return {
    ok: true,
    confirmed: false,
    paymentStatus,
    retry: shouldRetryPurchaseStatus(paymentStatus),
  };
}
