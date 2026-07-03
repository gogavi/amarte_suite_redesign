import { motion } from 'framer-motion';
import { useState, useRef } from 'react';

interface Plan {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  imageEmoji: string;
  category: string;
}

interface PlanesSectionProps {
  onSelectPlan: (planName: string) => void;
}

const planesList: Plan[] = [
  {
    id: 'decoracion_clasica',
    name: 'Romance Clásico',
    price: '$120.000',
    category: 'Romance',
    description: 'La atmósfera tradicional e infalible para celebrar amor y complicidad.',
    features: [
      'Pétalos de rosa naturales sobre la cama',
      'Globos metalizados de helio (Rojos)',
      'Velas aromáticas led decorativas',
      '1 Botella de vino o champaña de la casa',
    ],
    imageEmoji: '🌹',
  },
  {
    id: 'plan_cumpleanos',
    name: 'Plan Cumpleaños',
    price: '$150.000',
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
    price: '$250.000',
    category: 'Romance',
    description: 'Nuestra experiencia insignia de lujo y romance total.',
    features: [
      'Arreglo de rosas premium importadas',
      'Decoración extendida con pétalos y globos de corazón',
      'Botella de champaña Möet o seleccionada',
      'Deliciosas fresas cubiertas con chocolate',
    ],
    imageEmoji: '💖',
  },
  {
    id: 'plan_erotico',
    name: 'Plan Erótico',
    price: '$190.000',
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
    price: '$200.000',
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
    price: '$170.000',
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
    id: 'plan_novimiento',
    name: 'Plan Novimiento',
    price: '$195.000',
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

export default function PlanesSection({ onSelectPlan }: PlanesSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const maxScroll = element.scrollWidth - element.clientWidth;
    if (maxScroll > 0) {
      setScrollProgress(element.scrollLeft / maxScroll);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.75 
        : scrollLeft + clientWidth * 0.75;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 md:py-20 px-6 max-w-6xl mx-auto relative" aria-label="Planes Románticos">
      <div className="mb-10 text-center sm:text-left">
        <span className="text-xs text-[#19A6E0] uppercase tracking-widest font-heading mb-2 block">
          Personaliza tu Estadía
        </span>
        <h2 className="font-heading text-3xl md:text-4xl text-white uppercase">
          PLANES DE <span className="text-[#E6007E] filter drop-shadow-[0_0_12px_rgba(230,0,126,0.25)]">DECORACIÓN</span>
        </h2>
      </div>

      <div className="relative w-full group/carousel px-2">
        {/* Left Arrow (Magenta, sides) */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-[-24px] top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-[#17171E]/95 backdrop-blur-md border border-[#E6007E] text-[#E6007E] flex items-center justify-center hover:bg-[#E6007E] hover:text-white transition-all duration-200 opacity-60 hover:opacity-100 hidden sm:flex shadow-[0_0_15px_rgba(230,0,126,0.3)] text-xl font-bold"
          aria-label="Anterior"
        >
          ←
        </button>

        {/* Horizontal Scroll Carousel */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-6 overflow-x-auto pb-6 scroll-smooth snap-x snap-mandatory no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {planesList.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="flex-shrink-0 w-[290px] sm:w-[320px] snap-start rounded-2xl bg-[#17171E]/50 backdrop-blur-md border border-white/5 p-6 flex flex-col justify-between hover:border-[#E6007E]/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(230,0,126,0.12)]"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="text-4xl">{plan.imageEmoji}</div>
                  <span className="text-[9px] text-[#19A6E0] uppercase tracking-wider font-heading px-2 py-0.5 rounded bg-[#19A6E0]/10 border border-[#19A6E0]/20">
                    {plan.category}
                  </span>
                </div>
                <h3 className="font-heading text-lg text-white uppercase mb-2">{plan.name}</h3>
                <p className="font-body text-xs text-[#D1D1D6] leading-relaxed mb-4 min-h-[50px]">{plan.description}</p>
                <div className="text-xl font-heading text-[#E6007E] mb-6">{plan.price}</div>

                <ul className="space-y-2 border-t border-white/5 pt-4 mb-6">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="font-body text-[11px] text-[#D1D1D6] flex items-start">
                      <span className="text-[#19A6E0] mr-2">✦</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => onSelectPlan(plan.name)}
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-[#E6007E] hover:text-white border border-white/10 hover:border-transparent text-white font-heading text-xs uppercase tracking-widest transition-all duration-200"
              >
                Agregar con Martina
              </button>
            </motion.div>
          ))}
        </div>

        <div className="pointer-events-none absolute right-0 top-0 h-[calc(100%-1.5rem)] w-14 bg-gradient-to-l from-bg-dark via-bg-dark/80 to-transparent sm:hidden" />

        {/* Right Arrow (Magenta, sides) */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-[-24px] top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-[#17171E]/95 backdrop-blur-md border border-[#E6007E] text-[#E6007E] flex items-center justify-center hover:bg-[#E6007E] hover:text-white transition-all duration-200 opacity-60 hover:opacity-100 hidden sm:flex shadow-[0_0_15px_rgba(230,0,126,0.3)] text-xl font-bold"
          aria-label="Siguiente"
        >
          →
        </button>
      </div>

      {/* Swipe Notice / Progress Dots for Mobile */}
      <div className="flex flex-col items-center gap-3 mt-3 sm:hidden" aria-hidden="true">
        <div className="relative h-1.5 w-28 overflow-hidden rounded-full bg-white/10">
          <div 
            className="absolute left-0 top-0 h-full w-12 rounded-full bg-gradient-to-r from-[#E6007E] to-[#19A6E0] shadow-[0_0_14px_rgba(230,0,126,0.35)] transition-all duration-75"
            style={{ transform: `translateX(${scrollProgress * (112 - 48)}px)` }}
          />
        </div>
        <span className="text-[10px] text-[#B7B4BC] uppercase tracking-widest">
          Desliza para ver {planesList.length} planes →
        </span>
      </div>
    </section>
  );
}
