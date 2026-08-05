import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useReservation } from '../../context/ReservationContext';
import { createWebReservation, type PaymentMethod } from '../../services/reservationService';
import { buildWhatsappReservasUrl, buildWhatsappReservationMessage, getWompiCheckoutUrl } from '../../services/paymentLinks';
import {
  fetchSuiteCatalog,
  getPackPrice,
  resolveCatalogSuiteName,
  type CatalogSuite,
  type SuitePack,
} from '../../services/suiteCatalogService';
import { trackEvent } from '../../lib/analytics';

interface ReservaExpressFormProps {
  onClose: () => void;
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

export default function ReservaExpressForm({ onClose }: ReservaExpressFormProps) {
  const { state, dispatch } = useReservation();
  const lockedLocalSuiteName = state.selectedSuite?.name ?? null;
  const lockedCatalogName = resolveCatalogSuiteName(lockedLocalSuiteName);
  const onCloseRef = useRef(onClose);

  const [catalog, setCatalog] = useState<CatalogSuite[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

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
  const [submitError, setSubmitError] = useState<string | null>(null);

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
    trackEvent('reserva_form_open', {
      location: 'reserva_express',
      suite_name: lockedLocalSuiteName ?? undefined,
    });
  }, [lockedLocalSuiteName]);

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

  const selectedSuite = useMemo(
    () => catalog.find((suite) => suite.id === formData.suiteId) ?? null,
    [catalog, formData.suiteId]
  );

  const availablePacks = selectedSuite?.packs ?? [];

  const selectedPack = useMemo(
    () => availablePacks.find((pack) => pack.rateTypeId === formData.packId) ?? null,
    [availablePacks, formData.packId]
  );

  const canShowPrice = Boolean(selectedSuite && selectedPack && formData.date);
  const price = canShowPrice && selectedPack ? getPackPrice(selectedPack, formData.date) : 0;
  const suiteLocked = Boolean(lockedCatalogName);

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

        const preferred =
          suites.find((suite) => suite.name === lockedCatalogName) ?? suites[0];
        const preferredPack = preferred.packs[0];

