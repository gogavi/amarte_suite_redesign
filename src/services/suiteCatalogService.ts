import { supabase } from '../lib/supabaseClient';

export type SuitePack = {
  rateTypeId: string;
  name: string;
  hours: number;
  order: number;
  weekdayPrice: number;
  weekendPrice: number;
};

export type CatalogSuite = {
  id: string;
  name: string;
  packs: SuitePack[];
};

type RoomRateRow = {
  price: number | string;
  room_types: {
    id: string;
    name: string;
    active: boolean | null;
    sort_order: number | null;
  } | null;
  rate_types: {
    id: string;
    name: string;
    hours: number;
    order_index: number;
    active: boolean | null;
  } | null;
  day_categories: {
    id: string;
    name: string;
    days: string[] | null;
  } | null;
};

const LOCAL_SUITE_NAME_TO_DB: Record<string, string> = {
  'Suite Deluxe Diamante': 'Suite Diamante',
  'Suite Deluxe Gold': 'Suite Gold',
  'Suite Deluxe Rubí': 'Suite Rubí',
  'Suite Deluxe Zafiro': 'Suite Zafiro',
  'Suite Temática Gótica / Baticueva': 'Suite Gótica',
  'Suite Temática Árabe': 'Suite Árabe',
  'Suite Temática Harley Queen': 'Suite Queen',
  'Suite Especial Jacuzzi VIP': 'Suite Jacuzzi',
  'Suite Especial Cabaña': 'Suite Cabaña',
  'Suite Especial Amarte': 'Suite Amarte',
  'Suite Especial Cama en Movimiento': 'Suite Movimiento',
};

function isWeekendDayCategory(dayName: string, days: string[] | null): boolean {
  if (dayName.toLowerCase().includes('viernes')) return true;
  if (!days?.length) return false;
  return days.includes('Viernes') || days.includes('Sábado');
}

/** Viernes=5, Sábado=6 en Date#getDay() (fecha YYYY-MM-DD parseada en local). */
export function isWeekendDate(dateIso: string): boolean {
  if (!dateIso) return false;
  const [year, month, day] = dateIso.split('-').map(Number);
  if (!year || !month || !day) return false;
  const weekday = new Date(year, month - 1, day).getDay();
  return weekday === 5 || weekday === 6;
}

export function resolveCatalogSuiteName(localSuiteName?: string | null): string | null {
  if (!localSuiteName) return null;
  return LOCAL_SUITE_NAME_TO_DB[localSuiteName] ?? localSuiteName;
}

export function getPackPrice(pack: SuitePack, dateIso: string): number {
  return isWeekendDate(dateIso) ? pack.weekendPrice : pack.weekdayPrice;
}

export async function fetchSuiteCatalog(): Promise<CatalogSuite[]> {
  const { data, error } = await supabase
    .from('room_rates')
    .select(`
      price,
      room_types!inner (
        id,
        name,
        active,
        sort_order
      ),
      rate_types!inner (
        id,
        name,
        hours,
        order_index,
        active
      ),
      day_categories!inner (
        id,
        name,
        days
      )
    `);

  if (error) {
    throw new Error(error.message || 'No se pudo cargar el catálogo de suites.');
  }

  const rows = (data ?? []) as RoomRateRow[];
  const bySuite = new Map<string, CatalogSuite & { sortOrder: number }>();

  for (const row of rows) {
    const room = row.room_types;
    const rate = row.rate_types;
    const day = row.day_categories;
    if (!room || !rate || !day) continue;
    if (room.active === false || rate.active === false) continue;
    if (!room.name.startsWith('Suite ')) continue;

    const price = Math.round(Number(row.price));
    if (!Number.isFinite(price)) continue;

    let suite = bySuite.get(room.id);
    if (!suite) {
      suite = {
        id: room.id,
        name: room.name,
        packs: [],
        sortOrder: room.sort_order ?? 999,
      };
      bySuite.set(room.id, suite);
    }

    let pack = suite.packs.find((item) => item.rateTypeId === rate.id);
    if (!pack) {
      pack = {
        rateTypeId: rate.id,
        name: rate.name,
        hours: rate.hours,
        order: rate.order_index,
        weekdayPrice: 0,
        weekendPrice: 0,
      };
      suite.packs.push(pack);
    }

    if (isWeekendDayCategory(day.name, day.days)) {
      pack.weekendPrice = price;
    } else {
      pack.weekdayPrice = price;
    }
  }

  return Array.from(bySuite.values())
    .map((suite) => ({
      id: suite.id,
      name: suite.name,
      packs: suite.packs
        .filter((pack) => pack.weekdayPrice > 0 || pack.weekendPrice > 0)
        .sort((a, b) => a.order - b.order || a.hours - b.hours),
    }))
    .filter((suite) => suite.packs.length > 0)
    .sort((a, b) => {
      const left = bySuite.get(a.id)?.sortOrder ?? 999;
      const right = bySuite.get(b.id)?.sortOrder ?? 999;
      if (left !== right) return left - right;
      return a.name.localeCompare(b.name, 'es');
    });
}
