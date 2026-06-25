# 🪐 15_CodexExecutionPlan.md — Plan de Ejecución para Codex (Codex Execution Plan)
## Proyecto: AMARTE Web Experience 2026
**Rol de Autor:** Arquitecto Principal del Proyecto

---

## 1. Instrucciones de Gobernanza para Codex
Este documento define las reglas de desarrollo y el orden paso a paso que **Codex** debe seguir para implementar el código fuente. Se debe respetar estrictamente la arquitectura definida en `13_ReactArchitecture.md` y la estructura de carpetas de `14_FolderStructure.md`.

---

## 2. Orden Lógico de Construcción
La implementación debe realizarse de forma secuencial para garantizar la estabilidad del proyecto en todo momento:

```
[Paso 1: Setup y Configuración]
               │
               ▼
[Paso 2: Implementar Design Tokens y CSS]
               │
               ▼
[Paso 3: Componentes Átomos y Estructura Base]
               │
               ▼
[Paso 4: Catálogo de Suites e Integración con Supabase]
               │
               ▼
[Paso 5: Flujo de Pre-Reserva Express]
               │
               ▼
[Paso 6: Widget y Backend de Martina Conversacional]
               │
               ▼
[Paso 7: Pasarela de Pagos y QA Final]
```

---

## 3. Criterios de Aceptación Técnicos por Paso

### Paso 1: Setup y Configuración Inicial
* **Acción:** Inicializar el proyecto con Vite y TypeScript, y configurar rutas en `AppRouter.tsx`. Configurar el andamiaje de los servicios locales en `src/services/` (inicializados con mock data estática).
* **Criterio de Aceptación:** El proyecto compila sin errores de TypeScript y la consola de desarrollo muestra las rutas activas correctamente en móviles.

### Paso 2: Implementación del Sistema de Estilos
* **Acción:** Configurar `tailwind.config.js` agregando los colores (`magenta-digital`, `cyan-orbital`, `surface-dark`, etc.), las fuentes (`Fjalla One`, `Jost`, `Courgette`) y los bordes redondeados (12px). Crear los estilos globales en `src/styles/index.css` incluyendo los efectos de esmerilado (Glassmorphism).
* **Criterio de Aceptación:** Se visualiza correctamente una página de prueba mostrando todos los colores, tipografías y el efecto Glassmorphism en dispositivos móviles.

### Paso 3: Catálogo de Suites (Fase Crítica)
* **Acción:** Crear los componentes `SuiteCard`, `HourSelector` y la vista `SuitesCatalog`. Conectar con el servicio local simulado de tarifas y suites (`ratesService.ts` / `useSupabaseRates`) para obtener precios reales y realizar el filtro dinámico por categorías en base a la matriz estática de marca.
* **Criterio de Aceptación:** El usuario puede filtrar suites en móvil, ver tarifas calculadas por horas en tiempo real (semana/fin de semana) de forma simulada y el rendimiento en Lighthouse arroja un LCP inferior a 1.8 segundos.

### Paso 4: Integración Conversacional de Martina y Cierre de Reserva
* **Acción:** Implementar `MartinaWidget` y conectarlo con el servicio conversacional local (`martinaService.ts` simulado con respuestas RAG basadas en el prompt v2). Implementar el redireccionamiento final a WhatsApp empaquetando la reserva configurada.
* **Criterio de Aceptación:** Al interactuar con el widget, Martina sugiere la suite correcta según el contexto. Si el usuario decide reservar, el enlace de WhatsApp abre la conversación de destino conteniendo el mensaje estructurado de pre-reserva completo.
