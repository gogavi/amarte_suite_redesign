-- Reserva directa de planes de decoración.
-- NO APLICAR desde este PR. Dejar el archivo para revisión.
-- Idempotente: CREATE OR REPLACE y GRANT repetibles.
--
-- Qué cambia
-- 1. calculate_reservation_price no suma $120.000 si el room type empieza por "Plan ".
--    El precio del plan en room_rates ya incluye la decoración.
-- 2. enforce_reservation_web_price usa el mismo fee en 0 para esos tipos, así no
--    vuelve a sumar los $120.000 al armar pago total (80 %) y abono 50 % (90 % / 2).
--    También permite "Sin pago / Continuar por WhatsApp" + CON DECORACIÓN solo
--    cuando el tipo empieza por "Plan ". En una suite normal sigue prohibido.
-- 3. web_reservation_expected_charge replica la misma regla para el recibo.
-- 4. suite_choice_has_conflict devuelve {checked, conflict} de la suite física
--    (tipo = suite, o tipo Plan % con suite = la elegida). SECURITY DEFINER:
--    anon no tiene SELECT de reservations. No devuelve datos del huésped.
--
-- Orden de despliegue
-- 1. Aplicar ESTE SQL en el proyecto dftbelnombbtjryqphaa.
-- 2. Desplegar las Edge Functions create-wompi-payment, express-purchase-status
--    y wompi-webhook (el abono 50 % cobra la columna abono, no precio).
-- 3. Recién entonces desplegar el frontend.
--
-- Si el frontend sale antes: el cliente envía el precio del plan SIN los $120.000.
-- El trigger vigente espera ese precio MÁS $120.000 (diferencia 120000 > tolerancia
-- de 1000) y rechaza el INSERT con PRECIO_INVALIDO. No se cobra doble y no queda
-- fila. WhatsApp + CON DECORACIÓN también se rechaza hasta esta migración.
-- Kill switch sin tocar la base: VITE_PLAN_DIRECT_BOOKING=false vuelve el botón
-- "Reservar este plan" al chat de Martina.
--
-- El abono del 50 % de una suite SIN decoración ya lo acepta el trigger actual.
-- El checkout de ese abono no funciona hasta desplegar create-wompi-payment,
-- porque hoy esa función solo admite forma_pago = 'Pago total' y cobra precio.

CREATE OR REPLACE FUNCTION public.calculate_reservation_price(p_room_type_id uuid, p_fecha date, p_rate_type_id uuid, p_con_decoracion boolean, p_beneficio_ruleta text)
 RETURNS numeric
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_category_id uuid;
  v_base numeric;
  v_pct numeric;
  v_pack numeric;
  v_fee numeric;
  v_room_name text;
BEGIN
  IF p_room_type_id IS NULL OR p_fecha IS NULL OR p_rate_type_id IS NULL THEN
    RAISE EXCEPTION 'PRECIO_INVALIDO'
      USING ERRCODE = 'P0001',
            HINT = 'Faltan suite, fecha o pack para calcular el precio.';
  END IF;

  v_category_id := public.resolve_reservation_day_category_id(p_fecha);
  IF v_category_id IS NULL THEN
    RAISE EXCEPTION 'PRECIO_INVALIDO'
      USING ERRCODE = 'P0001',
            HINT = 'No se pudo determinar la categoría del día.';
  END IF;

  SELECT rr.price INTO v_base
  FROM public.room_rates rr
  WHERE rr.room_type_id = p_room_type_id
    AND rr.day_category_id = v_category_id
    AND rr.rate_type_id = p_rate_type_id
  LIMIT 1;

  IF v_base IS NULL THEN
    RAISE EXCEPTION 'PRECIO_INVALIDO'
      USING ERRCODE = 'P0001',
            HINT = 'No hay tarifa para esta combinación de suite, día y pack.';
  END IF;

  v_base := round(v_base);
  v_pct := public.roulette_discount_percent(p_beneficio_ruleta);
  v_pack := v_base - CASE WHEN v_pct > 0 THEN round(v_base * v_pct / 100) ELSE 0 END;
  v_fee := 0;
  IF coalesce(p_con_decoracion, false) THEN
    SELECT rt.name INTO v_room_name
    FROM public.room_types rt
    WHERE rt.id = p_room_type_id;
    -- El precio de un Plan ya incluye la decoración. No sumar $120.000 otra vez.
    IF v_room_name IS NULL OR left(v_room_name, 5) IS DISTINCT FROM 'Plan ' THEN
      v_fee := 120000;
    END IF;
  END IF;

  RETURN v_pack + v_fee;
END;
$function$


CREATE OR REPLACE FUNCTION public.enforce_reservation_web_price()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_room_type_id uuid;
  v_rate_type_id uuid;
  v_pack_norm text;
  v_con_decoracion boolean;
  v_plan_tipo boolean;
  v_forma text;
  v_is_sin_pago boolean;
  v_catalog numeric;
  v_fee numeric;
  v_pack numeric;
  v_pct numeric;
  v_expected_precio numeric;
  v_expected_abono numeric;
  v_dep_precio numeric;
  v_dep_abono numeric;
  v_full_precio numeric;
  v_full_abono numeric;
  v_diff_dep numeric;
  v_diff_full numeric;
  v_client_precio numeric;
  v_client_abono numeric;
  v_raw text;
  v_diff numeric;
  v_base numeric;
