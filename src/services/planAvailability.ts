import { supabase } from '../lib/supabaseClient';

export type SuiteChoiceAvailability = {
  /** La suite tiene control de cupo en la base. */
  checked: boolean;
  /** Hay cruce con otra reserva, incluida la hora de limpieza. */
  conflict: boolean;
};

/**
 * Cruce de la suite física elegida en un plan.
 * La función `suite_choice_has_conflict` vive en la migración y no está aplicada
 * todavía: si falta, devolvemos null y el formulario avisa sin bloquear.
 * No usa `suite_slot_has_conflict`: con el rol anon esa función no ve filas
 * (RLS) y diría que todo está libre.
 */
export async function fetchSuiteChoiceAvailability(input: {
  suite: string;
  date: string;
  time: string;
  pack: string;
}): Promise<SuiteChoiceAvailability | null> {
  const { data, error } = await supabase.rpc('suite_choice_has_conflict', {
    p_suite: input.suite,
    p_fecha: input.date,
    p_hora: input.time,
    p_pack: input.pack,
  });

  if (error || !data || typeof data !== 'object') return null;

  const row = data as { checked?: unknown; conflict?: unknown };
  if (typeof row.checked !== 'boolean' || typeof row.conflict !== 'boolean') return null;
  return { checked: row.checked, conflict: row.conflict };
}
