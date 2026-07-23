import { supabase } from '../lib/supabaseClient';

type RoomRateRow = {
  price: number | string;
  room_types: {
    id: string;
    name: string;
    active: boolean | null;
  } | null;
  rate_types: {
    id: string;
    name: string;
    hours: number;
    active: boolean | null;
  } | null;
  day_categories: {
    id: string;
    name: string;
    days: string[] | null;
  } | null;
};

const WEEKDAY_PACK_HOURS = 6;

function isWeekendDayCategory(dayName: string, days: string[] | null): boolean {
  if (dayName.toLowerCase().includes('viernes')) return true;
  if (!days?.length) return false;
  return days.includes('Viernes') || days.includes('Sábado');
}

export function formatPlanPrice(price: number): string {
  return `$${Math.round(price).toLocaleString('es-CO')}`;
}

/**
 * Precios de planes: Pack 6 horas · Domingo–Jueves.
 * Clave = nombre exacto en `room_types` (ej. "Plan Amarte").
 */
export async function fetchPlanWeekday6hPrices(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('room_rates')
    .select(`
      price,
      room_types!inner (
        id,
        name,
        active
      ),
      rate_types!inner (
        id,
        name,
        hours,
        active
      ),
      day_categories!inner (
        id,
        name,
        days
      )
    `);

  if (error) {
    throw new Error(error.message || 'No se pudieron cargar las tarifas de planes.');
  }

  const rows = (data ?? []) as RoomRateRow[];
  const prices: Record<string, number> = {};

  for (const row of rows) {
    const room = row.room_types;
    const rate = row.rate_types;
    const day = row.day_categories;
    if (!room || !rate || !day) continue;
    if (room.active === false || rate.active === false) continue;
    if (!room.name.startsWith('Plan ')) continue;
    if (rate.hours !== WEEKDAY_PACK_HOURS) continue;
    if (isWeekendDayCategory(day.name, day.days)) continue;

    const price = Math.round(Number(row.price));
    if (!Number.isFinite(price) || price <= 0) continue;

    prices[room.name] = price;
  }

  return prices;
}
