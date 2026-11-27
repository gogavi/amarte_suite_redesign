/**
 * Montos que acepta `enforce_reservation_web_price` cuando el fee de
 * decoración es 0 (suite sin decoración, o plan cuyo tipo empieza por "Plan "
 * después de la migración que no suma $120.000).
 *
 * Réplica de reservas.amartesuite.com (`gogavi/Microservicio-Reservas`):
 * - Pago total: 20 % de descuento. `precio` = `abono` = round(pack * 0.80).
 * - Abono 50 %: 10 % de descuento sobre el pack y se cobra la mitad.
 *   `precio` = round(pack * 0.90). `abono` = round(precio * 0.50).
 *   El fee de decoración de $120.000, cuando aplica, no se descuenta ni se parte;
 *   en planes ese fee queda en 0.
 * - WhatsApp: precio de catálogo y abono 0. El personal cobra el abono.
 */

export type PaymentMethod = 'wompi' | 'wompi_abono' | 'whatsapp';

export type TriggerPaymentFields = {
  formaPago: string;
  precio: string;
  abono: string;
};

export type StayQuote = {
  catalog: number;
  /** Lo que Wompi cobra en pago total (también es el `precio` guardado). */
  totalCharge: number;
  /** Total de la reserva con 10 % de descuento (`precio` del abono). */
  depositTotal: number;
  /** Lo que Wompi cobra ahora en el abono del 50 %. */
  depositCharge: number;
};

export function roundCop(value: number): number {
  return Math.round(value);
}

/** Misma aritmética que el trigger con `v_fee = 0`. */
export function quoteStay(catalogPrice: number): StayQuote {
  const catalog = roundCop(catalogPrice);
  const depositTotal = roundCop(catalog * 0.9);
  return {
    catalog,
    totalCharge: roundCop(catalog * 0.8),
    depositTotal,
    depositCharge: roundCop(depositTotal * 0.5),
  };
}

export function paymentFieldsForTrigger(
  method: PaymentMethod,
  catalogPrice: number,
): TriggerPaymentFields {
  const quote = quoteStay(catalogPrice);

  switch (method) {
    case 'whatsapp':
      return {
        formaPago: 'Sin pago / Continuar por WhatsApp',
        precio: String(quote.catalog),
        abono: '0',
      };
    case 'wompi':
      return {
        formaPago: 'Pago total',
        precio: String(quote.totalCharge),
        abono: String(quote.totalCharge),
      };
    case 'wompi_abono':
      return {
        formaPago: 'Abono 50%',
        precio: String(quote.depositTotal),
        abono: String(quote.depositCharge),
      };
    default: {
      const exhaustive: never = method;
      throw new Error(`Método de pago no soportado: ${exhaustive}`);
    }
  }
}

/** Pesos que debe firmar el checkout. El abono cobra `abono`, no `precio`. */
export function checkoutChargePesos(fields: TriggerPaymentFields): string {
  if (fields.formaPago === 'Abono 50%') return fields.abono;
  return fields.precio;
}
