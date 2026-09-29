const STORAGE_KEY = 'amarte-google-click-ids';
const CLICK_ID_RE = /^[A-Za-z0-9_.-]{4,200}$/;
const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;
const CLICK_COLUMN_RE = /\b(gclid|gbraid|wbraid|click_ids_captured_at)\b/;

export type GoogleClickIds = {
  gclid: string | null;
  gbraid: string | null;
  wbraid: string | null;
  capturedAt: string | null;
};

export type ReservationClickColumns = {
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  click_ids_captured_at?: string;
};

type ClickIdStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

export function sanitizeClickId(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  let value = raw.trim();
  if (!value) return null;
  try {
    value = decodeURIComponent(value);
  } catch {
    return null;
  }
  value = value.trim();
  if (!CLICK_ID_RE.test(value)) return null;
  return value;
}

function readCookie(cookieString: string, name: string): string | null {
  if (!cookieString) return null;
  const parts = cookieString.split(';');
  for (const part of parts) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() !== name) continue;
    return part.slice(idx + 1).trim();
  }
  return null;
}

/** Cookie del Google tag: GCL.<unix>.<click id> */
export function clickIdFromGclCookie(cookieValue: string | null): string | null {
  if (!cookieValue) return null;
  let decoded = cookieValue.trim();
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    return null;
  }
  const parts = decoded.split('.');
  if (parts.length < 3 || parts[0] !== 'GCL' || !/^\d+$/.test(parts[1])) return null;
  return sanitizeClickId(parts.slice(2).join('.'));
}

export function emptyClickIds(): GoogleClickIds {
  return { gclid: null, gbraid: null, wbraid: null, capturedAt: null };
}

export function captureGoogleClickIds(input: {
  search?: string;
  cookie?: string;
  now?: Date;
}): GoogleClickIds {
  const query = typeof input.search === 'string' ? input.search.replace(/^\?/, '') : '';
  const params = new URLSearchParams(query);
  const fromUrl = {
    gclid: sanitizeClickId(params.get('gclid') ?? ''),
    gbraid: sanitizeClickId(params.get('gbraid') ?? ''),
    wbraid: sanitizeClickId(params.get('wbraid') ?? ''),
  };
  const cookie = typeof input.cookie === 'string' ? input.cookie : '';
  const gclid = fromUrl.gclid || clickIdFromGclCookie(readCookie(cookie, '_gcl_aw'));
  const gbraid = fromUrl.gbraid || clickIdFromGclCookie(readCookie(cookie, '_gcl_gb'));
  const wbraid = fromUrl.wbraid;
  const hasAny = Boolean(gclid || gbraid || wbraid);
  return {
    gclid: gclid || null,
    gbraid: gbraid || null,
    wbraid: wbraid || null,
    capturedAt: hasAny ? (input.now ?? new Date()).toISOString() : null,
  };
}

function normalizeStored(value: unknown): GoogleClickIds {
  if (!value || typeof value !== 'object') return emptyClickIds();
  const row = value as Partial<GoogleClickIds>;
  const gclid = sanitizeClickId(row.gclid ?? '');
  const gbraid = sanitizeClickId(row.gbraid ?? '');
  const wbraid = sanitizeClickId(row.wbraid ?? '');
  const capturedAt = typeof row.capturedAt === 'string' && row.capturedAt.trim()
    ? row.capturedAt.trim()
    : null;
  if (!gclid && !gbraid && !wbraid) return emptyClickIds();
  return { gclid, gbraid, wbraid, capturedAt };
}

export function readStoredClickIds(storage: ClickIdStorage | null | undefined): GoogleClickIds {
  if (!storage || typeof storage.getItem !== 'function') return emptyClickIds();
  try {
    return normalizeStored(JSON.parse(storage.getItem(STORAGE_KEY) || 'null'));
  } catch {
    return emptyClickIds();
  }
}

export function mergeClickIds(stored: GoogleClickIds, fresh: GoogleClickIds): GoogleClickIds {
  const base = normalizeStored(stored);
  const next = normalizeStored(fresh);
  const gclid = next.gclid || base.gclid;
  const gbraid = next.gbraid || base.gbraid;
  const wbraid = next.wbraid || base.wbraid;
  if (!gclid && !gbraid && !wbraid) return emptyClickIds();
  const same = base.gclid === gclid && base.gbraid === gbraid && base.wbraid === wbraid && base.capturedAt;
  return {
    gclid,
    gbraid,
    wbraid,
    capturedAt: same ? base.capturedAt : (next.capturedAt || base.capturedAt),
  };
}

export function rememberGoogleClickIds(
  storage: ClickIdStorage | null | undefined,
  search: string,
  cookie: string,
  now: Date = new Date(),
): GoogleClickIds {
  const fresh = captureGoogleClickIds({ search, cookie, now });
  const merged = mergeClickIds(readStoredClickIds(storage), fresh);
  if (storage && typeof storage.setItem === 'function' && merged.capturedAt) {
    storage.setItem(STORAGE_KEY, JSON.stringify(merged));
  }
  return merged;
}

export function rememberGoogleClickIdsFromBrowser(now: Date = new Date()): GoogleClickIds {
  if (typeof window === 'undefined') return emptyClickIds();
  return rememberGoogleClickIds(window.sessionStorage, window.location.search, document.cookie, now);
}

function capturedAtForInsert(iso: string | null, now: Date): string {
  const parsed = iso ? Date.parse(iso) : Number.NaN;
  if (!Number.isFinite(parsed)) return now.toISOString();
  const age = now.getTime() - parsed;
  if (age < -5 * 60 * 1000 || age > MAX_AGE_MS) return now.toISOString();
  return new Date(parsed).toISOString();
}

/** Columnas opcionales del INSERT. Vacío si no hay click id. */
export function clickIdsForReservation(
  ids: GoogleClickIds,
  now: Date = new Date(),
): ReservationClickColumns {
  const normalized = normalizeStored(ids);
  const payload: ReservationClickColumns = {};
  if (normalized.gclid) payload.gclid = normalized.gclid;
  if (normalized.gbraid) payload.gbraid = normalized.gbraid;
  if (normalized.wbraid) payload.wbraid = normalized.wbraid;
  if (!payload.gclid && !payload.gbraid && !payload.wbraid) return {};
  payload.click_ids_captured_at = capturedAtForInsert(normalized.capturedAt, now);
  return payload;
}

/**
 * PostgREST/Postgres aún no tiene las columnas de click id
 * (las añade el SQL de Microservicio-Reservas). La reserva se reintenta sin ellas.
 */
export function isMissingClickIdColumn(error: { code?: string | null; message?: string | null }): boolean {
  const code = error.code ?? '';
  if (code !== 'PGRST204' && code !== '42703') return false;
  return CLICK_COLUMN_RE.test(error.message ?? '');
}

export const GOOGLE_CLICK_IDS_STORAGE_KEY = STORAGE_KEY;
