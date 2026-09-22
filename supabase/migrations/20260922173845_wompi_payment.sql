-- Pago Wompi: columnas de estado, auditoría de webhooks y rate limit de checkout.
-- anon no obtiene SELECT/UPDATE; el webhook y create-wompi-payment usan service_role.

ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS payment_status text,
  ADD COLUMN IF NOT EXISTS payment_reference text,
  ADD COLUMN IF NOT EXISTS paid_amount numeric,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz;

ALTER TABLE public.reservations
  DROP CONSTRAINT IF EXISTS reservations_payment_status_check;

ALTER TABLE public.reservations
  ADD CONSTRAINT reservations_payment_status_check
  CHECK (
    payment_status IS NULL
    OR payment_status IN ('pending', 'approved', 'declined', 'voided', 'error', 'amount_mismatch')
  );

COMMENT ON COLUMN public.reservations.payment_status IS 'Estado de pago Wompi. NULL = aún no notificado.';
COMMENT ON COLUMN public.reservations.payment_reference IS 'Id de transacción Wompi.';
COMMENT ON COLUMN public.reservations.paid_amount IS 'Monto pagado en pesos COP (misma unidad que precio).';
COMMENT ON COLUMN public.reservations.paid_at IS 'Primera confirmación APPROVED vía webhook.';

CREATE OR REPLACE FUNCTION public.strip_anon_reservation_payment()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.role() IS DISTINCT FROM 'anon' THEN
    RETURN NEW;
  END IF;

  NEW.payment_status := NULL;
  NEW.payment_reference := NULL;
  NEW.paid_amount := NULL;
  NEW.paid_at := NULL;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS reservations_strip_anon_payment ON public.reservations;

CREATE TRIGGER reservations_strip_anon_payment
BEFORE INSERT OR UPDATE ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.strip_anon_reservation_payment();

CREATE TABLE IF NOT EXISTS public.wompi_webhook_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  checksum text NOT NULL UNIQUE,
  event_name text,
  environment text,
  transaction_id text,
  transaction_status text,
  reference text,
  amount_in_cents bigint,
  payload jsonb NOT NULL,
  processing_note text,
  received_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wompi_checkout_attempts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  reservation_id uuid NOT NULL,
  ip_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS wompi_checkout_attempts_reservation_created_idx
  ON public.wompi_checkout_attempts (reservation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS wompi_checkout_attempts_ip_created_idx
  ON public.wompi_checkout_attempts (ip_hash, created_at DESC);

CREATE INDEX IF NOT EXISTS reservations_payment_reference_idx
  ON public.reservations (payment_reference);

ALTER TABLE public.wompi_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wompi_checkout_attempts ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.wompi_webhook_events FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.wompi_checkout_attempts FROM PUBLIC, anon, authenticated;

GRANT ALL ON TABLE public.wompi_webhook_events TO service_role;
GRANT ALL ON TABLE public.wompi_checkout_attempts TO service_role;
