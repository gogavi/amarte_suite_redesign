# Dossier técnico — AMARTE Web Experience

**Fecha de actualización:** 27 de julio de 2026  
**Repositorio:** `PaginaWebAmarte` (`amarte-web-experience`)  
**Producto:** Sitio público de marketing y conversión de Amarte Suite  
**Operador legal:** Inversiones Ogavi S.A.  
**Deploy:** Vercel — proyecto `amarte-suite-redesign`  
**Relación con otros sistemas:** Comparte la base de datos Supabase con el backoffice `reservasAmarteSuite` (ver `brief_client/DOSSIER_TECNICO_PROYECTO.md`). Este repo es solo el frontend público; no incluye panel administrativo ni autenticación.

---

## 1. Resumen ejecutivo

Aplicación web SPA orientada a conversión para **Amarte Suite** (“El Planeta Romántico de Bogotá”), motel/hotel temático para parejas en Teusaquillo, Bogotá.

### Objetivos de negocio (según `01_PRD.md`)

| Objetivo | KPI | Meta 2026 |
|---|---|---|
| Incrementar reservas | Conversión visita → solicitud de reserva | +25% |
| Engagement con Martina | Sesiones que inician chat/voz | >45% |
| Percepción premium | Rebote / tiempo en página | <30% rebote; >3 min |
| Diferenciación | Retención / Pasaporte digital | +15% redenciones |

**North Star Metric:** reservas iniciadas desde Martina.

### Qué hace este producto hoy

1. Presenta la marca con un Hero orbital de alto impacto visual.
2. Catálogo de **11 suites** con video y tarifas.
3. **Planes de decoración** con precios vivos desde Supabase.
4. **Reserva Express**: formulario → INSERT en `reservations` → cierre por Wompi o WhatsApp.
5. Integración del concierge conversacional **Martina** (widget externo voz/chat).
6. Hub de experiencias hacia tienda externa (`hotelamartesuite.store`) y ubicación.

### Stack en una línea

React 18 + TypeScript strict + Vite 8 + Tailwind 3 + Framer Motion + Supabase (anon) + Vercel.

---

## 2. Alcance y límites del sistema

### Dentro de este repositorio

- Frontend público (marketing + pre-reserva).
- Lectura de tarifas (`room_rates` + joins).
- Escritura de pre-reservas (`reservations`, canal `Web Automático`).
- Carga del widget Martina desde Railway.
- Deep-links a Wompi, WhatsApp, Maps/Waze, Instagram/TikTok/Facebook y tienda Shopify-like.

### Fuera de este repositorio

| Sistema | Rol |
|---|---|
| `reservasAmarteSuite` | Backoffice: CRUD reservas, portería, pasaportes, roles, dashboard |
| ChatBotAmarte (Railway) | Backend y UI del widget Martina (`amarte-widget.js`) |
| Supabase proyecto compartido | Postgres + Storage (`generated-videos`) |
| `hotelamartesuite.store` | Catálogo comercial sexshop / restaurante / bebidas |
| Wompi | Checkout de pago online |

### No implementado (documentado vs. código)

| Documentado en | Estado en código |
|---|---|
| Router SPA + URLs SEO (`11_SEO_ContentStrategy.md`) | No: navegación por `useState` en `Home.tsx`; `react-router-dom` instalado pero sin uso |
| Analytics GTM (`17_ConversionArchitecture.md`) | No hay eventos GTM/GA en `src/` |
| GSAP ScrollTrigger (`09_MotionGuidelines.md`) | Dependencia instalada; **cero imports** en `src/` |
| Átomos (`ButtonPrimary`, etc. en `08_ComponentLibrary.md`) | No existen; solo `molecules/` + `organisms/` |
| Pasaporte digital / AmarTips | Fuera del alcance implementado |
| Navegación interna Hub → SexShop/Restaurante/Bebidas | Vistas existen; el Hub abre URLs externas |

---

## 3. Stack tecnológico

