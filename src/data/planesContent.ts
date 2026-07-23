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
    description: 'La atmósfera tradicional e infalible para celebrar amor y complicidad.',
    features: [
      'Pétalos de rosa naturales sobre la cama',
      'Globos metalizados de helio (Rojos)',
      'Velas aromáticas',
      'Botella de vino espumoso de la casa',
    ],
    imageEmoji: '🌹',
  },
  {
    id: 'plan_cumpleanos',
    name: 'Plan Cumpleaños',
    dbName: 'Plan Cumpleaños',
    category: 'Celebración',
    description: 'Festeja tu día especial con un montaje festivo y dulce.',
    features: [
      'Letrero y globos metalizados de Feliz Cumpleaños',
      'Mini torta gourmet para compartir',
      'Globos de helio en colores de la marca',
      'Botella de vino espumoso de la casa',
    ],
    imageEmoji: '🎂',
  },
  {
    id: 'plan_amarte',
    name: 'Plan Amarte',
    dbName: 'Plan Amarte',
    category: 'Romance',
    description: 'Nuestra experiencia insignia de lujo y romance total.',
    features: [
      'Pétalos de rosa naturales sobre la cama',
      'Decoración extendida con globos rojos de corazón',
      'Botella de vino espumoso de la casa',
      'Dos chocolates',
    ],
    imageEmoji: '💖',
  },
  {
    id: 'plan_erotico',
    name: 'Plan Erótico',
    dbName: 'Plan Erótico',
    category: 'Fantasía',
    description: 'Diseñado para romper la rutina y explorar sensaciones apasionantes.',
    features: [
      'Iluminación roja/magenta de acento romántico',
      'Aceites de masaje aromáticos y térmicos',
      'Kit erótico de iniciación (juguete + plumas)',
      'Vino espumoso y fresas con chocolate',
    ],
    imageEmoji: '🖤',
  },
  {
    id: 'plan_humedo',
    name: 'Plan Húmedo',
    dbName: 'Plan Húmedo',
    category: 'Bienestar',
    description: 'Relajación absoluta en jacuzzi y sauna para renovar energías.',
    features: [
      'Kit de sales relajantes y espuma para jacuzzi',
      'Esencias de eucalipto para sauna',
      'Uso de dos batas de baño afelpadas premium',
      'Tabla gourmet de quesos y jamones + champaña',
    ],
    imageEmoji: '🛀',
  },
  {
    id: 'plan_cabana',
    name: 'Plan Cabaña',
    dbName: 'Plan Cabaña',
    category: 'Romance',
    description: 'Un escape acogedor con calidez de chimenea y detalles rústicos.',
    features: [
      'Decoración rústica con faroles y velas led',
      'Vino caliente aromatizado especial de la casa',
      'Malvaviscos con chocolate caliente',
      'Cobijas térmicas extra para mayor confort',
    ],
    imageEmoji: '🏡',
  },
  {
    id: 'plan_movimiento',
    name: 'Plan Movimiento',
    dbName: 'Plan Movimiento',
    category: 'Fantasía',
    description: 'Luces rítmicas en movimiento y sonido envolvente para dejarte llevar.',
    features: [
      'Sistema de luces en movimiento automatizado',
      'Playlist especial sincronizada a altavoces de la suite',
      'Kit erótico premium sorpresa',
      '2 Cócteles de autor de nuestra coctelería',
    ],
    imageEmoji: '🎬',
  },
];
