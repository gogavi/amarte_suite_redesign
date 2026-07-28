import { SECTION_NAV_ITEMS, formatSectionIndex } from '../../data/sectionNav';

interface SectionDotNavProps {
  activeId: string;
  onNavigate: (id: string) => void;
}

export default function SectionDotNav({ activeId, onNavigate }: SectionDotNavProps) {
  const activeItem = SECTION_NAV_ITEMS.find((item) => item.id === activeId);

  return (
    <nav
      className="pointer-events-none fixed right-4 top-1/2 z-nav hidden -translate-y-1/2 md:flex lg:right-6"
      aria-label="Navegación de secciones"
    >
      <div className="pointer-events-auto flex items-center gap-3">
        {activeItem && (
          <div
            className="rounded-full border border-cyan-orbital/80 bg-cyan-orbital/10 px-3 py-1.5 whitespace-nowrap transition-opacity duration-200 motion-reduce:transition-none"
            aria-hidden="true"
          >
            <span className="font-body text-caption font-semibold text-cyan-orbital">
              {formatSectionIndex(activeItem.index)}.
            </span>
            <span className="ml-1.5 font-body text-caption font-semibold text-white">
              {activeItem.label}
            </span>
          </div>
        )}

        <ul className="flex flex-col items-center gap-3 rounded-full border border-white/10 bg-[#17171E]/85 px-2.5 py-3.5 backdrop-blur-md reflective-glass">
          {SECTION_NAV_ITEMS.map((item) => {
            const isActive = item.id === activeId;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  aria-label={`Ir a ${item.label}`}
                  aria-current={isActive ? 'true' : undefined}
                  className={`relative block rounded-full transition-[width,height,background-color,box-shadow] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-orbital motion-reduce:transition-none ${
                    isActive
                      ? 'h-2.5 w-2.5 bg-cyan-orbital shadow-[0_0_10px_rgba(25,166,224,0.85)]'
                      : 'h-1.5 w-1.5 bg-gris-carbon hover:bg-gris-medio'
                  }`}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
