# UI — Patrones de la experiencia web

Fuente canónica de tokens: [`07_DesignSystem.md`](../07_DesignSystem.md) + `tailwind.config.js`.

## Look & feel

- Dark espacial (`bg-dark`), acentos magenta (CTA) y cyan (secundario).
- Tipografía: Fjalla One (heading) + Jost (body).
- Glass / `reflective-glass` en paneles y nav.

## Landing

Orden típico en `Home.tsx`: Hero → Trust → Video → Suites → Planes → Promo → Hub → Contacto → Martina → Footer.

### Navegación de secciones

- Desktop/tablet: `SectionDotNav` (dots + label activo), alineada a `max-w-6xl`.
- Móvil: `SectionStickyNav` (chips).
- Config: `src/data/sectionNav.ts`.

### Videos

- Modales de plan (hero) y suite: `createPortal` a `document.body`, centrados.
- `VideoExperience`: YouTube embed con play explícito (audio con `mute=0` tras click).

### Pre-reserva (`ReservaExpressForm`)

- Pack de tiempo como chips (no `<select>`).
- Fecha con `min` = hoy.
- Resumen centrado: fecha + hora seleccionadas.
- Hora / minuto / periodo con subtítulos bajo cada control.

## Motion

Respetar `prefers-reduced-motion`. Evitar sobrecargar el hero en móvil.
