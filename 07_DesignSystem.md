# 🪐 07_DesignSystem.md — Sistema de Diseño Visual (Design System)
## Proyecto: AMARTE Web Experience 2026
**Rol de Autor:** Arquitecto Principal del Proyecto

---

## 1. Fundamentos Visuales (Design Tokens)
Este sistema unifica las inconsistencias del manual físico legacy de marca (v2.0) y lo adapta para pantallas de alta fidelidad y contraste digital en interfaces oscuras.

### 1.1. Paleta de Color Consolidada

```json
{
  "color": {
    "brand": {
      "magentaOfficial": "#C3007A",  // Conservado para piezas físicas/impresión.
      "magentaDigital":  "#E6007E",  // Optimizado para contraste digital y CTAs web.
      "cyanOrbital":     "#19A6E0",  // Acento complementario frío. Evoca espacio y órbitas.
      "black":           "#000000",
      "white":           "#FFFFFF"
    },
    "secondary": {
      "rosaCuarzo":  "#CB7BA7",      // Fondos suaves, bordes sutiles de tarjetas.
      "grisCarbon":  "#4E4E4C",      // Texto secundario e iconos neutros.
      "grisMedio":   "#929095"       // Captions y elementos deshabilitados.
    },
    "surface": {
      "bgDark":     "#0D0D11",       // Fondo base de la web (Efecto espacio profundo).
      "surfaceCard": "#17171E",      // Superficie de tarjetas y modales (Glassmorphism).
      "bgLight":    "#FFFFFF"
    },
    "system": {
      "success": "#2EB872",          // Pago exitoso, reserva confirmada.
      "warning": "#F5A623",          // Alertas de disponibilidad.
      "error":   "#E5384B"           // Errores de validación en formularios (distinto del Magenta).
    }
  }
}
```

---

## 2. Tipografía y Escala
Adoptamos el escenario premium híbrido optimizando legibilidad y peso de bundles de fuentes:

* **Títulos Principales / Impacto:** `Fjalla One` (Google Fonts). Condensada, fuerte. Solo en mayúsculas.
* **Subtítulos y Acentos Románticos:** `Courgette` (Google Fonts). Cursiva script elegante. En dosis mínimas.
* **Cuerpo de Texto y Formularios:** `Jost` (Google Fonts). Geométrica art-déco, con excelente consistencia visual junto a Bellerose del logo.

### Escala Tipográfica de Interfaces:
* **Display / Hero (Titulares de alto impacto):** `48px (3rem) | Bold | Tracking: -0.02em | Fjalla One`
* **H1 / Títulos de Sección:** `32px (2rem) | Bold | Fjalla One`
* **H2 / Subtítulos:** `24px (1.5rem) | SemiBold | Fjalla One`
* **Citas / Frases de Acento:** `20px (1.25rem) | Regular | Courgette`
* **Body / Texto Base:** `16px (1rem) | Regular | Jost`
* **Caption / Legales / Notas:** `13px (0.8125rem) | Regular | Jost`

---

## 3. Retículas, Sombras y Bordes (Borders, Spacing & Layers)
* **Borde Redondeado Estándar:** `12px (0.75rem)` para tarjetas y botones principales.
* **Sombras Espaciales (Glow Effect):** En lugar de sombras negras duras, usamos halos de luz magenta y cian difuminados en estados hover:
  * `glow-magenta: 0 0 15px rgba(230, 0, 126, 0.4)`
  * `glow-cyan: 0 0 15px rgba(25, 166, 224, 0.4)`
* **Efecto Esmerilado (Glassmorphism):**
  * `background: rgba(23, 23, 30, 0.75)`
  * `backdrop-filter: blur(10px)`
  * `border: 1px solid rgba(255, 255, 255, 0.08)`

### 3.1. Espaciado Responsivo (Responsive Spacing)
Definimos tokens dinámicos utilizando la función clamp de CSS o clases responsivas para adaptar los espacios de forma fluida entre móvil y escritorio:

| Token | Espacio Móvil (Mobile) | Espacio Escritorio (Desktop) | Uso Recomendado |
|---|---|---|---|
| `spacing-xs` | `4px (0.25rem)` | `8px (0.5rem)` | Espacios entre textos, micro-elementos. |
| `spacing-sm` | `12px (0.75rem)` | `16px (1rem)` | Margen interno de botones, inputs. |
| `spacing-md` | `16px (1rem)` | `24px (1.5rem)` | Margen interno de tarjetas, grids secundarios. |
| `spacing-lg` | `24px (1.5rem)` | `40px (2.5rem)` | Separación entre secciones, contenedores. |
| `spacing-xl` | `48px (3rem)` | `80px (5rem)` | Margen superior del Hero y pie de página. |

### 3.2. Arquitectura de Capas (Z-Index Architecture)
Para evitar conflictos de solapamiento visual entre menús colapsables, modales y el widget flotante o el overlay de voz de Martina:

```json
{
  "z-index": {
    "background": 100,       // Lienzos espaciales, WebGL, partículas traseras
    "cards": 200,            // Contenido, suites, planes, AmarTips
    "navbar": 500,           // Cabecera y menús de navegación principal
    "modal": 900,            // Modales de confirmación, formularios pop-up
    "martina": 1000,         // Widget flotante o pantalla completa de Martina
    "voiceOverlay": 1200     // Interfaz overlay a pantalla completa de entrada de voz
  }
}
```

---

## 4. Tokens de Animación (Motion Tokens)
Gobernamos la velocidad del sitio web con tokens que definen los tiempos de transición estándar:

* **Fast (150ms):** `transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1)`. Utilizado para hovers rápidos en botones, enlaces o iconos reactivos.
* **Normal (250ms):** `transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1)`. Para despliegue de menús, expansión de acordeones y transiciones de estados de formularios.
* **Premium (400ms):** `transition: all 400ms cubic-bezier(0.25, 1, 0.5, 1)`. Para apertura de modales, efectos de Glassmorphism fluidos y transiciones de fotos de suites.
* **Hero / Orbit (700ms):** `transition: all 700ms cubic-bezier(0.25, 1, 0.5, 1)`. Utilizado para las entradas del sistema solar en el Hero, órbitas de cohetes y giros planetarios iniciales.

