-- CLUB CONTROL MANAGER R1 — MASS ATTENDANCE POSTCHECK
-- Read-only verification after 01_INSTALL.sql.

SELECT
  to_regprocedure('public.cc_manager_mass_attendance_r1_v1(text,text)') IS NOT NULL AS writer_exists,
  to_regprocedure('public.cc_manager_mass_attendance_snapshot_r1_v1(text)') IS NOT NULL AS snapshot_exists,
  has_function_privilege('authenticated','public.cc_manager_mass_attendance_r1_v1(text,text)','EXECUTE') AS writer_authenticated,
  has_function_privilege('authenticated','public.cc_manager_mass_attendance_snapshot_r1_v1(text)','EXECUTE') AS snapshot_authenticated,
  NOT has_function_privilege('anon','public.cc_manager_mass_attendance_r1_v1(text,text)','EXECUTE') AS writer_denies_anon,
  NOT has_function_privilege('anon','public.cc_manager_mass_attendance_snapshot_r1_v1(text)','EXECUTE') AS snapshot_denies_anon;

SELECT
  count(*) AS mass_bookings,
  count(*) FILTER (WHERE attendance='MEGJELENT') AS attended,
  count(*) FILTER (WHERE attendance='NEM JELENT MEG') AS no_show,
  count(*) FILTER (WHERE coalesce(attendance,'') NOT IN ('','NINCS RÖGZÍTVE','MEGJELENT','NEM JELENT MEG')) AS unexpected_attendance_values
FROM public.mass_bookings;
