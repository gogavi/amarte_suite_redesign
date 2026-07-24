import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Suite } from '../../services/ratesService';
import SuiteCard from '../molecules/SuiteCard';

interface StackedCardsDeckProps {
  suites: Suite[];
  onSelectSuite: (suite: Suite) => void;
}

function PreviewSuiteCard({ suite }: { suite: Suite }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-brand border border-white/8 bg-bg-dark">
      <img src={suite.image} alt="" aria-hidden="true" className="h-full w-full object-cover opacity-70" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D11]/90 via-[#0D0D11]/20 to-transparent" />
      <span className="absolute bottom-5 left-5 font-heading text-sm uppercase tracking-widest text-white/80">
        {suite.name}
      </span>
    </div>
  );
}

export default function StackedCardsDeck({ suites, onSelectSuite }: StackedCardsDeckProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSuite = suites[activeIndex];
  const previousSuite = suites[(activeIndex - 1 + suites.length) % suites.length];
  const nextSuite = suites[(activeIndex + 1) % suites.length];

  const goToPrevious = () => {
    setActiveIndex((current) => (current - 1 + suites.length) % suites.length);
  };

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % suites.length);
  };

  return (
    <div className="relative w-full max-w-[380px] mx-auto select-none">
      <div className="relative h-[560px] flex items-center justify-center overflow-visible">
        <motion.div
          key={`previous-${previousSuite.id}`}
          aria-hidden="true"
          className="absolute left-[-48px] top-14 w-[78%] h-[450px] rounded-brand overflow-hidden opacity-50 pointer-events-none"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 0.5, rotate: -6, scale: 0.9 }}
          transition={{ duration: 0.24, ease: [0.25, 1, 0.5, 1] }}
        >
          <PreviewSuiteCard suite={previousSuite} />
        </motion.div>

        <motion.div
          key={`next-${nextSuite.id}`}
          aria-hidden="true"
          className="absolute right-[-48px] top-14 w-[78%] h-[450px] rounded-brand overflow-hidden opacity-50 pointer-events-none"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 0.5, rotate: 6, scale: 0.9 }}
          transition={{ duration: 0.24, ease: [0.25, 1, 0.5, 1] }}
        >
          <PreviewSuiteCard suite={nextSuite} />
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeSuite.id}
            className="relative z-20 w-full h-full rounded-brand overflow-hidden shadow-[0_28px_90px_rgba(0,0,0,0.55),0_0_40px_rgba(230,0,126,0.16)]"
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
          >
            <SuiteCard suite={activeSuite} onSelect={onSelectSuite} isActiveDeckCard />
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={goToPrevious}
        className="absolute left-[-6px] top-[150px] z-30 h-11 w-11 rounded-full border border-magenta-digital/40 bg-magenta-digital text-white shadow-[0_0_28px_rgba(230,0,126,0.35)] transition-transform hover:scale-105 hover:bg-[#ff0a90] active:scale-95"
        aria-label="Ver suite anterior"
      >
        ←
      </button>

      <button
        type="button"
        onClick={goToNext}
        className="absolute right-[-6px] top-[150px] z-30 h-11 w-11 rounded-full border border-magenta-digital/40 bg-magenta-digital text-white shadow-[0_0_28px_rgba(230,0,126,0.35)] transition-transform hover:scale-105 hover:bg-[#ff0a90] active:scale-95"
        aria-label="Ver siguiente suite"
      >
        →
      </button>

      <div className="mt-5 flex flex-col items-center text-center">
        <span className="font-heading text-xs uppercase tracking-[0.28em] text-rosa-cuarzo/80">
          {activeIndex + 1} / {suites.length}
        </span>
        <span className="mt-1 font-body text-[11px] text-gris-medio">
          Explora y elige tu suite ideal
        </span>
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {suites.map((suite, index) => (
          <button
            key={suite.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Ver ${suite.name}`}
            className={`h-1.5 rounded-full transition-all ${
              index === activeIndex ? 'w-8 bg-magenta-digital' : 'w-1.5 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