| Capa | Tecnología | Versión | Notas |
|---|---|---|---|
| UI | React + ReactDOM | ^18.3.1 | StrictMode en `main.tsx` |
| Lenguaje | TypeScript | ^5.2.2 | `strict`, `noUnusedLocals`, `noImplicitReturns` |
| Bundler | Vite | ^8.0.16 | Dev en puerto 3000 (`strictPort: false`) |
| Estilos | Tailwind CSS + PostCSS | ^3.4.4 | Tokens de marca en `tailwind.config.js` |
| Motion | Framer Motion | ^11.2.10 | Librería activa de animación |
| Motion (declarado) | GSAP | ^3.12.5 | No usado en código |
| Routing (declarado) | react-router-dom | ^7.1.7 | No usado en código |
| BaaS | @supabase/supabase-js | ^2.110.8 | Solo anon key; sin Auth |
| Deploy | Vercel | — | `.vercel/project.json` |
| Lint | ESLint + typescript-eslint | ^8.57.0 | Script existe; **falta archivo de config** |

Gestión de paquetes: npm con `.npmrc` → `legacy-peer-deps=true`.

---

## 4. Estructura del repositorio

```
PaginaWebAmarte/
├── index.html                 # Fuentes Google (Fjalla One, Jost, Courgette), favicon
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── .env / .env.example
├── .npmrc
├── .vercel/project.json
├── DOSSIER_TECNICO.md         # Este documento
├── 01_PRD.md … 18_*.md        # Specs de producto/arquitectura
├── onboarding_codex.md
├── brief_client/              # Briefs de marca + dossier del backoffice hermano
├── public/videos/             # MP4 estáticos (planes)
├── .agents/skills/dali-frontend/
└── src/
    ├── main.tsx
    ├── App.tsx                # ReservationProvider → Home
    ├── vite-env.d.ts
    ├── styles/index.css
    ├── assets/                # Suites, home_motion, vectors
    ├── views/
    │   ├── Home.tsx           # Orquestador + “router” local
    │   ├── PlanesView.tsx
    │   ├── SexShopView.tsx
    │   ├── RestauranteView.tsx
    │   └── BebidasView.tsx
    ├── components/
    │   ├── organisms/         # Secciones de página
    │   └── molecules/         # Piezas reutilizables
    ├── context/
    │   └── ReservationContext.tsx
    ├── hooks/
    │   └── useMagnet.ts
    ├── lib/
    │   └── supabaseClient.ts
    ├── services/              # Integraciones y lógica de negocio
    └── data/
        └── planesContent.ts   # Contenido editorial de planes
```

### Convenciones

- Atomic Design **parcial**: `molecules/` + `organisms/` (sin `atoms/`).
- UI “tonta” + servicios con I/O (Supabase, WhatsApp, Wompi, widget).
- Lazy loading agresivo desde `Home.tsx` con `React.lazy` + `Suspense`.
- Documentación de producto numerada en la raíz (`01_`…`18_`), firmada como Arquitecto Principal.

---

## 5. Arquitectura de la aplicación

```
┌─────────────────────────────────────────────────────────────┐
│  index.html → main.tsx → App.tsx                            │
│       └── ReservationProvider                               │
│              └── Home (activeView + modales)                │
│                    ├── HeroOrbital (eager)                  │
│                    ├── TrustBar (eager)                     │
│                    ├── lazy: VideoExperience, Suites…       │
│                    ├── lazy: ReservaExpressForm (modal)     │
│                    ├── lazy: LocationModal                  │
│                    └── lazy: PlanesView | SexShop | …       │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
   Supabase (anon)     Railway Martina      Wompi / WhatsApp
   room_rates          amarte-widget.js     checkout / wa.me
   reservations        openChat / openLive
   Storage videos
```

### Navegación (sin router)

Estado local en `Home.tsx`:

```ts
activeView: 'home' | 'planes' | 'sexshop' | 'restaurante' | 'bebidas'
```