BEGIN
  IF auth.role() IS DISTINCT FROM 'anon' THEN
    RETURN NEW;
  END IF;

  v_forma := btrim(coalesce(NEW.forma_pago, ''));
  v_is_sin_pago := (v_forma = 'Sin pago / Continuar por WhatsApp');
  v_con_decoracion := (NEW.decoracion = 'CON DECORACIÓN');
  v_plan_tipo := left(btrim(coalesce(NEW.tipo, '')), 5) = 'Plan ';

  IF v_forma NOT IN (
    'Abono 50%',
    'Pago total',
    'PSE',
    'Sin pago / Continuar por WhatsApp'
  ) THEN
    RAISE EXCEPTION 'PRECIO_INVALIDO'
      USING ERRCODE = 'P0001',
            HINT = 'La forma de pago web no es válida.';
  END IF;

  IF v_is_sin_pago AND v_con_decoracion AND NOT v_plan_tipo THEN
    RAISE EXCEPTION 'PRECIO_INVALIDO'
      USING ERRCODE = 'P0001',
            HINT = 'La decoración no se puede reservar sin pago.';
  END IF;

  SELECT rt.id INTO v_room_type_id
  FROM public.room_types rt
  WHERE rt.name = NEW.tipo
  LIMIT 1;

  IF v_room_type_id IS NULL THEN
    RAISE EXCEPTION 'PRECIO_INVALIDO'
      USING ERRCODE = 'P0001',
            HINT = 'No se encontró la suite para calcular el precio.';
  END IF;

  v_pack_norm := public.normalize_es(NEW.pack_tiempo);

  SELECT rty.id INTO v_rate_type_id
  FROM public.rate_types rty
  WHERE public.normalize_es(rty.name) = v_pack_norm
  LIMIT 1;

  IF v_rate_type_id IS NULL THEN
    SELECT rty.id INTO v_rate_type_id
    FROM public.rate_types rty
    WHERE public.normalize_es(rty.name) LIKE '%' || v_pack_norm || '%'
       OR v_pack_norm LIKE '%' || public.normalize_es(rty.name) || '%'
    ORDER BY rty.order_index NULLS LAST, rty.name
    LIMIT 1;
  END IF;

  IF v_rate_type_id IS NULL THEN
    RAISE EXCEPTION 'PRECIO_INVALIDO'
      USING ERRCODE = 'P0001',
            HINT = 'No se encontró el pack para calcular el precio.';
  END IF;

  v_catalog := public.calculate_reservation_price(
    v_room_type_id,
    NEW.fecha_reserva,
    v_rate_type_id,
    v_con_decoracion,
    NEW.beneficio_ruleta
  );
  v_fee := CASE WHEN v_con_decoracion AND NOT v_plan_tipo THEN 120000 ELSE 0 END;
  v_pack := v_catalog - v_fee;

  IF v_pack <= 0 THEN
    RAISE EXCEPTION 'PRECIO_INVALIDO'
      USING ERRCODE = 'P0001',
            HINT = 'La tarifa calculada no es válida.';
  END IF;

  v_dep_precio := round(v_pack * 0.90) + v_fee;
  v_dep_abono := round(round(v_pack * 0.90) * 0.5) + v_fee;
  v_full_precio := round(v_pack * 0.80) + v_fee;
  v_full_abono := v_full_precio;

  IF v_forma = 'Abono 50%' THEN
    v_expected_precio := v_dep_precio;
    v_expected_abono := v_dep_abono;
  ELSIF v_forma = 'Pago total' THEN
    v_expected_precio := v_full_precio;
    v_expected_abono := v_full_abono;
  ELSIF v_is_sin_pago THEN
    v_expected_precio := v_pack;
    v_expected_abono := 0;
  END IF;

  v_raw := btrim(coalesce(NEW.precio, ''));
  IF v_raw = '' THEN
    RAISE EXCEPTION 'PRECIO_INVALIDO'
      USING ERRCODE = 'P0001',
            HINT = 'El precio enviado no es numérico.';
  END IF;
  BEGIN
    v_client_precio := replace(replace(v_raw, '$', ''), ',', '')::numeric;
  EXCEPTION WHEN invalid_text_representation THEN
    RAISE EXCEPTION 'PRECIO_INVALIDO'
      USING ERRCODE = 'P0001',
            HINT = 'El precio enviado no es numérico.';
  END;

  v_raw := btrim(coalesce(NEW.abono, ''));
  IF v_raw = '' THEN
    v_client_abono := NULL;
  ELSE
    BEGIN
      v_client_abono := replace(replace(v_raw, '$', ''), ',', '')::numeric;
    EXCEPTION WHEN invalid_text_representation THEN
      RAISE EXCEPTION 'PRECIO_INVALIDO'
        USING ERRCODE = 'P0001',
              HINT = 'El abono enviado no es numérico.';
    END;
  END IF;

  IF v_client_precio IS NULL OR v_client_precio <= 0 THEN
    RAISE EXCEPTION 'PRECIO_INVALIDO'
      USING ERRCODE = 'P0001',
            HINT = 'El precio enviado es inválido.';
  END IF;

  IF v_forma = 'PSE' THEN
    v_diff_dep := abs(v_client_precio - v_dep_precio);
    v_diff_full := abs(v_client_precio - v_full_precio);
    IF v_client_abono IS NOT NULL THEN
      v_diff_dep := greatest(v_diff_dep, abs(v_client_abono - v_dep_abono));
      v_diff_full := greatest(v_diff_full, abs(v_client_abono - v_full_abono));
    END IF;

    IF v_diff_dep <= 1000 AND (v_diff_full > 1000 OR v_diff_dep <= v_diff_full) THEN
      v_expected_precio := v_dep_precio;
      v_expected_abono := v_dep_abono;
    ELSIF v_diff_full <= 1000 THEN
      v_expected_precio := v_full_precio;
      v_expected_abono := v_full_abono;
    ELSE
      RAISE EXCEPTION 'PRECIO_INVALIDO'
        USING ERRCODE = 'P0001',
              HINT = 'El precio no coincide con Abono 50% ni con Pago total.';
    END IF;
  END IF;

  IF v_client_abono IS NULL THEN
    IF v_expected_abono = 0 THEN
      v_client_abono := 0;
    ELSE
      RAISE EXCEPTION 'PRECIO_INVALIDO'
        USING ERRCODE = 'P0001',
              HINT = 'Falta el abono de la pre-reserva.';
    END IF;
  END IF;

  IF v_client_abono < 0 OR (v_client_abono = 0 AND v_expected_abono > 0) THEN
    RAISE EXCEPTION 'PRECIO_INVALIDO'
      USING ERRCODE = 'P0001',
            HINT = 'El abono enviado es inválido.';
  END IF;

  v_diff := greatest(
    abs(v_client_precio - v_expected_precio),
    abs(v_client_abono - v_expected_abono)
  );

  IF v_diff > 1000 THEN
    RAISE EXCEPTION 'PRECIO_INVALIDO'
      USING ERRCODE = 'P0001',
            HINT = 'El precio o el abono difieren demasiado de la tarifa de catálogo.';
  END IF;

  NEW.precio := round(v_expected_precio)::bigint::text;
  NEW.abono := round(v_expected_abono)::bigint::text;
  NEW.precio_ajustado_por_trigger := (v_diff > 1);

  v_pct := public.roulette_discount_percent(NEW.beneficio_ruleta);
  IF v_pct > 0 THEN
    SELECT round(rr.price) INTO v_base
    FROM public.room_rates rr
    WHERE rr.room_type_id = v_room_type_id
      AND rr.day_category_id = public.resolve_reservation_day_category_id(NEW.fecha_reserva)
      AND rr.rate_type_id = v_rate_type_id
    LIMIT 1;
    NEW.descuento_ruleta_porcentaje := v_pct;
    NEW.descuento_ruleta_monto := round(coalesce(v_base, 0) * v_pct / 100);
    NEW.precio_sin_descuento := v_base;
  ELSE
    NEW.descuento_ruleta_porcentaje := NULL;
    NEW.descuento_ruleta_monto := NULL;
    NEW.precio_sin_descuento := NULL;
  END IF;

  RETURN NEW;
