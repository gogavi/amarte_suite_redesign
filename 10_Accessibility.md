# 🪐 10_Accessibility.md — Guía de Accesibilidad (Accessibility Guidelines)
## Proyecto: AMARTE Web Experience 2026
**Rol de Autor:** Arquitecto Principal del Proyecto

---

## 1. Estándar Objetivo (WCAG 2.1 AA)
La nueva experiencia digital de **Amarte Suite** debe ser accesible para personas con discapacidades visuales, motoras o auditivas parciales. Cumpliremos rigurosamente el estándar internacional WCAG 2.1 nivel AA.

---

## 2. Contraste de Color y Visualización
Dado que la web utiliza una base visual oscura (`#0D0D11`), se debe tener especial cuidado con el contraste de los textos y elementos interactivos:
* **Texto sobre Fondos Oscuros:** El texto en gris o rosa cuarzo debe tener una relación de contraste mínima de `4.5:1` para texto base y `3:1` para títulos grandes.
  * Texto base (`#FFFFFF` o `#CB7BA7`) sobre fondo oscuro (`#0D0D11`) cumple con la norma.
  * **¡Advertencia!** El Magenta Digital (`#E6007E`) y el Cian Orbital (`#19A6E0`) no deben usarse directamente para bloques largos de texto, solo para botones, enlaces destacados o iconos de acento que superen los ratios de tamaño correspondientes.
* **Modo Alto Contraste:** Asegurar que todos los bordes de campos de formulario de Glassmorphism sean claramente visibles (usar `border-opacity` superior a 0.2 en estados de foco).

---

## 3. Navegación por Teclado e Indicadores de Foco (Focus States)
Todos los flujos críticos (especialmente la selección de suites y el formulario de pre-reserva express) deben ser completamente navegables sin mouse:
* **Indicador de Foco Visible:** El estado `:focus-visible` no debe ocultarse. Debe definirse una línea de contorno luminosa con un halo orbital (`ring-2 ring-cyan-orbital`).
* **Saltar al Contenido:** Agregar un enlace de salto de accesibilidad ("Skip to Content") al inicio del sitio para que los usuarios de teclado puedan saltar directamente al catálogo de suites o al chat con Martina.
* **Orden de Tabulación Lógico:** El foco de tabulación debe fluir secuencialmente a través del menú, la exploración de suites y finalmente el widget de Martina.

---

## 4. Estructura Semántica y Atributos ARIA
* **Uso Semántico de Etiquetas HTML5:** Utilizar `<header>`, `<nav>`, `<main>`, `<section>`, `<article>` y `<footer>` de forma estricta.
* **Atributos ARIA Clave:**
  * Para el Widget de Martina: `role="log"` para la ventana de mensajes, `aria-live="polite"` para notificar cuando Martina responde, y `aria-label="Asistente virtual Martina"`.
  * Para las Fichas de Suites: `role="region" aria-label="Suite Diamante"`.
  * Botones de Control: Todo botón con icono debe tener un atributo `aria-label` descriptivo (ej. `<button aria-label="Enviar mensaje a Martina">`).