| Vista | Componente | Entrada activa |
|---|---|---|
| `home` | Secciones en `Home.tsx` | Default |
| `planes` | `PlanesView.tsx` | CTA desde `PlanesSection` |
| `sexshop` / `restaurante` / `bebidas` | Views dedicadas | Código presente; Hub actual abre tienda externa |

Modales controlados en `Home`:

- `isFormOpen` → `ReservaExpressForm`
- `isLocationOpen` → `LocationModal`

---

## 6. Mapa de componentes

### Organisms (`src/components/organisms/`)

| Componente | Rol |
|---|---|
| `HeroOrbital` | Hero full-bleed: video, canvas de partículas, CTAs Martina, conversation starters |
| `MartinaFeatureSection` | Bloque de presentación de Martina |
| `SuitesSection` | Grid desktop / `StackedCardsDeck` mobile |
| `StackedCardsDeck` | Carrusel apilado táctil de suites |
| `VideoExperience` | Bloque de video experiencia (YouTube embed) |
| `PlanesSection` | Carrusel de planes en Home |
| `ReservaExpressForm` | Modal de pre-reserva + cierre Wompi/WhatsApp |
| `HubAccessGrid` | Accesos a experiencias / tienda / ubicación |
| `ContactoSection` | Contacto, Maps/Waze, redes |
| `MartinaHero` | **Legacy / no montado** en el flujo actual de `Home` |
| `MartinaWidget` | **Legacy / chat local simulado**; reemplazado por widget Railway |

### Molecules (`src/components/molecules/`)

| Componente | Rol |
|---|---|
| `SuiteCard` | Ficha de suite (imagen, features, video hover/modal) |
| `SuiteVideoModal` | Modal de video MP4 de suite |
| `TrustBar` | Barra de confianza bajo el Hero |
| `PromoBanner` | Carrusel de 3 promos con autoplay |
| `LocationModal` | Modal de ubicación + Maps/Waze |

### Kill-switches de performance (`HeroOrbital.tsx`)

- `SHOW_ORB_AURA`
- `SHOW_CURSOR_DIMPLE`

Permiten desactivar efectos costosos sin borrar el código.

---

## 7. Servicios e integraciones

### 7.1 Supabase — `src/lib/supabaseClient.ts`

Cliente único con `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`.  
Si faltan, lanza error al cargar el módulo.

**Sin autenticación** en este frontend. El acceso se basa en políticas RLS de la anon key (lectura de tarifas / insert de reservas públicas).

### 7.2 Catálogo y tarifas

| Servicio | Archivo | Función |
|---|---|---|
| Suites vitrina | `ratesService.ts` | 11 suites hardcodeadas + URLs de video en Storage |
| Suites dinámicas | `suiteCatalogService.ts` | Query `room_rates` filtrando `Suite `; mapeo `LOCAL_SUITE_NAME_TO_DB` |
| Planes | `plansCatalogService.ts` | Precios Pack 6h · Domingo–Jueves desde `room_rates` |
| Contenido editorial planes | `data/planesContent.ts` | Copy, features, `dbName` |

**Estrategia dual de precios:** vitrina instantánea en código + precios reales en runtime desde Postgres.

### 7.3 Pre-reserva — `reservationService.ts`

`createWebReservation()` hace `INSERT` en `reservations` y retorna `id`.

Campos relevantes del row:

| Columna | Origen |
|---|---|
| `nombre`, `documento`, `whatsapp`, `correo` | Formulario |
| `tipo`, `pack_tiempo`, `fecha_reserva`, `hora_reserva`, `precio` | Selección + cálculo |
| `canal` | Siempre `'Web Automático'` |
| `forma_pago` | `'Wompi'` o `'WhatsApp'` |
| `tipo_plan` / `decoracion` | Hoy: sin decoración por defecto |
| `modificado_por` | `'web'` |
| `is_taken` | `false` |

### 7.4 Cierre de conversión — `paymentLinks.ts`

- `getWompiCheckoutUrl()` → abre checkout Wompi en `_blank`.
- `buildWhatsappReservasUrl` / `buildWhatsappReservationMessage` → `wa.me` con mensaje preformateado.

