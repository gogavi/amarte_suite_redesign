# Roadmap

## Estado actual (2026)

- Landing SPA Amarte con hero Martina, suites, planes, hub y contacto.
- Pre-reserva express → Supabase `reservations` + links WhatsApp/Wompi.
- Catálogo de tarifas desde `room_rates`.
- Nav híbrida scroll-spy; modales de video portaleados.
- Docs de agente: `.cursor/rules/`, `docs/`, `AGENTS.md`.

## Próximos pasos sugeridos

1. **Testing** — Vitest + RTL en validación de reserva y mappers de precio.
2. **Schema docs** — exportar ER / políticas RLS a `docs/database.md`.
3. **Routing** — si se reactivan vistas internas, adoptar `react-router` de forma consistente.
4. **Wompi** — endurecer flujo de pago (estados, webhooks) sin exponer secrets.
5. **Performance** — budget de motion/video en mobile; Lighthouse periódico.
6. **Contenido** — alinear copy editorial y nombres BD (mapa de suites) en un solo origen.

## No prioritario

- Light mode.
- App nativa / PWA completa.
- Reescribir el stack (Next, etc.) sin necesidad de negocio.