END;
$function$


CREATE OR REPLACE FUNCTION public.web_reservation_expected_charge(p_receipt_token uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  r public.reservations%ROWTYPE;
  v_room_type_id uuid;
  v_rate_type_id uuid;
  v_pack_norm text;
  v_con_decoracion boolean;
  v_plan_tipo boolean;
  v_forma text;
  v_is_sin_pago boolean;
  v_catalog numeric;
  v_fee numeric;
  v_pack numeric;
  v_expected_precio numeric;
  v_expected_abono numeric;
  v_dep_precio numeric;
  v_dep_abono numeric;
  v_full_precio numeric;
  v_full_abono numeric;
  v_diff_dep numeric;
  v_diff_full numeric;
  v_client_precio numeric;
  v_client_abono numeric;
  v_raw text;
BEGIN
  IF p_receipt_token IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT * INTO r
  FROM public.reservations
  WHERE receipt_token = p_receipt_token;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  v_forma := btrim(coalesce(r.forma_pago, ''));
  v_is_sin_pago := (v_forma = 'Sin pago / Continuar por WhatsApp');
  v_con_decoracion := (r.decoracion = 'CON DECORACIÓN');
  v_plan_tipo := left(btrim(coalesce(r.tipo, '')), 5) = 'Plan ';

  IF v_forma NOT IN (
    'Abono 50%',
    'Pago total',
    'PSE',
    'Sin pago / Continuar por WhatsApp'
  ) THEN
    RAISE EXCEPTION 'PRECIO_INVALIDO'
      USING ERRCODE = 'P0001',
            HINT = 'La forma de pago web no es válida.';
  END IF;

  IF v_is_sin_pago AND v_con_decoracion AND NOT v_plan_tipo THEN
    RAISE EXCEPTION 'PRECIO_INVALIDO'
      USING ERRCODE = 'P0001',
            HINT = 'La decoración no se puede reservar sin pago.';
  END IF;

  SELECT rt.id INTO v_room_type_id
  FROM public.room_types rt
  WHERE rt.name = r.tipo
  LIMIT 1;

  IF v_room_type_id IS NULL THEN
    RAISE EXCEPTION 'PRECIO_INVALIDO'
      USING ERRCODE = 'P0001',
            HINT = 'No se encontró la suite para calcular el precio.';
  END IF;

  v_pack_norm := public.normalize_es(r.pack_tiempo);

  SELECT rty.id INTO v_rate_type_id
  FROM public.rate_types rty
  WHERE public.normalize_es(rty.name) = v_pack_norm
  LIMIT 1;

  IF v_rate_type_id IS NULL THEN
    SELECT rty.id INTO v_rate_type_id
    FROM public.rate_types rty
    WHERE public.normalize_es(rty.name) LIKE '%' || v_pack_norm || '%'
       OR v_pack_norm LIKE '%' || public.normalize_es(rty.name) || '%'
    ORDER BY rty.order_index NULLS LAST, rty.name
    LIMIT 1;
  END IF;

  IF v_rate_type_id IS NULL THEN
    RAISE EXCEPTION 'PRECIO_INVALIDO'
      USING ERRCODE = 'P0001',
            HINT = 'No se encontró el pack para calcular el precio.';
  END IF;

  v_catalog := public.calculate_reservation_price(
    v_room_type_id,
    r.fecha_reserva,
    v_rate_type_id,
    v_con_decoracion,
    r.beneficio_ruleta
  );
  v_fee := CASE WHEN v_con_decoracion AND NOT v_plan_tipo THEN 120000 ELSE 0 END;
  v_pack := v_catalog - v_fee;

  IF v_pack <= 0 THEN
    RAISE EXCEPTION 'PRECIO_INVALIDO'
      USING ERRCODE = 'P0001',
            HINT = 'La tarifa calculada no es válida.';
  END IF;

  v_dep_precio := round(v_pack * 0.90) + v_fee;
  v_dep_abono := round(round(v_pack * 0.90) * 0.5) + v_fee;
  v_full_precio := round(v_pack * 0.80) + v_fee;
  v_full_abono := v_full_precio;

  IF v_forma = 'Abono 50%' THEN
    v_expected_precio := v_dep_precio;
    v_expected_abono := v_dep_abono;
  ELSIF v_forma = 'Pago total' THEN
    v_expected_precio := v_full_precio;
    v_expected_abono := v_full_abono;
  ELSIF v_is_sin_pago THEN
    v_expected_precio := v_pack;
    v_expected_abono := 0;
  ELSE
    v_raw := btrim(coalesce(r.precio, ''));
    v_client_precio := replace(replace(v_raw, '$', ''), ',', '')::numeric;
    v_raw := btrim(coalesce(r.abono, ''));
    IF v_raw = '' THEN
      v_client_abono := NULL;
    ELSE
      v_client_abono := replace(replace(v_raw, '$', ''), ',', '')::numeric;
    END IF;

    v_diff_dep := abs(v_client_precio - v_dep_precio);
    v_diff_full := abs(v_client_precio - v_full_precio);
    IF v_client_abono IS NOT NULL THEN
      v_diff_dep := greatest(v_diff_dep, abs(v_client_abono - v_dep_abono));
      v_diff_full := greatest(v_diff_full, abs(v_client_abono - v_full_abono));
    END IF;

    IF v_diff_dep <= 1000 AND (v_diff_full > 1000 OR v_diff_dep <= v_diff_full) THEN
      v_expected_precio := v_dep_precio;
      v_expected_abono := v_dep_abono;
    ELSIF v_diff_full <= 1000 THEN
      v_expected_precio := v_full_precio;
      v_expected_abono := v_full_abono;
    ELSE
      RAISE EXCEPTION 'PRECIO_INVALIDO'
        USING ERRCODE = 'P0001',
              HINT = 'El precio no coincide con Abono 50% ni con Pago total.';
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'id', r.id,
    'expected_abono', round(v_expected_abono),
    'expected_precio', round(v_expected_precio),
    'forma_pago', r.forma_pago,
    'estado_pago', r.estado_pago,
    'wompi_payment_link_id', r.wompi_payment_link_id,
    'wompi_transaction_id', r.wompi_transaction_id,
    'created_at', r.created_at
  );
