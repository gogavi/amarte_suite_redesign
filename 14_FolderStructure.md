# 🪐 14_FolderStructure.md — Estructura del Repositorio (Folder Structure)
## Proyecto: AMARTE Web Experience 2026
**Rol de Autor:** Arquitecto Principal del Proyecto

---

## 1. Convención y Estructura de Carpetas
Para mantener el proyecto ordenado y escalable, Codex y el equipo de desarrollo deben seguir la siguiente estructura de carpetas en el repositorio:

```
amarte-web-experience/
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # Linter, pruebas, build y despliegue automático
├── public/                    # Assets estáticos globales (robots.txt, sitemap.xml)
├── src/
│   ├── assets/                # Imágenes de marca, texturas espaciales, logos
│   │   ├── images/
│   │   └── vectors/
│   ├── components/            # Componentes ordenados por Atomic Design
│   │   ├── atoms/             # Botones, sellos, inputs básicos
│   │   ├── molecules/         # Fichas de suite, controles de chat, selectores
│   │   ├── organisms/         # Widget de Martina, galería, formulario de reserva
│   │   └── ui/                # Componentes comunes de layout (AppShell, Loading)
│   ├── context/               # Proveedores de estado global
│   │   ├── AuthContext.tsx
│   │   ├── MartinaContext.tsx
│   │   └── ReservationContext.tsx
│   ├── hooks/                 # Hooks personalizados de lógica desacoplada
│   │   ├── useMartinaVoice.ts
│   │   ├── usePassport.ts
│   │   ├── useReservationState.ts
│   │   └── useSupabaseRates.ts
│   ├── lib/                   # Configuraciones de clientes externos
│   │   └── supabase.ts        # Inicialización del cliente Supabase
│   ├── routes/                # Configuración de rutas y guards
│   │   └── AppRouter.tsx
│   ├── services/              # Consumo de APIs y lógica de base de datos
│   │   ├── martinaService.ts  # Envío de mensajes y prompts a Martina
│   │   ├── ratesService.ts    # Consulta y cálculo de precios
│   │   └── reservationService.ts
│   ├── styles/                # CSS Global y tokens de Tailwind
│   │   └── index.css
│   ├── types/                 # Definición de tipos e interfaces TypeScript
│   │   ├── database.types.ts  # Tipos autogenerados de Supabase
│   │   └── index.ts           # Interfaces de negocio (Suite, Plan, Reserva)
│   ├── utils/                 # Utilidades generales y helpers
│   │   ├── dates.ts           # Lógica horaria y huso de Colombia (-05:00)
│   │   └── validations.ts     # Esquemas de validación (Zod / Yup)
│   ├── views/                 # Páginas/Pantallas de nivel superior
│   │   ├── Home.tsx
│   │   ├── Pasaporte.tsx
│   │   ├── SuiteDetail.tsx
│   │   └── SuitesCatalog.tsx
│   ├── App.tsx                # Punto de entrada de React con Providers
│   └── main.tsx               # Montaje en el DOM
├── supabase/                  # Directorio de Supabase
│   ├── functions/             # Edge Functions
│   │   ├── martina-engine/    # Motor de IA para Martina
│   │   └── checkout/          # Handlers de ePayco
│   └── migrations/            # Migraciones SQL de base de datos
├── tailwind.config.js         # Configuración de tokens de Tailwind
├── vite.config.ts             # Configuración del bundler Vite
├── package.json
└── tsconfig.json
```

---

## 2. Convenciones de Nombres
* **Componentes React:** PascalCase (ej. `SuiteCard.tsx`, `MartinaWidget.tsx`).
* **Hooks Personalizados:** camelCase con prefijo `use` (ej. `useReservationState.ts`).
* **Archivos Auxiliares / Utilidades:** camelCase o kebab-case (ej. `dates.ts`, `validation-schemas.ts`).
* **Servicios e Integraciones:** camelCase con sufijo `Service` (ej. `martinaService.ts`).
* **Estilos e Interfaces:** Nombres descriptivos simples (`index.css`, `index.ts`).
