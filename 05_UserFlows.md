# 🪐 05_UserFlows.md — Flujos de Usuario (User Flows)
## Proyecto: AMARTE Web Experience 2026
**Rol de Autor:** Arquitecto Principal del Proyecto

---

## 1. Flujo de Pre-Reserva Express (Cierre Web/WhatsApp)
Muestra la ruta crítica desde que un usuario selecciona una suite hasta que realiza el pago o finaliza la reserva:

```mermaid
flowchart TD
    Inicio[Usuario navega por ficha de Suite] --> Seleccionar[Hace clic en Reservar ahora]
    Seleccionar --> Configurar[Elige fecha, hora y duración: 4h, 8h, 12h, Día Hotelero]
    Configurar --> Formulario[Completa Nombre, Documento y WhatsApp]
    Formulario --> MetodoPago{Elige método de pago}
    
    MetodoPago -->|Pago Digital| Pasarela[Checkout ePayco online]
    MetodoPago -->|WhatsApp / Transferencia| WA[Redirección WhatsApp con datos precargados]
    
    Pasarela --> Confirmacion[Pantalla de éxito + Enlace de Pasaporte digital]
    WA --> Asesor[Asesor humano confirma pago y registra reserva en Supabase]
```

---

## 2. Flujo Conversacional con Martina
Describe cómo Martina interactúa con el usuario para resolver dudas y generar oportunidades de reserva (Upselling):

```mermaid
flowchart TD
    InicioChat[Usuario abre chat o activa voz con Martina] --> Saludo[Martina saluda y pregunta por la ocasión especial]
    Saludo --> ResUsuario[Usuario responde e indica sus preferencias]
    ResUsuario --> Analisis{¿Usuario busca lujo, temática o relajación?}
    
    Analisis -->|Lujo| RecDeluxe[Martina sugiere Suites Deluxe: Diamante/Gold/Rubí]
    Analisis -->|Temática| RecTematica[Martina sugiere Suites Temáticas: Árabe/Gótica/Queen]
    Analisis -->|Relajación / Jacuzzi| RecJacuzzi[Martina sugiere Suite VIP Jacuzzi]
    
    RecDeluxe & RecTematica & RecJacuzzi --> OfrecerPlan{¿Desean agregar Plan Decoración?}
    OfrecerPlan -->|Sí| AplicarPlan[Agrega decoración: Plan Romántico / Erótico]
    OfrecerPlan -->|No| ProcederReserva[Proceder a pre-reserva express]
    
    AplicarPlan --> ProcederReserva
```

---

## 3. Flujo del Pasaporte Romántico (Fidelización)
1. **Acceso:** El cliente escanea un código QR en la suite física o ingresa a la web con su número de identificación.
2. **Visualización:** El panel muestra los sellos virtuales acumulados (cada suite visitada desbloquea un planeta diferente del sistema solar Amarte).
3. **Redención:** Al acumular 5 sellos, el sistema genera automáticamente un cupón digital con un código único de descuento para su próxima visita, canjeable directamente en el flujo de pre-reserva express o presentándolo al asesor por WhatsApp.
