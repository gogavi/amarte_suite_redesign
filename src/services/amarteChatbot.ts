export type AmarteChatbotBridge = {
  openChat: (initialMessage?: string) => void;
  openLive: () => void;
  close: () => void;
};

declare global {
  interface Window {
    AMARTE_CHATBOT_URL?: string;
    AmarteChatbot?: AmarteChatbotBridge;
  }
}

const SCRIPT_ATTR = 'data-amarte-widget-loader';

let loadPromise: Promise<AmarteChatbotBridge> | null = null;

function getBackendUrl(): string {
  const fromEnv = String(import.meta.env.VITE_AMARTE_CHATBOT_URL || '').trim().replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  return 'https://chatbotamarte-production.up.railway.app';
}

function isBridgeReady(value: unknown): value is AmarteChatbotBridge {
  if (!value || typeof value !== 'object') return false;
  const bridge = value as AmarteChatbotBridge;
  return typeof bridge.openLive === 'function' && typeof bridge.openChat === 'function';
}

function waitForBridge(timeoutMs = 8000): Promise<AmarteChatbotBridge> {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const tick = () => {
      if (isBridgeReady(window.AmarteChatbot)) {
        resolve(window.AmarteChatbot);
        return;
      }
      if (Date.now() - started >= timeoutMs) {
        reject(new Error('AmarteChatbot bridge no disponible tras cargar el widget'));
        return;
      }
      window.setTimeout(tick, 40);
    };
    tick();
  });
}

/**
 * Carga amarte-widget.js una sola vez y resuelve el bridge público.
 * Prefetch en mount; openLive debe invocarse en el mismo gesto de clic.
 */
export function ensureWidgetLoaded(): Promise<AmarteChatbotBridge> {
  if (isBridgeReady(window.AmarteChatbot)) {
    return Promise.resolve(window.AmarteChatbot);
  }

  if (loadPromise) return loadPromise;

  const backendUrl = getBackendUrl();
  window.AMARTE_CHATBOT_URL = backendUrl;

  loadPromise = new Promise<AmarteChatbotBridge>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[${SCRIPT_ATTR}]`);
    if (existing) {
      waitForBridge().then(resolve).catch(reject);
      return;
    }

    const script = document.createElement('script');
    script.src = `${backendUrl}/amarte-widget.js?v=${Date.now()}`;
    script.async = true;
    script.setAttribute(SCRIPT_ATTR, 'true');
    script.onload = () => {
      waitForBridge().then(resolve).catch(reject);
    };
    script.onerror = () => {
      loadPromise = null;
      reject(new Error(`No se pudo cargar el widget desde ${backendUrl}`));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}

/**
 * Prefetch silencioso (p. ej. en mount de Home). No abre paneles.
 */
export function prefetchMartinaWidget(): void {
  void ensureWidgetLoaded().catch((err) => {
    console.warn('[AmarteChatbot] prefetch falló:', err);
  });
}

/**
 * Abre chat de texto. Si el widget aún no cargó, espera y luego abre
 * (aceptable para starters; no usar para mic en vivo).
 */
export async function openChat(initialMessage?: string): Promise<void> {
  const bridge = await ensureWidgetLoaded();
  bridge.openChat(initialMessage);
}

/**
 * Inicia voz en vivo.
 * Preferible: llamar ensureWidgetLoaded() antes (prefetch) y luego openLiveSync()
 * en el onClick para no romper el gesto de micrófono.
 */
export function openLiveSync(): void {
  if (isBridgeReady(window.AmarteChatbot)) {
    window.AmarteChatbot.openLive();
    return;
  }
  void ensureWidgetLoaded()
    .then((bridge) => bridge.openLive())
    .catch((err) => {
      console.error('[AmarteChatbot] openLive falló:', err);
      alert('No pudimos conectar con Martina en vivo. Intenta de nuevo en unos segundos.');
    });
}

export async function closeMartina(): Promise<void> {
  if (isBridgeReady(window.AmarteChatbot) && typeof window.AmarteChatbot.close === 'function') {
    window.AmarteChatbot.close();
    return;
  }
  const bridge = await ensureWidgetLoaded();
  bridge.close();
}
