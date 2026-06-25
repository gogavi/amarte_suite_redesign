

export interface Message {
  id: string;
  sender: 'user' | 'martina';
  text: string;
  timestamp: Date;
}

export const getMartinaInitialGreeting = (): string => {
  return "Hola 💖 Soy Martina, tu anfitriona digital de Amarte Suite. Estoy aquí para ayudarte a encontrar la experiencia perfecta dentro del Planeta Romántico de Bogotá. ¿Están celebrando algo especial o simplemente quieren escaparse de la rutina?";
};

export const getMartinaResponse = (userInput: string): string => {
  const text = userInput.toLowerCase();

  // Caso: Precios
  if (text.includes("precio") || text.includes("costo") || text.includes("cuánto cuesta") || text.includes("valor")) {
    return "¡Claro! En el Planeta Romántico tenemos tarifas adaptadas a su tiempo de viaje. 🪐 Por ejemplo, la Suite Amarte va desde $78.000 (4 horas en semana) hasta $165.000 (Día Hotelero de 12 horas en semana). Las Suites Deluxe y Temáticas tienen un valor de $200.000 las 4 horas (en semana). ¿Les gustaría que les recomiende una suite de lujo, una temática o una con jacuzzi? 🛀✨";
  }

  // Caso: Lujo
  if (text.includes("lujo") || text.includes("premium") || text.includes("diamante") || text.includes("gold") || text.includes("zafiro")) {
    return "Si buscan lujo absoluto, les recomiendo nuestra majestuosa **Suite Deluxe Diamante** 💎 o la brillante **Suite Gold** 💛. Ambas cuentan con jacuzzi de hidromasaje, iluminación digital programable y acabados de gama alta para hacerlos sentir en otro planeta. ¿Quieren ver los precios de estas opciones?";
  }

  // Caso: Temática
  if (text.includes("tematica") || text.includes("arabe") || text.includes("gotica") || text.includes("queen")) {
    return "¡Me encanta esa idea! Nuestras Suites Temáticas son ideales para vivir una fantasía única. Pueden elegir la **Suite Gótica** 🦇 (con jaula de sumisión e iluminación tenue), la exótica **Suite Árabe** 🕌 (con cúpulas orientales y cojines de seda) o la sensual **Suite Queen** 😈. ¿Celebran alguna ocasión especial o es una sorpresa erótica?";
  }

  // Caso: Jacuzzi o relajarse
  if (text.includes("jacuzzi") || text.includes("tina") || text.includes("relajar")) {
    return "Para una desconexión y relajación total, la **Suite VIP Jacuzzi** 🫧 es la ideal. Cuenta con un jacuzzi gigante con cromoterapia y sauna ilimitada para que se olviden de la rutina diaria. El valor por 4 horas de Domingo a Jueves es de $175.000. ¿Les gustaría agendar este viaje?";
  }

  // Caso: Ubicación
  if (text.includes("ubicacion") || text.includes("donde quedan") || text.includes("direccion") || text.includes("mapa")) {
    return "Nos encontramos ubicados en el corazón de Bogotá, en el tradicional sector de Teusaquillo: 📍 **Calle 62 #14-19**. Es una zona muy reservada y de fácil acceso. Pueden ver la ubicación exacta aquí: https://bit.ly/ubicacionAmarte 🗺️. ¿Cuándo planean visitarnos?";
  }

  // Caso: Reservar
  if (text.includes("reservar") || text.includes("reserva") || text.includes("separar")) {
    return "¡Excelente decisión! 🚀 Para preparar su vuelo espacial al Planeta Romántico necesito que me indiquen:\n1. Fecha de visita 📅\n2. Hora aproximada de llegada ⏰\n3. Suite o Plan que prefieren 💞\n\nCon eso les daré el valor exacto y el enlace de pago seguro.";
  }

  // Caso: Métodos de pago
  if (text.includes("pago") || text.includes("pagar") || text.includes("banco") || text.includes("nequi") || text.includes("tarjeta")) {
    return "Pueden realizar el pago seguro online por ePayco aquí: 💳 https://secure.payco.co/checkoutopen/66308\n\nTambién recibimos transferencias a nuestra cuenta corriente **Bancolombia No. 30089879630** (NIT: 900112447-4) a nombre de Inversiones Ogavi S.A. ¿Les queda cómodo este método?";
  }

  // Caso por defecto (Anfitriona)
  return "Qué buena pregunta. En Amarte Suite nos encargamos de que cada detalle sea inolvidable. Cuéntenme un poco más, ¿qué tipo de suite o decoración están imaginando para su noche especial? 💖🌹";
};
