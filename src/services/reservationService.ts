import { supabase } from '../lib/supabaseClient';

export type PaymentMethod = 'epayco' | 'whatsapp';

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

export async function createWebReservation(
  input: CreateWebReservationInput
): Promise<CreateWebReservationResult> {
  const tipo = input.tipo.trim();
  const packTiempo = input.packTiempo.trim();
  const formaPago = input.method === 'epayco' ? 'ePayco' : 'WhatsApp';

  if (!tipo || !packTiempo) {
    throw new Error('Faltan tipo de suite o pack de tiempo.');
  }

  const row: ReservationInsertRow = {
    nombre: input.name.trim(),
    documento: (input.document ?? '').trim(),
    whatsapp: input.whatsapp.trim(),
    correo: (input.email ?? '').trim(),
    tipo,
    suite: '—',
    fecha_reserva: input.date,
    hora_reserva: input.time,
    pack_tiempo: packTiempo,
    precio: String(Math.round(input.price)),
    canal: 'Web Automático',
    forma_pago: formaPago,
    tipo_plan: 'Sin Decoración',
    decoracion: 'SIN DECORACIÓN',
    is_taken: false,
    mensaje: '',
    asesora: '',
    modificado_por: 'web',
    abono: '',
    hotel_observations: '',
  };

  const { data, error } = await supabase
    .from('reservations')
    .insert(row)
    .select('id')
    .single();

  if (error) {
    throw new Error(error.message || 'No se pudo guardar la pre-reserva.');
  }

  if (!data?.id) {
    throw new Error('La pre-reserva no devolvió un id.');
  }

  return {
    id: data.id as string,
    tipo,
    packTiempo,
  };
}
