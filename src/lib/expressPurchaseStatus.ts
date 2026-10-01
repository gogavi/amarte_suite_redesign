import { shouldRetryPurchaseStatus } from './thanksReturn.ts';
import type { PaidTipoPago } from './analytics.ts';

export type ExpressPurchaseResult =
  | {
    ok: true;
    confirmed: true;
    value: number;
    currency: 'COP';
    transactionId: string;
    reservationTotal: number;
    tipoPago: PaidTipoPago;
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
  reservation_total?: unknown;
  tipo_pago?: unknown;
};

function asPositiveNumber(value: unknown): number | null {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

function paidTipoPago(value: unknown): PaidTipoPago {
  if (value === 'abono_50' || value === 'total_100') return value;
  return 'total_100';
}

/** Interpreta el JSON de `express-purchase-status`. No llama a la red. */
export function parseExpressPurchaseStatusPayload(data: unknown): ExpressPurchaseResult {
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
    const reservationTotal = asPositiveNumber(payload.reservation_total) ?? value;
    return {
      ok: true,
      confirmed: true,
      value,
      currency: 'COP',
      transactionId,
      reservationTotal,
      tipoPago: paidTipoPago(payload.tipo_pago),
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
