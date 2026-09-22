# API — Contratos vía servicios y Edge Functions

No existe un backend REST propio. El contrato del SPA son funciones en `src/services/`.
Los secretos de Wompi viven en **Supabase Edge Functions** (Deno), no en Vite.

## Catálogo de suites y packs

**`suiteCatalogService.ts`**

- `fetchSuiteCatalog()` → lee `room_rates` (+ `room_types`, `rate_types`, `day_categories`).
- `getPackPrice(pack, dateIso)` → weekday vs weekend (vie/sáb).
- `resolveCatalogSuiteName(localName)` → mapeo UI → nombre BD.
- `mergeSuitesWithCatalogPrices(suites, catalog)` → hidrata la vitrina (`SuitesSection`) con precios de BD.

## Planes de decoración

**`plansCatalogService.ts`**

- `fetchPlanWeekday6hPrices()` → precios Pack 6h · Dom–Jue para `room_types` cuyo nombre empieza con `Plan `.
- Contenido editorial en `src/data/planesContent.ts`.

## Pre-reserva

**`reservationService.ts`**

- `createWebReservation(input)` → `insert` en `reservations` (rol `anon`, RLS `anon_insert_prereserva_web`).
- `PaymentMethod`: `'wompi' | 'whatsapp'`.

Campos relevantes del input: `name`, `whatsapp`, `tipo`, `packTiempo`, `date`, `time`, `price`, `method`.

`forma_pago` que acepta el trigger `enforce_reservation_web_price` para la web:

- Wompi → `'Pago total'` (80 % del pack; `precio` y `abono` los reescribe el trigger).
- WhatsApp → `'Sin pago / Continuar por WhatsApp'`.

El cliente **no** envía el monto a Wompi. El checkout se firma en servidor con el `precio` ya persistido.

## Pagos / WhatsApp

**`paymentLinks.ts`**

- `createWompiCheckout(reservationId)` → `supabase.functions.invoke('create-wompi-payment')`. Devuelve `{ checkoutUrl }` de Web Checkout (`https://checkout.wompi.co/p/...`).
- Mensajes y URL de WhatsApp de reservas (`buildWhatsappReservationMessage`, `buildWhatsappReservasUrl`).

El frontend **no** incluye `WOMPI_PRIVATE_KEY`, secreto de integridad ni secreto de eventos.

## Flujo Wompi

```
formulario INSERT reservations (anon)
  → create-wompi-payment (service_role lee precio, firma integridad)
  → popup Web Checkout
  → Wompi POST wompi-webhook (checksum + GET /v1/transactions/{id})
  → UPDATE payment_status = approved si monto coincide
```

Redirección del checkout (`WOMPI_REDIRECT_URL`, típico `https://reservas.amartesuite.com/?pago=retorno`) es informativa. **No** marca la reserva como pagada. La fuente de verdad es el webhook.

### Edge Function `create-wompi-payment`

