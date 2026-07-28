import { useEffect, useRef } from 'react';
import { SECTION_NAV_ITEMS } from '../../data/sectionNav';

interface SectionStickyNavProps {
  activeId: string;
  onNavigate: (id: string) => void;
}

export default function SectionStickyNav({ activeId, onNavigate }: SectionStickyNavProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    const scroller = scrollerRef.current;
    const chip = chipRefs.current.get(activeId);
    if (!scroller || !chip) return;

    const behavior: ScrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)')
      .matches
      ? 'auto'
      : 'smooth';

    const target =
      chip.offsetLeft - scroller.clientWidth / 2 + chip.offsetWidth / 2;

    scroller.scrollTo({ left: Math.max(0, target), behavior });
  }, [activeId]);

  return (
    <nav
      className="sticky top-0 z-nav border-b border-white/10 bg-bg-dark/92 backdrop-blur-md md:hidden"
      aria-label="Navegación de secciones"
    >
      <div className="px-3 pt-2.5 pb-2">
        <div className="mb-2 text-center font-heading text-[10px] font-bold tracking-[0.2em] text-white">
          AMARTE
        </div>
        <div
          ref={scrollerRef}
          className="flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {SECTION_NAV_ITEMS.map((item) => {
            const isActive = item.id === activeId;
            const shortLabel =
              item.id === 'experiencias' ? 'Exp.' : item.label;

            return (
              <button
                key={item.id}
                type="button"
                ref={(el) => {
                  if (el) chipRefs.current.set(item.id, el);
                  else chipRefs.current.delete(item.id);
                }}
                onClick={() => onNavigate(item.id)}
                aria-label={`Ir a ${item.label}`}
                aria-current={isActive ? 'true' : undefined}
                className={`shrink-0 rounded-full px-2.5 py-1.5 font-body text-[11px] font-semibold transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-orbital motion-reduce:transition-none ${
                  isActive
                    ? 'border border-cyan-orbital bg-cyan-orbital/20 text-cyan-orbital'
                    : 'border border-transparent text-gris-medio hover:text-white'
                }`}
              >
                {shortLabel}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
