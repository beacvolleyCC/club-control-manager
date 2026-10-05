-- CLUB CONTROL MANAGER R1 — CANONICAL MASS ATTENDANCE BRIDGE
-- Adds new R1 RPCs only. Does not replace/drop existing v1 RPCs.
-- Attendance write path:
-- authenticated Manager -> permission check -> B4.2 canonical writer
-- -> B4.3B no-show/revoke evaluation -> DB readback.

BEGIN;

DO $$
BEGIN
  IF to_regclass('public.mass_bookings') IS NULL THEN
    RAISE EXCEPTION 'R1_INSTALL_MASS_BOOKINGS_MISSING';
  END IF;
  IF to_regclass('public.manager_accounts') IS NULL THEN
    RAISE EXCEPTION 'R1_INSTALL_MANAGER_ACCOUNTS_MISSING';
  END IF;
  IF to_regprocedure('private.cc_manager_require_any_v1(text,text)') IS NULL THEN
    RAISE EXCEPTION 'R1_INSTALL_MANAGER_PERMISSION_HELPER_MISSING';
  END IF;
  IF to_regprocedure('public.cc_mass_admin_attendance_v0550b42(text,text,text,text)') IS NULL THEN
    RAISE EXCEPTION 'R1_INSTALL_CANONICAL_ATTENDANCE_WRITER_MISSING';
  END IF;
  IF to_regprocedure('public.cc_mass_no_show_sanction_eval_v0550b43b(text,text)') IS NULL THEN
    RAISE EXCEPTION 'R1_INSTALL_CANONICAL_SANCTION_EVAL_MISSING';
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.cc_manager_mass_attendance_snapshot_r1_v1(
  p_event_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
DECLARE
  v_manager_id uuid;
  v_event_id text := trim(coalesce(p_event_id,''));
BEGIN
  v_manager_id := private.cc_manager_require_any_v1('mass.trainings','view');

  IF v_event_id='' THEN
    RAISE EXCEPTION 'EVENT_ID_REQUIRED';
  END IF;

  RETURN (
    SELECT coalesce(
      jsonb_agg(
        jsonb_build_object(
          'bookingId',b.id,
          'eventId',b.event_id,
          'attendance',coalesce(nullif(trim(b.attendance),''),'NINCS RÖGZÍTVE'),
          'bookingStatus',coalesce(b.booking_status,''),
          'updatedAt',b.updated_at
        )
        ORDER BY lower(coalesce(b.name,'')),b.id
      ),
      '[]'::jsonb
    )
    FROM public.mass_bookings b
    WHERE b.event_id=v_event_id
      AND b.booking_status IN ('AKTÍV','NEM JELENT MEG')
  );
END
$$;

REVOKE ALL ON FUNCTION public.cc_manager_mass_attendance_snapshot_r1_v1(text)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cc_manager_mass_attendance_snapshot_r1_v1(text)
TO authenticated;

CREATE OR REPLACE FUNCTION public.cc_manager_mass_attendance_r1_v1(
  p_booking_id text,
  p_attendance text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
DECLARE
  v_manager_id uuid;
  v_actor text := '';
  v_booking_id text := trim(coalesce(p_booking_id,''));
  v_attendance text := trim(coalesce(p_attendance,''));
  v_before public.mass_bookings%rowtype;
  v_after public.mass_bookings%rowtype;
  v_write jsonb := '{}'::jsonb;
  v_sanction jsonb := '{}'::jsonb;
  v_action text := 'NONE';
BEGIN
  v_manager_id := private.cc_manager_require_any_v1('mass.trainings','edit');

  SELECT lower(coalesce(a.email,''))
    INTO v_actor
  FROM public.manager_accounts a
  WHERE a.id=v_manager_id
  LIMIT 1;

  IF v_booking_id='' THEN
    RAISE EXCEPTION 'BOOKING_ID_REQUIRED';
  END IF;

  IF v_attendance NOT IN ('NINCS RÖGZÍTVE','MEGJELENT','NEM JELENT MEG') THEN
    RAISE EXCEPTION 'ATTENDANCE_INVALID';
  END IF;

  SELECT *
    INTO v_before
  FROM public.mass_bookings b
  WHERE b.id=v_booking_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'BOOKING_NOT_FOUND';
  END IF;

  v_write := public.cc_mass_admin_attendance_v0550b42(
    v_before.source_workbook_id,
    v_before.id,
    v_attendance,
    v_actor
  );

  v_sanction := public.cc_mass_no_show_sanction_eval_v0550b43b(
    v_before.source_workbook_id,
    v_before.id
  );

  SELECT *
    INTO v_after
  FROM public.mass_bookings b
  WHERE b.id=v_before.id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ATTENDANCE_READBACK_FAILED';
  END IF;

  IF coalesce(v_after.attendance,'') IS DISTINCT FROM v_attendance THEN
    RAISE EXCEPTION 'ATTENDANCE_READBACK_MISMATCH';
  END IF;

  v_action := upper(coalesce(v_sanction->>'action','NONE'));

  RETURN coalesce(v_write,'{}'::jsonb) || jsonb_build_object(
    'ok',true,
    'success',true,
    'persisted',true,
    'bookingId',v_after.id,
    'eventId',v_after.event_id,
    'attendance',v_after.attendance,
    'bookingStatus',v_after.booking_status,
    'updatedAt',v_after.updated_at,
    'sanctionResult',coalesce(v_sanction,'{}'::jsonb),
    'sanctionNotificationPending',v_action IN ('WARNING','BAN'),
    'bridge','MANAGER_R1_CANONICAL_ATTENDANCE'
  );
END
$$;

REVOKE ALL ON FUNCTION public.cc_manager_mass_attendance_r1_v1(text,text)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cc_manager_mass_attendance_r1_v1(text,text)
TO authenticated;

COMMIT;
