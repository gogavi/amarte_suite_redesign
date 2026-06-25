# 🪐 03_UX_Principles.md — Principios de Experiencia de Usuario (UX Principles)
## Proyecto: AMARTE Web Experience 2026
**Rol de Autor:** Arquitecto Principal del Proyecto

---

## 1. Mobile-First como Prioridad Absoluta
El 90% del tráfico del hotel proviene de dispositivos móviles, principalmente a través de enlaces directos en redes sociales (Instagram, TikTok). La experiencia web debe diseñarse y optimizarse en primer lugar para móviles:
* **Navegación con una mano (Thumb Zone):** Los botones principales de acción (CTA) y el acceso a Martina deben estar dentro del área accesible para el pulgar.
* **Optimización de carga en redes móviles:** Elementos visuales optimizados para conexiones 3G/4G urbanas. Carga diferida (lazy loading) agresiva de imágenes pesadas y videos.
* **Formularios adaptados:** Uso de teclados específicos de teléfono (numérico para teléfono/cédula, email para correo) y autocompletado nativo.

---

## 2. Heurísticas de Usabilidad Especializadas
Diseñamos la experiencia web bajo tres heurísticas adaptadas al contexto de hoteles de parejas:

### H1: Privacidad y Discreción
* **Navegación Discreta:** Opción rápida de "Salida Express" o "Ocultar Web" que redirige a un sitio neutro (ej. buscador de noticias o Google) con un solo toque, útil si el usuario requiere discreción inmediata en su entorno.
* **Formularios Mínimos:** No solicitar datos sensibles innecesarios. Mantener la recolección de datos al mínimo absoluto indispensable para coordinar la reserva.

### H2: Fricción Cero hacia la Conversación
* **Martina omnipresente pero no invasiva:** Un widget flotante de chat que no tape contenidos críticos pero sea fácilmente activable.
* **Transición fluida a WhatsApp:** Si el usuario decide continuar por WhatsApp, la web debe empaquetar toda la información de la pre-reserva (suite, fecha, horas) y pasarla como un mensaje inicial precargado. El usuario no debe repetir información.

### H3: Claridad y Transparencia de Tarifas
* **Detección del día de la semana:** La web debe calcular automáticamente si el día seleccionado es tarifa de fin de semana (Viernes/Sábado) o de semana (Domingo a Jueves), mostrando el precio final exacto sin letras chicas ni cobros sorpresa de última hora.

---

## 3. Diseño Emocional y Microinteracciones
* **Anticipación del Escape:** La navegación por la ficha de suites debe evocar relajación y romance. Las transiciones de pantalla deben simular un viaje orbital (desplazamientos curvos, desvanecimientos suaves).
* **Feedback Reactivo:** Hover de botones con expansión sutil de órbita luminosa, simulando un efecto de energía estelar o halo de planeta.
* **Loader Espacial:** Reemplazar las barras de carga clásicas por un cohete orbitando un planeta-corazón para mantener el universo narrativo activo en los tiempos de espera.
