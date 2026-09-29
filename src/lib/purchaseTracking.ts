const STORAGE_KEY = 'amarte-www-purchase-ids';
const MAX_STORED_IDS = 50;

export type PurchaseCandidate = {
  confirmed: boolean;
  transactionId: string;
  value: number;
  currency: string;
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