### 7.5 Martina — `amarteChatbot.ts`

1. Prefetch en idle (`requestIdleCallback`, timeout 4s) desde `Home`.
2. Carga única de `{backend}/amarte-widget.js`.
3. Bridge global `window.AmarteChatbot`: `openChat`, `openLive`, `close`.
4. Backend por defecto: `https://chatbotamarte-production.up.railway.app`.

**Legacy:** `martinaService.ts` + `MartinaWidget.tsx` simulan chat local; no forman el flujo de producción actual.

### 7.6 Storage de videos

Bucket público `generated-videos`.  
`ratesService.buildSuiteVideoUrl(file)` construye:

```
{VITE_SUPABASE_URL}/storage/v1/object/public/generated-videos/{file}
```

---

## 8. Modelo de datos (lado frontend)

### Tipos principales

```ts
// ratesService.ts
Suite {
  id, name, slug
  category: "deluxe" | "tematica" | "especial"
  features: { jacuzzi, sauna, cama_movimiento, aire_acondicionado }
  rates: { weekday: SuiteRate; weekend: SuiteRate }
  image, whatsappLink, videoUrl?, videoYoutubeId?
}

SuiteRate { "4h", "8h", "12h", day_hotelero }

// planesContent.ts
PlanContent { id, name, dbName, description, features, imageEmoji, category }

// ReservationContext.tsx
ReservationState {
  selectedSuite, date, time
  hours: "4h" | "8h" | "12h" | "day_hotelero"
  userName, userDocument, userWhatsapp, userEmail
  decorationPlan, totalPrice
}
```

### Suites hardcodeadas (11)

| Categoría | Suites |
|---|---|
| Deluxe | Diamante, Gold, Rubí, Zafiro |
| Temática | Gótica/Baticueva, Árabe, Harley Queen |
| Especial | Jacuzzi VIP, Cabaña, Amarte, Movimiento |

### Planes editoriales (7)

Plan Romántico, Cumpleaños, Amarte, Erótico, Húmedo, Cabaña, Movimiento — categorías: Romance, Celebración, Fantasía, Bienestar.

### Tablas Supabase inferidas del código

| Tabla | Uso |
|---|---|
| `room_rates` | Precios (joins a tipos de habitación/tarifa/día) |
| `room_types` | `id`, `name`, `active`, `sort_order` |
| `rate_types` | `id`, `name`, `hours`, `order_index`, `active` |
| `day_categories` | `id`, `name`, `days[]` |
| `reservations` | Pre-reservas web (columnas en español) |
| Storage `generated-videos` | MP4 de suites |

El esquema canónico y RLS viven en el proyecto Supabase / backoffice, no en este repo.

---

## 9. Estado global y hooks

### `ReservationContext`

Único estado compartido. Implementación: `useReducer` + Context.

Acciones: `SET_SUITE`, `SET_DATE`, `SET_TIME`, `SET_HOURS`, `SET_USER_DATA`, `SET_PLAN`, `CALCULATE_PRICE`, `RESET`.

Hook: `useReservation()` — falla si se usa fuera del provider.

### `useMagnet`

Efecto magnético al cursor (`mousemove` + `getBoundingClientRect`). Usado en `MartinaHero` (no montado hoy).

### Estado local frecuente

- `activeView`, modales en `Home`.
- `isMobile` vía `window.innerWidth` + `resize` (repetido en varios componentes).
- `prefers-reduced-motion` en Hero y CSS.

---

## 10. Variables de entorno

Definidas en `.env.example` y tipadas en `src/vite-env.d.ts`:

| Variable | Obligatoria | Descripción | Fallback |
|---|---|---|---|
| `VITE_SUPABASE_URL` | Sí | Project URL Supabase | — (error si falta) |
| `VITE_SUPABASE_ANON_KEY` | Sí | anon/public key | — (error si falta) |
| `VITE_AMARTE_CHATBOT_URL` | No | Backend Martina | Railway production |
| `VITE_WOMPI_CHECKOUT_URL` | No | Checkout Wompi | URL hardcodeada en servicio |
| `VITE_WHATSAPP_RESERVAS` | No | Número wa.me | `573007416683` |

