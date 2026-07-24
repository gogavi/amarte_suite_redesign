import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Promo {
  id: string;
  tag: string;
  title: string;
  description: string;
  ctaText: string;
  emoji: string;
  message: string;
}

const promos: Promo[] = [
  {
    id: 'cumple',
    tag: 'Campaña Especial 2026',
    title: '¿Cumples años este mes?',
    description: 'Reserva cualquier Suite con Jacuzzi VIP y te regalamos el montaje del Plan Romance Básico sin costo.',
    ctaText: 'APLICAR PROMO',
    emoji: '🎁',
    message: 'Hola Martina, vi la promoción de cumpleaños y quiero aplicarla a mi reserva.',
  },
  {
    id: 'lunes_jueves',
    tag: 'Descuento de Temporada',
    title: 'Lunes a Jueves de Aventura',
    description: 'Obtén un 15% de descuento directo seleccionando cualquier suite temática en estadías de 8 horas o más.',
    ctaText: 'RESERVAR CON 15% OFF',
    emoji: '✨',
    message: 'Hola Martina, quiero aplicar el 15% de descuento de lunes a jueves en una suite temática.',
  },
  {
    id: 'dia_hotelero',
    tag: 'Experiencia Extendida',
    title: 'Día Hotelero Premium',
    description: 'Disfruta de la suite por más tiempo con check-out tardío gratuito y botella de vino de cortesía.',
    ctaText: 'RESERVAR DÍA HOTELERO',
    emoji: '🍾',
    message: 'Hola Martina, me interesa reservar el Día Hotelero Premium con check-out tardío.',
  },
];

interface PromoBannerProps {
  onPromoClick: (message: string) => void;
}

export default function PromoBanner({ onPromoClick }: PromoBannerProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % promos.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = promos[current];

  return (
    <div className="py-6 px-6 max-w-6xl mx-auto w-full overflow-hidden">
      <div className="relative rounded-2xl bg-gradient-to-r from-[#17171E] via-[#221220] to-[#17171E] border border-[#E6007E]/30 p-6 sm:p-8 shadow-[0_0_25px_rgba(230,0,126,0.15)] hover:shadow-[0_0_35px_rgba(230,0,126,0.25)] transition-[box-shadow] duration-300 min-h-[160px] flex items-center">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#E6007E]/15 rounded-full pointer-events-none" />

        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            onClick={() => onPromoClick(slide.message)}
            className="w-full flex flex-col sm:flex-row justify-between items-center gap-6 cursor-pointer group"
          >
            <div className="flex items-center gap-4 text-left flex-1">
              <div className="text-4xl select-none group-hover:animate-bounce">
                {slide.emoji}
              </div>
              <div>
                <span className="text-[10px] text-[#E6007E] uppercase tracking-widest font-heading">
                  {slide.tag}
                </span>
                <h3 className="font-heading text-xl sm:text-2xl text-white uppercase mt-1">
                  {slide.title}
                </h3>
                <p className="font-body text-xs text-[#929095] mt-1 leading-relaxed">
                  {slide.description}
                </p>
              </div>
            </div>

            <button className="whitespace-nowrap px-6 py-3 rounded-xl bg-[#E6007E] hover:bg-[#E6007E]/90 text-white font-heading text-xs uppercase tracking-widest transition-all duration-200 shadow-[0_0_15px_rgba(230,0,126,0.3)]">
              {slide.ctaText}
            </button>
          </motion.div>
        </AnimatePresence>

        {/* Carousel indicators */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {promos.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrent(idx);
              }}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${current === idx ? 'bg-[#E6007E] w-3' : 'bg-white/20'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
