import { supabase } from '../lib/supabaseClient';

export type StayHours = '4h' | '8h' | '12h' | 'day_hotelero';
export type PaymentMethod = 'epayco' | 'whatsapp';

const SUITE_ID_TO_TIPO: Record<string, string> = {
  'suite-diamante': 'Suite Diamante',
  'suite-gold': 'Suite Gold',
  'suite-rubi': 'Suite Rubí',
  'suite-zafiro': 'Suite Zafiro',
  'suite-gotica': 'Suite Gótica',
  'suite-arabe': 'Suite Árabe',
  'suite-harleyqueen': 'Suite Queen',
  'suite-vip-jacuzzi': 'Suite Jacuzzi',
  'suite-cabaña': 'Suite Cabaña',
  'suite-amarte': 'Suite Amarte',
  'suite-movimiento': 'Suite Movimiento',
};

const HOURS_TO_PACK: Record<StayHours, string> = {
  '4h': 'Pack 4 horas',
  '8h': 'Pack 8 horas',
  '12h': 'Pack 12 horas',
  day_hotelero: 'Día Hotelero',
};

export type CreateWebReservationInput = {
  name: string;
  document?: string;
  whatsapp: string;
  email?: string;
  suiteId: string;
  hours: StayHours;
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

export function mapSuiteIdToTipo(suiteId: string): string {
  const tipo = SUITE_ID_TO_TIPO[suiteId];
  if (!tipo) {
    throw new Error(`Suite no reconocida para la base de datos: ${suiteId}`);
  }
  return tipo;
}

export function mapHoursToPackTiempo(hours: StayHours): string {
  return HOURS_TO_PACK[hours];
}

export async function createWebReservation(
  input: CreateWebReservationInput
): Promise<CreateWebReservationResult> {
  const tipo = mapSuiteIdToTipo(input.suiteId);
  const packTiempo = mapHoursToPackTiempo(input.hours);
  const formaPago = input.method === 'epayco' ? 'ePayco' : 'WhatsApp';

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
