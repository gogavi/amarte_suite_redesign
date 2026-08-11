# Section Scroll Nav — Design Spec

**Date:** 2026-07-28  
**Status:** Approved (user)  
**Scope:** Landing home only (`activeView === 'home'`)

## Goal

Navegación in-page que indica la sección visible al scrollear y permite saltar entre secciones. Experiencia híbrida por breakpoint.

## Decisions

| Decision | Choice |
|---|---|
| Desktop / tablet (`md+`) | Opción A — cápsula vertical de dots a la derecha con label activo |
| Móvil (`< md`) | Opción C — barra sticky superior con chips horizontales |
| Secciones | Compacto: Inicio, Suites, Planes, Experiencias, Contacto, Martina |
| Label desktop | Siempre visible en el dot activo (`01. Inicio`) |
| Chips móvil | Pills con borde/fondo cyan en el activo |
| Fuera de alcance | Cablear labels decorativos del hero; nav en vistas internas |

## Sections

| Index | Label | Anchor `id` | Target |
|---|---|---|---|
| 01 | Inicio | `inicio` | Wrapper around `HeroOrbital` |
| 02 | Suites | `suites-section` | Existing wrapper in `Home.tsx` |
| 03 | Planes | `planes` | `PlanesSection` root |
| 04 | Experiencias | `experiencias` | `HubAccessGrid` root |
| 05 | Contacto | `contacto` | `ContactoSection` root |
| 06 | Martina | `martina` | `MartinaFeatureSection` root |

TrustBar, VideoExperience, PromoBanner y Footer no aparecen en el menú.

## Behavior

1. `IntersectionObserver` observa las 6 secciones; la con mayor ratio visible (o la más cercana al centro del viewport) es `activeId`.
2. Click / Enter / Space en un ítem → `element.scrollIntoView({ behavior: 'smooth', block: 'start' })`.
3. Respetar `prefers-reduced-motion`: scroll instantáneo si reduced motion.
4. Nav oculta cuando `activeView !== 'home'`.
5. Desktop: `fixed` derecha, centrado vertical, `z-nav` (500).
6. Móvil: `sticky` top, glass oscuro; chips scrollables horizontalmente; sin dots laterales (evitar conflicto con chat flotante).

## Visual

- Tokens: `bg-dark` / surface glass, acento `cyan-orbital` (`#19A6E0`), texto blanco / `gris-medio`.
- Estética Amarte (glass suave, glow cyan contenido) — no neón agresivo.
- Microinteracciones: transición de tamaño/opacidad del dot activo; Framer Motion ligero o CSS transitions.
- Accesibilidad: `nav` con `aria-label`, ítems como botones/links con `aria-current="true"` en el activo; focus visible.

## Architecture

```
SECTION_NAV_ITEMS (data)
        │
        ▼
 useSectionSpy(ids) ──► activeId
        │
        ├── SectionDotNav (hidden md:flex)
        └── SectionStickyNav (md:hidden)
                │
                └── Home.tsx (mount + section ids)
```

### Files

| File | Role |
|---|---|
| `src/data/sectionNav.ts` | Config: id, label, index |
| `src/hooks/useSectionSpy.ts` | IntersectionObserver → activeId |
| `src/components/molecules/SectionDotNav.tsx` | Desktop/tablet UI |
| `src/components/molecules/SectionStickyNav.tsx` | Mobile UI |
| `src/views/Home.tsx` | Mount nav + ensure section ids |
| Section organisms | Add `id` props where missing |

## Non-goals

- Reemplazar o cablear el header decorativo del hero.
- Deep-linking obligatorio vía hash URL (nice-to-have futuro).
- Nav en `PlanesView` / `SexShopView` / etc.
