import imgDiamante from '../assets/suites/suite_diamante.jpg';
import imgGold from '../assets/suites/suite_gold.jpg';
import imgRubi from '../assets/suites/suite_rubi.jpg';
import imgZafiro from '../assets/suites/suite_zafiro.jpg';
import imgArabe from '../assets/suites/suite_arabe.jpg';
import imgBaticueva from '../assets/suites/suite_baticueva.jpg';
import imgHarleyQueen from '../assets/suites/suite_harleyqueen.jpg';
import imgJacuzziVip from '../assets/suites/suite_jacuzzi_VIP.jpg';
import imgCabana from '../assets/suites/suite_cabana.jpg';
import imgAmarte from '../assets/suites/suite_amarte.jpg';
import imgMovimiento from '../assets/suites/suite_movimiento.jpg';

export interface SuiteRate {
  "4h": number;
  "8h": number;
  "12h": number;
  day_hotelero: number;
}

export interface Suite {
  id: string;
  name: string;
  slug: string;
  category: "deluxe" | "tematica" | "especial";
  description: string;
  features: {
    jacuzzi: boolean;
    sauna: boolean;
    cama_movimiento: boolean;
    aire_acondicionado: boolean;
  };
  rates: {
    weekday: SuiteRate;
    weekend: SuiteRate;
  };
  image: string;
  whatsappLink: string;
  videoYoutubeId?: string;
}

