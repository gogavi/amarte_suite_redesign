# Propuesta GTM / GA4 / Ads — medición Amarte (NO PUBLICAR)

Contenedor actual: **GTM-W5VQCDF5**. GA4 **G-MD6CPJ6M7G**. Ads **AW-774067101**.

Esta nota describe cambios de etiquetas. **No se publica el contenedor desde este PR.** No se crea ni se toca ninguna etiqueta en la UI de Google.

El sitio ya empuja los eventos. Las conversiones que hoy convierten siguen en paralelo hasta el corte de abajo.

## Qué escucha el contenedor publicado hoy

- `pre_reserva_submit` → Ads lead (label `4izbCPeiy9wcEJ2njfEC`)
- `whatsapp_redirect` excepto `location = martina_widget`
- clic `a.amarte-opt-link` hacia `wa.me`
- visibilidad de `#suites-section` (hay que quitarla como conversión)
- `purchase` → Ads compra (label `pmATCJyy3YkbEJ2njfEC`)

`martina_open` y `reserva_form_open` llegan al `dataLayer` y no tienen etiqueta.

## Variables de capa de datos

Crear (o reutilizar) una variable DLV por clave. No hace falta valor por defecto.

| Variable | Clave |
|---|---|
| `dlv - value` | `value` |
| `dlv - currency` | `currency` |
| `dlv - transaction_id` | `transaction_id` |
| `dlv - method` | `method` |
| `dlv - location` | `location` |
| `dlv - tipo_pago` | `tipo_pago` |
| `dlv - reservation_total` | `reservation_total` |
| `dlv - link_url` | `link_url` |
| `dlv - phone_number` | `phone_number` |
| `dlv - item_list_name` | `item_list_name` |
| `dlv - payment_type` | `payment_type` |
| `dlv - interaction_type` | `interaction_type` |

## Una etiqueta GA4 por evento

Medición: `G-MD6CPJ6M7G`. Tipo: **Evento de GA4**. Un activador de evento personalizado por fila. Marcar los parámetros de la fila. No usar la visibilidad de `#suites-section`.

| Evento | Activador | Parámetros |
|---|---|---|
| `generate_lead` | Custom Event `generate_lead` | `method`, `location`, `link_url`, `phone_number`, `transaction_id`, `currency`, `value`, `tipo_pago` |
| `martina_open` | Custom Event `martina_open` | `location` (`hero` \| `launcher` \| `seccion`), `interaction_type` (`text` \| `voice`) |
| `view_item_list` | Custom Event `view_item_list` | `item_list_name` (`suites`), `location` (`www` \| `reservas`) |
| `begin_checkout` | Custom Event `begin_checkout` | `location`, `currency`, `value` |
| `add_payment_info` | Custom Event `add_payment_info` | `transaction_id`, `currency`, `value`, `tipo_pago`, `payment_type` |
| `purchase` | Custom Event `purchase` (la etiqueta que ya existe) | `transaction_id`, `currency`, `value`, `tipo_pago`, `reservation_total` |

`page_view` sigue siendo el automático de la etiqueta de configuración. No añadir otro.

Moneda de los eventos de dinero: `COP`. `transaction_id` es siempre `reservations.id`, nunca un UUID generado en el tag.

## Conversiones de Google Ads (separadas, sin publicar)

Cuenta `AW-774067101`. Recuento **una**. ID de pedido / transacción: `{{dlv - transaction_id}}`.

No reutilizar el label de compra `pmATCJyy3YkbEJ2njfEC` para leads. No reutilizar el label de pre-reserva `4izbCPeiy9wcEJ2njfEC` para la compra.

| Acción nueva | Cuándo | Valor | Notas |
|---|---|---|---|
| Lead sin pago | `generate_lead` con `method = reserva` y `tipo_pago = sin_pago` | 0 | Reserva Express por WhatsApp. `www` sí lo emite. |
| Lead abono 50 | `generate_lead` con `method = reserva` y `tipo_pago = abono_50` | 0 | `www` no lo emite. Lo emitirá reservas cuando ese flujo exista. Crear la acción igual, inactiva hasta que haya tráfico. |
| Compra total 100 | `purchase` con `tipo_pago = total_100` | `{{dlv - value}}` (monto cobrado) | Sustituye, en el corte, a la compra única actual. |
| Compra abono 50 | `purchase` con `tipo_pago = abono_50` | `{{dlv - value}}` (el abono cobrado, no `reservation_total`) | `www` no lo emite. `reservation_total` es el total de la reserva, no el valor de la conversión. |

