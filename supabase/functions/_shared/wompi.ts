const PROPERTY_PATH = /^[A-Za-z0-9_]+(\.[A-Za-z0-9_]+)*$/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(input),
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

/** Comparación de hex case-insensitive en tiempo constante. */
export function timingSafeEqualHex(left: string, right: string): boolean {
  const a = left.trim().toLowerCase();
  const b = right.trim().toLowerCase();
  const length = Math.max(a.length, b.length, 1);
  let mismatch = a.length === b.length ? 0 : 1;

  for (let i = 0; i < length; i += 1) {
    const ca = i < a.length ? a.charCodeAt(i) : 0;
    const cb = i < b.length ? b.charCodeAt(i) : 0;
    mismatch |= ca ^ cb;
  }

  return mismatch === 0;
}

/**
 * Firma de integridad del Web Checkout / Widget.
 * Docs: concatenar sin separadores reference + amount_in_cents + currency
 * [+ expiration-time] + integrity_secret, luego SHA-256 hex.
 * https://docs.wompi.co/docs/colombia/widget-checkout-web/
 */
export async function integritySignature(params: {
  reference: string;
  amountInCents: number;
  currency: string;
  integritySecret: string;
  expirationTime?: string;
}): Promise<string> {
  const parts = [
    params.reference,
    String(params.amountInCents),
    params.currency,
  ];
  if (params.expirationTime) {
    parts.push(params.expirationTime);
  }
  parts.push(params.integritySecret);
  return sha256Hex(parts.join(''));
}

export function readDataProperty(data: unknown, path: string): string | null {
  if (!PROPERTY_PATH.test(path)) return null;

  let current: unknown = data;
  for (const segment of path.split('.')) {
    if (
      current === null
      || typeof current !== 'object'
      || Array.isArray(current)
      || !(segment in current)
    ) {
      return null;
    }
    current = (current as Record<string, unknown>)[segment];
  }

  if (typeof current === 'string' || typeof current === 'number' || typeof current === 'boolean') {
    return String(current);
  }

  return null;
}

/**
 * Checksum de eventos Wompi.
 * Docs: valores de signature.properties (sobre `data`, en ese orden)
 * + timestamp + events_secret, SHA-256.
 * https://docs.wompi.co/docs/colombia/eventos/
 */
export async function eventChecksum(params: {
  data: unknown;
  properties: string[];
  timestamp: number;
  eventsSecret: string;
}): Promise<string | null> {
  const values: string[] = [];

  for (const path of params.properties) {
    const value = readDataProperty(params.data, path);
    if (value === null) return null;
    values.push(value);
  }

  values.push(String(params.timestamp), params.eventsSecret);
  return sha256Hex(values.join(''));
}

export function pesosToCents(precio: string): number | null {
  const pesos = Number(String(precio).replace(/[$\s,]/g, '').trim());
  if (!Number.isInteger(pesos) || pesos <= 0) return null;
  return pesos * 100;
}

export function buildWompiCheckoutUrl(params: {
  publicKey: string;
  amountInCents: number;
  reference: string;
  integritySignature: string;
  redirectUrl: string;
  customerEmail?: string;
  customerFullName?: string;
  customerPhone?: string;
  customerLegalId?: string;
}): string {
  const query = new URLSearchParams();
  query.set('public-key', params.publicKey);
  query.set('currency', 'COP');
  query.set('amount-in-cents', String(params.amountInCents));
  query.set('reference', params.reference);
  query.set('signature:integrity', params.integritySignature);
  query.set('redirect-url', params.redirectUrl);

  if (params.customerEmail) {
    query.set('customer-data:email', params.customerEmail);
  }
  if (params.customerFullName) {
    query.set('customer-data:full-name', params.customerFullName);
  }
  if (params.customerPhone) {
    query.set('customer-data:phone-number', params.customerPhone);
    query.set('customer-data:phone-number-prefix', '+57');
  }
  if (params.customerLegalId) {
    query.set('customer-data:legal-id', params.customerLegalId);
    query.set('customer-data:legal-id-type', 'CC');
  }

  return `https://checkout.wompi.co/p/?${query.toString()}`;
}

export function colombianLocalPhone(raw: string): string | undefined {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith('57')) return digits.slice(2);
  return undefined;
}

const DEFAULT_WWW_ORIGIN = 'https://www.amartesuite.com';
const HTTPS_ORIGIN = /^https:\/\/[a-z0-9.-]+$/i;
const WOMPI_TX_ID = /^[A-Za-z0-9_-]{4,80}$/;
const FINAL_PAYMENT_FAILURE = new Set(['DECLINED', 'VOIDED', 'ERROR']);

