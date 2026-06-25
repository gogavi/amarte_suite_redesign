# 🪐 18_HeroExperience.md — Especificación Maestra de la Experiencia Hero + Martina
## Proyecto: AMARTE Web Experience 2026
**Rol de Autor:** Arquitecto Principal del Proyecto
**Inspiración Estética:** AION + AMARTE Suite ("El Planeta Romántico")

---

## 1. Visión Conceptual: AION + AMARTE
El Hero no es una cabecera estática con un slider de fotos del hotel. Es una **experiencia digital inmersiva y tridimensional** que transporta de inmediato a la pareja al universo de la marca. 

Bajo la influencia de **AION**, la interfaz se siente viva y responsiva. Fusionamos la elegancia tipográfica y espacial con la interacción conversacional para convertir el primer impacto visual en una reserva iniciada.

```
┌────────────────────────────────────────────────────────┐
│  🪐 AMARTE SUITE (Header)                  [Reservar]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  "TE VOY A LLEVAR                                      │
│   A MARTE"                    👩‍🚀 [Avatar Martina]      │
│                                "Hola, ¿celebran algo   │
│  Viajá al Planeta Romántico     especial hoy? 💖"      │
│  de Bogotá con Martina.                                │
│                                                        │
│  [Explorar Suites]             [Hablar con Voz 🎙️]     │
│                                                        │
├────────────────────────────────────────────────────────┤
│  [  ⭐ Más de 50.000 parejas han viajado a Marte   ]   │ (TrustBar)
└────────────────────────────────────────────────────────┘
```

---

## 2. Elementos Clave de la Experiencia

### 2.1. El Lienzo Espacial Profundo (Interactive Canvas)
* **Visual:** Un fondo WebGL oscuro (`#0D0D11`) de estrellas de baja intensidad que reacciona levemente al movimiento del cursor o al giroscopio del móvil (efecto parallax interactivo tridimensional).
* **Las Órbitas:** Líneas SVG sutiles con gradientes de color Cian Orbital y Rosa Cuarzo que cruzan la pantalla de forma curva.
* **El Planeta Corazón:** El logotipo de Amarte (el corazón-planeta con cráteres) se renderiza en alta resolución, rotando de forma lenta sobre su propio eje. Al pasar el cursor, el planeta pulsa levemente y genera una onda gravitacional visual expansiva.

### 2.2. La Ventana Orbital Inmersiva (Inspiración Dreamcore / Portal Gateway)
Adoptamos el comportamiento visual clave de la biblioteca de movimiento (como se ve en *Dreamcore Landing* y *Gateway Portal*):
* **El Portal Ojo de Buey / Ventanilla de Nave:** El centro del Hero presenta una estructura en forma de ventanilla de nave espacial elíptica u órbita circular (Glassmorphism con bordes cromados suaves).
* **Transición de Portal Estelar (Portal Transition):** Al interactuar con el botón "Viajar a otro planeta" o al hacer clic sobre el portal, la ventanilla se expande de forma elíptica en un zoom 3D inmersivo de pantalla completa (mecanismo *Portal Zoom*). El cielo estelar da paso a una vista interior tridimensional y envolvente de las suites temáticas (Árabe, Gótica, Deluxe) simulando un aterrizaje real en la suite física del hotel.
* **Scroll-Triggered Window:** Al desplazar el scroll vertical, la forma de la ventanilla interactúa revelando dinámicamente diferentes suites o paisajes del Planeta Romántico como máscaras de capa SVG, creando un efecto de profundidad inmersiva único.

### 2.3. MartinaHero: La Anfitriona Ingrávida
Martina no es un widget de soporte arrinconado. Vive en el corazón del Hero:
* **El Avatar:** Un modelo / ilustración 3D de alta fidelidad de Martina con su traje y casco espacial de astronauta. Se presenta flotando suavemente en el lateral derecho de la pantalla con una animación continua de ingravidez (float animation).
* **El Casco Interactivo:** El visor de su casco de astronauta refleja sutilmente las estrellas de fondo y proyecta colores magenta suaves cuando está en estado de escucha activa.
* **Diálogo Proactivo:** Burbujas de diálogo con estilo de Glassmorphism aparecen a su lado mostrando frases dinámicas personalizadas según la hora del día o la proximidad del fin de semana (ej. *"¿Preparados para escapar de la rutina esta noche? 🍾"*).

---

## 3. Estados de la Experiencia Hero

| Estado | Comportamiento Visual | Acciones Disponibles |
|---|---|---|
| **E1: Inactivo (Llegada)** | Martina flota de manera ingrávida. El portal circular central muestra nubes estelares en movimiento. | El usuario puede explorar el sitio o interactuar con el portal. |
| **E2: Saludo Activo** | Martina parpadea, su burbuja de texto cambia y el visor del portal se expande un 5% invitando a mirar dentro. | "Chatear con Martina" o hacer clic en el Portal. |
| **E3: Transición de Portal (Zoom)** | El portal circular central se expande acelerando hasta cubrir la pantalla completa en una animación fluida de 700ms. | Transición inmersiva hacia el interior interactivo de la suite elegida. |
| **E4: Voz Activa (Manos Libres)** | El fondo se oscurece. Martina se desplaza al centro de la pantalla. El visor de su casco proyecta ondas de voz en color Magenta Digital. | Entrada de voz activa. Martina responde en audio. |

---

## 4. Animaciones y Control Técnico (GSAP & Framer Motion)

### 4.1. Animación Parallax y Portal (GSAP)
Utilizamos `ScrollTrigger` de GSAP para sincronizar el efecto de zoom y máscara de la ventanilla con el scroll vertical del usuario:
```javascript
// Efecto de expansión de la ventanilla (Portal Zoom) al desplazar
gsap.to(".portal-window", {
  scrollTrigger: {
    trigger: ".hero-orbital",
    start: "top top",
    end: "bottom top",
    scrub: 1 // Efecto de inercia suave de 1 segundo
  },
  scale: 2.5,
  borderRadius: "0%", // Se expande de círculo/ojo de buey a pantalla completa
  ease: "power2.inOut"
});

gsap.to(".constelacion-fondo", {
  scrollTrigger: {
    trigger: ".hero-orbital",
    start: "top top",
    end: "bottom top",
    scrub: true
  },
  y: -150,
  ease: "none"
});
```

### 4.2. Flotación Ingrávida de Martina (Framer Motion)
Para simular de manera perfecta la gravedad cero de Martina al flotar al lado del título principal:
```jsx
const martinaFloat = {
  animate: {
    y: [0, -12, 0],
    rotate: [0, 1.5, -1.5, 0],
    transition: {
      duration: 5,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "mirror"
    }
  }
};
```

