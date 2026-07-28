export interface Message {
  id: string;
  sender: 'user' | 'martina';
  text: string;
  timestamp: Date;
}

const FORM_URL = 'https://amartesuite.com/formulario-reservas-amarte-suite/';
const PROMO_JACUZZI_URL = 'https://amartesuite.com/suite-jacuzzi-mejor-precio/';
const MAPS_URL = 'https://bit.ly/ubicacionAmarte';

export const getMartinaInitialGreeting = (): string => {
  return 'Hola 💖✨ Soy Martina, tu asistente de Amarte Suite en Chapinero. Te ayudo a encontrar la suite o el plan perfecto y a dejar tu reserva lista en un momento 🥂. ¿Buscas jacuzzi, una suite especial o una decoración sorpresa? 🛁🔥';
};

export const getMartinaResponse = (userInput: string): string => {
  const text = userInput.toLowerCase();

  // Límite estricto: acompañantes / contenido adulto
  if (
    text.includes('acompañante') ||
    text.includes('acompanante') ||
    text.includes('escort') ||
    text.includes('prepago') ||
    text.includes('chica') ||
    text.includes('chicas') ||
    text.includes('contenido adulto') ||
    text.includes('porn')
  ) {
    return 'Gracias por escribirnos 💖. Con mucha cordialidad te cuento que en Amarte Suite no ofrecemos acompañantes ni contenido para adultos 🔞. Somos un hotel de suites para parejas: privacidad, comodidad y experiencias románticas 🛌✨. ¿Te ayudo con una suite o un plan de decoración?';
  }

  // Mimosas
  if (text.includes('mimosa')) {
    return '¡Claro! 🍸 Las Mimosas son exquisitos cócteles de bienvenida de obsequio, no el brunch clásico 🥂✨. En la Promo Jacuzzi van 2 incluidas en el pack. ¿Te muestro esa promo? 🛁🔥';
  }

  // Objeción de precio (antes que "precio" genérico)
  if (
    text.includes('caro') ||
    text.includes('presupuesto') ||
    text.includes('descuento') ||
    text.includes('muy costoso') ||
    text.includes('no me alcanza')
  ) {
    return 'Te entiendo perfectamente 💖. Puedo ofrecerte la Suite Sencilla a **$30.000 la hora suelta** 💰, o si te late VIP/Temática/Jacuzzi aplicarte hoy un **10% (hasta 15%) de descuento exclusivo** 😉🔥. ¿Cuál te acomoda más para asegurarte la reserva?';
  }

  // Jacuzzi / promo (prioridad)
  if (
    text.includes('jacuzzi') ||
    text.includes('tina') ||
    text.includes('relajar') ||
    text.includes('promo')
  ) {
    return `🔥 **Promo Jacuzzi** por **$150.000 / 4 horas**: jacuzzi ilimitado + **2 Mimosas** (cócteles de bienvenida) 🛁🍸🍸.\n\nPre-reserva aquí 👇\n${PROMO_JACUZZI_URL}\n\nSi quieres más tiempo, te paso todos los valores de la Suite Jacuzzi ✨. ¿Agendamos las 4 horas o te muestro 8h / 12h / día hotelero?`;
  }

  // Planes / decoración / celebraciones
  if (
    text.includes('plan') ||
    text.includes('decoraci') ||
    text.includes('celebr') ||
    text.includes('cumpleaños') ||
    text.includes('aniversario') ||
    text.includes('sorpresa')
  ) {
    return 'Para planes y celebraciones preparamos el montaje con pétalos, globos románticos, velas, lencería especial y el ambiente listo para la sorpresa 💖🌹🎉.\n\nValores de decoración:\n• Suites Sencillas / Cabaña: **+$100.000**\n• VIP, Temáticas, Jacuzzi y Sauna: **+$120.000**\n\n¿Para qué ocasión lo armas y en qué tipo de suite? ✨';
  }

  // Reservar / cierre con formulario
  if (
    text.includes('reservar') ||
    text.includes('reserva') ||
    text.includes('separar') ||
    text.includes('formulario') ||
    text.includes('agendar')
  ) {
    return `¡Excelente elección! 🥂✨ Para dejar tu suite lista y asegurada, completa este rápido formulario (menos de 1 minuto) 👇\n\n🔗 ${FORM_URL}\n\nAllí pones tus datos y puedes abonar o aprovechar **25% OFF pagando el 100%** de tu reserva 🔥. ¡Te esperamos en Amarte Suite! 💖`;
  }

  // Métodos de pago
  if (
    text.includes('pago') ||
    text.includes('pagar') ||
    text.includes('banco') ||
    text.includes('nequi') ||
    text.includes('tarjeta') ||
    text.includes('wompi') ||
    text.includes('transfer') ||
    text.includes('datáfono') ||
    text.includes('datafono') ||
    text.includes('qr')
  ) {
    return 'Aceptamos efectivo en recepción, transferencias, código QR, datáfono y link seguro de Wompi 💳💵✨. Si ya elegiste suite o plan, te paso el formulario para cerrar en un minuto 👇\n\n🔗 ' + FORM_URL;
  }

  // Ubicación
  if (
    text.includes('ubicacion') ||
    text.includes('ubicación') ||
    text.includes('donde quedan') ||
    text.includes('dónde quedan') ||
    text.includes('direccion') ||
    text.includes('dirección') ||
    text.includes('mapa') ||
    text.includes('chapinero') ||
    text.includes('llegar')
  ) {
    return `Estamos en **Chapinero**, Calle 62 con Caracas 📍 **Calle 62 #14-19**, Bogotá. Zona fácil de llegar y discreta ✨.\n\nMapa: ${MAPS_URL}\n\n¿Quieres que te ayude a dejar la reserva lista? 🥂`;
  }

  // Lujo
  if (
    text.includes('lujo') ||
    text.includes('premium') ||
    text.includes('diamante') ||
    text.includes('gold') ||
    text.includes('zafiro') ||
    text.includes('rubí') ||
    text.includes('rubi')
  ) {
    return 'Para lujo total te recomiendo **Diamante** 💎, **Gold** 💛, **Rubí** ❤️ o **Zafiro** 💙: acabados premium y experiencia Wow ✨. ¿Quieres precios de 4h o te armo también con decoración (+$120.000)? 🔥';
  }

  // Temática
  if (
    text.includes('tematica') ||
    text.includes('temática') ||
    text.includes('arabe') ||
    text.includes('árabe') ||
    text.includes('gotica') ||
    text.includes('gótica') ||
    text.includes('queen')
  ) {
    return '¡Me encanta! 🔥 Nuestras temáticas: **Gótica** 🦇, **Árabe** 🕌 y **Queen** 😈. Ideales para una fantasía en pareja 💖. ¿Celebran algo especial o es escapada espontánea? ✨';
  }

  // Precios / valores (genérico)
  if (
    text.includes('precio') ||
    text.includes('costo') ||
    text.includes('cuánto') ||
    text.includes('cuanto') ||
    text.includes('valor') ||
    text.includes('tarifa')
  ) {
    return '¡Claro! 💖 Te oriento rapidito: si buscas **jacuzzi**, la estrella es la Promo **$150.000 / 4h** 🛁🔥. También hay sencillas desde packs de 4h y Deluxe/Temáticas con tarifas según día. ¿Jacuzzi, sencilla o temática? Así te doy el valor exacto ✨';
  }

  // Edad / políticas
  if (text.includes('edad') || text.includes('menor') || text.includes('18')) {
    return 'Importante: el ingreso es **solo 18+** 🔞✨. Las tarifas son para 2 personas; cada persona adicional suma **$60.000** 👥. ¿Te ayudo a elegir suite? 🥂';
  }

  // Abono / tolerancia
  if (text.includes('abono') || text.includes('adelanto') || text.includes('tolerancia') || text.includes('espera')) {
    return 'Pre-reserva **sin abono** solo en suites sencillas sin decoración ✨. Con decoración, planes o reserva garantizada el abono es obligatorio 💳. Sin abono hay tolerancia máxima de **30 minutos** sobre la hora confirmada ⏱️. ¿Quieres que te pase el formulario para asegurarla? 💖';
  }

  // Despedida / gracias sin reserva
  if (
    text.includes('gracias') ||
    text.includes('chao') ||
    text.includes('adiós') ||
    text.includes('adios') ||
    text.includes('hasta luego') ||
    text.includes('no gracias')
  ) {
    return '¡Muchas gracias a ti por escribirnos! 💖 Fue un gusto atenderte. Aquí en Amarte Suite siempre tendrás tu espacio listo para desconectarte. ¡Que tengas un excelente resto de día! ✨🥂';
  }

  // Default
  return '¡Con gusto! 💖✨ Cuéntame en una frase: ¿jacuzzi, suite temática/VIP o decoración sorpresa? Así te guío al pack ideal y al cierre rapidito 🛁🎉';
};
