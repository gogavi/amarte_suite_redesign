const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
const WOMPI_TX_RE = /^[A-Za-z0-9_-]{4,80}$/;

const TERMINAL_UNPAID = new Set(['declined', 'voided', 'error', 'amount_mismatch']);

export type ThanksQuery = {
  reservationId: string | null;
  wompiTransactionId: string | null;
};

export function isGraciasPath(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, '') || '/';
  return path === '/gracias';
}

function wompiIdFromRaw(raw: string): string | null {
  const match = raw.match(/(?:^|[?&])id=([A-Za-z0-9_-]{4,80})/);
  if (!match) return null;
  return WOMPI_TX_RE.test(match[1]) ? match[1] : null;
}

/** Lee `rt` (id de la reserva) e `id` (transacción que Wompi agrega al volver). */
export function parseThanksSearch(search: string): ThanksQuery {
  const raw = search.startsWith('?') ? search.slice(1) : search;
  const params = new URLSearchParams(raw);
  const rt = params.get('rt') ?? '';
  const reservationId = rt.match(UUID_RE)?.[0]?.toLowerCase() ?? null;
  const queryId = (params.get('id') ?? params.get('transaction_id') ?? '').trim();
  const wompiTransactionId = WOMPI_TX_RE.test(queryId)
    ? queryId
    : (wompiIdFromRaw(rt) ?? wompiIdFromRaw(raw));
  return { reservationId, wompiTransactionId };
}

export function shouldRetryPurchaseStatus(paymentStatus: string | null | undefined): boolean {
  if (!paymentStatus) return true;
  return !TERMINAL_UNPAID.has(paymentStatus);
}
