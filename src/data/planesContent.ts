export type PlanCategory = 'Romance' | 'Celebración' | 'Fantasía' | 'Bienestar';

export type PlanContent = {
  id: string;
  /** Nombre visible en la UI */
  name: string;
  /** Nombre exacto en `room_types` (Supabase) */
  dbName: string;
  description: string;
  features: string[];
  imageEmoji: string;
  category: PlanCategory;
};

/** Contenido editorial de planes. El precio se resuelve desde Supabase. */
export const PLANES_CONTENT: PlanContent[] = [
  {
    id: 'decoracion_clasica',
    name: 'Plan Romántico',
    dbName: 'Plan Romántico',
    category: 'Romance',
    description:
      'Montaje clásico de amor y complicidad en Suites Deluxe Gold, Rubí o Zafiro.',
    features: [
      'Vino espumoso',
      'Globos',
      'Pétalos',
      'Crispetas',
      'Velas',
      'Dos chocolates',
      'Sauna y jacuzzi',
    ],
    imageEmoji: '🌹',
  },
  {
    id: 'plan_cumpleanos',
    name: 'Plan Cumpleaños',
    dbName: 'Plan Cumpleaños',
    category: 'Celebración',
    description:
      'Festeja tu día especial en Suites Deluxe Queen, Gótica o Árabe.',
    features: [
      'Vino espumoso',
      'Globos',
      'Pétalos',
      'Crispetas',
      'Velas',
      'Dos chocolates',
      'Sauna y jacuzzi',
    ],
    imageEmoji: '🎂',
  },
  {
    id: 'plan_amarte',
    name: 'Plan Amarte',
    dbName: 'Plan Amarte',
    category: 'Romance',
    description: 'Experiencia insignia de romance total en Suite Amarte.',
    features: [
      'Vino espumoso',
      'Columpio',
      'Pétalos',
      'Crispetas',
      'Globos',
      'Dos chocolates',
    ],
    imageEmoji: '💖',
  },
  {
    id: 'plan_erotico',
    name: 'Plan Erótico',
    dbName: 'Plan Erótico',
    category: 'Fantasía',
    description:
      'Fantasía y seducción en Suites Deluxe Queen, Diamante o Árabe.',
    features: [
      'Antifaz - Body - Esposas - Látigo',
      'Vino espumoso',
      'Globos',
      'Pétalos',
      'Velas',
      'Dos chocolates',
      'Jacuzzi',
    ],
    imageEmoji: '🖤',
  },
  {
    id: 'plan_humedo',
    name: 'Plan Húmedo',
    dbName: 'Plan Húmedo',
    category: 'Bienestar',
    description: 'Relajación con jacuzzi en Suite VIP Jacuzzi.',
    features: [
      'Vino espumoso',
      'Globos',
      'Pétalos',
      'Crispetas',
      'Velas',
      'Dos chocolates',
      'Jacuzzi',
    ],
    imageEmoji: '🛀',
  },
  {
    id: 'plan_cabana',
    name: 'Plan Cabaña',
    dbName: 'Plan Cabaña',
    category: 'Romance',
    description: 'Escape íntimo y acogedor en Suite Cabaña.',
    features: [
      'Vino espumoso',
      'Silla Erótica',
      'Pétalos',
      'Crispetas',
      'Globos',
      'Dos chocolates',
    ],
    imageEmoji: '🏡',
  },
  {
    id: 'plan_movimiento',
    name: 'Plan Movimiento',
    dbName: 'Plan Movimiento',
    category: 'Fantasía',
    description: 'Suite Movimiento con única cama dinámica.',
    features: [
      'Vino espumoso',
      'Cama con movimientos',
      'Pétalos',
      'Crispetas',
      'Globos',
      'Dos chocolates',
    ],
    imageEmoji: '🎬',
  },
];