Solo variables con prefijo `VITE_` se exponen al cliente. No colocar secrets de servicio en este frontend.

---

## 11. Cómo correr el proyecto

### Requisitos

- Node.js compatible con Vite 8
- npm
- Acceso a un proyecto Supabase con las tablas/políticas esperadas

### Comandos

```bash
npm install
cp .env.example .env   # completar URL y anon key
npm run dev            # http://localhost:3000 (o 3001+)
npm run build          # tsc && vite build
npm run preview        # servir dist/
npm run lint           # requiere config ESLint (hoy ausente)
```

### Scripts (`package.json`)

| Script | Comando |
|---|---|
| `dev` | `vite` |
| `build` | `tsc && vite build` |
| `lint` | `eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0` |
| `preview` | `vite preview` |

---

## 12. Sistema de diseño y branding

Fuente de verdad documental: `07_DesignSystem.md`.  
Materialización: `tailwind.config.js` + `src/styles/index.css` + Google Fonts en `index.html`.

### Dirección visual

**“Apple Premium + Espacial Romántico”** (skill `dali-frontend`): elegancia, glass suave, intimidad; evitar neón agresivo / estética ciberpunk.

### Tokens de color

| Token | Hex / valor | Uso |
|---|---|---|
| `magenta-digital` | `#E6007E` | CTA primario |
| `cyan-orbital` | `#19A6E0` | Acento frío |
| `rosa-cuarzo` | `#CB7BA7` | Apoyo |
| `gris-carbon` | `#8E8E93` | Texto secundario |
| `gris-medio` | `#D1D1D6` | Bordes / muted |
| `bg-dark` | `#0D0D11` | Fondo |
| `surface-card` | `rgba(23,23,30,0.75)` | Superficies |

### Tipografía

| Rol | Familia |
|---|---|
| Heading | Fjalla One |
| Body | Jost |
| Accent | Courgette (dosis mínimas) |

### Z-index

`back:100` → `card:200` → `nav:500` → `modal:900` → `martina:1000` → `overlay:1200`

### Utilidades CSS clave

- `.reflective-glass` — glass **sin** `backdrop-filter` (protege INP).
- `.glow-magenta-hover` / `.glow-cyan-hover`
- `.rounded-brand` (12px)
- `.content-visibility-auto`
- `.animate-gradient-slow` (desactivado con `prefers-reduced-motion`)

---

## 13. Motion y performance

### Librerías

- **Activa:** Framer Motion (`motion.*`, `AnimatePresence`, `whileInView`, springs).
- **Inactiva:** GSAP (dependencia muerta).
- **Custom:** Canvas 2D de partículas en `HeroOrbital` con `requestAnimationFrame` + `IntersectionObserver` para pausar fuera de viewport.

### Motion Budget (skill Dalí)

1. Máx. 1 animación principal en Hero.
2. Máx. 1 animación scroll-driven por sección.
3. Máx. 1 hover animado por componente interactivo.
4. Suspender todo si `prefers-reduced-motion`.

### Optimizaciones implementadas

- Lazy loading de casi todos los organisms/views.
- `content-visibility: auto` en secciones.
- Glass sin `backdrop-filter`.
- Prefetch del widget Martina en idle time.
- Imágenes con `loading="lazy"`.
- DPR limitado en canvas móvil.
- Kill-switches de efectos pesados en Hero.

---

## 14. Flujos de usuario críticos

### 14.1 Reserva Express

```
Usuario elige suite / CTA reserva
    → Home abre ReservaExpressForm
    → Carga catálogo/tarifas desde Supabase
    → Usuario elige fecha, hora, pack, datos
    → createWebReservation() → INSERT reservations
    → Bifurcación:
         A) Wompi (checkout externo)
         B) WhatsApp (mensaje con datos de la reserva)
```

