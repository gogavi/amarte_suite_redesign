# 🪐 08_ComponentLibrary.md — Biblioteca de Componentes (Component Library)
## Proyecto: AMARTE Web Experience 2026
**Rol de Autor:** Arquitecto Principal del Proyecto

---

## 1. Introducción
Este catálogo sigue el enfoque de **Atomic Design** para estructurar componentes reutilizables, escalables y mantenibles en la aplicación React. Todos los componentes deben consumir los tokens definidos en `07_DesignSystem.md` y aplicar Tailwind CSS.

---

## 2. Átomos (Componentes Básicos)

### 2.1. Botón Primario (`ButtonPrimary`)
* **Visual:** Fondo Magenta Digital (`#E6007E`), texto blanco, Jost Bold, redondeado de 12px.
* **Comportamiento:** Transición suave (Framer Motion) en hover agregando un brillo sutil (`glow-magenta`).
* **Accesibilidad:** Requiere atributo `aria-label` descriptivo.

### 2.2. Botón Orbital (`ButtonOrbital`)
* **Visual:** Fondo transparente, borde Magenta o Cian Orbital, texto de color correspondiente, Jost SemiBold.
* **Comportamiento:** Relleno de color en hover con animación de entrada lateral.

### 2.3. Sello Pasaporte (`PassportStamp`)
* **Visual:** Sello circular con silueta de planeta o cupido astronauta.
* **Estados:** Desbloqueado (Magenta/Cian activo) o Bloqueado (Gris medio con opacidad).

---

## 3. Moléculas (Combinación de Átomos)

### 3.1. Selector de Horas (`HourSelector`)
* **Estructura:** Fila o grid de botones que permiten seleccionar la duración (4h, 8h, 12h, Día Hotelero).
* **Comportamiento:** Animación de selección en la que el botón activo se expande un 5% y proyecta un brillo orbital.

### 3.2. Ficha de Suite Simplificada (`SuiteCard`)
* **Estructura:** Contenedor de Glassmorphism con imagen de fondo, título de la suite, precio desde e iconos de especificaciones (jacuzzi, sauna).
* **Comportamiento:** Hover genera zoom suave de la imagen y resalta el borde de la tarjeta.

### 3.3. Entrada de Chat de Martina (`MartinaInput`)
* **Estructura:** Campo de texto interactivo con botón de micrófono (Voz) y botón de envío.
* **Accesibilidad:** Etiquetas claras y lector de estado para cuando Martina está "pensando" o "escribiendo".

### 3.4. Tarjeta de AmarTip (`AmarTipCard`)
* **Estructura:** Tarjeta de Glassmorphism suave (`bg-opacity-50`) que muestra el título del consejo de romance, categoría (ej. Sorpresas), emojis temáticos de Martina y una pequeña cita manuscrita en fuente Courgette.
* **Interactividad:** Clic para expandir el consejo o enviárselo a la pareja por WhatsApp.

### 3.5. Barra de Confianza (`TrustBar`)
* **Estructura:** Contenedor horizontal sutil posicionado justo debajo del Hero principal. Muestra estadísticas sociales en tiempo real (ej. *"Más de 50.000 parejas han viajado a Marte"*), insignias de excelencia y testimonios muy cortos e interactivos.

### 3.6. Tarjeta de Experiencia (`ExperienceCard`)
* **Estructura:** Tarjetas dinámicas que promocionan los servicios no hoteleros: Carta de Restaurante, Catálogo de Sex Shop, Promociones activas y reservas para Eventos especiales.
* **Estilo:** Diseño oscuro con iluminación focal en el producto y botón de acción directa a WhatsApp.

---

## 4. Organismos (Estructuras Complejas)

### 4.1. Widget Conversacional Martina (`MartinaWidget`)
* **Estructura:** Ventana flotante interactiva. Contiene cabecera con avatar animado de Martina (casco de astronauta), cuerpo con historial de mensajes (burbujas de conversación con bordes redondeados asimétricos) y pie con `MartinaInput`.

### 4.2. Galería de Suites Interactiva (`SuitesGallery`)
* **Estructura:** Grid dinámico con filtros de categoría (Deluxe, Temáticas, Especiales). Permite alternar la vista entre precios de semana y fin de semana.

### 4.3. Formulario de Reserva Express (`ReservaExpressForm`)
* **Estructura:** Card de Glassmorphism que integra selección de fecha/hora, selector de suite, selector de horas y pasarela de checkout ePayco.

### 4.4. Hero Orbital (`HeroOrbital`)
* **Estructura:** El contenedor principal y dinámico del landing page. Diseñado bajo la inspiración estética de AION. Presenta un fondo espacial WebGL profundo (estrellas interactivas en movimiento lento) y órbitas SVG que se cruzan.
* **Centro visual:** El "Planeta Amarte" (Corazón interactivo) con una órbita activa donde viaja el cohete-cupido.

### 4.5. Martina Hero (`MartinaHero`)
* **Estructura:** La versión inmersiva de la anfitriona integrada directamente dentro de la zona lateral del `HeroOrbital`. En lugar de ser solo un chatbot flotante, Martina se muestra como un avatar de cuerpo completo / medio cuerpo flotando de forma ingrávida al lado del título principal del Hero, invitando al usuario a iniciar la interacción conversacional de inmediato.

### 4.6. Navegación Orbital (`OrbitalNavigation`)
* **Estructura:** Menú de navegación interactivo con forma de órbita circular. El usuario desplaza el cursor o desliza el dedo de forma circular para girar la órbita, haciendo que diferentes suites giren y se posicionen al centro de la pantalla, simulando una selección planetaria estelar.

