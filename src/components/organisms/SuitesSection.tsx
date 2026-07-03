import { useState, useEffect } from 'react';
import { Suite, suitesData } from '../../services/ratesService';
import SuiteCard from '../molecules/SuiteCard';
import StackedCardsDeck from './StackedCardsDeck';

interface SuitesSectionProps {
  onSelectSuite: (suite: Suite) => void;
}

export default function SuitesSection({ onSelectSuite }: SuitesSectionProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section className="py-16 md:py-20 px-6 max-w-6xl mx-auto flex flex-col items-center">
      
      {/* Cabecera de la Sección */}
      <div className="text-center mb-12 max-w-xl">
        <span className="text-xs text-cyan-orbital uppercase tracking-widest font-heading mb-2 block">
          Nuestras Suites
        </span>
        <h1 className="font-heading text-4xl md:text-5xl text-white mb-4 uppercase">
          CONOCE TU PRÓXIMO <span className="text-magenta-digital filter drop-shadow-[0_0_12px_rgba(230,0,126,0.25)]">DESTINO</span>
        </h1>
        <p className="font-body text-rosa-cuarzo text-base font-light leading-relaxed">
          {isMobile 
            ? "Explora una suite a la vez, compara el ambiente y elige la experiencia que mejor acompaña tu noche."
            : "Compara nuestras categorías premium de suites temáticas y deluxe para encontrar la velada perfecta."
          }
        </p>
      </div>

      {/* Renderizado Dinámico Híbrido (Desktop Grid / Mobile Stacked Deck) */}
      <div className="w-full flex justify-center min-h-[500px]">
        {isMobile ? (
          // Vista Móvil: Showcase premium con suite protagonista
          <div className="w-full py-4">
            <StackedCardsDeck 
              suites={suitesData} 
              onSelectSuite={onSelectSuite} 
            />
          </div>
        ) : (
          // Vista Escritorio: Grid de Comparación Clásico Premium
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {suitesData.map((suite) => (
              <SuiteCard 
                key={suite.id} 
                suite={suite} 
                onSelect={onSelectSuite} 
              />
            ))}
          </div>
        )}
      </div>

    </section>
  );
}
