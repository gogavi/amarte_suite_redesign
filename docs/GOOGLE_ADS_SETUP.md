# Configuración Google Ads + GTM + GA4 (Amarte Suite)

Guía operativa para conectar la web con Google Ads. El código ya empuja eventos al `dataLayer`; tú configuras las cuentas y las etiquetas en la UI de Google.

## Requisitos previos en la web

1. Crea el contenedor GTM (paso A) y copia el ID (`GTM-XXXXXXX`).
2. En `.env` (y en el entorno de producción / hosting):

```env
VITE_GTM_ID=GTM-W5VQCDF5
```

Contenedor actual de Amarte: **`GTM-W5VQCDF5`**.

3. Redeploy / rebuild (local: reinicia `npm run dev`). Sin este valor, la web **no** carga GTM. En el hosting (Vercel/etc.) define la misma variable en el panel de Environment Variables.

### Eventos que ya dispara el sitio

| Evento `dataLayer` | Cuándo | Uso recomendado en Ads |
|---|---|---|
| `pre_reserva_submit` | Pre-reserva guardada en Supabase | **Conversión primaria** (Lead) |
| `whatsapp_redirect` | Clic a WhatsApp (formulario, contacto, modal) | Conversión secundaria / Lead |
| `checkout_init` | Apertura de checkout Wompi | Conversión secundaria |
| `reserva_form_open` | Apertura del formulario express | Embudo / observación |
| `martina_open` | Apertura de Martina | Micro / remarketing |
| `martina_chat_start` | Primer mensaje o voz | Micro / embudo |

Parámetros habituales: `value`, `currency` (`COP`), `suite_name`, `plan_name`, `method`, `transaction_id`, `location`.

---

## A. Crear / preparar cuentas

1. Entra a [ads.google.com](https://ads.google.com) y abre o crea la cuenta de **Amarte Suite**.
2. En [analytics.google.com](https://analytics.google.com) crea una propiedad **GA4** para el dominio (ej. `amartesuite.com`). Anota el Measurement ID (`G-XXXXXXXX`).
3. En [tagmanager.google.com](https://tagmanager.google.com):
   - Crear cuenta / contenedor **Web**.
   - Copia el ID del contenedor (`GTM-XXXXXXX`).
4. Pega `VITE_GTM_ID` en `.env` y publica el sitio.

---

## B. Configurar GTM (después del deploy)

### Variables

1. **Variables** → **Configurar** → activa built-ins útiles (`Event`, `Page URL`, etc.).
2. **Variables** → **Nueva** → **Variable de capa de datos** para cada clave que uses en Ads/GA4, por ejemplo:
   - `dlv - value` → nombre de variable de capa de datos: `value`
   - `dlv - currency` → `currency`
   - `dlv - suite_name` → `suite_name`
   - `dlv - plan_name` → `plan_name`
   - `dlv - method` → `method`
   - `dlv - transaction_id` → `transaction_id`
   - `dlv - location` → `location`

### Activadores (Custom Event)

Crea un activador por evento:

| Nombre sugerido | Tipo | Nombre del evento |
|---|---|---|
| CE - pre_reserva_submit | Evento personalizado | `pre_reserva_submit` |
| CE - whatsapp_redirect | Evento personalizado | `whatsapp_redirect` |
| CE - checkout_init | Evento personalizado | `checkout_init` |
| CE - reserva_form_open | Evento personalizado | `reserva_form_open` |
| CE - martina_open | Evento personalizado | `martina_open` |
| CE - martina_chat_start | Evento personalizado | `martina_chat_start` |

### Etiquetas

1. **Google Tag** (o configuración GA4) con Measurement ID `G-XXXXXXXX`, activador **All Pages**.
2. **GA4 Event** (una por evento de negocio), activador = el Custom Event correspondiente. Mapea parámetros (`value`, `currency`, etc.) desde las variables DLV.
3. **Conversion Linker** — etiqueta Google Ads Conversion Linker, activador **All Pages** (imprescindible).
4. **Google Ads Conversion Tracking** — una etiqueta por acción de conversión (paso C), activador = Custom Event.
   - Para valor: usa `{{dlv - value}}` y moneda `{{dlv - currency}}` o fija `COP`.
   - ID de transacción: `{{dlv - transaction_id}}` cuando exista (evita duplicados).
5. **Google Ads Remarketing** (opcional, recomendado) — All Pages.

### Publicar

1. **Vista previa** (Preview) → abre el sitio → dispara formulario / WhatsApp / Martina.
2. Confirma que los eventos aparecen en el debugger de GTM.
3. **Enviar** → **Publicar** el contenedor.

---

## C. Acciones de conversión en Google Ads

1. **Objetivos** → **Conversiones** → **Resumen** → **Nueva acción de conversión** → **Sitio web**.
2. Indica el dominio. Google puede detectar GTM o te pedirá configurar la etiqueta manualmente.
3. Crea al menos:

| Acción | Categoría | Conteo | Rol |
|---|---|---|---|
| Pre-reserva web | Enviar formulario de clientes potenciales / Lead | Una | **Primaria** |
| WhatsApp reserva | Contacto / Lead | Una | Secundaria o primaria secundaria |
| Inicio checkout Wompi | Iniciar pago / Otra | Una | Observación / secundaria |

4. En cada acción, copia:
   - **ID de conversión** (`AW-XXXXXXXX`)
   - **Etiqueta / Conversion Label**
5. En GTM, pégalos en cada tag **Google Ads Conversion Tracking**.
6. **Vincula** Google Ads ↔ GA4: Ads → **Administración** → **Cuentas vinculadas** → Google Analytics.
7. En campañas Search / Performance Max, usa **Pre-reserva web** como objetivo principal de Smart Bidding.
8. Espera 24–72 h y revisa **Conversiones** → diagnóstico / registros recientes.

---

## D. Buenas prácticas

- Un solo **Conversion Linker**. No instales a la vez gtag Ads hardcodeado **y** tags Ads en GTM (duplicarías conversiones).
- Envía `value` en COP en `pre_reserva_submit` / `checkout_init` para optimizar por valor cuando haya volumen.
- No marques `martina_open` ni `reserva_form_open` como conversión primaria.
- Wompi abre en otra pestaña: **no** uses “pago confirmado” como conversión principal hasta tener URL de retorno controlada.
- Fase 2 (opcional): Enhanced Conversions con email/WhatsApp hasheados del formulario.

---

## Validación rápida

1. `VITE_GTM_ID` en producción.
2. GTM Preview: ves `gtm.js` y los custom events.
3. Tag Assistant / Ads: la conversión primaria registra al completar una pre-reserva de prueba.
4. En consola del navegador: `window.dataLayer` debe contener objetos con `event: 'pre_reserva_submit'` (etc.) tras las acciones.
