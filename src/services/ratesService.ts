import { responsiveFromPicture, type ResponsiveImage } from '../lib/responsiveImage';
import imgDiamante from '../assets/suites/suite_diamante.jpg?w=480;960&format=avif;webp&as=picture';
import imgGold from '../assets/suites/suite_gold.jpg?w=480;960&format=avif;webp&as=picture';
import imgRubi from '../assets/suites/suite_rubi.jpg?w=480;960&format=avif;webp&as=picture';
import imgZafiro from '../assets/suites/suite_zafiro.jpg?w=480;960&format=avif;webp&as=picture';
import imgArabe from '../assets/suites/suite_arabe.jpg?w=480;960&format=avif;webp&as=picture';
import imgBaticueva from '../assets/suites/suite_baticueva.jpg?w=480;960&format=avif;webp&as=picture';
import imgHarleyQueen from '../assets/suites/suite_harleyqueen.jpg?w=480;960&format=avif;webp&as=picture';
import imgJacuzziVip from '../assets/suites/suite_jacuzzi_VIP.jpg?w=480;960&format=avif;webp&as=picture';
import imgCabana from '../assets/suites/suite_cabana.jpg?w=480;960&format=avif;webp&as=picture';
import imgAmarte from '../assets/suites/suite_amarte.jpg?w=480;960&format=avif;webp&as=picture';
import imgMovimiento from '../assets/suites/suite_movimiento.jpg?w=480;960&format=avif;webp&as=picture';

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
  image: ResponsiveImage;
  whatsappLink: string;
  /** URL pública del MP4 en el bucket `generated-videos` de Supabase Storage. */
  videoUrl?: string;
  videoYoutubeId?: string;
}

const GENERATED_VIDEOS_BASE = `${
  import.meta.env.VITE_SUPABASE_URL || "https://dftbelnombbtjryqphaa.supabase.co"
}/storage/v1/object/public/generated-videos`;

function buildSuiteVideoUrl(videoFile: string): string {
  return `${GENERATED_VIDEOS_BASE}/${encodeURIComponent(videoFile)}`;
}

