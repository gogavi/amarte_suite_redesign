# 🪐 11_SEO_ContentStrategy.md — Estrategia de SEO y Contenidos (SEO & Content Strategy)
## Proyecto: AMARTE Web Experience 2026
**Rol de Autor:** Arquitecto Principal del Proyecto

---

## 1. Estrategia de SEO Técnico (On-Page)
El rediseño debe garantizar que Amarte Suite mantenga y supere su posicionamiento histórico en búsquedas orgánicas clave en Bogotá (ej. "hotel parejas bogota", "moteles teusaquillo", "suites tematicas bogota").

### 1.1. Arquitectura de URLs Limpias
* **Suites:** `/suites/[slug]` (ej. `/suites/suite-deluxe-diamante`).
* **Planes Románticos:** `/planes/[slug]` (ej. `/planes/plan-erotico`).
* **AmarTips:** `/amartips/[slug]` (ej. `/amartips/ideas-sorprender-pareja`).

### 1.2. Datos Estructurados (JSON-LD)
Implementaremos schemas específicos de Google para las páginas de suites y artículos de consejos:

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Suite Deluxe Diamante - Amarte Suite",
  "image": "https://amartesuite.com/assets/suites/diamante.jpg",
  "description": "Suite de lujo premium con jacuzzi, sauna y ambientación romántica en Bogotá.",
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "COP",
    "lowPrice": "200000",
    "highPrice": "390000",
    "offerCount": "4"
  }
}
```

---

## 2. Estrategia de Contenidos: Los AmarTips
Los AmarTips son el principal motor de tráfico orgánico recurrente y autoridad de marca.
* **Estructura del Blog de AmarTips:**
  * **Categorías Principales:** Sorpresas y Detalles, Conexión Emocional, Tips de Pasión, Ideas de Salidas.
  * **Integración en Fichas de Suites:** Mostrar AmarTips relevantes de manera contextualizada (ej. en la página de la Suite Cabaña, mostrar un AmarTip sobre "Cómo preparar una noche rústica y cálida").
  * **Interactividad con Martina:** Martina debe poder sugerir AmarTips a los usuarios durante sus conversaciones según el contexto de su búsqueda ("Tengo un AmarTip perfecto para ustedes...").

---

## 3. Plan de Migración SEO (Redirecciones 301)
Dado que reemplazamos una web WordPress activa, se debe mapear y configurar el archivo de redireccionamientos en el servidor (o en el archivo de rutas de Next.js/Supabase Edge Functions) para evitar pérdida de autoridad:

| URL Legacy (WordPress) | Nueva URL (Web Experience 2026) | Tipo |
|---|---|---|
| `/` | `/` | 301 |
| `/habitacion/suite-deluxe-diamante/` | `/suites/suite-deluxe-diamante` | 301 |
| `/habitacion/gotica/` | `/suites/suite-gotica` | 301 |
| `/habitacion/arabe/` | `/suites/suite-arabe` | 301 |
| `/formulario-reservas-amarte-suite/` | `/reserva-express` | 301 |
| `/amartips-blog/` | `/amartips` | 301 |
