import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useReservation } from '../../context/ReservationContext';
import type { PlanContent } from '../../data/planesContent';
import { createWebReservation, type PaymentMethod } from '../../services/reservationService';
import {
  buildWhatsappReservasUrl,
  buildWhatsappReservationMessage,
  createWompiCheckout,
} from '../../services/paymentLinks';
import {
  fetchSuiteCatalog,
  getPackPrice,
  resolveCatalogSuiteName,
  type CatalogSuite,
  type SuitePack,
} from '../../services/suiteCatalogService';
import { fetchPlanStayPacks, formatPlanPrice } from '../../services/plansCatalogService';
import {
  fetchSuiteChoiceAvailability,
  type SuiteChoiceAvailability,
} from '../../services/planAvailability';
import { eligiblePlanSuites } from '../../lib/planSuites';
import { quoteStay } from '../../lib/reservationPricing';
import {
  trackAddPaymentInfo,
  trackBeginCheckout,
  trackEvent,
  trackGenerateLeadReserva,
  trackGenerateLeadWhatsapp,
  tipoPagoForReservationMethod,
  type CheckoutLocation,
} from '../../lib/analytics';
import { copFromWompiCheckoutUrl } from '../../lib/wompiAmount';
import { clickIdsForReservation, rememberGoogleClickIdsFromBrowser } from '../../lib/googleClickIds';

interface ReservaExpressFormProps {
  onClose: () => void;
  /** Reserva directa de un plan de decoración. Sin este prop, el formulario sigue en modo suite. */
  plan?: PlanContent | null;
}

type TimePeriod = 'AM' | 'PM';

type ReservaHistoryState = {
  amarteReservaOpen?: boolean;
};

/** Evita pushState duplicado en Strict Mode (mount → unmount → remount). */
let ownedReservaHistoryEntry = false;

