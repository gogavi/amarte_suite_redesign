# 🪐 13_ReactArchitecture.md — Arquitectura Técnica Front-End (React Architecture)
## Proyecto: AMARTE Web Experience 2026
**Rol de Autor:** Arquitecto Principal del Proyecto

---

## 1. Patrones de Diseño y Estado
La aplicación Front-End se estructurará siguiendo los principios de **Component-Driven Design** y **Clean Architecture** adaptada al ecosistema React.

### 1.1. Gestión de Estado Global y Local
* **Estado del Flujo de Reservas:** Utilizaremos `Context API` + `useReducer` en React para manejar la configuración de la pre-reserva de manera global (Suite seleccionada, fecha, hora de llegada, pack de horas, datos del cliente), permitiendo que tanto el catálogo de suites como Martina y el formulario express manipulen el mismo estado de manera coordinada.
* **Estado de la Conversación con Martina:** Estado encapsulado utilizando `useRef` para el historial de mensajes (evitando renderizados innecesarios) y variables de estado locales (`useState`) para controlar el parpadeo del avatar o el estado de grabación de voz.
* **Desacoplamiento de Backend (Mock Data):** Dado que este proyecto es estrictamente Front-End (el backend es desarrollado de manera independiente por el hermano de Jota Ochoa), se omitirá la conexión directa a Supabase durante la Fase V1. El consumo de tarifas, disponibilidad de suites y datos del pasaporte se realizará mediante **servicios simulados locales (Mock Services)** en `src/services/`. Estos servicios exponen interfaces limpias para que la integración futura se realice reemplazando únicamente el cuerpo de las funciones de servicio, sin alterar la UI ni los hooks.

---

## 2. Sistema de Enrutamiento y Carga Diferida (Lazy Loading)
Para garantizar Core Web Vitals excelentes y una experiencia Mobile-First fluida, implementaremos enrutamiento basado en **React Router DOM v7** con división de código (Code-Splitting) nativa:

```jsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoadingScreen from './components/ui/LoadingScreen';

// Carga perezosa de vistas
const Home = lazy(() => import('./views/Home'));
const SuitesCatalog = lazy(() => import('./views/SuitesCatalog'));
const SuiteDetail = lazy(() => import('./views/SuiteDetail'));
const Pasaporte = lazy(() => import('./views/Pasaporte'));
const Page404 = lazy(() => import('./views/Page404'));

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/suites" element={<SuitesCatalog />} />
          <Route path="/suites/:slug" element={<SuiteDetail />} />
          <Route path="/pasaporte" element={<Pasaporte />} />
          <Route path="*" element={<Page404 />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

---

## 3. Hooks Personalizados (Custom Hooks)
Para separar la lógica de negocio del renderizado de interfaces (Container-Presentational Pattern), implementaremos los siguientes hooks clave:

* `useReservationState`: Permite interactuar con el Context de la reserva activa (agregar suites, calcular checkout en base al pack de horas, validar campos).
* `useMartinaVoice`: Lógica de integración con APIs de reconocimiento y síntesis de voz del navegador para el modo manos libres de Martina.
* `useSupabaseRates`: Hook que expone las tarifas dinámicas y calcula precios según la fecha elegida (aplicando lógica de tarifas de fin de semana).
* `usePassport`: Gestiona el progreso de fidelización de sellos y calcula recompensas del usuario registrado.

---

## 4. Proveedores de Contexto (Context Providers)
Se requiere la implementación de los siguientes Contexts globales:
1. `ReservationProvider`: Almacena y procesa el estado mutable de la reserva en curso.
2. `MartinaProvider`: Mantiene el historial de la conversación activa y el estado de carga/espera del bot.
3. `AuthProvider`: Autenticación del usuario para el Pasaporte digital (integrado con Supabase Auth).