Detalle UX: el formulario intercepta `history.pushState` / `popstate` para que el “atrás” del móvil cierre el modal en lugar de salir del sitio.

### 14.2 Martina

```
CTA voz/chat en Hero / scrollToHero
    → openChat(mensaje?)  [mismo gesto de clic]
    → ensureWidgetLoaded()
    → bridge.openChat / openLive
```

Prefetch previo reduce latencia percibida sin bloquear el first paint.

### 14.3 Exploración de planes

```
Home → PlanesSection (carrusel + precios vivos)
     → “Ver todos” → PlanesView (grid completo)
```

### 14.4 Experiencias complementarias

```
HubAccessGrid → window.open(hotelamartesuite.store/…)
              → LocationModal (Maps / Waze)
```

---

## 15. Configuración clave

| Archivo | Contenido relevante |
|---|---|
| `vite.config.ts` | Plugin React; puerto 3000 |
| `tsconfig.json` | Strict + reglas de higiene TS |
| `tailwind.config.js` | Colores, fonts, z-index de marca |
| `postcss.config.js` | tailwindcss + autoprefixer |
| `.vercel/project.json` | `amarte-suite-redesign` |
| `.npmrc` | `legacy-peer-deps=true` |
| `index.html` | Precarga de fuentes no bloqueante (`media="print" onload`) |
| `src/vite-env.d.ts` | Tipado de `ImportMetaEnv` |

**Hueco conocido:** no hay `.eslintrc*` / `eslint.config.*` pese al script `lint` y las devDependencies.

---

## 16. Documentación del ecosistema

### Specs de producto (raíz)

| Doc | Contenido |
|---|---|
| `01_PRD.md` | Producto, KPIs, personas, alcance |
| `02_BrandTranslation.md` | Marca física → digital |
| `03_UX_Principles.md` | Mobile-first, discreción, fricción cero |
| `04_InformationArchitecture.md` | Sitemap / taxonomía |
| `05_UserFlows.md` | Flujos de reserva y conversación |
| `06_ContentArchitecture.md` | Colecciones de contenido |
| `07_DesignSystem.md` | Tokens oficiales |
| `08_ComponentLibrary.md` | Biblioteca declarada (parcialmente implementada) |
| `09_MotionGuidelines.md` | Física orbital / timings |
| `10_Accessibility.md` | WCAG 2.1 AA |
| `11_SEO_ContentStrategy.md` | SEO (mayormente no implementado) |
| `12_ProjectRoadmap.md` | Roadmap por fases |
| `13_ReactArchitecture.md` | Patrones React |
| `14_FolderStructure.md` | Convención de carpetas |
| `15_CodexExecutionPlan.md` | Plan de ejecución para agentes |
| `16_MartinaExperience.md` | Personalidad y tono de Martina |
| `17_ConversionArchitecture.md` | CRO / GTM (no implementado) |
| `18_HeroExperience.md` | Spec del Hero |

### Briefs de cliente

- `brief_client/MANUAL_MARCA_AMARTE_SUITE.md`
- `brief_client/MARTINA _prompt_V2_anfitriona_digital.md`
- `brief_client/Martina_Prompt_V1.md`
- `brief_client/DOSSIER_TECNICO_PROYECTO.md` — **backoffice hermano**, no este sitio

### Agentes

- `.agents/skills/dali-frontend/SKILL.md` — especialista UI/Motion del proyecto

---

## 17. Inventario de features (estado real)

