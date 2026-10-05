-- CLUB CONTROL MANAGER R1 — MASS ATTENDANCE PRECHECK
-- Read-only. Safe to run before installation.

DO $$
BEGIN
  IF to_regclass('public.mass_bookings') IS NULL THEN
    RAISE EXCEPTION 'R1_PRECHECK_MASS_BOOKINGS_MISSING';
  END IF;
  IF to_regclass('public.manager_accounts') IS NULL THEN
    RAISE EXCEPTION 'R1_PRECHECK_MANAGER_ACCOUNTS_MISSING';
  END IF;
  IF to_regprocedure('private.cc_manager_require_any_v1(text,text)') IS NULL THEN
    RAISE EXCEPTION 'R1_PRECHECK_MANAGER_PERMISSION_HELPER_MISSING';
  END IF;
  IF to_regprocedure('public.cc_mass_admin_attendance_v0550b42(text,text,text,text)') IS NULL THEN
    RAISE EXCEPTION 'R1_PRECHECK_CANONICAL_ATTENDANCE_WRITER_MISSING';
  END IF;
  IF to_regprocedure('public.cc_mass_no_show_sanction_eval_v0550b43b(text,text)') IS NULL THEN
    RAISE EXCEPTION 'R1_PRECHECK_CANONICAL_SANCTION_EVAL_MISSING';
  END IF;
END
$$;

SELECT
  true AS precheck_ok,
  (SELECT count(*) FROM public.mass_bookings) AS mass_bookings,
  (SELECT count(*) FROM public.mass_bookings WHERE attendance='MEGJELENT') AS attended,
  (SELECT count(*) FROM public.mass_bookings WHERE attendance='NEM JELENT MEG') AS no_show,
  (SELECT count(*) FROM public.mass_bookings WHERE coalesce(attendance,'') NOT IN ('','NINCS RÖGZÍTVE','MEGJELENT','NEM JELENT MEG')) AS unexpected_attendance_values;