END;
$function$


CREATE OR REPLACE FUNCTION public.suite_choice_has_conflict(
  p_suite text,
  p_fecha date,
  p_hora text,
  p_pack text,
  p_exclude_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_units text[];
  v_capacity integer;
  v_overlaps integer;
  v_start timestamptz;
  v_end timestamptz;
BEGIN
  IF p_suite IS NULL OR btrim(p_suite) = '' OR btrim(p_suite) = '—' THEN
    RETURN jsonb_build_object('checked', false, 'conflict', false);
  END IF;

  IF NOT public.is_capacity_checked_suite(p_suite) THEN
    RETURN jsonb_build_object('checked', false, 'conflict', false);
  END IF;

  v_units := public.suite_room_units(p_suite);
  IF v_units IS NOT NULL AND cardinality(v_units) > 0 THEN
    v_capacity := cardinality(v_units);
  ELSE
    v_capacity := 1;
  END IF;

  v_start := public.parse_reservation_check_in(p_fecha, p_hora);
  v_end := public.calculate_check_out(p_fecha, p_hora, p_pack);
  IF v_start IS NULL OR v_end IS NULL THEN
    RETURN jsonb_build_object('checked', true, 'conflict', false);
  END IF;

  SELECT COUNT(*)::integer
    INTO v_overlaps
  FROM public.reservations r
  WHERE (p_exclude_id IS NULL OR r.id <> p_exclude_id)
    AND r.fecha_reserva BETWEEN (p_fecha - 1) AND (p_fecha + 1)
    AND (
      r.tipo = p_suite
      OR (
        left(btrim(coalesce(r.tipo, '')), 5) = 'Plan '
        AND r.suite = p_suite
      )
    )
    AND public.parse_reservation_check_in(r.fecha_reserva, r.hora_reserva) IS NOT NULL
    AND COALESCE(
          r.check_out,
          public.calculate_check_out(r.fecha_reserva, r.hora_reserva, r.pack_tiempo)
        ) IS NOT NULL
    AND v_start < COALESCE(
          r.check_out,
          public.calculate_check_out(r.fecha_reserva, r.hora_reserva, r.pack_tiempo)
        ) + interval '1 hour'
    AND public.parse_reservation_check_in(r.fecha_reserva, r.hora_reserva)
          < v_end + interval '1 hour';

  RETURN jsonb_build_object(
    'checked', true,
    'conflict', COALESCE(v_overlaps, 0) >= v_capacity
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.suite_choice_has_conflict(text, date, text, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.suite_choice_has_conflict(text, date, text, text, uuid) TO anon, authenticated, service_role;


-- ---------------------------------------------------------------------------
-- ROLLBACK (no se ejecuta con este archivo). Pegar y correr a mano para volver
-- al fee de $120.000 en toda decoración y al rechazo de WhatsApp con decoración.
-- ---------------------------------------------------------------------------
-- DROP FUNCTION IF EXISTS public.suite_choice_has_conflict(text, date, text, text, uuid);
--
-- CREATE OR REPLACE FUNCTION public.calculate_reservation_price(p_room_type_id uuid, p_fecha date, p_rate_type_id uuid, p_con_decoracion boolean, p_beneficio_ruleta text)
--  RETURNS numeric
--  LANGUAGE plpgsql
--  STABLE SECURITY DEFINER
--  SET search_path TO 'public'
-- AS $function$
-- DECLARE
--   v_category_id uuid;
--   v_base numeric;
--   v_pct numeric;
--   v_pack numeric;
--   v_fee numeric;
-- BEGIN
--   IF p_room_type_id IS NULL OR p_fecha IS NULL OR p_rate_type_id IS NULL THEN
--     RAISE EXCEPTION 'PRECIO_INVALIDO'
--       USING ERRCODE = 'P0001',
--             HINT = 'Faltan suite, fecha o pack para calcular el precio.';
--   END IF;
--
--   v_category_id := public.resolve_reservation_day_category_id(p_fecha);
--   IF v_category_id IS NULL THEN
--     RAISE EXCEPTION 'PRECIO_INVALIDO'
--       USING ERRCODE = 'P0001',
--             HINT = 'No se pudo determinar la categoría del día.';
--   END IF;
--
--   SELECT rr.price INTO v_base
--   FROM public.room_rates rr
--   WHERE rr.room_type_id = p_room_type_id
--     AND rr.day_category_id = v_category_id
--     AND rr.rate_type_id = p_rate_type_id
--   LIMIT 1;
--
--   IF v_base IS NULL THEN
--     RAISE EXCEPTION 'PRECIO_INVALIDO'
--       USING ERRCODE = 'P0001',
--             HINT = 'No hay tarifa para esta combinación de suite, día y pack.';
--   END IF;
--
--   v_base := round(v_base);
--   v_pct := public.roulette_discount_percent(p_beneficio_ruleta);
--   v_pack := v_base - CASE WHEN v_pct > 0 THEN round(v_base * v_pct / 100) ELSE 0 END;
--   v_fee := CASE WHEN coalesce(p_con_decoracion, false) THEN 120000 ELSE 0 END;
--
--   RETURN v_pack + v_fee;
-- END;
-- $function$
--
-- CREATE OR REPLACE FUNCTION public.enforce_reservation_web_price()
--  RETURNS trigger
--  LANGUAGE plpgsql
--  SECURITY DEFINER
--  SET search_path TO 'public'
-- AS $function$
-- DECLARE
--   v_room_type_id uuid;
--   v_rate_type_id uuid;
--   v_pack_norm text;
--   v_con_decoracion boolean;
--   v_forma text;
--   v_is_sin_pago boolean;
--   v_catalog numeric;
--   v_fee numeric;
--   v_pack numeric;
--   v_pct numeric;
--   v_expected_precio numeric;
--   v_expected_abono numeric;
--   v_dep_precio numeric;
--   v_dep_abono numeric;
--   v_full_precio numeric;
--   v_full_abono numeric;
--   v_diff_dep numeric;
--   v_diff_full numeric;
--   v_client_precio numeric;
--   v_client_abono numeric;
--   v_raw text;
--   v_diff numeric;
--   v_base numeric;
-- BEGIN
--   IF auth.role() IS DISTINCT FROM 'anon' THEN
--     RETURN NEW;
--   END IF;
--
--   v_forma := btrim(coalesce(NEW.forma_pago, ''));
--   v_is_sin_pago := (v_forma = 'Sin pago / Continuar por WhatsApp');
--   v_con_decoracion := (NEW.decoracion = 'CON DECORACIÓN');
--
--   IF v_forma NOT IN (
--     'Abono 50%',
--     'Pago total',
--     'PSE',
--     'Sin pago / Continuar por WhatsApp'
--   ) THEN
--     RAISE EXCEPTION 'PRECIO_INVALIDO'
--       USING ERRCODE = 'P0001',
--             HINT = 'La forma de pago web no es válida.';
--   END IF;
--
--   IF v_is_sin_pago AND v_con_decoracion THEN
--     RAISE EXCEPTION 'PRECIO_INVALIDO'
--       USING ERRCODE = 'P0001',
--             HINT = 'La decoración no se puede reservar sin pago.';
--   END IF;
--
--   SELECT rt.id INTO v_room_type_id
--   FROM public.room_types rt
--   WHERE rt.name = NEW.tipo
--   LIMIT 1;
--
--   IF v_room_type_id IS NULL THEN
--     RAISE EXCEPTION 'PRECIO_INVALIDO'
--       USING ERRCODE = 'P0001',
--             HINT = 'No se encontró la suite para calcular el precio.';
--   END IF;
--
--   v_pack_norm := public.normalize_es(NEW.pack_tiempo);
--
--   SELECT rty.id INTO v_rate_type_id
--   FROM public.rate_types rty
--   WHERE public.normalize_es(rty.name) = v_pack_norm
--   LIMIT 1;
--
--   IF v_rate_type_id IS NULL THEN
--     SELECT rty.id INTO v_rate_type_id
--     FROM public.rate_types rty
--     WHERE public.normalize_es(rty.name) LIKE '%' || v_pack_norm || '%'
--        OR v_pack_norm LIKE '%' || public.normalize_es(rty.name) || '%'
--     ORDER BY rty.order_index NULLS LAST, rty.name
--     LIMIT 1;
--   END IF;
--
--   IF v_rate_type_id IS NULL THEN
--     RAISE EXCEPTION 'PRECIO_INVALIDO'
--       USING ERRCODE = 'P0001',
--             HINT = 'No se encontró el pack para calcular el precio.';
--   END IF;
--
--   v_catalog := public.calculate_reservation_price(
--     v_room_type_id,
--     NEW.fecha_reserva,
--     v_rate_type_id,
--     v_con_decoracion,
--     NEW.beneficio_ruleta
--   );
--   v_fee := CASE WHEN v_con_decoracion THEN 120000 ELSE 0 END;
--   v_pack := v_catalog - v_fee;
--
--   IF v_pack <= 0 THEN
--     RAISE EXCEPTION 'PRECIO_INVALIDO'
--       USING ERRCODE = 'P0001',
--             HINT = 'La tarifa calculada no es válida.';
--   END IF;
--
--   v_dep_precio := round(v_pack * 0.90) + v_fee;
--   v_dep_abono := round(round(v_pack * 0.90) * 0.5) + v_fee;
--   v_full_precio := round(v_pack * 0.80) + v_fee;
--   v_full_abono := v_full_precio;
--
--   IF v_forma = 'Abono 50%' THEN
--     v_expected_precio := v_dep_precio;
--     v_expected_abono := v_dep_abono;
--   ELSIF v_forma = 'Pago total' THEN
--     v_expected_precio := v_full_precio;
--     v_expected_abono := v_full_abono;
--   ELSIF v_is_sin_pago THEN
--     v_expected_precio := v_pack;
--     v_expected_abono := 0;
--   END IF;
--
--   v_raw := btrim(coalesce(NEW.precio, ''));
--   IF v_raw = '' THEN
--     RAISE EXCEPTION 'PRECIO_INVALIDO'
--       USING ERRCODE = 'P0001',
--             HINT = 'El precio enviado no es numérico.';
--   END IF;
--   BEGIN
--     v_client_precio := replace(replace(v_raw, '$', ''), ',', '')::numeric;
--   EXCEPTION WHEN invalid_text_representation THEN
--     RAISE EXCEPTION 'PRECIO_INVALIDO'
--       USING ERRCODE = 'P0001',
--             HINT = 'El precio enviado no es numérico.';
--   END;
--
--   v_raw := btrim(coalesce(NEW.abono, ''));
--   IF v_raw = '' THEN
--     v_client_abono := NULL;
--   ELSE
--     BEGIN
--       v_client_abono := replace(replace(v_raw, '$', ''), ',', '')::numeric;
--     EXCEPTION WHEN invalid_text_representation THEN
--       RAISE EXCEPTION 'PRECIO_INVALIDO'
--         USING ERRCODE = 'P0001',
--               HINT = 'El abono enviado no es numérico.';
--     END;
--   END IF;
--
--   IF v_client_precio IS NULL OR v_client_precio <= 0 THEN
--     RAISE EXCEPTION 'PRECIO_INVALIDO'
--       USING ERRCODE = 'P0001',
--             HINT = 'El precio enviado es inválido.';
--   END IF;
--
--   IF v_forma = 'PSE' THEN
--     v_diff_dep := abs(v_client_precio - v_dep_precio);
--     v_diff_full := abs(v_client_precio - v_full_precio);
--     IF v_client_abono IS NOT NULL THEN
--       v_diff_dep := greatest(v_diff_dep, abs(v_client_abono - v_dep_abono));
--       v_diff_full := greatest(v_diff_full, abs(v_client_abono - v_full_abono));
--     END IF;
--
--     IF v_diff_dep <= 1000 AND (v_diff_full > 1000 OR v_diff_dep <= v_diff_full) THEN
--       v_expected_precio := v_dep_precio;
--       v_expected_abono := v_dep_abono;
--     ELSIF v_diff_full <= 1000 THEN
--       v_expected_precio := v_full_precio;
--       v_expected_abono := v_full_abono;
--     ELSE
--       RAISE EXCEPTION 'PRECIO_INVALIDO'
--         USING ERRCODE = 'P0001',
--               HINT = 'El precio no coincide con Abono 50% ni con Pago total.';
--     END IF;
--   END IF;
--
--   IF v_client_abono IS NULL THEN
--     IF v_expected_abono = 0 THEN
--       v_client_abono := 0;
--     ELSE
--       RAISE EXCEPTION 'PRECIO_INVALIDO'
--         USING ERRCODE = 'P0001',
--               HINT = 'Falta el abono de la pre-reserva.';
--     END IF;
--   END IF;
--
--   IF v_client_abono < 0 OR (v_client_abono = 0 AND v_expected_abono > 0) THEN
--     RAISE EXCEPTION 'PRECIO_INVALIDO'
--       USING ERRCODE = 'P0001',
--             HINT = 'El abono enviado es inválido.';
--   END IF;
--
--   v_diff := greatest(
--     abs(v_client_precio - v_expected_precio),
--     abs(v_client_abono - v_expected_abono)
--   );
--
--   IF v_diff > 1000 THEN
--     RAISE EXCEPTION 'PRECIO_INVALIDO'
--       USING ERRCODE = 'P0001',
--             HINT = 'El precio o el abono difieren demasiado de la tarifa de catálogo.';
--   END IF;
--
--   NEW.precio := round(v_expected_precio)::bigint::text;
--   NEW.abono := round(v_expected_abono)::bigint::text;
--   NEW.precio_ajustado_por_trigger := (v_diff > 1);
--
--   v_pct := public.roulette_discount_percent(NEW.beneficio_ruleta);
--   IF v_pct > 0 THEN
--     SELECT round(rr.price) INTO v_base
--     FROM public.room_rates rr
--     WHERE rr.room_type_id = v_room_type_id
--       AND rr.day_category_id = public.resolve_reservation_day_category_id(NEW.fecha_reserva)
--       AND rr.rate_type_id = v_rate_type_id
--     LIMIT 1;
--     NEW.descuento_ruleta_porcentaje := v_pct;
--     NEW.descuento_ruleta_monto := round(coalesce(v_base, 0) * v_pct / 100);
--     NEW.precio_sin_descuento := v_base;
--   ELSE
--     NEW.descuento_ruleta_porcentaje := NULL;
--     NEW.descuento_ruleta_monto := NULL;
--     NEW.precio_sin_descuento := NULL;
--   END IF;
--
--   RETURN NEW;
-- END;
-- $function$
--
-- CREATE OR REPLACE FUNCTION public.web_reservation_expected_charge(p_receipt_token uuid)
--  RETURNS jsonb
--  LANGUAGE plpgsql
--  STABLE SECURITY DEFINER
--  SET search_path TO 'public'
-- AS $function$
-- DECLARE
--   r public.reservations%ROWTYPE;
--   v_room_type_id uuid;
--   v_rate_type_id uuid;
--   v_pack_norm text;
--   v_con_decoracion boolean;
--   v_forma text;
--   v_is_sin_pago boolean;
--   v_catalog numeric;
--   v_fee numeric;
--   v_pack numeric;
--   v_expected_precio numeric;
--   v_expected_abono numeric;
--   v_dep_precio numeric;
--   v_dep_abono numeric;
--   v_full_precio numeric;
--   v_full_abono numeric;
--   v_diff_dep numeric;
--   v_diff_full numeric;
--   v_client_precio numeric;
--   v_client_abono numeric;
--   v_raw text;
-- BEGIN
--   IF p_receipt_token IS NULL THEN
--     RETURN NULL;
--   END IF;
--
--   SELECT * INTO r
--   FROM public.reservations
--   WHERE receipt_token = p_receipt_token;
--
--   IF NOT FOUND THEN
--     RETURN NULL;
--   END IF;
--
--   v_forma := btrim(coalesce(r.forma_pago, ''));
--   v_is_sin_pago := (v_forma = 'Sin pago / Continuar por WhatsApp');
--   v_con_decoracion := (r.decoracion = 'CON DECORACIÓN');
--
--   IF v_forma NOT IN (
--     'Abono 50%',
--     'Pago total',
--     'PSE',
--     'Sin pago / Continuar por WhatsApp'
--   ) THEN
--     RAISE EXCEPTION 'PRECIO_INVALIDO'
--       USING ERRCODE = 'P0001',
--             HINT = 'La forma de pago web no es válida.';
--   END IF;
--
--   IF v_is_sin_pago AND v_con_decoracion THEN
--     RAISE EXCEPTION 'PRECIO_INVALIDO'
--       USING ERRCODE = 'P0001',
--             HINT = 'La decoración no se puede reservar sin pago.';
--   END IF;
--
--   SELECT rt.id INTO v_room_type_id
--   FROM public.room_types rt
--   WHERE rt.name = r.tipo
--   LIMIT 1;
--
--   IF v_room_type_id IS NULL THEN
--     RAISE EXCEPTION 'PRECIO_INVALIDO'
--       USING ERRCODE = 'P0001',
--             HINT = 'No se encontró la suite para calcular el precio.';
--   END IF;
--
--   v_pack_norm := public.normalize_es(r.pack_tiempo);
--
--   SELECT rty.id INTO v_rate_type_id
--   FROM public.rate_types rty
--   WHERE public.normalize_es(rty.name) = v_pack_norm
--   LIMIT 1;
--
--   IF v_rate_type_id IS NULL THEN
--     SELECT rty.id INTO v_rate_type_id
--     FROM public.rate_types rty
--     WHERE public.normalize_es(rty.name) LIKE '%' || v_pack_norm || '%'
--        OR v_pack_norm LIKE '%' || public.normalize_es(rty.name) || '%'
--     ORDER BY rty.order_index NULLS LAST, rty.name
--     LIMIT 1;
--   END IF;
--
--   IF v_rate_type_id IS NULL THEN
--     RAISE EXCEPTION 'PRECIO_INVALIDO'
--       USING ERRCODE = 'P0001',
--             HINT = 'No se encontró el pack para calcular el precio.';
--   END IF;
--
--   v_catalog := public.calculate_reservation_price(
--     v_room_type_id,
--     r.fecha_reserva,
--     v_rate_type_id,
--     v_con_decoracion,
--     r.beneficio_ruleta
--   );
--   v_fee := CASE WHEN v_con_decoracion THEN 120000 ELSE 0 END;
--   v_pack := v_catalog - v_fee;
--
--   IF v_pack <= 0 THEN
--     RAISE EXCEPTION 'PRECIO_INVALIDO'
--       USING ERRCODE = 'P0001',
--             HINT = 'La tarifa calculada no es válida.';
--   END IF;
--
--   v_dep_precio := round(v_pack * 0.90) + v_fee;
--   v_dep_abono := round(round(v_pack * 0.90) * 0.5) + v_fee;
--   v_full_precio := round(v_pack * 0.80) + v_fee;
--   v_full_abono := v_full_precio;
--
--   IF v_forma = 'Abono 50%' THEN
--     v_expected_precio := v_dep_precio;
--     v_expected_abono := v_dep_abono;
--   ELSIF v_forma = 'Pago total' THEN
--     v_expected_precio := v_full_precio;
--     v_expected_abono := v_full_abono;
--   ELSIF v_is_sin_pago THEN
--     v_expected_precio := v_pack;
--     v_expected_abono := 0;
--   ELSE
--     v_raw := btrim(coalesce(r.precio, ''));
--     v_client_precio := replace(replace(v_raw, '$', ''), ',', '')::numeric;
--     v_raw := btrim(coalesce(r.abono, ''));
--     IF v_raw = '' THEN
--       v_client_abono := NULL;
--     ELSE
--       v_client_abono := replace(replace(v_raw, '$', ''), ',', '')::numeric;
--     END IF;
--
--     v_diff_dep := abs(v_client_precio - v_dep_precio);
--     v_diff_full := abs(v_client_precio - v_full_precio);
--     IF v_client_abono IS NOT NULL THEN
--       v_diff_dep := greatest(v_diff_dep, abs(v_client_abono - v_dep_abono));
--       v_diff_full := greatest(v_diff_full, abs(v_client_abono - v_full_abono));
--     END IF;
--
--     IF v_diff_dep <= 1000 AND (v_diff_full > 1000 OR v_diff_dep <= v_diff_full) THEN
--       v_expected_precio := v_dep_precio;
--       v_expected_abono := v_dep_abono;
--     ELSIF v_diff_full <= 1000 THEN
--       v_expected_precio := v_full_precio;
--       v_expected_abono := v_full_abono;
--     ELSE
--       RAISE EXCEPTION 'PRECIO_INVALIDO'
--         USING ERRCODE = 'P0001',
--               HINT = 'El precio no coincide con Abono 50% ni con Pago total.';
--     END IF;
--   END IF;
--
--   RETURN jsonb_build_object(
--     'id', r.id,
--     'expected_abono', round(v_expected_abono),
--     'expected_precio', round(v_expected_precio),
--     'forma_pago', r.forma_pago,
--     'estado_pago', r.estado_pago,
--     'wompi_payment_link_id', r.wompi_payment_link_id,
--     'wompi_transaction_id', r.wompi_transaction_id,
--     'created_at', r.created_at
--   );
-- END;
-- $function$
