import { motion } from 'framer-motion';
import { useEffect, useRef, useState, type UIEvent } from 'react';
import { PLANES_CONTENT, type PlanContent } from '../../data/planesContent';
import {
  fetchPlanWeekday6hPrices,
  formatPlanPrice,
} from '../../services/plansCatalogService';

type PlanCard = PlanContent & {
  priceLabel: string;
};

interface PlanesSectionProps {
  onSelectPlan: (planName: string) => void;
}

export default function PlanesSection({ onSelectPlan }: PlanesSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [planes, setPlanes] = useState<PlanCard[]>(() =>
    PLANES_CONTENT.map((plan) => ({ ...plan, priceLabel: '…' }))
  );
  const [pricesError, setPricesError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPrices() {
      try {
        const prices = await fetchPlanWeekday6hPrices();
        if (cancelled) return;

        setPlanes(
          PLANES_CONTENT.map((plan) => {
            const amount = prices[plan.dbName];
            return {
              ...plan,
              priceLabel:
                typeof amount === 'number' && amount > 0
                  ? formatPlanPrice(amount)
                  : 'Consultar',
            };
          })
        );
        setPricesError(false);
      } catch {
        if (cancelled) return;
        setPricesError(true);
        setPlanes(
          PLANES_CONTENT.map((plan) => ({ ...plan, priceLabel: 'Consultar' }))
        );
      }
    }

    void loadPrices();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const maxScroll = element.scrollWidth - element.clientWidth;
    if (maxScroll > 0) {
      setScrollProgress(element.scrollLeft / maxScroll);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo =
        direction === 'left'
          ? scrollLeft - clientWidth * 0.75
          : scrollLeft + clientWidth * 0.75;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 md:py-20 px-6 max-w-6xl mx-auto relative content-visibility-auto" aria-label="Planes Románticos">
      <div className="mb-10 text-center sm:text-left">
        <span className="text-xs text-[#19A6E0] uppercase tracking-widest font-heading mb-2 block">
          Personaliza tu Estadía
        </span>
        <h2 className="font-heading text-3xl md:text-4xl text-white uppercase">
          PLANES DE <span className="text-[#E6007E]">DECORACIÓN</span>
        </h2>
        <p className="font-body text-xs text-[#B7B4BC] mt-2">
          Precio desde pack 6 horas · Domingo a Jueves
          {pricesError ? ' · tarifas temporales no disponibles' : ''}
        </p>
      </div>

      <div className="relative w-full group/carousel px-2">
        <button
          onClick={() => scroll('left')}
          className="absolute left-[-24px] top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-[#17171E] border border-[#E6007E] text-[#E6007E] flex items-center justify-center hover:bg-[#E6007E] hover:text-white transition-[background-color,color,opacity] duration-200 opacity-60 hover:opacity-100 hidden sm:flex shadow-[0_0_15px_rgba(230,0,126,0.3)] text-xl font-bold"
          aria-label="Anterior"
        >
          ←
        </button>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-6 overflow-x-auto pb-6 scroll-smooth snap-x snap-mandatory no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {planes.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="flex-shrink-0 w-[290px] sm:w-[320px] snap-start rounded-2xl bg-[#17171E] border border-white/5 p-6 flex flex-col justify-between hover:border-[#E6007E]/30 transition-[border-color,box-shadow] duration-200 hover:shadow-[0_0_20px_rgba(230,0,126,0.12)]"
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
                <div className="mb-6">
                  <span className="text-[10px] text-[#929095] block uppercase tracking-widest font-heading mb-1">
                    Desde (6h)
                  </span>
                  <div className="text-xl font-heading text-[#E6007E]">{plan.priceLabel}</div>
                </div>

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
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-[#E6007E] hover:text-white border border-white/10 hover:border-transparent text-white font-heading text-xs uppercase tracking-widest transition-[background-color,color,border-color] duration-200"
              >
                Agregar con Martina
              </button>
            </motion.div>
          ))}
        </div>

        <div className="pointer-events-none absolute right-0 top-0 h-[calc(100%-1.5rem)] w-14 bg-gradient-to-l from-bg-dark via-bg-dark/80 to-transparent sm:hidden" />

        <button
          onClick={() => scroll('right')}
          className="absolute right-[-24px] top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-[#17171E] border border-[#E6007E] text-[#E6007E] flex items-center justify-center hover:bg-[#E6007E] hover:text-white transition-[background-color,color,opacity] duration-200 opacity-60 hover:opacity-100 hidden sm:flex shadow-[0_0_15px_rgba(230,0,126,0.3)] text-xl font-bold"
          aria-label="Siguiente"
        >
          →
        </button>
      </div>

      <div className="flex flex-col items-center gap-3 mt-3 sm:hidden" aria-hidden="true">
        <div className="relative h-1.5 w-28 overflow-hidden rounded-full bg-white/10">
          <div
            className="absolute left-0 top-0 h-full w-12 rounded-full bg-gradient-to-r from-[#E6007E] to-[#19A6E0] shadow-[0_0_14px_rgba(230,0,126,0.35)] transition-all duration-75"
            style={{ transform: `translateX(${scrollProgress * (112 - 48)}px)` }}
          />
        </div>
        <span className="text-[10px] text-[#B7B4BC] uppercase tracking-widest">
          Desliza para ver {planes.length} planes →
        </span>
      </div>
    </section>
  );
}
