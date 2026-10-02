import { parseExpressPurchaseStatusPayload, type ExpressPurchaseResult } from '../lib/expressPurchaseStatus';
import { supabase } from '../lib/supabaseClient';

export type { ExpressPurchaseResult } from '../lib/expressPurchaseStatus';

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

  return parseExpressPurchaseStatusPayload(data);
}