- JWT: `verify_jwt = true` (anon key o sesión).
- Body: `{ reservationId }` UUID. Ignora cualquier monto del cliente.
- Lee la fila con `SUPABASE_SERVICE_ROLE_KEY`. Exige `canal = 'Web Automático'` y `forma_pago = 'Pago total'`.
- Firma SHA-256: `reference + amount_in_cents + currency + WOMPI_INTEGRITY_SECRET` ([docs](https://docs.wompi.co/docs/colombia/widget-checkout-web/)).
- `amount-in-cents` = `Number(precio) * 100` (Wompi cobra en centavos).
- Rate limit: 5 intentos / 10 min por reserva y 30 / 10 min por hash de IP.
- Respuesta: `{ checkoutUrl }`. No expone secretos.

### Edge Function `wompi-webhook`

- JWT: `verify_jwt = false` (Wompi no manda JWT de Supabase). Autenticación = checksum SHA-256 de eventos ([docs](https://docs.wompi.co/docs/colombia/eventos/)).
- Firma inválida o body malformado → 401 y **cero** escrituras.
- Checksum: valores de `signature.properties` (orden del evento, sobre `data`) + `timestamp` + `WOMPI_EVENTS_SECRET`. Comparar con `X-Event-Checksum` o `signature.checksum` (case-insensitive).
- El checksum de ejemplo `3476DDA5…` en la página de eventos **no** coincide con SHA-256 de la cadena de ejemplo publicada; se trata como ilustrativo. El algoritmo (concatenar properties + timestamp + secreto) es el de la guía. La firma de integridad del checkout sí coincide con el vector oficial `37c84077…`.
- Tras la firma, confirma con `GET {WOMPI_API_BASE}/transactions/{id}` usando `WOMPI_PUBLIC_KEY` (la consulta de transacción usa la llave **pública**, no la privada).
- `APPROVED` + monto = `precio` de la fila cuya `id` = `reference` → `payment_status = approved`.
- Idempotente: `wompi_webhook_events.checksum` unique; un evento ya `applied` no vuelve a mutar.
- `WOMPI_PRIVATE_KEY` **no se lee** en esta función (ni en `create-wompi-payment`).

## Secretos (`supabase secrets set`)

Solo nombres; los valores salen del dashboard de Wompi (Desarrolladores → Secretos para integración técnica) y de Project Settings de Supabase.

```bash
supabase secrets set WOMPI_PUBLIC_KEY
supabase secrets set WOMPI_INTEGRITY_SECRET
supabase secrets set WOMPI_EVENTS_SECRET
supabase secrets set WOMPI_PRIVATE_KEY
supabase secrets set WOMPI_REDIRECT_URL
supabase secrets set WOMPI_API_BASE
supabase secrets set WOMPI_ENV
```

| Secreto | Quién lo usa | Notas |
|---|---|---|
| `WOMPI_PUBLIC_KEY` | ambas funciones | Prefijo `pub_prod_` / `pub_test_`. Viaja en la URL de checkout. |
| `WOMPI_INTEGRITY_SECRET` | `create-wompi-payment` | Prefijo `prod_integrity_` / `test_integrity_`. |
| `WOMPI_EVENTS_SECRET` | `wompi-webhook` | Prefijo `prod_events_` / `test_events_`. |
| `WOMPI_PRIVATE_KEY` | ninguna (reservada) | Prefijo `prv_prod_` / `prv_test_`. Guardarla rotada; no referenciarla en código. |
| `WOMPI_REDIRECT_URL` | `create-wompi-payment` | HTTPS del SPA, p. ej. `https://reservas.amartesuite.com/?pago=retorno`. |
| `WOMPI_API_BASE` | `wompi-webhook` | `https://production.wompi.co/v1` o `https://sandbox.wompi.co/v1`. |
| `WOMPI_ENV` | `wompi-webhook` | `prod` o `test` (debe coincidir con `environment` del evento). |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | ambas | Las inyecta la plataforma. En local: `supabase/.env.local` (gitignored). |

URL de eventos en el dashboard Wompi (producción):

`https://dftbelnombbtjryqphaa.supabase.co/functions/v1/wompi-webhook`

Sandbox debe apuntar a otra función o al mismo endpoint con secretos `test_*` y `WOMPI_ENV=test`.

## Probar en local

Despliegue al proyecto (después de `supabase secrets set` y `supabase link`):

```bash
npx supabase functions deploy create-wompi-payment
npx supabase functions deploy wompi-webhook
```

`config.toml` ya pone `verify_jwt = true` en create-wompi-payment y `false` en wompi-webhook.

Serve local (curl / prueba de firma; el SPA sigue pegándole al proyecto remoto salvo que uses stack local):

npx supabase functions serve create-wompi-payment --env-file supabase/.env.local --no-verify-jwt
npx supabase functions serve wompi-webhook --env-file supabase/.env.local --no-verify-jwt
```

`create-wompi-payment` en producción **sí** verifica JWT. En local `--no-verify-jwt` solo facilita curl.

Vectores de firma (docs oficiales, no secretos de Amarte):

```bash
deno test supabase/functions/_shared/wompi_test.ts
```

Webhook **sin** firma (debe ser 401 y `wompi_webhook_events` vacío):

```bash
curl -i -X POST http://localhost:54321/functions/v1/wompi-webhook \
  -H "Content-Type: application/json" \
  -d "{\"event\":\"transaction.updated\",\"data\":{\"transaction\":{\"id\":\"x\",\"status\":\"APPROVED\",\"amount_in_cents\":100}}}"
```

Webhook firmado (PowerShell). Usa el secreto de **sandbox**, nunca lo commits:

```powershell
$secret = $env:WOMPI_EVENTS_SECRET
$txId = "1234-1610641025-49201"
$status = "APPROVED"
$cents = "4490000"
$timestamp = "1530291411"
$plain = "$txId$status$cents$timestamp$secret"
$sha = [System.BitConverter]::ToString(
  [System.Security.Cryptography.SHA256]::Create().ComputeHash(
    [Text.Encoding]::UTF8.GetBytes($plain)
  )
).Replace("-", "").ToLower()

$body = @{
  event = "transaction.updated"
  environment = "test"
  timestamp = 1530291411
  data = @{
    transaction = @{
      id = $txId
      status = $status
      amount_in_cents = 4490000
      reference = "<uuid-de-reserva-de-prueba>"
    }
  }
  signature = @{
    properties = @("transaction.id", "transaction.status", "transaction.amount_in_cents")
    checksum = $sha
  }
} | ConvertTo-Json -Depth 6

curl.exe -i -X POST http://localhost:54321/functions/v1/wompi-webhook `
  -H "Content-Type: application/json" `
  -H "X-Event-Checksum: $sha" `
  -d $body
```

El `GET` a Wompi solo confirma si `id` existe en sandbox/prod. Para un replay local completo usa un id real de transacción sandbox o mockea el fetch. Un segundo POST con el mismo checksum no debe volver a cambiar `paid_at`.

## Chat / Martina

**`amarteChatbot.ts`**, **`martinaService.ts`**

- Prefetch/apertura del widget; no sustituyen la pre-reserva en BD.

## Suites (contenido local)

**`ratesService.ts`**

- Metadata editorial de suites (imágenes, videos, copy) usada por la UI de tarjetas.
