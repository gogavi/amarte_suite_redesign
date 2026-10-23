const STORAGE_KEY = 'amarte-reserva-attribution';
const MAX_VALUE_LENGTH = 512;

export const RESERVAS_HOME_URL = 'https://reservas.amartesuite.com';

const ATTRIBUTION_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'gclid',
  'gbraid',
  'wbraid',
  'fbclid',
] as const;

type AttributionKey = (typeof ATTRIBUTION_KEYS)[number];
type AttributionParams = Partial<Record<AttributionKey, string>>;

type AttributionStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

const INSTALL_FLAG = '__amarteReservaAttribution';

function sanitizeAttributionValue(raw: string | null): string | null {
  if (!raw) return null;
  let value = '';
  for (const char of raw) {
    const code = char.charCodeAt(0);
    if (code <= 31 || code === 127) continue;
    value += char;
  }
  value = value.trim();
  if (!value || value.length > MAX_VALUE_LENGTH) return null;
  return value;
}

function hasAttribution(params: AttributionParams): boolean {
  return ATTRIBUTION_KEYS.some((key) => Boolean(params[key]));
}

export function attributionFromSearch(search: string): AttributionParams {
  const query = search.startsWith('?') ? search.slice(1) : search;
  const params = new URLSearchParams(query);
  const captured: AttributionParams = {};
  for (const key of ATTRIBUTION_KEYS) {
    const value = sanitizeAttributionValue(params.get(key));
    if (value) captured[key] = value;
  }
  return captured;
}

function readStoredAttribution(storage: AttributionStorage | null | undefined): AttributionParams {
  if (!storage || typeof storage.getItem !== 'function') return {};
  try {
    const parsed: unknown = JSON.parse(storage.getItem(STORAGE_KEY) || 'null');
    if (!parsed || typeof parsed !== 'object') return {};
    const row = parsed as Partial<Record<AttributionKey, unknown>>;
    const stored: AttributionParams = {};
    for (const key of ATTRIBUTION_KEYS) {
      const raw = row[key];
      const value = sanitizeAttributionValue(typeof raw === 'string' ? raw : null);
      if (value) stored[key] = value;
    }
    return stored;
  } catch {
    return {};
  }
}

/** Primer toque: si ya hay atribución guardada, no se reemplaza. */
export function rememberReservaAttribution(
  storage: AttributionStorage | null | undefined,
  search: string,
): AttributionParams {
  const stored = readStoredAttribution(storage);
  if (hasAttribution(stored)) return stored;

  const fresh = attributionFromSearch(search);
  if (hasAttribution(fresh) && storage && typeof storage.setItem === 'function') {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    } catch {
      return fresh;
    }
  }
  return fresh;
}

export function appendAttribution(destination: string, params: AttributionParams): string {
  if (!hasAttribution(params)) return destination;
  let url: URL;
  try {
    url = new URL(destination);
  } catch {
    return destination;
  }

  let added = false;
  for (const key of ATTRIBUTION_KEYS) {
    const value = params[key];
    if (!value || url.searchParams.has(key)) continue;
    url.searchParams.append(key, value);
    added = true;
  }
  return added ? url.toString() : destination;
}

export function reservaHref(
  destination: string,
  search: string,
  storage: AttributionStorage | null | undefined,
): string {
  return appendAttribution(destination, rememberReservaAttribution(storage, search));
}

export function isReservasHref(href: string): boolean {
  try {
    const url = new URL(href);
    return url.protocol === 'https:' && url.hostname === 'reservas.amartesuite.com';
  } catch {
    return false;
  }
}

export function attributedReservasHref(
  href: string,
  search: string,
  storage: AttributionStorage | null | undefined,
): string {
  if (!isReservasHref(href)) return href;
  return reservaHref(href, search, storage);
}

/** Sin `window` (render de servidor o Node) el enlace no cambia. */
export function reservaHrefFromBrowser(destination: string): string {
  if (typeof window === 'undefined') return destination;
  try {
    return reservaHref(destination, window.location.search, window.sessionStorage);
  } catch {
    return destination;
  }
}

export function installReservaAttributionForwarding(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  try {
    rememberReservaAttribution(window.sessionStorage, window.location.search);
  } catch {
    // sessionStorage bloqueado: el clic igual intenta leer la URL actual.
  }

  const flagged = window as Window & { [INSTALL_FLAG]?: boolean };
  if (flagged[INSTALL_FLAG]) return;
  flagged[INSTALL_FLAG] = true;

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const anchor = target.closest('a');
    if (!(anchor instanceof HTMLAnchorElement) || !anchor.href) return;
    try {
      const next = attributedReservasHref(anchor.href, window.location.search, window.sessionStorage);
      if (next !== anchor.href) anchor.href = next;
    } catch {
      // Se deja el href original.
    }
  }, true);
}
