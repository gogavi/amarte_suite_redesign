import React, { useState } from 'react';
import { useReservation } from '../../context/ReservationContext';
import { calculateRate, suitesData } from '../../services/ratesService';
import {
  createWebReservation,
  type PaymentMethod,
  type StayHours,
} from '../../services/reservationService';

interface ReservaExpressFormProps {
  onClose: () => void;
}

export default function ReservaExpressForm({ onClose }: ReservaExpressFormProps) {
  const { state, dispatch } = useReservation();
  const [formData, setFormData] = useState({
    name: '',
    document: '',
    whatsapp: '',
    email: '',
    date: '',
    time: '',
    hours: '4h' as StayHours,
    suiteId: state.selectedSuite?.id || suitesData[0].id
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (submitError) setSubmitError(null);
  };

  const calculateFinalPrice = () => {
    const selectedSuite = suitesData.find((s) => s.id === formData.suiteId);
    if (!selectedSuite) return 0;

    // Detectar si la fecha es viernes o sábado
    let isWeekend = false;
    if (formData.date) {
      const day = new Date(formData.date).getDay();
      isWeekend = day === 4 || day === 5; // 4 = Viernes, 5 = Sábado en Javascript Date si se parsea local
    }

    return calculateRate(formData.suiteId, formData.hours, isWeekend);
  };

  const price = calculateFinalPrice();

  const handleSubmit = async (e: React.FormEvent, method: PaymentMethod) => {
    e.preventDefault();
    if (!formData.name || !formData.whatsapp || !formData.date || !formData.time) {
      setSubmitError('Completa los campos obligatorios: Nombre, WhatsApp, Fecha y Hora.');
      return;
    }

    const selectedSuite = suitesData.find((s) => s.id === formData.suiteId);
    if (!selectedSuite) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await createWebReservation({
        name: formData.name,
        document: formData.document,
        whatsapp: formData.whatsapp,
        email: formData.email,
        suiteId: formData.suiteId,
        hours: formData.hours,
        date: formData.date,
        time: formData.time,
        price,
        method,
      });

      dispatch({
        type: 'SET_USER_DATA',
        payload: {
          name: formData.name,
          document: formData.document,
          whatsapp: formData.whatsapp,
          email: formData.email
        }
      });
      dispatch({ type: 'SET_DATE', payload: formData.date });
      dispatch({ type: 'SET_TIME', payload: formData.time });
      dispatch({ type: 'SET_HOURS', payload: formData.hours });
      dispatch({ type: 'CALCULATE_PRICE', payload: price });

      if (method === 'epayco') {
        window.open('https://secure.payco.co/checkoutopen/66308', '_blank');
      } else {
        const message = `¡Hola! Quiero reservar en el Planeta Romántico:\n\n*Huésped:* ${formData.name}\n*Suite:* ${selectedSuite.name}\n*Fecha:* ${formData.date}\n*Hora:* ${formData.time}\n*Estadía:* ${formData.hours}\n*Valor Estimado:* $${price.toLocaleString('es-CO')} COP\n\nQuedo pendiente para confirmar el pago. 🪐`;
        const encodedMsg = encodeURIComponent(message);
        window.open(`https://wa.me/573235726252?text=${encodedMsg}`, '_blank');
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

        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gris-medio uppercase tracking-widest block mb-1">Nombre *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                className="w-full bg-bg-dark/60 border border-white/10 rounded-brand px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-orbital disabled:opacity-60"
              />
            </div>
            <div>
              <label className="text-xs text-gris-medio uppercase tracking-widest block mb-1">Cédula (Opcional)</label>
              <input
                type="text"
                name="document"
                value={formData.document}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="w-full bg-bg-dark/60 border border-white/10 rounded-brand px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-orbital disabled:opacity-60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gris-medio uppercase tracking-widest block mb-1">WhatsApp/Teléfono *</label>
              <input
                type="tel"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                className="w-full bg-bg-dark/60 border border-white/10 rounded-brand px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-orbital disabled:opacity-60"
              />
            </div>
            <div>
              <label className="text-xs text-gris-medio uppercase tracking-widest block mb-1">Correo (Opcional)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="w-full bg-bg-dark/60 border border-white/10 rounded-brand px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-orbital disabled:opacity-60"
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
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="w-full bg-bg-dark border border-white/10 rounded-brand px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-orbital disabled:opacity-60"
              >
                {suitesData.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gris-medio uppercase tracking-widest block mb-1">Tiempo de estadía *</label>
              <select
                name="hours"
                value={formData.hours}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="w-full bg-bg-dark border border-white/10 rounded-brand px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-orbital disabled:opacity-60"
              >
                <option value="4h">4 Horas</option>
                <option value="8h">8 Horas</option>
                <option value="12h">12 Horas</option>
                <option value="day_hotelero">Día Hotelero (2pm - 12m)</option>
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
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                className="w-full bg-bg-dark/60 border border-white/10 rounded-brand px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-orbital disabled:opacity-60"
              />
            </div>
            <div>
              <label className="text-xs text-gris-medio uppercase tracking-widest block mb-1">Hora aproximada *</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                className="w-full bg-bg-dark/60 border border-white/10 rounded-brand px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-orbital disabled:opacity-60"
              />
            </div>
          </div>

          {/* Precio Final */}
          <div className="bg-bg-dark/80 rounded-brand p-4 border border-white/5 flex justify-between items-center mt-6">
            <span className="text-sm text-rosa-cuarzo font-light uppercase tracking-widest">Valor de la reserva:</span>
            <span className="text-2xl font-heading text-cyan-orbital font-bold">
              ${price.toLocaleString('es-CO')} COP
            </span>
          </div>

          {submitError && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-brand px-3 py-2" role="alert">
              {submitError}
            </p>
          )}

          {/* Botones de acción */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'epayco')}
              disabled={isSubmitting}
              className="w-full bg-magenta-digital hover:bg-magenta-digital/90 text-white font-heading py-3 rounded-brand transition-all glow-magenta flex items-center justify-center gap-2 hover:scale-102 disabled:opacity-60 disabled:hover:scale-100"
            >
              {isSubmitting ? 'Guardando…' : '💳 Pagar Online (ePayco)'}
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'whatsapp')}
              disabled={isSubmitting}
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