export const suitesData: Suite[] = [
  {
    id: "suite-diamante",
    name: "Suite Deluxe Diamante",
    slug: "suite-deluxe-diamante",
    category: "deluxe",
    description: "Nuestra suite insignia. Lujo absoluto, jacuzzi de hidromasaje, acabados premium y atmósfera con iluminación digital programable para una noche inolvidable.",
    features: { jacuzzi: true, sauna: true, cama_movimiento: false, aire_acondicionado: true },
    rates: {
      weekday: { "4h": 200000, "8h": 230000, "12h": 280000, day_hotelero: 350000 },
      weekend: { "4h": 250000, "8h": 290000, "12h": 350000, day_hotelero: 390000 }
    },
    image: imgDiamante,
    whatsappLink: "https://wa.me/p/5897691113605046/573235726252"  },
  {
    id: "suite-gold",
    name: "Suite Deluxe Gold",
    slug: "suite-deluxe-gold",
    category: "deluxe",
    description: "Atmósfera dorada de lujo y seducción. Diseñada con detalles en chapa de oro y espejos panorámicos para una velada llena de sofisticación.",
    features: { jacuzzi: true, sauna: false, cama_movimiento: false, aire_acondicionado: true },
    rates: {
      weekday: { "4h": 200000, "8h": 230000, "12h": 280000, day_hotelero: 350000 },
      weekend: { "4h": 250000, "8h": 290000, "12h": 350000, day_hotelero: 390000 }
    },
    image: imgGold,
    whatsappLink: "https://wa.me/p/5897691113605046/573235726252"  },
  {
    id: "suite-rubi",
    name: "Suite Deluxe Rubí",
    slug: "suite-deluxe-rubi",
    category: "deluxe",
    description: "Elegancia y pasión en tonalidades carmesí. Cuenta con tina de hidromasajes, acabados de mármol y un ambiente diseñado para encender los sentidos.",
    features: { jacuzzi: true, sauna: false, cama_movimiento: false, aire_acondicionado: true },
    rates: {
      weekday: { "4h": 200000, "8h": 230000, "12h": 280000, day_hotelero: 350000 },
      weekend: { "4h": 250000, "8h": 290000, "12h": 350000, day_hotelero: 390000 }
    },
    image: imgRubi,
    whatsappLink: "https://wa.me/p/5897691113605046/573235726252"  },
  {
    id: "suite-zafiro",
    name: "Suite Deluxe Zafiro",
    slug: "suite-deluxe-zafiro",
    category: "deluxe",
    description: "Atmósfera azul zafiro que evoca calma y exclusividad. Equipada con jacuzzi, luces inteligentes graduables y cama king size premium.",
    features: { jacuzzi: true, sauna: false, cama_movimiento: false, aire_acondicionado: true },
    rates: {
      weekday: { "4h": 200000, "8h": 230000, "12h": 280000, day_hotelero: 350000 },
      weekend: { "4h": 250000, "8h": 290000, "12h": 350000, day_hotelero: 390000 }
    },
    image: imgZafiro,
    whatsappLink: "https://wa.me/p/5897691113605046/573235726252"  },
  {
    id: "suite-gotica",
    name: "Suite Temática Gótica / Baticueva",
    slug: "suite-gotica",
    category: "tematica",
    description: "Fantasía oscura y misterio. Iluminación de acento tenue, decoración gótica evocando la baticueva, tina de hidromasaje y detalles temáticos únicos.",
    features: { jacuzzi: true, sauna: false, cama_movimiento: false, aire_acondicionado: false },
    rates: {
      weekday: { "4h": 200000, "8h": 230000, "12h": 280000, day_hotelero: 350000 },
      weekend: { "4h": 250000, "8h": 290000, "12h": 350000, day_hotelero: 390000 }
    },
    image: imgBaticueva,
    whatsappLink: "https://wa.me/p/4019349191434593/573235726252"  },
  {
    id: "suite-arabe",
    name: "Suite Temática Árabe",
    slug: "suite-arabe",
    category: "tematica",
    description: "Transpórtate a las mil y una noches. Cúpulas orientales, cojines de seda, jacuzzi con iluminación cálida y cama redonda de ensueño rodeada de velos.",
    features: { jacuzzi: true, sauna: false, cama_movimiento: false, aire_acondicionado: true },
    rates: {
      weekday: { "4h": 200000, "8h": 230000, "12h": 280000, day_hotelero: 350000 },
      weekend: { "4h": 250000, "8h": 290000, "12h": 350000, day_hotelero: 390000 }
    },
    image: imgArabe,
    whatsappLink: "https://wa.me/p/4019862324758030/573235726252"  },
  {
    id: "suite-harleyqueen",
    name: "Suite Temática Harley Queen",
    slug: "suite-harleyqueen",
    category: "tematica",
    description: "Decoración inspirada en el arte pop y el dinamismo urbano. Colores vibrantes, jacuzzi de hidromasaje y ambiente lúdico y divertido.",
    features: { jacuzzi: true, sauna: false, cama_movimiento: false, aire_acondicionado: true },
    rates: {
      weekday: { "4h": 200000, "8h": 230000, "12h": 280000, day_hotelero: 350000 },
      weekend: { "4h": 250000, "8h": 290000, "12h": 350000, day_hotelero: 390000 }
    },
    image: imgHarleyQueen,
    whatsappLink: "https://wa.me/p/4019862324758030/573235726252"  },
  {
    id: "suite-vip-jacuzzi",
    name: "Suite Especial Jacuzzi VIP",
    slug: "suite-vip-jacuzzi",
    category: "especial",
    description: "Máxima relajación y escape de la rutina. Jacuzzi gigante climatizado con cromoterapia para una desconexión total en Teusaquillo.",
    features: { jacuzzi: true, sauna: true, cama_movimiento: false, aire_acondicionado: false },
    rates: {
      weekday: { "4h": 175000, "8h": 200000, "12h": 250000, day_hotelero: 320000 },
      weekend: { "4h": 200000, "8h": 240000, "12h": 300000, day_hotelero: 350000 }
    },
    image: imgJacuzziVip,
    whatsappLink: "https://wa.me/p/4566077396739183/573235726252"  },
  {
    id: "suite-cabaña",
    name: "Suite Especial Cabaña",
    slug: "suite-cabana",
    category: "especial",
    description: "Estilo rústico, íntimo y acogedor. Chimenea artificial, paredes de madera y cama de gran tamaño para simular un escape en la montaña.",
    features: { jacuzzi: false, sauna: false, cama_movimiento: true, aire_acondicionado: false },
    rates: {
      weekday: { "4h": 100000, "8h": 130000, "12h": 160000, day_hotelero: 200000 },
      weekend: { "4h": 120000, "8h": 150000, "12h": 220000, day_hotelero: 270000 }
    },
    image: imgCabana,
    whatsappLink: "https://wa.me/p/3980047085436054/573235726252"  },
  {
    id: "suite-amarte",
    name: "Suite Especial Amarte",
    slug: "suite-amarte",
    category: "especial",
    description: "Nuestra suite homónima. Decoración romántica insuperable, jacuzzi privado y detalles florales y de luces listos para sorprender.",
    features: { jacuzzi: true, sauna: false, cama_movimiento: false, aire_acondicionado: true },
    rates: {
      weekday: { "4h": 180000, "8h": 210000, "12h": 260000, day_hotelero: 330000 },
      weekend: { "4h": 210000, "8h": 250000, "12h": 310000, day_hotelero: 360000 }
    },
    image: imgAmarte,
    whatsappLink: "https://wa.me/p/4566077396739183/573235726252"  },
  {
    id: "suite-movimiento",
    name: "Suite Especial Cama en Movimiento",
    slug: "suite-movimiento",
    category: "especial",
    description: "Lleva tu fantasía a otro plano. Suite equipada con nuestra famosa cama con movimiento rítmico automatizado y sonido de alta fidelidad.",
    features: { jacuzzi: false, sauna: false, cama_movimiento: true, aire_acondicionado: true },
    rates: {
      weekday: { "4h": 120000, "8h": 150000, "12h": 180000, day_hotelero: 220000 },
      weekend: { "4h": 140000, "8h": 170000, "12h": 240000, day_hotelero: 290000 }
    },
    image: imgMovimiento,
    whatsappLink: "https://wa.me/p/3980047085436054/573235726252"  }
];

export const getSuites = (): Suite[] => {
  return suitesData;
};

export const getSuiteBySlug = (slug: string): Suite | undefined => {
  return suitesData.find(s => s.slug === slug);
};

export const calculateRate = (suiteId: string, hours: "4h" | "8h" | "12h" | "day_hotelero", isWeekend: boolean): number => {
  const suite = suitesData.find(s => s.id === suiteId);
  if (!suite) return 0;
  const ratesGroup = isWeekend ? suite.rates.weekend : suite.rates.weekday;
  return ratesGroup[hours];
};
