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
- `canal` (`Web Automático`)
- `forma_pago` (`Pago total` para Wompi · `Sin pago / Continuar por WhatsApp` para WhatsApp)
- `tipo_plan`, `decoracion`, `is_taken`, `modificado_por` (`web`)

Columnas de pago Wompi (solo las escribe el webhook / `create-wompi-payment` con `service_role`):

- `payment_status` — `pending | approved | declined | voided | error | amount_mismatch` (NULL = aún no hay evento)
- `payment_reference` — id de transacción Wompi
- `paid_amount` — pesos COP enteros, misma unidad que `precio`
- `paid_at` — primera confirmación `APPROVED`

Trigger `strip_anon_reservation_payment`: en INSERT/UPDATE del rol `anon`, anula esas cuatro columnas. `anon` no tiene política SELECT ni UPDATE.

RLS web: `anon_insert_prereserva_web` (`canal = 'Web Automático' AND is_taken = false`). Staff `authenticated_*` según helpers `is_reservas_*`.

### `wompi_webhook_events`

Auditoría del JSON crudo de Wompi. `checksum` unique (idempotencia). RLS on; `REVOKE ALL` a `anon` y `authenticated`. Solo `service_role`.

### `wompi_checkout_attempts`

Rate limit de `create-wompi-payment` (reserva + hash de IP). Misma postura RLS.

Migración: [`supabase/migrations/20260922173845_wompi_payment.sql`](../supabase/migrations/20260922173845_wompi_payment.sql).

## Convenciones

- Nombres de suite en BD pueden diferir del copy UI (ver mapa en `suiteCatalogService`).
- Weekend comercial: viernes y sábado (y categorías de día que los incluyan).
- No usar service role en el browser.
- `precio` en `reservations` es texto numérico en pesos; Wompi espera centavos (`precio * 100`).

## Pendiente de documentar

- Diagrama ER completo / resto de migraciones históricas (viven en el proyecto remoto).