export const suitesData: Suite[] = [
  {
    id: "suite-diamante",
    name: "Suite Deluxe Diamante",
    slug: "suite-deluxe-diamante",
    category: "tematica",
    description: "Suite temática con jacuzzi.",
    features: { jacuzzi: true, sauna: false, cama_movimiento: false, aire_acondicionado: true },
    rates: {
      weekday: { "4h": 240000, "8h": 280000, "12h": 340000, day_hotelero: 420000 },
      weekend: { "4h": 300000, "8h": 350000, "12h": 420000, day_hotelero: 470000 }
    },
    image: responsiveFromPicture(imgDiamante),
    whatsappLink: "https://wa.me/p/5897691113605046/573235726252",
    videoUrl: buildSuiteVideoUrl("SUITE DELUXE DIAMANTE.mp4"),
  },
  {
    id: "suite-gold",
    name: "Suite Deluxe Gold",
    slug: "suite-deluxe-gold",
    category: "deluxe",
    description: "Suite deluxe en tonos dorados, con sauna y jacuzzi.",
    features: { jacuzzi: true, sauna: true, cama_movimiento: false, aire_acondicionado: true },
    rates: {
      weekday: { "4h": 240000, "8h": 280000, "12h": 340000, day_hotelero: 420000 },
      weekend: { "4h": 300000, "8h": 350000, "12h": 420000, day_hotelero: 470000 }
    },
    image: responsiveFromPicture(imgGold),
    whatsappLink: "https://wa.me/p/5897691113605046/573235726252",
    videoUrl: buildSuiteVideoUrl("SUITE DELUXE GOLD.mp4"),
  },
  {
    id: "suite-rubi",
    name: "Suite Deluxe Rubí",
    slug: "suite-deluxe-rubi",
    category: "deluxe",
    description: "Suite deluxe en tonos carmesí, con sauna y jacuzzi.",
    features: { jacuzzi: true, sauna: true, cama_movimiento: false, aire_acondicionado: true },
    rates: {
      weekday: { "4h": 240000, "8h": 280000, "12h": 340000, day_hotelero: 420000 },
      weekend: { "4h": 300000, "8h": 350000, "12h": 420000, day_hotelero: 470000 }
    },
    image: responsiveFromPicture(imgRubi),
    whatsappLink: "https://wa.me/p/5897691113605046/573235726252",
    videoUrl: buildSuiteVideoUrl("SUITE RUBI.mp4"),
  },
  {
    id: "suite-zafiro",
    name: "Suite Deluxe Zafiro",
    slug: "suite-deluxe-zafiro",
    category: "deluxe",
    description: "Suite deluxe en tonos azules, con sauna y jacuzzi.",
    features: { jacuzzi: true, sauna: true, cama_movimiento: false, aire_acondicionado: true },
    rates: {
      weekday: { "4h": 240000, "8h": 280000, "12h": 340000, day_hotelero: 420000 },
      weekend: { "4h": 300000, "8h": 350000, "12h": 420000, day_hotelero: 470000 }
    },
    image: responsiveFromPicture(imgZafiro),
    whatsappLink: "https://wa.me/p/5897691113605046/573235726252",
    videoUrl: buildSuiteVideoUrl("SUITE DELUXE ZAFIRO.mp4"),
  },
  {
    id: "suite-gotica",
    name: "Suite Temática Gótica / Baticueva",
    slug: "suite-gotica",
    category: "tematica",
    description: "Suite temática de estilo gótico, con sauna y jacuzzi.",
    features: { jacuzzi: true, sauna: true, cama_movimiento: false, aire_acondicionado: false },
    rates: {
      weekday: { "4h": 240000, "8h": 280000, "12h": 340000, day_hotelero: 420000 },
      weekend: { "4h": 300000, "8h": 350000, "12h": 420000, day_hotelero: 470000 }
    },
    image: responsiveFromPicture(imgBaticueva),
    whatsappLink: "https://wa.me/p/4019349191434593/573235726252",
    videoUrl: buildSuiteVideoUrl("SUITE GOTICA.mp4"),
  },
  {
    id: "suite-arabe",
    name: "Suite Temática Árabe",
    slug: "suite-arabe",
    category: "tematica",
    description: "Suite temática de estilo árabe, con jacuzzi.",
    features: { jacuzzi: true, sauna: false, cama_movimiento: false, aire_acondicionado: true },
    rates: {
      weekday: { "4h": 240000, "8h": 280000, "12h": 340000, day_hotelero: 420000 },
      weekend: { "4h": 300000, "8h": 350000, "12h": 420000, day_hotelero: 470000 }
    },
    image: responsiveFromPicture(imgArabe),
    whatsappLink: "https://wa.me/p/4019862324758030/573235726252",
    videoUrl: buildSuiteVideoUrl("SUITE DELUXE ARABE.mp4"),
  },
  {
    id: "suite-harleyqueen",
    name: "Suite Temática Harley Queen",
    slug: "suite-harleyqueen",
    category: "tematica",
    description: "Suite temática de estilo pop, con jacuzzi.",
    features: { jacuzzi: true, sauna: false, cama_movimiento: false, aire_acondicionado: true },
    rates: {
      weekday: { "4h": 240000, "8h": 280000, "12h": 340000, day_hotelero: 420000 },
      weekend: { "4h": 300000, "8h": 350000, "12h": 420000, day_hotelero: 470000 }
    },
    image: responsiveFromPicture(imgHarleyQueen),
    whatsappLink: "https://wa.me/p/4019862324758030/573235726252",
    videoUrl: buildSuiteVideoUrl("SUITE DELUXE QUEEN.mp4"),
  },
  {
    id: "suite-vip-jacuzzi",
    name: "Suite Especial Jacuzzi VIP",
    slug: "suite-vip-jacuzzi",
    category: "especial",
    description: "Suite con jacuzzi.",
    features: { jacuzzi: true, sauna: false, cama_movimiento: false, aire_acondicionado: false },
    rates: {
      weekday: { "4h": 200000, "8h": 240000, "12h": 300000, day_hotelero: 380000 },
      weekend: { "4h": 240000, "8h": 290000, "12h": 360000, day_hotelero: 420000 }
    },
    image: responsiveFromPicture(imgJacuzziVip),
    whatsappLink: "https://wa.me/p/4566077396739183/573235726252",
    videoUrl: buildSuiteVideoUrl("SUITE VIP JACUZZI.mp4"),
  },
  {
    id: "suite-cabaña",
    name: "Suite Especial Cabaña",
    slug: "suite-cabana",
    category: "especial",
    description: "Suite de estilo cabaña.",
    features: { jacuzzi: false, sauna: false, cama_movimiento: false, aire_acondicionado: false },
    rates: {
      weekday: { "4h": 120000, "8h": 160000, "12h": 190000, day_hotelero: 240000 },
      weekend: { "4h": 150000, "8h": 180000, "12h": 260000, day_hotelero: 320000 }
    },
    image: responsiveFromPicture(imgCabana),
    whatsappLink: "https://wa.me/p/3980047085436054/573235726252",
    videoUrl: buildSuiteVideoUrl("SUITE CABANA.mp4"),
  },
  {
    id: "suite-amarte",
    name: "Suite Especial Amarte",
    slug: "suite-amarte",
    category: "especial",
    description: "Suite sencilla, sin jacuzzi.",
    features: { jacuzzi: false, sauna: false, cama_movimiento: false, aire_acondicionado: true },
    rates: {
      weekday: { "4h": 90000, "8h": 120000, "12h": 160000, day_hotelero: 200000 },
      weekend: { "4h": 120000, "8h": 160000, "12h": 220000, day_hotelero: 260000 }
    },
    image: responsiveFromPicture(imgAmarte),
    whatsappLink: "https://wa.me/p/4566077396739183/573235726252",
    videoUrl: buildSuiteVideoUrl("SUITE AMARTE.mp4"),
  },
  {
    id: "suite-movimiento",
    name: "Suite Especial Cama en Movimiento",
    slug: "suite-movimiento",
    category: "especial",
    description: "Suite con cama en movimiento.",
    features: { jacuzzi: false, sauna: false, cama_movimiento: true, aire_acondicionado: true },
    rates: {
      weekday: { "4h": 120000, "8h": 160000, "12h": 190000, day_hotelero: 240000 },
      weekend: { "4h": 150000, "8h": 180000, "12h": 260000, day_hotelero: 320000 }
    },
    image: responsiveFromPicture(imgMovimiento),
    whatsappLink: "https://wa.me/p/3980047085436054/573235726252",
    videoUrl: buildSuiteVideoUrl("SUITE MOVIMIENTO.mp4"),
  },
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
