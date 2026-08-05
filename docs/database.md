# Database — Vista desde el cliente

Fuente de verdad: proyecto Supabase. El frontend usa la **anon key** con RLS.

## Tablas tocadas por la web

### `room_rates`

Join principal del catálogo. Relaciona:

- `room_types` — suites y planes (`name`, `active`, `sort_order`)
- `rate_types` — packs (`name`, `hours`, `order_index`, `active`)
- `day_categories` — categoría de día (`name`, `days[]`)

Uso:

- Suites + packs de tiempo (4h / 8h / 12h / Día Hotelero, etc.)
- Precios de planes (filtro `Plan %` + 6h + no fin de semana)

### `reservations`

Insert desde pre-reserva web. Campos escritos (entre otros):

- `nombre`, `documento`, `whatsapp`, `correo`
- `tipo`, `suite`, `pack_tiempo`, `precio`
- `fecha_reserva`, `hora_reserva`
- `canal` (`Web Automático`), `forma_pago` (`Wompi` | `WhatsApp`)
- `tipo_plan`, `decoracion`, `is_taken`, `modificado_por` (`web`)

## Convenciones

- Nombres de suite en BD pueden diferir del copy UI (ver mapa en `suiteCatalogService`).
- Weekend comercial: viernes y sábado (y categorías de día que los incluyan).
- No usar service role en el browser.

## Pendiente de documentar

- Diagrama ER completo / migraciones versionadas en repo.
- Políticas RLS explícitas por tabla.