const HOUR_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTE_OPTIONS = ['00', '15', '30', '45'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

function formatAmPmTime(hour: string, minute: string, period: TimePeriod): string {
  return `${hour}:${minute} ${period}`;
}

function formatVisitDate(isoDate: string): string {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) return isoDate;
  return new Date(year, month - 1, day).toLocaleDateString('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function packLabel(pack: SuitePack): string {
  if (pack.name === 'Día Hotelero') return 'Día Hotelero (2pm - 12m)';
  return pack.name.replace('Pack ', '');
}

/** Etiqueta corta para los chips de duración (estilo segmented control). */
function packChipLabel(pack: SuitePack): string {
  if (pack.name === 'Día Hotelero') return 'Día Hotelero';
  const short = pack.name.replace('Pack ', '').replace(/\s*horas?\s*/i, ' h').trim();
  return short.replace(/(\d+)\s*h/i, '$1 h');
}

function openCheckout(popup: Window | null, url: string): void {
  if (popup && !popup.closed) {
    popup.location.href = url;
    return;
  }
  window.location.assign(url);
}

export default function ReservaExpressForm({ onClose, plan = null }: ReservaExpressFormProps) {
  const { state, dispatch } = useReservation();
  const planMode = plan !== null;
  const lockedLocalSuiteName = planMode ? null : state.selectedSuite?.name ?? null;
  const lockedCatalogName = resolveCatalogSuiteName(lockedLocalSuiteName);
  const onCloseRef = useRef(onClose);

  const [catalog, setCatalog] = useState<CatalogSuite[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [planPacks, setPlanPacks] = useState<SuitePack[]>([]);
  const [planPacksLoading, setPlanPacksLoading] = useState(planMode);
  const [slotAvailability, setSlotAvailability] = useState<SuiteChoiceAvailability | null>(null);
  const [slotChecking, setSlotChecking] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    document: '',
    whatsapp: '',
    email: '',
    date: '',
    timeHour: '2',
    timeMinute: '00',
    timePeriod: 'PM' as TimePeriod,
    suiteId: '',
    packId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const submitLockRef = useRef(false);
  const createdReservationIdRef = useRef<string | null>(null);

  const timeLabel = formatAmPmTime(formData.timeHour, formData.timeMinute, formData.timePeriod);
  const dateLabel = formatVisitDate(formData.date);
  const minVisitDate = todayIsoDate();
  const visitSummary = dateLabel
    ? `Seleccionada: ${dateLabel} · ${timeLabel}`
    : `Seleccionada: ${timeLabel}`;

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const location: CheckoutLocation = plan ? 'reserva_plan' : 'reserva_express';
    trackEvent('reserva_form_open', {
      location,
      suite_name: lockedLocalSuiteName ?? undefined,
      decoration_plan: plan?.dbName,
    });
    trackBeginCheckout(location);
  }, [lockedLocalSuiteName, plan]);

  const isSubmittingRef = useRef(isSubmitting);
  useEffect(() => {
    isSubmittingRef.current = isSubmitting;
  }, [isSubmitting]);

  const requestClose = useCallback(() => {
    if (isSubmittingRef.current) return;

    const historyState = window.history.state as ReservaHistoryState | null;
    if (ownedReservaHistoryEntry || historyState?.amarteReservaOpen) {
      window.history.back();
      return;
    }

    onCloseRef.current();
  }, []);

  // Back del móvil/navegador cierra el modal en lugar de salir del sitio.
  // No hacemos history.back() en cleanup: en Strict Mode provoca popstate y cierra al instante.
  useEffect(() => {
    if (!ownedReservaHistoryEntry) {
      window.history.pushState({ amarteReservaOpen: true } satisfies ReservaHistoryState, '');
      ownedReservaHistoryEntry = true;
    }

    const onPopState = () => {
      ownedReservaHistoryEntry = false;
      onCloseRef.current();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (isSubmittingRef.current) return;
      const historyState = window.history.state as ReservaHistoryState | null;
      if (ownedReservaHistoryEntry || historyState?.amarteReservaOpen) {
        window.history.back();
        return;
      }
      onCloseRef.current();
    };

    window.addEventListener('popstate', onPopState);
    window.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const suiteChoices = useMemo(() => {
    if (!plan) return catalog.map((suite) => ({ suite, recommended: false }));
    return eligiblePlanSuites(catalog, plan.suitePolicy);
  }, [catalog, plan]);

  const selectedSuite = useMemo(
    () => suiteChoices.find((item) => item.suite.id === formData.suiteId)?.suite ?? null,
    [suiteChoices, formData.suiteId]
  );

  const availablePacks = plan ? planPacks : (selectedSuite?.packs ?? []);

  const selectedPack = useMemo(
    () => availablePacks.find((pack) => pack.rateTypeId === formData.packId) ?? null,
    [availablePacks, formData.packId]
  );

  const canShowPrice = Boolean(selectedSuite && selectedPack && formData.date);
  const price = canShowPrice && selectedPack ? getPackPrice(selectedPack, formData.date) : 0;
  const stayQuote = price > 0 ? quoteStay(price) : null;
  const suiteLocked = plan ? plan.suitePolicy.mode === 'locked' : Boolean(lockedCatalogName);
  const ratesLoading = catalogLoading || planPacksLoading;
  const formLocked = isSubmitting || hasSubmitted;

  useEffect(() => {
    if (!plan || !selectedSuite || !selectedPack || !formData.date) {
      setSlotAvailability(null);
      setSlotChecking(false);
      return;
    }

    let cancelled = false;
    setSlotChecking(true);
    void fetchSuiteChoiceAvailability({
      suite: selectedSuite.name,
      date: formData.date,
      time: timeLabel,
      pack: selectedPack.name,
    }).then((result) => {
      if (!cancelled) setSlotAvailability(result);
    }).finally(() => {
      if (!cancelled) setSlotChecking(false);
    });

    return () => {
      cancelled = true;
    };
  }, [plan, selectedSuite, selectedPack, formData.date, timeLabel]);

  useEffect(() => {
    let cancelled = false;

    const loadCatalog = async () => {
      setCatalogLoading(true);
      setCatalogError(null);
      try {
        const suites = await fetchSuiteCatalog();
        if (cancelled) return;
        if (!suites.length) {
          setCatalogError('No hay suites disponibles en la base de datos.');
          setCatalog([]);
          return;
        }

        setCatalog(suites);

        const preferred = plan
          ? (eligiblePlanSuites(suites, plan.suitePolicy).find((item) => item.recommended)
            ?? eligiblePlanSuites(suites, plan.suitePolicy)[0])?.suite
          : suites.find((suite) => suite.name === lockedCatalogName) ?? suites[0];
        if (!preferred) {
          setCatalogError('No hay suites disponibles para esta reserva.');
          return;
        }
        const preferredPack = plan ? undefined : preferred.packs[0];

        setFormData((prev) => ({
          ...prev,
          suiteId: preferred.id,
          packId: plan ? prev.packId : (preferredPack?.rateTypeId ?? ''),
        }));
      } catch (error) {
        if (cancelled) return;
        const message = error instanceof Error
          ? error.message
          : 'No se pudo cargar suites y tarifas.';
        setCatalogError(message);
      } finally {
        if (!cancelled) setCatalogLoading(false);
      }
    };

    void loadCatalog();
    return () => {
      cancelled = true;
    };
  }, [lockedCatalogName, plan]);

  useEffect(() => {
    if (!plan) {
      setPlanPacks([]);
      setPlanPacksLoading(false);
      return;
    }

    let cancelled = false;
    setPlanPacksLoading(true);

    void fetchPlanStayPacks(plan.dbName)
      .then((packs) => {
        if (cancelled) return;
        if (!packs.length) {
          setCatalogError('Este plan no tiene tarifas de 6 h, 12 h o día hotelero.');
          setPlanPacks([]);
          return;
        }
        setPlanPacks(packs);
        setFormData((prev) => ({
          ...prev,
          packId: packs.some((pack) => pack.rateTypeId === prev.packId)
            ? prev.packId
            : packs[0].rateTypeId,
        }));
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message = error instanceof Error
          ? error.message
          : 'No se pudieron cargar las tarifas del plan.';
        setCatalogError(message);
        setPlanPacks([]);
      })
      .finally(() => {
        if (!cancelled) setPlanPacksLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [plan]);

  useEffect(() => {
    if (plan) return;
    if (!selectedSuite) return;
    const packStillValid = selectedSuite.packs.some((pack) => pack.rateTypeId === formData.packId);
    if (!packStillValid) {
      setFormData((prev) => ({
        ...prev,
        packId: selectedSuite.packs[0]?.rateTypeId ?? '',
      }));
    }
  }, [plan, selectedSuite, formData.packId]);

  const clearError = () => {
    if (submitError) setSubmitError(null);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, name: e.target.value.toUpperCase() }));
    clearError();
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, document: digitsOnly(e.target.value).slice(0, 12) }));
    clearError();
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, whatsapp: digitsOnly(e.target.value).slice(0, 15) }));
    clearError();
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, email: e.target.value.trimStart() }));
    clearError();
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearError();
  };

  const handleSuiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (suiteLocked) return;
    const suiteId = e.target.value;
    const suite = catalog.find((item) => item.id === suiteId);
    setFormData((prev) => ({
      ...prev,
      suiteId,
      packId: suite?.packs[0]?.rateTypeId ?? '',
    }));
    clearError();
  };

  const validateForm = (): string | null => {
    if (
      !formData.name.trim()
      || !formData.document
      || !formData.whatsapp
      || !formData.email.trim()
      || !formData.date
    ) {
      return 'Completa los campos obligatorios: Nombre, Cédula, WhatsApp, Correo, Fecha y Hora.';
    }

    if (formData.date < todayIsoDate()) {
      return 'La fecha de visita no puede ser anterior a hoy.';
    }

    if (formData.whatsapp.length < 10) {
      return 'El WhatsApp debe tener al menos 10 dígitos.';
    }

    if (formData.document.length < 5) {
      return 'La cédula debe tener al menos 5 dígitos.';
    }

    const email = formData.email.trim();
    if (!EMAIL_REGEX.test(email)) {
      return 'Ingresa un correo válido (ejemplo: nombre@correo.com).';
    }

    if (!selectedSuite || !selectedPack) {
      return 'Selecciona una suite y un pack de tiempo.';
    }

    if (price <= 0) {
      return 'No hay tarifa disponible para esa combinación de suite y fecha.';
    }

    if (plan && slotAvailability?.conflict) {
      return 'Esa suite ya tiene una reserva que se cruza con este horario. Elige otra suite u otra hora.';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent, method: PaymentMethod) => {
    e.preventDefault();
    if (submitLockRef.current) return;

    const validationError = validateForm();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    if (!selectedSuite || !selectedPack) return;

    const time = timeLabel;
    const email = formData.email.trim();

    submitLockRef.current = true;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setSubmitError(null);

    const popup = window.open('about:blank', '_blank');
    if (popup) {
      popup.opener = null;
    }

    try {
      const alreadyCreatedId = createdReservationIdRef.current;
      const reservation = alreadyCreatedId
        ? { id: alreadyCreatedId, tipo: plan?.dbName ?? selectedSuite.name, packTiempo: selectedPack.name }
        : await createWebReservation({
          name: formData.name.trim(),
          document: formData.document,
          whatsapp: formData.whatsapp,
          email,
          tipo: plan ? plan.dbName : selectedSuite.name,
          packTiempo: selectedPack.name,
          date: formData.date,
          time,
          price,
          method,
          planName: plan?.dbName,
          suiteChoice: plan ? selectedSuite.name : undefined,
          clickIds: clickIdsForReservation(rememberGoogleClickIdsFromBrowser()),
        });

      createdReservationIdRef.current = reservation.id;

      if (!alreadyCreatedId) {
        dispatch({
          type: 'SET_USER_DATA',
          payload: {
            name: formData.name.trim(),
            document: formData.document,
            whatsapp: formData.whatsapp,
            email,
          },
        });
        dispatch({ type: 'SET_DATE', payload: formData.date });
        dispatch({ type: 'SET_TIME', payload: time });
        dispatch({ type: 'CALCULATE_PRICE', payload: price });

        const tipoPago = tipoPagoForReservationMethod(method);
        const checkoutLocation: CheckoutLocation = plan ? 'reserva_plan' : 'reserva_express';
        trackEvent('pre_reserva_submit', {
          location: checkoutLocation,
          transaction_id: reservation.id,
          suite_name: selectedSuite.name,
          plan_name: selectedPack.name,
          decoration_plan: plan?.dbName,
          method,
          value: price,
          currency: 'COP',
          tipo_pago: tipoPago,
        });
        trackGenerateLeadReserva({
          transactionId: reservation.id,
          tipoPago,
        });
      }

      let checkoutUrl: string;
      let successMessage: string;
      const checkoutLocation: CheckoutLocation = plan ? 'reserva_plan' : 'reserva_express';
      switch (method) {
        case 'wompi':
        case 'wompi_abono': {
          trackEvent('checkout_init', {
            location: checkoutLocation,
            transaction_id: reservation.id,
            suite_name: selectedSuite.name,
            plan_name: selectedPack.name,
            decoration_plan: plan?.dbName,
            hours: selectedPack.name,
            value: price,
            currency: 'COP',
          });
          checkoutUrl = (await createWompiCheckout(reservation.id)).checkoutUrl;
          const amountToCharge = copFromWompiCheckoutUrl(checkoutUrl);
          const paidTipo = tipoPagoForReservationMethod(method);
          if (amountToCharge !== null && (paidTipo === 'abono_50' || paidTipo === 'total_100')) {
            trackAddPaymentInfo({
              transactionId: reservation.id,
              value: amountToCharge,
              tipoPago: paidTipo,
            });
          }
          successMessage = method === 'wompi_abono'
            ? 'Pre-reserva guardada. Paga el abono del 50 % en Wompi. El saldo queda para el día de la visita.'
            : 'Pre-reserva guardada. Completa el pago en Wompi; la confirmación llega sola, sin enviar comprobante por WhatsApp.';
          break;
        }
        case 'whatsapp':
          trackEvent('whatsapp_redirect', {
            location: checkoutLocation,
            transaction_id: reservation.id,
            suite_name: selectedSuite.name,
            plan_name: selectedPack.name,
            decoration_plan: plan?.dbName,
            estimated_value: price,
            value: price,
            currency: 'COP',
          });
          checkoutUrl = buildWhatsappReservasUrl(buildWhatsappReservationMessage({
            name: formData.name.trim(),
            document: formData.document,
            clientWhatsapp: formData.whatsapp,
            email,
            suiteName: selectedSuite.name,
            packName: selectedPack.name,
            dateIso: formData.date,
            timeLabel: time,
            price,
            planName: plan?.dbName,
          }));
          trackGenerateLeadWhatsapp({
            location: checkoutLocation,
            linkUrl: checkoutUrl,
          });
          successMessage = plan
            ? 'Pre-reserva guardada con decoración. Continúa por WhatsApp: el personal cobra el abono.'
            : 'Pre-reserva guardada. Continúa la conversación en WhatsApp.';
          break;
        default: {
          const exhaustive: never = method;
          throw new Error(`Método de pago no soportado: ${exhaustive}`);
        }
      }

      openCheckout(popup, checkoutUrl);
      setSubmitSuccess(successMessage);
      setHasSubmitted(true);
    } catch (error) {
      if (popup && !popup.closed) {
        popup.close();
      }
      const message = error instanceof Error
        ? error.message
        : 'No se pudo guardar la pre-reserva. Intenta de nuevo.';
      setSubmitError(message);
    } finally {
      submitLockRef.current = false;
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full bg-bg-dark/60 border border-[#E6007E] rounded-brand px-4 py-2 text-sm text-white focus:outline-none focus:border-[#E6007E] focus:ring-1 focus:ring-[#E6007E]/40 disabled:opacity-60';
  const selectClass =
    'w-full bg-bg-dark border border-[#E6007E] rounded-brand px-4 py-2 text-sm text-white focus:outline-none focus:border-[#E6007E] focus:ring-1 focus:ring-[#E6007E]/40 disabled:opacity-60';
  const labelClass =
    'amarte-reserva-label text-xs uppercase tracking-widest block mb-1 font-medium text-[#E6007E]';
  const labelStyle = { color: '#E6007E' } as const;
  const submitDisabled = formLocked
    || ratesLoading
    || !!catalogError
    || !canShowPrice
    || (planMode && (slotChecking || slotAvailability?.conflict === true));

  const paymentLabel = (method: PaymentMethod): string => {
    if (isSubmitting) return 'Guardando…';
    if (hasSubmitted) return 'Reserva enviada';
    switch (method) {
      case 'wompi':
        return stayQuote ? `Pagar total ${formatPlanPrice(stayQuote.totalCharge)}` : 'Pagar total (Wompi)';
      case 'wompi_abono':
        return stayQuote ? `Abono 50 % ${formatPlanPrice(stayQuote.depositCharge)}` : 'Abono 50 % (Wompi)';
      case 'whatsapp':
        return 'WhatsApp sin pago';
      default: {
        const exhaustive: never = method;
        return exhaustive;
      }
    }
  };

  return (
    <div
      className="fixed inset-0 bg-bg-dark/90 flex items-center justify-center p-4 z-modal overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Formulario de pre-reserva"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Cerrar formulario"
        onClick={requestClose}
        disabled={isSubmitting}
      />

      <div className="glass-panel w-full max-w-xl rounded-brand border border-white/10 bg-[#17171E] p-6 md:p-8 relative shadow-2xl my-8 z-10">
        <button
          type="button"
          onClick={requestClose}
          disabled={isSubmitting}
          aria-label="Cerrar"
          className="absolute top-3 right-3 flex min-h-10 min-w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-base text-gris-medio transition hover:border-white/30 hover:bg-white/10 hover:text-white disabled:opacity-50"
        >
          ✕
        </button>

        <h2 className="font-heading text-2xl md:text-3xl text-white tracking-wide mb-2 text-center pr-14">
          {plan ? plan.name : 'PREPARA TU VIAJE'}
        </h2>
        <p className="font-body text-rosa-cuarzo text-body text-center mb-4">
          {plan
            ? plan.description
            : 'Pre-reserva en menos de 2 minutos. Cierre digital o asesoría directa.'}
        </p>
        {plan && (
          <ul className="mb-6 space-y-1 border-t border-white/5 pt-4">
            {plan.features.map((feature) => (
              <li key={feature} className="font-body text-sm text-[#D1D1D6]">
                <span className="text-[#19A6E0] mr-2">✦</span>
                {feature}
              </li>
            ))}
          </ul>
        )}

        <form className="space-y-4" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} style={labelStyle}>Nombre *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                autoCapitalize="characters"
                required
                disabled={formLocked}
                className={`${inputClass} uppercase`}
                placeholder="NOMBRE COMPLETO"
              />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Cédula *</label>
              <input
                type="text"
                name="document"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.document}
                onChange={handleDocumentChange}
                required
                disabled={formLocked}
                className={inputClass}
                placeholder="Solo números"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} style={labelStyle}>WhatsApp/Teléfono *</label>
              <input
                type="tel"
                name="whatsapp"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.whatsapp}
                onChange={handleWhatsappChange}
                required
                disabled={formLocked}
                className={inputClass}
                placeholder="Tu celular"
              />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Correo *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleEmailChange}
                required
                disabled={formLocked}
                className={inputClass}
                placeholder="nombre@correo.com"
              />
            </div>
          </div>

          <hr className="border-white/5 my-4" />

          <div>
            <label className={labelClass} style={labelStyle}>
              {plan ? 'Suite del plan *' : 'Selecciona Suite *'}
            </label>
            <select
              name="suiteId"
              value={formData.suiteId}
              onChange={handleSuiteChange}
              disabled={formLocked || ratesLoading || !!catalogError || suiteLocked}
              className={selectClass}
            >
              {ratesLoading && <option value="">Cargando suites…</option>}
              {!ratesLoading && suiteChoices.map(({ suite, recommended }) => (
                <option key={suite.id} value={suite.id}>
                  {recommended && plan?.suitePolicy.mode === 'same-price'
                    ? `${suite.name} · Recomendada`
                    : suite.name}
                </option>
              ))}
            </select>
            {suiteLocked && selectedSuite && (
              <p className="mt-1 text-[10px] text-gris-medio uppercase tracking-widest">
                {plan ? 'Este plan se reserva solo en esta suite' : 'Suite fijada desde la ficha seleccionada'}
              </p>
            )}
            {plan?.suitePolicy.mode === 'same-price' && (
              <p className="mt-1 text-[10px] text-gris-medio uppercase tracking-widest">
                Puedes elegir cualquier suite de este precio. Las recomendadas son las del plan.
              </p>
            )}
          </div>

          <div>
            <label className={labelClass} style={labelStyle} id="pack-tiempo-label">
              {plan ? 'Duración *' : 'Pack de tiempo *'}
            </label>
            <div
              role="group"
              aria-labelledby="pack-tiempo-label"
              className="flex flex-wrap gap-2"
            >
              {!availablePacks.length && (
                <p className="text-sm text-gris-medio">
                  {ratesLoading ? 'Cargando duraciones…' : 'Sin duraciones'}
                </p>
              )}
              {availablePacks.map((pack) => {
                const isActive = formData.packId === pack.rateTypeId;
                return (
                  <button
                    key={pack.rateTypeId}
                    type="button"
                    disabled={formLocked || ratesLoading}
                    aria-pressed={isActive}
                    title={packLabel(pack)}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, packId: pack.rateTypeId }))
                    }
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-[background-color,border-color,color,opacity] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E6007E] disabled:opacity-60 ${
                      isActive
                        ? 'border border-[#E6007E] bg-[#E6007E] text-white'
                        : 'border border-white/20 bg-white/5 text-gris-medio hover:border-white/40 hover:text-white'
                    }`}
                  >
                    {packChipLabel(pack)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} style={labelStyle}>Fecha de visita *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleSelectChange}
                min={minVisitDate}
                required
                disabled={formLocked}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Hora aproximada *</label>
              <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <div>
                  <select
                    name="timeHour"
                    value={formData.timeHour}
                    onChange={handleSelectChange}
                    disabled={formLocked}
                    className={selectClass}
                    aria-label="Hora"
                  >
                    {HOUR_OPTIONS.map((hour) => (
                      <option key={hour} value={hour}>{hour}</option>
                    ))}
                  </select>
                  <span className="mt-1 block text-center text-[10px] uppercase tracking-widest text-gris-medio">
                    Hora
                  </span>
                </div>
                <div>
                  <select
                    name="timeMinute"
                    value={formData.timeMinute}
                    onChange={handleSelectChange}
                    disabled={formLocked}
                    className={selectClass}
                    aria-label="Minutos"
                  >
                    {MINUTE_OPTIONS.map((minute) => (
                      <option key={minute} value={minute}>{minute}</option>
                    ))}
                  </select>
                  <span className="mt-1 block text-center text-[10px] uppercase tracking-widest text-gris-medio">
                    Minuto
                  </span>
                </div>
                <div>
                  <select
                    name="timePeriod"
                    value={formData.timePeriod}
                    onChange={handleSelectChange}
                    disabled={formLocked}
                    className={selectClass}
                    aria-label="AM o PM"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                  <span className="mt-1 block text-center text-[10px] uppercase tracking-widest text-gris-medio">
                    Periodo
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-[10px] text-gris-medio uppercase tracking-widest">
            {visitSummary}
          </p>

          <div className="bg-bg-dark/80 rounded-brand p-4 border border-white/5 mt-6 space-y-2">
            <div className="flex justify-between items-center gap-4">
              <span className="text-sm font-medium uppercase tracking-widest text-[#E6007E]" style={{ color: '#E6007E' }}>
                {plan ? 'Precio del plan:' : 'Valor de la reserva:'}
              </span>
              <span className="text-2xl font-heading text-cyan-orbital font-bold text-right">
                {ratesLoading
                  ? '…'
                  : canShowPrice
                    ? `${formatPlanPrice(price)} COP`
                    : '—'}
              </span>
            </div>
            {stayQuote && (
              <div className="space-y-1 text-[11px] uppercase tracking-widest text-gris-medio">
                <p>Pago total en línea, 20 %: {formatPlanPrice(stayQuote.totalCharge)}</p>
                <p>Abono 50 % en línea: {formatPlanPrice(stayQuote.depositCharge)} de {formatPlanPrice(stayQuote.depositTotal)}</p>
                <p>WhatsApp sin pago: {formatPlanPrice(stayQuote.catalog)}. El personal cobra el abono.</p>
              </div>
            )}
          </div>
          {!ratesLoading && !canShowPrice && (
            <p className="font-body text-caption text-gris-medio -mt-2">
              {plan
                ? 'Elige duración y fecha. El precio sale de la tarifa del plan, entre semana o fin de semana.'
                : 'Elige suite, pack de tiempo y fecha para calcular el valor.'}
            </p>
          )}
          {plan && formData.date && selectedSuite && (
            <p className="font-body text-caption text-gris-medio" role="status">
              {slotChecking
                ? 'Revisando si la suite está libre en ese horario…'
                : slotAvailability?.conflict
                  ? 'Esa suite se cruza con otra reserva. Elige otra suite u otra hora.'
                  : slotAvailability?.checked
                    ? 'La suite está libre en ese horario, con la hora de aseo.'
                    : 'Todavía no podemos verificar el cruce de horarios desde aquí. El equipo confirma la suite.'}
            </p>
          )}

          {(submitError || catalogError) && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-brand px-3 py-2" role="alert">
              {submitError || catalogError}
            </p>
          )}
          {submitSuccess && !submitError && (
            <p className="text-sm text-cyan-orbital bg-cyan-orbital/10 border border-cyan-orbital/20 rounded-brand px-3 py-2" role="status">
              {submitSuccess}
            </p>
          )}

          <div className="grid grid-cols-1 gap-3 pt-4">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'wompi')}
              disabled={submitDisabled}
              className="w-full bg-magenta-digital hover:bg-magenta-digital/90 text-white font-heading py-3 rounded-brand transition-all glow-magenta flex items-center justify-center gap-2 hover:scale-102 disabled:opacity-60 disabled:hover:scale-100"
            >
              {paymentLabel('wompi')}
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'wompi_abono')}
              disabled={submitDisabled}
              className="w-full border border-[#E6007E] bg-transparent hover:bg-[#E6007E] text-white font-heading py-3 rounded-brand transition-all flex items-center justify-center gap-2 hover:scale-102 disabled:opacity-60 disabled:hover:scale-100"
            >
              {paymentLabel('wompi_abono')}
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'whatsapp')}
              disabled={submitDisabled}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-heading py-3 rounded-brand transition-all flex items-center justify-center gap-2 hover:scale-102 disabled:opacity-60 disabled:hover:scale-100"
            >
              {paymentLabel('whatsapp')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
