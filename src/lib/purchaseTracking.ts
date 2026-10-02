import { trackEvent, type PaidTipoPago } from './analytics.ts';

const STORAGE_KEY = 'amarte-www-purchase-ids';
const MAX_STORED_IDS = 50;

export type PurchaseCandidate = {
  confirmed: boolean;
  transactionId: string;
  value: number;
  currency: string;
};

export type ServerPurchaseInput = {
  confirmed: boolean;
  transactionId: string;
  value: number;
  currency: string;
  reservationTotal?: number | null;
  tipoPago?: string | null;
};

export type PurchaseEventPayload = {
  transaction_id: string;
  value: number;
  currency: 'COP';
  tipo_pago: PaidTipoPago;
  reservation_total: number;
};

export type PurchaseFireDecision = {
  fire: boolean;
  reason: 'not-confirmed' | 'missing-transaction-id' | 'invalid-value' | 'currency' | 'duplicate' | 'ok';
  transactionId?: string;
  value?: number;
};

type IdStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

const firingIds = new Set<string>();

function normalizeTransactionId(value: string): string {
  return value.trim();
}

export function shouldFirePurchase(
  candidate: PurchaseCandidate,
  alreadySentIds: ReadonlySet<string>,
): PurchaseFireDecision {
  if (!candidate.confirmed) return { fire: false, reason: 'not-confirmed' };
  const transactionId = normalizeTransactionId(candidate.transactionId);
  if (!transactionId) return { fire: false, reason: 'missing-transaction-id' };
  if (!Number.isFinite(candidate.value) || candidate.value <= 0) {
    return { fire: false, reason: 'invalid-value' };
  }
  if (candidate.currency !== 'COP') return { fire: false, reason: 'currency' };
  if (alreadySentIds.has(transactionId)) return { fire: false, reason: 'duplicate' };
  return {
    fire: true,
    reason: 'ok',
    transactionId,
    value: Math.round(candidate.value),
  };
}

export function readSentPurchaseIds(storage: IdStorage | null | undefined): Set<string> {
  if (!storage || typeof storage.getItem !== 'function') return new Set();
  try {
    const parsed = JSON.parse(storage.getItem(STORAGE_KEY) || '[]') as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === 'string' && id.trim().length > 0));
  } catch {
    return new Set();
  }
}

export function rememberSentPurchaseId(storage: IdStorage | null | undefined, transactionId: string): Set<string> {
  const ids = readSentPurchaseIds(storage);
  const trimmed = transactionId.trim();
  if (trimmed) {
    ids.add(trimmed);
    firingIds.add(trimmed);
  }
  const list = [...ids].slice(-MAX_STORED_IDS);
  if (storage && typeof storage.setItem === 'function') {
    storage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
  return new Set(list);
}

/** Marca el id antes del push para que un segundo efecto (Strict Mode) no duplique. */
export function claimPurchaseId(transactionId: string): boolean {
  const trimmed = transactionId.trim();
  if (!trimmed || firingIds.has(trimmed)) return false;
  firingIds.add(trimmed);
  return true;
}

export const PURCHASE_IDS_STORAGE_KEY = STORAGE_KEY;

export type PurchaseCommitDecision =
  | { fire: false; reason: PurchaseFireDecision['reason'] | 'missing-reservation-total' | 'tipo-pago' }
  | { fire: true; reason: 'ok'; payload: PurchaseEventPayload };

function resolveTipoPago(tipoPago: string | null | undefined): PaidTipoPago | null {
  if (tipoPago === undefined || tipoPago === null || tipoPago.trim() === '') return 'total_100';
  if (tipoPago === 'abono_50' || tipoPago === 'total_100') return tipoPago;
  return null;
}

function resolveReservationTotal(
  value: number,
  tipoPago: PaidTipoPago,
  reservationTotal: number | null | undefined,
): number | null {
  if (reservationTotal !== undefined && reservationTotal !== null) {
    if (!Number.isFinite(reservationTotal) || reservationTotal <= 0) return null;
    return Math.round(reservationTotal);
  }
  if (tipoPago === 'total_100') return Math.round(value);
  return null;
}

/** Arma `purchase` solo con datos confirmados por el servidor. */
export function purchaseEventFromServer(
  status: ServerPurchaseInput,
  alreadySentIds: ReadonlySet<string>,
): PurchaseCommitDecision {
  const gate = shouldFirePurchase(
    {
      confirmed: status.confirmed,
      transactionId: status.transactionId,
      value: status.value,
      currency: status.currency,
    },
    alreadySentIds,
  );
  if (!gate.fire || !gate.transactionId || gate.value === undefined) {
    const reason = gate.reason === 'ok' ? 'invalid-value' : gate.reason;
    return { fire: false, reason };
  }

  const tipoPago = resolveTipoPago(status.tipoPago);
  if (!tipoPago) return { fire: false, reason: 'tipo-pago' };

  const reservationTotal = resolveReservationTotal(gate.value, tipoPago, status.reservationTotal);
  if (reservationTotal === null) return { fire: false, reason: 'missing-reservation-total' };

  return {
    fire: true,
    reason: 'ok',
    payload: {
      transaction_id: gate.transactionId,
      value: gate.value,
      currency: 'COP',
      tipo_pago: tipoPago,
      reservation_total: reservationTotal,
    },
  };
}

/** Empuja `purchase` una vez por transaction_id. No dispara si el servidor no confirmó. */
export function commitServerPurchase(
  status: ServerPurchaseInput,
  storage: IdStorage | null | undefined,
): boolean {
  const decision = purchaseEventFromServer(status, readSentPurchaseIds(storage));
  if (!decision.fire) return false;
  if (!claimPurchaseId(decision.payload.transaction_id)) return false;
  trackEvent('purchase', decision.payload);
  rememberSentPurchaseId(storage, decision.payload.transaction_id);
  return true;
}
