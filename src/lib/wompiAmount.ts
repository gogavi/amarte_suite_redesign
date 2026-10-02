const WOMPI_CHECKOUT_ORIGIN = 'https://checkout.wompi.co';

/** Pesos COP firmados en la URL de Web Checkout. No usa el precio del formulario. */
export function copFromWompiCheckoutUrl(url: string): number | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (parsed.origin !== WOMPI_CHECKOUT_ORIGIN) return null;

  const cents = Number(parsed.searchParams.get('amount-in-cents'));
  if (!Number.isInteger(cents) || cents <= 0 || cents % 100 !== 0) return null;
  return cents / 100;
}
