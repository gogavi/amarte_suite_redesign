# 🪐 17_ConversionArchitecture.md — Arquitectura de Conversión (Conversion Architecture)
## Proyecto: AMARTE Web Experience 2026
**Rol de Autor:** Arquitecto Principal del Proyecto

---

## 1. Estrategia de CRO (Conversion Rate Optimization)
El objetivo final del rediseño es incrementar las reservas y el inicio de conversaciones estratégicas. La web se estructurará como un embudo de alta conversión (High-Converting Funnel), minimizando los puntos de fuga y aplicando disparadores psicológicos sutiles coherentes con la marca.

---

## 2. Embudos de Conversión Críticos
Definimos los dos caminos óptimos hacia la conversión:

### Embudo A: Ruta Conversacional (Martina a WhatsApp)
```
[Visita Web] ──> [Interacción con Martina (Chat/Voz)] ──> [Recomendación Suite + Plan] ──> [Redirección WhatsApp con pre-reserva] ──> [Pago / Confirmación]
```
* **Métrica clave:** Tasa de traspaso de chat web a WhatsApp.

### Embudo B: Reserva Express Directa (Checkout Digital)
```
[Visita Web] ──> [Explorar Catálogo] ──> [Configuración Reserva Express] ──> [Pasarela Checkout ePayco] ──> [Reserva Confirmada]
```
* **Métrica clave:** Tasa de finalización de pago online.

---

## 3. Disparadores de Urgencia Elegante
Para motivar la decisión de reserva sin presionar al cliente ni devaluar la percepción premium, implementaremos disparadores dinámicos:
* **Indicador de Ocupación Dinámico:** En las fichas de suites temáticas, mostrar sutilmente: *"2 parejas están viendo esta suite ahora"* o *"Reservada 4 veces hoy"*.
* **Contador Regresivo en Reserva:** Durante el proceso de pre-reserva express, bloquear temporalmente la suite por 10 minutos para el pago, mostrando un reloj de cuenta regresiva espacial.
* **AmarTips de Ocasión:** Martina puede recordar sutilmente las fechas clave (ej. *"Faltan 5 días para el fin de semana, ¿ya preparaste tu escape?"*).

---

## 4. Plan de Medición y Analítica (Eventos GTM)
Configuraremos eventos personalizados a través de Google Tag Manager (GTM) y dataLayer para medir la efectividad de cada componente en el embudo:

| Evento dataLayer | Disparador (Trigger) | Parámetros Enviados |
|---|---|---|
| `martina_click` | Clic en el widget flotante de Martina. | `location` (Header, Hero, Float) |
| `martina_chat_start` | Envío del primer mensaje o activación de voz. | `interaction_type` (text | voice) |
| `whatsapp_redirect` | Clic en botón de redirección de WhatsApp. | `suite_name`, `plan_name`, `estimated_value` |
| `checkout_init` | Redirección al checkout ePayco. | `suite_name`, `hours`, `total_price` |
| `booking_completed` | Retorno exitoso de pasarela de pagos. | `transaction_id`, `value`, `payment_method` |
| `amartip_view` | Apertura o lectura completa de un AmarTip. | `tip_id`, `category` |
