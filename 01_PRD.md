# 🪐 01_PRD.md — Documento Maestro del Producto (PRD)
## Proyecto: AMARTE Web Experience 2026
**Rol de Autor:** Arquitecto Principal del Proyecto

---

## 1. Introducción y Propósito
Este documento establece las especificaciones funcionales, de negocio y técnicas para el desarrollo del nuevo sitio web y la experiencia interactiva de **Amarte Suite** ("El Planeta Romántico de Bogotá"). El propósito es reemplazar la plataforma WordPress legacy con una aplicación web premium, de alta conversión y alto rendimiento, centrada en la interacción conversacional con nuestra anfitriona virtual, **Martina**.

---

## 2. Objetivos del Negocio y KPIs
El éxito del proyecto se medirá mediante los siguientes indicadores clave:

| Objetivo | KPI Primario | Meta 2026 |
|---|---|---|
| **O1: Incrementar reservas** | Tasa de conversión de visitas a solicitudes de reserva directas. | +25% en reservas completadas. |
| **O2: Incrementar interacciones con Martina** | Porcentaje de sesiones que inician chat/voz con Martina. | >45% de sesiones activas. |
| **O3: Mejorar percepción premium** | Tiempo de permanencia y baja tasa de rebote en páginas de suites. | <30% tasa de rebote; >3 min por sesión. |
| **O4: Diferenciación de marca** | Tasa de retención y recurrencia (Pasaporte Amarte digital). | +15% redenciones de sellos. |

### 2.1. North Star Metric (NSM)
* **Definición:** **Reservas iniciadas desde Martina.**
* **Justificación:** Esta es la métrica principal porque unifica de manera directa el uso y efectividad de la Inteligencia Artificial (conversación), el engagement del usuario y el objetivo clave del negocio (conversión/reservas).

---

## 3. Público Objetivo (User Personas)
1. **Parejas Urbanas (25–35 años):** Buscan un escape de la rutina rápida, suites temáticas modernas o de lujo, reserva ágil en dispositivos móviles e interacción directa.
2. **Planificadores de Ocasiones Especiales (35–55 años):** Buscan celebrar aniversarios o cumpleaños con decoraciones complejas. Requieren claridad en los detalles del plan y prefieren asesoría guiada (Martina / WhatsApp).

---

## 4. Alcance Funcional
El sistema web se compone de las siguientes áreas funcionales clave:

### 4.1. Catálogo Interactivo de Suites
* **Fichas de Suites:** Información multimedia a sangre completa (fotos 4K, videos optimizados).
* **Categorización:**
  * **Suites Deluxe:** Diamante, Gold, Rubí, Zafiro.
  * **Suites Temáticas:** Árabe, Gótica, Queen.
  * **Especiales:** Jacuzzi VIP, Cabaña, Amarte.
* **Filtros rápidos:** Con Jacuzzi, Temáticas, Deluxe, Rangos de horas (4h, 8h, 12h, Día Hotelero).

### 4.2. Ecosistema de Martina (Asistente Virtual)
* **Widget Flotante / Pantalla Completa:** Interfaz de chat y voz interactiva en web.
* **Integración Omnicanal:** Redirección inteligente a WhatsApp manteniendo el contexto de la conversación (reserva pre-configurada).
* **Generación de AmarTips:** Sugerencia de consejos rápidos en momentos oportunos de la navegación para incentivar el engagement.

### 4.3. Flujo de Pre-Reserva Express
* **Paso 1:** Selección de suite o plan de decoración.
* **Paso 2:** Configuración de fecha, hora de llegada y duración de la estadía (4h, 8h, 12h, Día Hotelero).
* **Paso 3:** Captura de datos básicos (Nombre, Documento, WhatsApp, Correo).
* **Paso 4:** Generación del enlace de pago (Payco / Transacción bancaria) o redirección a canal de cierre en WhatsApp con datos listos para el asesor humano.

### 4.4. Módulo de Contenidos (AmarTips & Pasaporte)
* **Biblioteca de AmarTips:** Categorizada y optimizada para SEO.
* **Pasaporte Amarte Digital:** Panel interactivo donde los usuarios registrados pueden consultar sus sellos acumulados y suites visitadas (estrategia de gamificación).

### 4.5. Alcance por Fases (Phased Scope)
Para evitar el crecimiento descontrolado del alcance (scope creep) y garantizar lanzamientos incrementales de alta calidad, la ejecución se dividirá en las siguientes iteraciones:

* **Fase V1 (Core MVP e Impacto Inicial):**
  - Experiencia inmersiva Hero + Martina (Chat).
  - Catálogo interactivo de Suites.
  - Flujo de pre-reserva express y redireccionamiento inteligente a WhatsApp.
* **Fase V2 (Contenido e Interacción de Voz):**
  - Biblioteca y cards de AmarTips.
  - Integración de voz de Martina en web.
* **Fase V3 (Fidelización y Retención):**
  - Pasaporte Amarte Digital.
  - Sistema de gamificación de sellos/planetas.
* **Fase V4 (Evolución de Inteligencia):**
  - Memoria persistente de Martina y personalización de la experiencia en base a visitas anteriores.

---

## 5. Integraciones Críticas
1. **Supabase (Backend-as-a-Service):** Gestión de Base de Datos relacional para reservas, portería, pasaportes, autenticación de usuarios de administración y sincronización en tiempo real.
2. **Pasarela de Pagos (ePayco):** Enlace directo de checkout web (`https://secure.payco.co/checkoutopen/66308`) y verificación de estados.
3. **WhatsApp Business API (wa.me):** Redirección inteligente a la línea de reservas humana (`573235726252`) enviando plantillas estructuradas con el producto seleccionado.
4. **Motor de IA (Martina):** Integración mediante Edge Functions a API de LLM (ej. Gemini/OpenAI) con sistema de RAG para consulta de tarifas actualizadas y disponibilidad.

---

## 6. Requisitos No Funcionales (NFRs)
* **Mobile-First:** 100% optimizado para visualización móvil (Chrome, Safari, WebView de Instagram/TikTok).
* **Core Web Vitals:** LCP < 1.5s, FID < 100ms, CLS < 0.1.
* **SEO Técnico:** Estructura JSON-LD para productos (suites) y artículos (AmarTips).
* **Seguridad:** Cumplimiento de RLS (Row Level Security) en Supabase para evitar accesos indebidos a datos de clientes.
* **Accesibilidad:** WCAG 2.1 nivel AA en contraste y usabilidad en teclado.
