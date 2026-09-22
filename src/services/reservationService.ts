import { supabase } from '../lib/supabaseClient';

export type PaymentMethod = 'wompi' | 'whatsapp';

export type CreateWebReservationInput = {
  name: string;
  document?: string;
  whatsapp: string;
  email?: string;
  /** Nombre de suite en BD (`tipo`), ej. Suite Diamante */
  tipo: string;
  /** Pack en BD (`pack_tiempo`), ej. Pack 4 horas */
  packTiempo: string;
  date: string;
  time: string;
  price: number;
  method: PaymentMethod;
};

export type CreateWebReservationResult = {
  id: string;
  tipo: string;
  packTiempo: string;
};

type ReservationInsertRow = {
  id: string;
  nombre: string;
  documento: string;
  whatsapp: string;
  correo: string;
  tipo: string;
  suite: string;
  fecha_reserva: string;
  hora_reserva: string;
  pack_tiempo: string;
  precio: string;
  canal: string;
  forma_pago: string;
  tipo_plan: string;
  decoracion: string;
  is_taken: boolean;
  mensaje: string;
  asesora: string;
  modificado_por: string;
  abono: string;
  hotel_observations: string;
};

type TriggerPaymentFields = {
  formaPago: string;
  precio: string;
  abono: string;
};

/**
 * Valores que acepta `enforce_reservation_web_price` para el rol `anon`.
 * WhatsApp = precio de catálogo, abono 0.
 * Wompi = Pago total (80 % del pack, abono = precio).
 */
function paymentFieldsForTrigger(
  method: PaymentMethod,
  catalogPrice: number
): TriggerPaymentFields {
  const pack = Math.round(catalogPrice);

  switch (method) {
    case 'whatsapp':
      return {
        formaPago: 'Sin pago / Continuar por WhatsApp',
        precio: String(pack),
        abono: '0',
      };
    case 'wompi': {
      const full = Math.round(pack * 0.8);
      return {
        formaPago: 'Pago total',
        precio: String(full),
        abono: String(full),
      };
    }
    default: {
      const exhaustive: never = method;
      throw new Error(`Método de pago no soportado: ${exhaustive}`);
    }
  }
}

function createReservationId(): string {
  if (typeof crypto.randomUUID !== 'function') {
    throw new Error('No se pudo generar el id de la pre-reserva.');
  }
  return crypto.randomUUID();
}

function reservationErrorMessage(raw: string | undefined): string {
  if (raw?.includes('SUITE_NO_DISPONIBLE')) {
    return 'La suite no está disponible en esa fecha y hora.';
  }
  if (raw?.includes('SUITE_INACTIVA')) {
    return 'Esa suite no está disponible.';
  }
  return 'No se pudo guardar la pre-reserva. Intenta de nuevo.';
}

export async function createWebReservation(
  input: CreateWebReservationInput
): Promise<CreateWebReservationResult> {
  const tipo = input.tipo.trim();
  const packTiempo = input.packTiempo.trim();

  if (!tipo || !packTiempo) {
    throw new Error('Faltan tipo de suite o pack de tiempo.');
  }

  const id = createReservationId();
  const payment = paymentFieldsForTrigger(input.method, input.price);

  const row: ReservationInsertRow = {
    id,
    nombre: input.name.trim(),
    documento: (input.document ?? '').trim(),
    whatsapp: input.whatsapp.trim(),
    correo: (input.email ?? '').trim(),
    tipo,
    suite: '—',
    fecha_reserva: input.date,
    hora_reserva: input.time,
    pack_tiempo: packTiempo,
    precio: payment.precio,
    canal: 'Web Automático',
    forma_pago: payment.formaPago,
    tipo_plan: 'Sin Decoración',
    decoracion: 'SIN DECORACIÓN',
    is_taken: false,
    mensaje: '',
    asesora: '',
    modificado_por: 'web',
    abono: payment.abono,
    hotel_observations: '',
  };

  // Sin `.select()`: anon no tiene política SELECT y RETURNING devolvería 0 filas.
  const { error } = await supabase.from('reservations').insert(row);

  if (error) {
    throw new Error(reservationErrorMessage(error.message));
  }

  return {
    id,
    tipo,
    packTiempo,
  };
}
