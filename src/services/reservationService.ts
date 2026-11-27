import {
  isMissingClickIdColumn,
  type ReservationClickColumns,
} from '../lib/googleClickIds';
import {
  paymentFieldsForTrigger,
  type PaymentMethod,
} from '../lib/reservationPricing';
import { supabase } from '../lib/supabaseClient';

export type { PaymentMethod };

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
  /**
   * Nombre del plan en `room_types` (`Plan …`).
   * Guarda la fila CON DECORACIÓN y deja la suite física en `suite`.
   */
  planName?: string;
  /** Suite elegida cuando `tipo` es el plan, no la habitación. */
  suiteChoice?: string;
  /** gclid / gbraid / wbraid. Se omiten si la tabla aún no tiene esas columnas. */
  clickIds?: ReservationClickColumns;
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
  if (raw?.includes('PRECIO_INVALIDO')) {
    return 'No se pudo confirmar el precio. Si reservaste un plan, falta aplicar la migración que evita el cobro extra de decoración.';
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
  const planName = input.planName?.trim() ?? '';
  const suiteChoice = input.suiteChoice?.trim() ?? '';
  const withPlan = planName.startsWith('Plan ');

  const row: ReservationInsertRow = {
    id,
    nombre: input.name.trim(),
    documento: (input.document ?? '').trim(),
    whatsapp: input.whatsapp.trim(),
    correo: (input.email ?? '').trim(),
    tipo,
    suite: withPlan && suiteChoice ? suiteChoice : '—',
    fecha_reserva: input.date,
    hora_reserva: input.time,
    pack_tiempo: packTiempo,
    precio: payment.precio,
    canal: 'Web Automático',
    forma_pago: payment.formaPago,
    tipo_plan: withPlan ? planName : 'Sin Decoración',
    decoracion: withPlan ? 'CON DECORACIÓN' : 'SIN DECORACIÓN',
    is_taken: false,
    mensaje: withPlan && suiteChoice ? `Suite elegida: ${suiteChoice}` : '',
    asesora: '',
    modificado_por: 'web',
    abono: payment.abono,
    hotel_observations: '',
  };

  const clickIds = input.clickIds ?? {};
  const hasClickIds = Object.keys(clickIds).length > 0;
  const rowWithClicks: ReservationInsertRow & ReservationClickColumns = {
    ...row,
    ...clickIds,
  };

  // Sin `.select()`: anon no tiene política SELECT y RETURNING devolvería 0 filas.
  let { error } = await supabase.from('reservations').insert(hasClickIds ? rowWithClicks : row);

  if (error && hasClickIds && isMissingClickIdColumn(error)) {
    const retry = await supabase.from('reservations').insert(row);
    error = retry.error;
  }

  if (error) {
    throw new Error(reservationErrorMessage(error.message));
  }

  return {
    id,
    tipo,
    packTiempo,
  };
}
