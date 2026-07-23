import React, { useEffect, useMemo, useState } from 'react';
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

interface ReservaExpressFormProps {
  onClose: () => void;
}

type TimePeriod = 'AM' | 'PM';

const HOUR_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTE_OPTIONS = ['00', '15', '30', '45'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

function formatAmPmTime(hour: string, minute: string, period: TimePeriod): string {
  return `${hour}:${minute} ${period}`;
}

function packLabel(pack: SuitePack): string {
  if (pack.name === 'Día Hotelero') return 'Día Hotelero (2pm - 12m)';
  return pack.name.replace('Pack ', '');
}

export default function ReservaExpressForm({ onClose }: ReservaExpressFormProps) {
  const { state, dispatch } = useReservation();
  const lockedLocalSuiteName = state.selectedSuite?.name ?? null;
  const lockedCatalogName = resolveCatalogSuiteName(lockedLocalSuiteName);

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
      await createWebReservation({
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

      if (method === 'wompi') {
        window.open(getWompiCheckoutUrl(), '_blank');
      } else {
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
    'w-full bg-bg-dark/60 border border-white/10 rounded-brand px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-orbital disabled:opacity-60';
  const selectClass =
    'w-full bg-bg-dark border border-white/10 rounded-brand px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-orbital disabled:opacity-60';

  return (
    <div className="fixed inset-0 bg-bg-dark/80 backdrop-blur-md flex items-center justify-center p-4 z-modal overflow-y-auto">
      <div className="glass-panel w-full max-w-xl rounded-brand p-6 md:p-8 relative shadow-2xl my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gris-medio hover:text-white transition-colors"
          disabled={isSubmitting}
        >
          ✕
        </button>

        <h2 className="font-heading text-2xl md:text-3xl text-white tracking-wide mb-2 text-center">
          PREPARA TU VIAJE
        </h2>
        <p className="font-body text-rosa-cuarzo text-sm text-center mb-6">
          Pre-reserva en menos de 2 minutos. Cierre digital o asesoría directa.
        </p>

        <form className="space-y-4" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gris-medio uppercase tracking-widest block mb-1">Nombre *</label>
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
              <label className="text-xs text-gris-medio uppercase tracking-widest block mb-1">Cédula (Opcional)</label>
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
              <label className="text-xs text-gris-medio uppercase tracking-widest block mb-1">WhatsApp/Teléfono *</label>
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
              <label className="text-xs text-gris-medio uppercase tracking-widest block mb-1">Correo (Opcional)</label>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gris-medio uppercase tracking-widest block mb-1">Selecciona Suite *</label>
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
              <label className="text-xs text-gris-medio uppercase tracking-widest block mb-1">Pack de tiempo *</label>
              <select
                name="packId"
                value={formData.packId}
                onChange={handleSelectChange}
                disabled={isSubmitting || catalogLoading || !availablePacks.length}
                className={selectClass}
              >
                {!availablePacks.length && <option value="">Sin packs</option>}
                {availablePacks.map((pack) => (
                  <option key={pack.rateTypeId} value={pack.rateTypeId}>
                    {packLabel(pack)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gris-medio uppercase tracking-widest block mb-1">Fecha de visita *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleSelectChange}
                required
                disabled={isSubmitting}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs text-gris-medio uppercase tracking-widest block mb-1">Hora aproximada *</label>
              <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
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
              </div>
              <p className="mt-1 text-[10px] text-gris-medio uppercase tracking-widest">
                Seleccionada: {timeLabel}
              </p>
            </div>
          </div>

          <div className="bg-bg-dark/80 rounded-brand p-4 border border-white/5 flex justify-between items-center mt-6 gap-4">
            <span className="text-sm text-rosa-cuarzo font-light uppercase tracking-widest">Valor de la reserva:</span>
            <span className="text-2xl font-heading text-cyan-orbital font-bold text-right">
              {catalogLoading
                ? '…'
                : canShowPrice
                  ? `$${price.toLocaleString('es-CO')} COP`
                  : '—'}
            </span>
          </div>
          {!catalogLoading && !canShowPrice && (
            <p className="text-[11px] text-gris-medio -mt-2">
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
