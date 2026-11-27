export const PLAN_STAY_HOURS = [6, 12, 24] as const;

/** Subconjunto de `CatalogSuite` que decide el nivel de precio. Sin cliente de datos. */
export type PricedSuite = {
  name: string;
  packs: ReadonlyArray<{
    hours: number;
    order: number;
    weekdayPrice: number;
    weekendPrice: number;
  }>;
};

export type PlanSuitePolicy =
  | { mode: 'same-price'; recommendedSuites: readonly string[] }
  | { mode: 'locked'; suite: string };

export type EligiblePlanSuite<T extends PricedSuite = PricedSuite> = {
  suite: T;
  recommended: boolean;
};

export function isPlanRoomType(name: string): boolean {
  return name.startsWith('Plan ');
}

/** Precio de referencia del mismo nivel: pack 4 h entre semana, o el pack más corto. */
export function referenceWeekdayPrice(suite: PricedSuite): number | null {
  const fourHours = suite.packs.find((pack) => pack.hours === 4 && pack.weekdayPrice > 0);
  if (fourHours) return fourHours.weekdayPrice;

  const fallback = [...suite.packs]
    .filter((pack) => pack.weekdayPrice > 0)
    .sort((left, right) => left.hours - right.hours || left.order - right.order);
  return fallback[0]?.weekdayPrice ?? null;
}

export function isPlanStayPack(pack: {
  hours: number;
  weekdayPrice: number;
  weekendPrice: number;
}): boolean {
  return (PLAN_STAY_HOURS as readonly number[]).includes(pack.hours)
    && (pack.weekdayPrice > 0 || pack.weekendPrice > 0);
}

/**
 * Romántico, Cumpleaños y Erótico: todas las suites del precio de las nombradas.
 * Un plan que nombra una sola suite queda fijo en esa suite.
 */
export function eligiblePlanSuites<T extends PricedSuite>(
  catalog: readonly T[],
  policy: PlanSuitePolicy,
): EligiblePlanSuite<T>[] {
  if (policy.mode === 'locked') {
    return catalog
      .filter((suite) => suite.name === policy.suite)
      .map((suite) => ({ suite, recommended: true }));
  }

  const recommended = new Set(policy.recommendedSuites);
  const tierPrices = new Set(
    catalog
      .filter((suite) => recommended.has(suite.name))
      .map((suite) => referenceWeekdayPrice(suite))
      .filter((price): price is number => price !== null && price > 0),
  );

  return catalog
    .filter((suite) => {
      const price = referenceWeekdayPrice(suite);
      return price !== null && tierPrices.has(price);
    })
    .map((suite) => ({ suite, recommended: recommended.has(suite.name) }))
    .sort((left, right) => {
      if (left.recommended !== right.recommended) return left.recommended ? -1 : 1;
      return left.suite.name.localeCompare(right.suite.name, 'es');
    });
}

/** `false` solo con el kill switch explícito. Si falta, la reserva directa queda activa. */
export function planDirectBookingFromFlag(raw: string | undefined | null): boolean {
  const value = String(raw ?? '').trim().toLowerCase();
  if (value === 'false' || value === '0' || value === 'off') return false;
  return true;
}

export function isPlanDirectBookingEnabled(): boolean {
  return planDirectBookingFromFlag(import.meta.env.VITE_PLAN_DIRECT_BOOKING);
}
