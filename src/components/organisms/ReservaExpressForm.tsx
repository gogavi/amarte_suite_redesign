import React, { useState } from 'react';
import { useReservation } from '../../context/ReservationContext';
import { calculateRate, suitesData } from '../../services/ratesService';

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
    hours: '4h' as "4h" | "8h" | "12h" | "day_hotelero",
    suiteId: state.selectedSuite?.id || suitesData[0].id
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleSubmit = (e: React.FormEvent, method: 'epayco' | 'whatsapp') => {
    e.preventDefault();
    if (!formData.name || !formData.whatsapp || !formData.date || !formData.time) {
      alert('Por favor completa los campos obligatorios: Nombre, WhatsApp, Fecha y Hora.');
      return;
    }

    const selectedSuite = suitesData.find((s) => s.id === formData.suiteId);
    if (!selectedSuite) return;

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
      // Redirección al checkout ePayco
      window.open('https://secure.payco.co/checkoutopen/66308', '_blank');
    } else {
      // Redirección WhatsApp con datos formateados
      const message = `¡Hola! Quiero reservar en el Planeta Romántico:\n\n*Huésped:* ${formData.name}\n*Suite:* ${selectedSuite.name}\n*Fecha:* ${formData.date}\n*Hora:* ${formData.time}\n*Estadía:* ${formData.hours}\n*Valor Estimado:* $${price.toLocaleString('es-CO')} COP\n\nQuedo pendiente para confirmar el pago. 🪐`;
      const encodedMsg = encodeURIComponent(message);
      window.open(`https://wa.me/573235726252?text=${encodedMsg}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-bg-dark/80 backdrop-blur-md flex items-center justify-center p-4 z-modal overflow-y-auto">
      <div className="glass-panel w-full max-w-xl rounded-brand p-6 md:p-8 relative shadow-2xl my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gris-medio hover:text-white transition-colors"
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
                className="w-full bg-bg-dark/60 border border-white/10 rounded-brand px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-orbital"
              />
            </div>
            <div>
              <label className="text-xs text-gris-medio uppercase tracking-widest block mb-1">Cédula (Opcional)</label>
              <input
                type="text"
                name="document"
                value={formData.document}
                onChange={handleInputChange}
                className="w-full bg-bg-dark/60 border border-white/10 rounded-brand px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-orbital"
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
                className="w-full bg-bg-dark/60 border border-white/10 rounded-brand px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-orbital"
              />
            </div>
            <div>
              <label className="text-xs text-gris-medio uppercase tracking-widest block mb-1">Correo (Opcional)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-bg-dark/60 border border-white/10 rounded-brand px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-orbital"
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
                className="w-full bg-bg-dark border border-white/10 rounded-brand px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-orbital"
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
                className="w-full bg-bg-dark border border-white/10 rounded-brand px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-orbital"
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
                className="w-full bg-bg-dark/60 border border-white/10 rounded-brand px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-orbital"
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
                className="w-full bg-bg-dark/60 border border-white/10 rounded-brand px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-orbital"
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

          {/* Botones de acción */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'epayco')}
              className="w-full bg-magenta-digital hover:bg-magenta-digital/90 text-white font-heading py-3 rounded-brand transition-all glow-magenta flex items-center justify-center gap-2 hover:scale-102"
            >
              💳 Pagar Online (ePayco)
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'whatsapp')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-heading py-3 rounded-brand transition-all flex items-center justify-center gap-2 hover:scale-102"
            >
              💬 Reservar por WhatsApp
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
