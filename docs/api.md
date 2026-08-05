# API — Contratos vía servicios

No existe un backend REST propio. El “contrato” son funciones en `src/services/`.

## Catálogo de suites y packs

**`suiteCatalogService.ts`**

- `fetchSuiteCatalog()` → lee `room_rates` (+ `room_types`, `rate_types`, `day_categories`).
- `getPackPrice(pack, dateIso)` → weekday vs weekend (vie/sáb).
- `resolveCatalogSuiteName(localName)` → mapeo UI → nombre BD.

## Planes de decoración

**`plansCatalogService.ts`**

- `fetchPlanWeekday6hPrices()` → precios Pack 6h · Dom–Jue para `room_types` cuyo nombre empieza con `Plan `.
- Contenido editorial en `src/data/planesContent.ts`.

## Pre-reserva

**`reservationService.ts`**

- `createWebReservation(input)` → `insert` en `reservations`.
- `PaymentMethod`: `'wompi' | 'whatsapp'`.

Campos relevantes del input: `name`, `whatsapp`, `tipo`, `packTiempo`, `date`, `time`, `price`, `method`.

## Pagos / WhatsApp

**`paymentLinks.ts`**

- URLs Wompi y mensajes WhatsApp de reservas.

## Chat / Martina

**`amarteChatbot.ts`**, **`martinaService.ts`**

- Prefetch/apertura del widget; no sustituyen la pre-reserva en BD.

## Suites (contenido local)

**`ratesService.ts`**

- Metadata editorial de suites (imágenes, videos, copy) usada por la UI de tarjetas.
