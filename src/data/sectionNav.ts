export type SectionNavItem = {
  id: string;
  label: string;
  /** Display index, 1-based (e.g. 1 → "01") */
  index: number;
};

export const SECTION_NAV_ITEMS: SectionNavItem[] = [
  { id: 'inicio', label: 'Inicio', index: 1 },
  { id: 'suites-section', label: 'Suites', index: 2 },
  { id: 'martina', label: 'Martina', index: 3 },
  { id: 'planes', label: 'Planes', index: 4 },
  { id: 'experiencias', label: 'Experiencias', index: 5 },
  { id: 'contacto', label: 'Contacto', index: 6 },
];

export function formatSectionIndex(index: number): string {
  return String(index).padStart(2, '0');
}
