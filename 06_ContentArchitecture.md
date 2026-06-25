# 🪐 06_ContentArchitecture.md — Arquitectura de Contenido (Content Architecture)
## Proyecto: AMARTE Web Experience 2026
**Rol de Autor:** Arquitecto Principal del Proyecto

---

## 1. Modelado de Contenidos (CMS / Base de Datos)
Para garantizar la escalabilidad de la experiencia web, definimos los esquemas lógicos de contenido estructurado:

### 1.1. Colección: Suites (`suites`)
Representa cada una de las habitaciones físicas del hotel:

```json
{
  "id": "uuid",
  "name": "string (ej. Suite Diamante)",
  "slug": "string (ej. suite-deluxe-diamante)",
  "category": "enum (deluxe | tematica | especial)",
  "description": "text (Soporte markdown)",
  "specifications": {
    "jacuzzi": "boolean",
    "sauna": "boolean",
    "cama_movimiento": "boolean",
    "aire_acondicionado": "boolean"
  },
  "rates": {
    "weekday": {
      "4h": "number",
      "8h": "number",
      "12h": "number",
      "day_hotelero": "number"
    },
    "weekend": {
      "4h": "number",
      "8h": "number",
      "12h": "number",
      "day_hotelero": "number"
    }
  },
  "media": {
    "gallery": ["url_string"],
    "video_360": "url_string",
    "featured_image": "url_string"
  },
  "whatsapp_product_link": "url_string"
}
```

### 1.2. Colección: Planes de Decoración (`planes`)
Representa los paquetes adicionales de experiencias románticas:

```json
{
  "id": "uuid",
  "name": "string (ej. Plan Erótico)",
  "description": "text",
  "items_included": ["string (ej. Pétalos de rosas)", "string (ej. Esposas)"],
  "rates": {
    "weekday": {
      "6h": "number",
      "12h": "number",
      "day_hotelero": "number"
    },
    "weekend": {
      "6h": "number",
      "12h": "number",
      "day_hotelero": "number"
    }
  },
  "whatsapp_product_link": "url_string"
}
```

### 1.3. Colección: AmarTips (`amartips`)
Los contenidos estratégicos de romance y pareja:

```json
{
  "id": "uuid",
  "title": "string",
  "slug": "string",
  "content": "text",
  "category": "string (ej. Sorpresas)",
  "emojis": ["string (ej. 💖)", "string (ej. 🔥)"],
  "author": "string (default: Martina)",
  "seo_keywords": ["string"],
  "created_at": "timestamp"
}
```

---

## 2. Consistencia y Fuentes de Verdad (Single Source of Truth)
Para evitar discrepancias en precios o descripciones en la web, la base de datos PostgreSQL en Supabase será la única fuente de verdad:
* **Precios dinámicos:** La interfaz web debe consumir directamente las tablas `room_rates` y `day_categories` de Supabase a través de Edge Functions o llamadas de servicio estructuradas.
* **Integración del Chat de Martina:** Martina consumirá la base de datos en tiempo real mediante búsquedas vectoriales o consultas SQL directas para responder precios actualizados, evitando respuestas estáticas cableadas (hardcoded) en sus prompts.