| Feature | Estado |
|---|---|
| Hero orbital + partículas + CTAs Martina | ✅ Producción |
| Trust bar | ✅ |
| Video experiencia | ✅ |
| Catálogo 11 suites (grid + stacked mobile) | ✅ |
| Video suite (YouTube / Storage MP4) | ✅ |
| Planes con precio Supabase | ✅ |
| Vista dedicada de planes | ✅ |
| Promo banner rotativo | ✅ |
| Hub de experiencias + Location modal | ✅ |
| Reserva Express → Supabase → Wompi/WhatsApp | ✅ |
| Widget Martina externo (Railway) | ✅ |
| Contacto / redes / Maps / Waze | ✅ |
| Lazy loading + content-visibility | ✅ |
| Preferencia reduced-motion | ✅ |
| Vistas SexShop / Restaurante / Bebidas | ⚠️ Código listo; Hub no las usa (abre tienda) |
| Chat Martina local (`MartinaWidget`) | ⚠️ Legacy sin montar |
| Router + SEO multi-ruta | ❌ |
| Analytics GTM | ❌ |
| GSAP ScrollTrigger | ❌ (dep muerta) |
| Auth / roles | ❌ (pertenece al backoffice) |
| Pasaporte digital / AmarTips | ❌ |

---

## 18. Relación con el backoffice

```
                    ┌──────────────────────┐
   Visitantes ───►  │  PaginaWebAmarte     │  (este repo)
                    │  Vercel público      │
                    └──────────┬───────────┘
                               │ anon key
                               ▼
                    ┌──────────────────────┐
                    │  Supabase Postgres   │
                    │  + Storage videos    │
                    └──────────┬───────────┘
                               │ service/auth
                               ▼
                    ┌──────────────────────┐
   Staff ────────►  │  reservasAmarteSuite │  (otro repo)
                    │  admin / asesor /    │
                    │  portero             │
                    └──────────────────────┘
```

Este sitio **crea** pre-reservas (`canal: Web Automático`); el backoffice las **opera** (asignación, portería, auditoría, etc.).

---

## 19. Riesgos técnicos y deuda conocida

1. **`react-router-dom` y `gsap` como dependencias muertas** — aumentan superficie y confusión; conviene usarlas o retirarlas.
2. **ESLint sin config** — `npm run lint` no es operable tal cual.
3. **Navegación sin URLs** — imposibilita deep-linking y SEO por sección.
4. **Duplicación de detección mobile** — varios componentes escuchan `resize` por separado.
5. **Código legacy Martina** (`MartinaHero`, `MartinaWidget`, `martinaService`) — riesgo de mantenimiento paralelo.
6. **Precios duales** (hardcode vs Supabase) — pueden divergir si no se sincronizan.
7. **Formulario sin decoración activa en insert** — `tipo_plan`/`decoracion` fijos a “sin decoración” aunque el contexto admite plan.
8. **Secrets en cliente** — solo anon key (correcto); verificar que RLS no permita lecturas/escrituras indebidas.

---

## 20. Checklist de onboarding para un desarrollador nuevo

1. Leer `01_PRD.md` + este dossier.
2. Revisar `07_DesignSystem.md` y skill `dali-frontend`.
3. Copiar `.env.example` → `.env` con credenciales Supabase.
4. `npm install && npm run dev`.
5. Recorrer Home → Suites → Reserva Express → Planes → Hub.
6. Verificar que el widget Martina carga (network: `amarte-widget.js`).
7. Confirmar INSERT en `reservations` desde el formulario (Supabase dashboard).
8. Antes de tocar UI: respetar tokens, motion budget y glass sin `backdrop-filter`.
9. No asumir que los docs `08`/`11`/`17` están 1:1 con el código; priorizar `src/`.

---

## 21. Glosario rápido

| Término | Significado |
|---|---|
| Martina | Anfitriona digital (voz/chat) del sitio |
| Pack / Día Hotelero | Unidades de tiempo de estadía (4h, 8h, 12h, día) |
| Plan | Upsell de decoración temática |
| Reserva Express | Flujo corto web → pre-reserva en BD |
| Widget | Script externo `amarte-widget.js` |
| Backoffice | `reservasAmarteSuite`, operación interna |
| Motion Budget | Límite de animaciones simultáneas por viewport/sección |
| Reflective glass | Estilo glass sin `backdrop-filter` |

---

*Documento generado a partir del estado real del código en `PaginaWebAmarte` (27 jul 2026). Para el sistema operativo interno de reservas, consultar `brief_client/DOSSIER_TECNICO_PROYECTO.md`.*
