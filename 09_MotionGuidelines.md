# 🪐 09_MotionGuidelines.md — Pautas de Animación (Motion Guidelines)
## Proyecto: AMARTE Web Experience 2026
**Rol de Autor:** Arquitecto Principal del Proyecto

---

## 1. Filosofía de Movimiento: "Física Orbital"
Las animaciones en **Amarte Suite** no son decoraciones aleatorias. Deben simular la física del espacio: órbitas, gravedades, aceleraciones cósmicas y transiciones fluidas.
* **Fluidez:** Nada de movimientos lineales cortados. Usar transiciones basadas en resortes (Spring Physics) en Framer Motion.
* **Direccionalidad:** Las entradas de secciones simulan una trayectoria orbital (movimientos ligeramente curvos o desplazamientos diagonales sutiles en lugar de líneas rectas).
* **Propósito:** El movimiento debe guiar el ojo hacia la acción principal (ej. el cohete despegando o Martina parpadeando para llamar la atención del chat).

---

## 2. Parámetros de Curvas y Tiempos (Timing & Easings)
Para mantener consistencia, se establecen las siguientes variables globales de curvas de animación (easings):

* **Ease Out Romántico (Para entradas y transiciones de fotos):**
  * `cubic-bezier(0.25, 1, 0.5, 1)` (Suave al inicio, frena de manera progresiva y elegante).
* **Spring Orbital (Para botones, menús flotantes y el widget de Martina):**
  * `stiffness: 120 | damping: 14 | mass: 0.8` (Física de rebote sutil pero reactiva al tacto).
* **Duraciones Estándar:**
  * Microinteracciones rápidas (hover botones, clics): `150ms – 250ms`.
  * Transiciones de página y despliegue de modales: `400ms – 600ms`.

---

## 3. Implementación con Framer Motion (Ejemplos Técnicos)

### 3.1. Animación del Widget de Martina (Entrada Orbital)
```jsx
const martinaVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8, 
    y: 100,
    rotate: -5
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    rotate: 0,
    transition: { 
      type: "spring", 
      stiffness: 100, 
      damping: 15 
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9, 
    y: 50,
    transition: { duration: 0.2 }
  }
};
```

### 3.2. Hover en Tarjeta de Suite (Efecto Gravedad)
Al pasar el cursor, la tarjeta se eleva ligeramente y proyecta un brillo difuminado:
```jsx
const suiteCardHover = {
  hover: {
    y: -8,
    scale: 1.02,
    boxShadow: "0px 10px 30px rgba(230, 0, 126, 0.25)",
    transition: { duration: 0.3, ease: "easeOut" }
  }
};
```

---

## 4. Uso Estratégico de GSAP
GSAP se utilizará exclusivamente en zonas donde Framer Motion se quede corto en rendimiento o donde se requieran animaciones complejas basadas en scroll (ScrollTrigger):
* **Hero Landing:** Animación de entrada por capas (Parallax espacial) de los planetas, estrellas de fondo y el cohete-cupido al hacer scroll en la página de inicio.
* **Línea de Tiempo del Pasaporte:** Efectos de dibujo SVG de las órbitas que se completan conforme el usuario recorre su historial de suites.