La compra que ya está publicada (`purchase` → `pmATCJyy3YkbEJ2njfEC`) se deja **hasta** tener la acción `total_100` recibiendo hits en vista previa. En `www`, Reserva Express solo cobra `Pago total`, así que todo `purchase` de este sitio lleva `tipo_pago = total_100`.

## Quitar la visibilidad de suites como conversión

El disparador de visibilidad de `#suites-section` no mide intención. Pausarlo o sacarlo de cualquier conversión de Ads y de cualquier evento GA4 marcado como conversión.

El reemplazo es el clic: `view_item_list` con `item_list_name = suites` (nav Suites y botón Explorar Suites en `www`). No es conversión primaria.

## Una sola etiqueta de WhatsApp

Hoy hay dos caminos: evento `whatsapp_redirect` (excluye `martina_widget`) y un clic CSS `a.amarte-opt-link`.

Dejar **una** etiqueta, sobre `generate_lead` donde `method = whatsapp`. Incluye contacto, modal, Reserva Express, gracias y el widget (`location = martina_widget`, `link_url` presente).

Hasta el corte, no borrar la etiqueta de `whatsapp_redirect`: el sitio sigue empujando ese evento con la misma `location` de antes.

No crear una segunda etiqueta de WhatsApp para el widget.

## Disparador de llamada

Evento: `generate_lead`. Condición: `method` igual a `phone`.

Parámetros: `location`, `phone_number` (solo dígitos).

En `www` el enlace de Llamar en contacto es `tel:+573013307909` (`phone_number` `573013307909`). WhatsApp de contacto sigue en `wa.me/573007416683`. El widget, si llama al puente, manda el mismo `573013307909`.

No marcar la llamada como conversión primaria de compra.

## Plan de transición (legacy → spec)

Orden. Cada paso se valida en **vista previa de GTM** contra un preview de Vercel, no contra producción, y **sin publicar** hasta el paso 6.

1. Crear variables, activadores y etiquetas GA4 nuevas en un workspace. No enviar.
2. Vista previa: comprobar que `pre_reserva_submit`, `whatsapp_redirect` y `purchase` siguen disparando sus etiquetas actuales y que los eventos nuevos aparecen al lado, no en su lugar.
3. Crear las acciones de Ads (sin pago, abono 50, total 100) en estado que no pujen Smart Bidding. Probar solo la de `total_100` con un pago de prueba, nunca uno real de huésped.
4. Cuando `purchase` + `tipo_pago = total_100` llegue al mismo label de compra (o al label nuevo ya verificado), pausar cualquier `gtag('event','conversion')` suelto. En este repo `/gracias` ya no llama a `gtag`: un solo `dataLayer.push` de `purchase`.
5. Pausar la visibilidad de `#suites-section` y la etiqueta CSS duplicada de WhatsApp. Dejar `whatsapp_redirect` una semana en observación, luego pausarla cuando `generate_lead` / `method = whatsapp` cubra las mismas locations (incluido `martina_widget`).
6. Pausar `pre_reserva_submit` como conversión de Ads cuando `generate_lead` / `method = reserva` lleve el mismo `transaction_id`. El sitio seguirá empujando `pre_reserva_submit` (con `tipo_pago`) por si hay que volver atrás.
7. Publicar el contenedor en una ventana acordada. Este PR no lo hace.

## Consent Mode v2 (recomendación, fuera de este PR)

Recomendado antes de tratar estas conversiones como definitivas en el EEE: Consent Mode v2 (`ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization`) con denegado por defecto hasta la elección, y las etiquetas de Ads/GA4 respetando ese estado.

**No implementar banner ni el snippet de consentimiento en este PR.** La homepage no debe bloquearse en un aviso de cookies dentro del mismo cambio de medición.

## Qué no hacer

- No publicar el contenedor.
- No duplicar la etiqueta de compra.
- No usar un `transaction_id` distinto del id de la reserva.
- No marcar `martina_open`, `view_item_list`, `reserva_form_open` ni `begin_checkout` como conversión primaria.