        setFormData((prev) => ({
          ...prev,
          suiteId: preferred.id,
          packId: preferredPack?.rateTypeId ?? '',
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
  }, [lockedCatalogName]);

  useEffect(() => {
    if (!selectedSuite) return;
    const packStillValid = selectedSuite.packs.some((pack) => pack.rateTypeId === formData.packId);
    if (!packStillValid) {
      setFormData((prev) => ({
        ...prev,
        packId: selectedSuite.packs[0]?.rateTypeId ?? '',
      }));
    }
  }, [selectedSuite, formData.packId]);

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
    if (!formData.name.trim() || !formData.whatsapp || !formData.date) {
      return 'Completa los campos obligatorios: Nombre, WhatsApp, Fecha y Hora.';
    }

    if (formData.date < todayIsoDate()) {
      return 'La fecha de visita no puede ser anterior a hoy.';
    }

    if (formData.whatsapp.length < 10) {
      return 'El WhatsApp debe tener al menos 10 dígitos.';
    }

    if (formData.document && formData.document.length < 5) {
      return 'La cédula debe tener al menos 5 dígitos.';
    }

    const email = formData.email.trim();
    if (email && !EMAIL_REGEX.test(email)) {
      return 'Ingresa un correo válido (ejemplo: nombre@correo.com).';
    }

    if (!selectedSuite || !selectedPack) {
      return 'Selecciona una suite y un pack de tiempo.';
    }

    if (price <= 0) {
      return 'No hay tarifa disponible para esa combinación de suite y fecha.';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent, method: PaymentMethod) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    if (!selectedSuite || !selectedPack) return;

    const time = timeLabel;
    const email = formData.email.trim();

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const reservation = await createWebReservation({
        name: formData.name.trim(),
        document: formData.document,
        whatsapp: formData.whatsapp,
        email,
        tipo: selectedSuite.name,
        packTiempo: selectedPack.name,
        date: formData.date,
        time,
        price,
        method,
      });

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

      trackEvent('pre_reserva_submit', {
        location: 'reserva_express',
        transaction_id: reservation.id,
        suite_name: selectedSuite.name,
        plan_name: selectedPack.name,
        method,
        value: price,
        currency: 'COP',
      });

      if (method === 'wompi') {
        trackEvent('checkout_init', {
          location: 'reserva_express',
          transaction_id: reservation.id,
          suite_name: selectedSuite.name,
          plan_name: selectedPack.name,
          hours: selectedPack.name,
          value: price,
          currency: 'COP',
        });
        window.open(getWompiCheckoutUrl(), '_blank');
      } else {
        trackEvent('whatsapp_redirect', {
          location: 'reserva_express',
          transaction_id: reservation.id,
          suite_name: selectedSuite.name,
          plan_name: selectedPack.name,
          estimated_value: price,
          value: price,
          currency: 'COP',
        });
        const message = buildWhatsappReservationMessage({
          name: formData.name.trim(),
          document: formData.document,
          clientWhatsapp: formData.whatsapp,
          email,
          suiteName: selectedSuite.name,
          packName: selectedPack.name,
          dateIso: formData.date,
          timeLabel: time,
          price,
        });
        window.open(buildWhatsappReservasUrl(message), '_blank');
      }
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'No se pudo guardar la pre-reserva. Intenta de nuevo.';
      setSubmitError(message);
    } finally {
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

      <div className="glass-panel w-full max-w-xl rounded-brand p-6 md:p-8 relative shadow-2xl my-8 z-10">
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <button
            type="button"
            onClick={requestClose}
            disabled={isSubmitting}
            className="rounded-brand border border-white/20 bg-white/5 px-3 py-2 font-heading text-[10px] uppercase tracking-widest text-white/80 transition hover:border-white/40 hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={requestClose}
            disabled={isSubmitting}
            aria-label="Cerrar"
            className="flex min-h-10 min-w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-base text-gris-medio transition hover:border-white/30 hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <h2 className="font-heading text-2xl md:text-3xl text-white tracking-wide mb-2 text-center pr-28">
          PREPARA TU VIAJE
        </h2>
        <p className="font-body text-rosa-cuarzo text-body text-center mb-6">
          Pre-reserva en menos de 2 minutos. Cierre digital o asesoría directa.
        </p>

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
                disabled={isSubmitting}
                className={`${inputClass} uppercase`}
                placeholder="NOMBRE COMPLETO"
              />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Cédula (Opcional)</label>
              <input
                type="text"
                name="document"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.document}
                onChange={handleDocumentChange}
                disabled={isSubmitting}
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
                disabled={isSubmitting}
                className={inputClass}
                placeholder="3001234567"
              />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Correo (Opcional)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleEmailChange}
                disabled={isSubmitting}
                className={inputClass}
                placeholder="nombre@correo.com"
              />
            </div>
          </div>

          <hr className="border-white/5 my-4" />

          <div>
            <label className={labelClass} style={labelStyle}>Selecciona Suite *</label>
            <select
              name="suiteId"
              value={formData.suiteId}
              onChange={handleSuiteChange}
              disabled={isSubmitting || catalogLoading || !!catalogError || suiteLocked}
              className={selectClass}
            >
              {catalogLoading && <option value="">Cargando suites…</option>}
              {!catalogLoading && catalog.map((suite) => (
                <option key={suite.id} value={suite.id}>{suite.name}</option>
              ))}
            </select>
            {suiteLocked && selectedSuite && (
              <p className="mt-1 text-[10px] text-gris-medio uppercase tracking-widest">
                Suite fijada desde la ficha seleccionada
              </p>
            )}
          </div>

          <div>
            <label className={labelClass} style={labelStyle} id="pack-tiempo-label">
              Pack de tiempo *
            </label>
            <div
              role="group"
              aria-labelledby="pack-tiempo-label"
              className="flex flex-wrap gap-2"
            >
              {!availablePacks.length && (
                <p className="text-sm text-gris-medio">
                  {catalogLoading ? 'Cargando packs…' : 'Sin packs'}
                </p>
              )}
              {availablePacks.map((pack) => {
                const isActive = formData.packId === pack.rateTypeId;
                return (
                  <button
                    key={pack.rateTypeId}
                    type="button"
                    disabled={isSubmitting || catalogLoading}
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
                disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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

          <div className="bg-bg-dark/80 rounded-brand p-4 border border-white/5 flex justify-between items-center mt-6 gap-4">
            <span className="text-sm font-medium uppercase tracking-widest text-[#E6007E]" style={{ color: '#E6007E' }}>Valor de la reserva:</span>
            <span className="text-2xl font-heading text-cyan-orbital font-bold text-right">
              {catalogLoading
                ? '…'
                : canShowPrice
                  ? `$${price.toLocaleString('es-CO')} COP`
                  : '—'}
            </span>
          </div>
          {!catalogLoading && !canShowPrice && (
            <p className="font-body text-caption text-gris-medio -mt-2">
              Elige suite, pack de tiempo y fecha para calcular el valor.
            </p>
          )}

          {(submitError || catalogError) && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-brand px-3 py-2" role="alert">
              {submitError || catalogError}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'wompi')}
              disabled={isSubmitting || catalogLoading || !!catalogError || !canShowPrice}
              className="w-full bg-magenta-digital hover:bg-magenta-digital/90 text-white font-heading py-3 rounded-brand transition-all glow-magenta flex items-center justify-center gap-2 hover:scale-102 disabled:opacity-60 disabled:hover:scale-100"
            >
              {isSubmitting ? 'Guardando…' : '💳 Pagar Online (Wompi)'}
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'whatsapp')}
              disabled={isSubmitting || catalogLoading || !!catalogError || !canShowPrice}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-heading py-3 rounded-brand transition-all flex items-center justify-center gap-2 hover:scale-102 disabled:opacity-60 disabled:hover:scale-100"
            >
              {isSubmitting ? 'Guardando…' : '💬 Reservar por WhatsApp'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
