import { useEffect, useState } from 'react';
import { trackEvent } from '../lib/analytics';
import {
  claimPurchaseId,
  readSentPurchaseIds,
  rememberSentPurchaseId,
  shouldFirePurchase,
} from '../lib/purchaseTracking';
import { parseThanksSearch } from '../lib/thanksReturn';
import { fetchExpressPurchaseStatus, type ExpressPurchaseResult } from '../services/purchaseStatus';

const ATTEMPTS = 3;
const RETRY_MS = 2000;

type GraciasPhase = 'checking' | 'paid' | 'pending' | 'declined' | 'missing' | 'error';

type PaidSummary = {
  value: number;
  transactionId: string;
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function formatCop(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

function firePurchaseOnce(value: number, transactionId: string): void {
  const storage = window.localStorage;
  const decision = shouldFirePurchase(
    { confirmed: true, transactionId, value, currency: 'COP' },
    readSentPurchaseIds(storage),
  );
  if (!decision.fire || !decision.transactionId || decision.value === undefined) return;
  if (!claimPurchaseId(decision.transactionId)) return;
  trackEvent('purchase', {
    transaction_id: decision.transactionId,
    value: decision.value,
    currency: 'COP',
  });
  rememberSentPurchaseId(storage, decision.transactionId);
}

function phaseFromResult(result: ExpressPurchaseResult): { phase: GraciasPhase; paid: PaidSummary | null } {
  if (result.confirmed) {
    return {
      phase: 'paid',
      paid: { value: result.value, transactionId: result.transactionId },
    };
  }
  if (result.ok && !result.retry) {
    return { phase: result.paymentStatus === 'amount_mismatch' ? 'error' : 'declined', paid: null };
  }
  if (!result.ok && !result.retry) {
    return { phase: 'error', paid: null };
  }
  return { phase: 'pending', paid: null };
}

export default function GraciasView() {
  const [phase, setPhase] = useState<GraciasPhase>('checking');
  const [paid, setPaid] = useState<PaidSummary | null>(null);

  useEffect(() => {
    const query = parseThanksSearch(window.location.search);
    const reservationId = query.reservationId;
    if (!reservationId) {
      setPhase('missing');
      return;
    }

    let cancelled = false;

    const run = async () => {
      let last: ExpressPurchaseResult | null = null;
      for (let attempt = 0; attempt < ATTEMPTS; attempt += 1) {
        if (cancelled) return;
        try {
          last = await fetchExpressPurchaseStatus(reservationId, query.wompiTransactionId);
        } catch {
          last = { ok: false, confirmed: false, retry: true, error: 'No pudimos consultar el pago.' };
        }
        if (cancelled) return;
        const next = phaseFromResult(last);
        if (next.phase === 'paid' && next.paid) {
          firePurchaseOnce(next.paid.value, next.paid.transactionId);
          setPaid(next.paid);
          setPhase('paid');
          return;
        }
        if (!last.ok && !last.retry) {
          setPhase('error');
          return;
        }
        if (last.ok && !last.retry) {
          setPhase(next.phase);
          return;
        }
        if (attempt < ATTEMPTS - 1) {
          await delay(RETRY_MS);
        }
      }
      if (!cancelled) setPhase('pending');
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  const title = phase === 'paid'
    ? 'Tu reserva quedó pagada'
    : phase === 'declined'
      ? 'No se completó el pago'
      : phase === 'missing'
        ? 'No encontramos el pago'
        : phase === 'error'
          ? 'No pudimos confirmar el pago'
          : phase === 'pending'
            ? 'Seguimos confirmando tu pago'
            : 'Confirmando tu pago';

  const body = phase === 'paid' && paid
    ? `Wompi aprobó ${formatCop(paid.value)}. No hace falta enviar comprobante por WhatsApp.`
    : phase === 'declined'
      ? 'Wompi no aprobó este intento. Puedes volver al inicio y abrir Reserva Express de nuevo.'
      : phase === 'missing'
        ? 'El enlace de retorno no trae la reserva. Si acabas de pagar, revisa el correo de Wompi o vuelve a la página que te mostró el checkout.'
        : phase === 'error'
          ? 'El monto o la consulta no cuadraron con la reserva. El equipo ve el pago en el sistema; no envíes el comprobante por este enlace.'
          : phase === 'pending'
            ? 'Si acabas de pagar, la confirmación puede tardar un momento. Recarga esta página en unos segundos. No envíes comprobante por WhatsApp.'
            : 'Estamos consultando el estado del pago con el servidor.';

  return (
    <main className="min-h-screen bg-bg-dark text-white font-body flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-brand border border-magenta-digital/40 bg-[#17171E] px-6 py-8 shadow-lg sm:px-8">
        <p className="font-accent text-xl text-magenta-digital">El Planeta Romántico</p>
        <h1 className="mt-2 font-heading text-3xl uppercase tracking-wide text-white">{title}</h1>
        <p className="mt-3 text-body text-gris-medio" role="status">{body}</p>
        <a
          href="/"
          className="mt-8 inline-flex min-h-[48px] items-center justify-center rounded-brand border-2 border-magenta-digital bg-magenta-digital px-6 font-heading text-sm uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-magenta-digital"
        >
          Volver al inicio
        </a>
      </div>
    </main>
  );
}