/**
 * Origen del SPA. `PUBLIC_SITE_URL` es opcional y no es un secreto.
 * Un valor que no sea `https://host` cae en www.amartesuite.com.
 */
export function publicSiteOrigin(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, '');
  if (HTTPS_ORIGIN.test(trimmed)) return trimmed;
  return DEFAULT_WWW_ORIGIN;
}

/** Retorno del Web Checkout. Wompi añade `id` de la transacción a esta URL. */
export function expressThanksUrl(origin: string, reservationId: string): string {
  const base = publicSiteOrigin(origin);
  return `${base}/gracias?rt=${encodeURIComponent(reservationId)}`;
}

export function isWompiTransactionId(value: string): boolean {
  return WOMPI_TX_ID.test(value);
}

export type StoredReservationPayment = {
  id: string;
  precio: string;
  paymentStatus: string | null;
  paidAmount: number | null;
};

export type WompiTxView = {
  id: string;
  status: string;
  amountInCents: number;
  reference: string;
  currency?: string;
};

export type ExpressPurchaseVerdict =
  | { action: 'return'; value: number; transactionId: string }
  | { action: 'approve'; value: number; transactionId: string; wompiTransactionId: string }
  | { action: 'mark_mismatch'; wompiTransactionId: string }
  | { action: 'mark_failure'; status: 'declined' | 'voided' | 'error'; wompiTransactionId: string }
  | { action: 'wait' };

function positiveCop(value: number | null): number | null {
  if (value === null || !Number.isFinite(value) || value <= 0) return null;
  return Math.round(value);
}

function precioCop(precio: string): number | null {
  const pesos = Number(String(precio).replace(/[$\s,]/g, '').trim());
  return positiveCop(pesos);
}

/**
 * Decide si la página /gracias puede contar la compra.
 * Un pago ya `approved` no se vuelve a escribir. Si llega la transacción de Wompi,
 * solo cuenta cuando `reference` es el id de la reserva y el monto coincide.
 */
export function decideExpressPurchase(
  reservation: StoredReservationPayment,
  wompi: WompiTxView | null,
): ExpressPurchaseVerdict {
  if (reservation.paymentStatus === 'approved') {
    const value = positiveCop(reservation.paidAmount) ?? precioCop(reservation.precio);
    if (value === null) return { action: 'wait' };
    return { action: 'return', value, transactionId: reservation.id };
  }

  if (!wompi || !isWompiTransactionId(wompi.id)) return { action: 'wait' };
  if (!isUuid(wompi.reference) || wompi.reference.toLowerCase() !== reservation.id.toLowerCase()) {
    return { action: 'wait' };
  }
  if (wompi.currency && wompi.currency.toUpperCase() !== 'COP') return { action: 'wait' };

  const status = wompi.status.toUpperCase();
  if (status === 'APPROVED') {
    const expectedCents = pesosToCents(reservation.precio);
    if (expectedCents === null || expectedCents !== wompi.amountInCents) {
      return { action: 'mark_mismatch', wompiTransactionId: wompi.id };
    }
    return {
      action: 'approve',
      value: expectedCents / 100,
      transactionId: reservation.id,
      wompiTransactionId: wompi.id,
    };
  }

  if (FINAL_PAYMENT_FAILURE.has(status)) {
    const lowered = status.toLowerCase();
    if (lowered === 'declined' || lowered === 'voided' || lowered === 'error') {
      return { action: 'mark_failure', status: lowered, wompiTransactionId: wompi.id };
    }
  }

  return { action: 'wait' };
}

export function parseWompiTransactionPayload(json: unknown): WompiTxView | null {
  if (!json || typeof json !== 'object') return null;
  const data = (json as { data?: unknown }).data;
  if (!data || typeof data !== 'object') return null;
  const row = data as {
    id?: unknown;
    status?: unknown;
    amount_in_cents?: unknown;
    reference?: unknown;
    currency?: unknown;
  };
  if (typeof row.id !== 'string' || !isWompiTransactionId(row.id)) return null;
  if (typeof row.status !== 'string' || !row.status.trim()) return null;
  if (typeof row.reference !== 'string') return null;
  if (typeof row.amount_in_cents !== 'number' || !Number.isInteger(row.amount_in_cents)) return null;
  const currency = typeof row.currency === 'string' ? row.currency : undefined;
  return {
    id: row.id,
    status: row.status,
    amountInCents: row.amount_in_cents,
    reference: row.reference,
    currency,
  };
}
