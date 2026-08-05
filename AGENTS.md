# AGENTS.md — Amarte Web Experience

Guía de entrada para agentes de código que trabajen en este repo.

## Qué es

SPA de marketing + pre-reserva para **Amarte Suite** (Bogotá): React 18, Vite, TypeScript, Tailwind, Framer Motion, Supabase.

Dev server: **`http://localhost:3005`** (`npm run dev`).

## Dónde mirar

| Área | Ruta |
|---|---|
| App / landing | `src/views/Home.tsx`, `src/App.tsx` |
| UI | `src/components/` |
| Datos / integraciones | `src/services/`, `src/lib/supabaseClient.ts` |
| Contenido estático | `src/data/` |
| Design system | `07_DesignSystem.md`, `tailwind.config.js` |
| Docs de producto/técnicas | [`docs/`](docs/) |
| Reglas Cursor | [`.cursor/rules/`](.cursor/rules/) |

## Reglas por dominio

- [architecture.mdc](.cursor/rules/architecture.mdc) — capas y límites (siempre activa)
- [frontend.mdc](.cursor/rules/frontend.mdc) — React/TS/motion
- [backend.mdc](.cursor/rules/backend.mdc) — `services/` como API client
- [ui.mdc](.cursor/rules/ui.mdc) — tokens y patrones visuales
- [supabase.mdc](.cursor/rules/supabase.mdc) — cliente anon, RLS, schema
- [testing.mdc](.cursor/rules/testing.mdc) — convenciones de tests

## Docs

- [business.md](docs/business.md) — producto y flujos
- [api.md](docs/api.md) — contratos de servicios
- [database.md](docs/database.md) — tablas usadas
- [ui.md](docs/ui.md) — patrones de UI
- [roadmap.md](docs/roadmap.md) — estado y siguientes pasos

## Prioridades al cambiar código

1. No romper pre-reserva (`ReservaExpressForm` → `reservationService`) ni catálogo de tarifas.
2. No exponer secrets; solo `VITE_SUPABASE_*` anon.
3. Respetar design system (dark, magenta/cyan); no rediseñar el hero sin pedido.
4. Mantener `prefers-reduced-motion` y modales centrados vía portal.
5. No inventar un backend Node: extender `src/services/`.

## Convenciones rápidas

- Imports al tope del módulo.
- Switch exhaustivo con `never` en uniones.
- Commits solo si el usuario lo pide.
- Specs de features en `docs/superpowers/` cuando aplique el flujo de diseño.
