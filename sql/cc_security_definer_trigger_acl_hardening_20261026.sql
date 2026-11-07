-- DRAFT ONLY. DO NOT RUN AGAINST LIVE WITHOUT A SEPARATE RELEASE DECISION.
-- Narrow privilege hardening: two PostgreSQL trigger functions, NOT generic RPCs.
-- Does not change function bodies, owners, tables, data, API grants, or auth gates.
-- Safe to rerun after approval; guard aborts if function shape/dependency drifts.
BEGIN;
SET LOCAL lock_timeout = '3s';

DO $guard$
DECLARE
  trigger_oid oid := to_regprocedure('public.cc_capture_competition_standings_history_v1()');
  event_oid oid := to_regprocedure('public.rls_auto_enable()');
  catalog_oid oid := to_regprocedure('public.cc_mass_public_catalog_v1(text)');
BEGIN
  IF trigger_oid IS NULL OR
     (SELECT p.prorettype::regtype::text <> 'trigger' OR NOT p.prosecdef
        FROM pg_proc p WHERE p.oid=trigger_oid) OR
     (SELECT count(*) FROM pg_trigger
        WHERE tgfoid=trigger_oid AND NOT tgisinternal) <> 1
  THEN
    RAISE EXCEPTION 'CC_TRIGGER_SECURITY_PRECHECK: table trigger shape/dependency drift';
  END IF;

  IF event_oid IS NULL OR
     (SELECT p.prorettype::regtype::text <> 'event_trigger' OR NOT p.prosecdef
        FROM pg_proc p WHERE p.oid=event_oid) OR
     (SELECT count(*) FROM pg_event_trigger
        WHERE evtfoid=event_oid AND evtname='ensure_rls') <> 1
  THEN
    RAISE EXCEPTION 'CC_TRIGGER_SECURITY_PRECHECK: RLS event trigger shape/dependency drift';
  END IF;

  -- Preserve the deliberately public, curated mass training catalog.
  -- We do NOT revoke this function's anon access here.
  IF catalog_oid IS NULL OR NOT has_function_privilege('anon',catalog_oid,'EXECUTE') THEN
    RAISE EXCEPTION 'CC_TRIGGER_SECURITY_PRECHECK: public mass catalog permission drift';
  END IF;
END
$guard$;

-- REVOKE on trigger functions does NOT remove, disable or redefine attached triggers.
-- Explicitly revoke PUBLIC to avoid inherited default PostgreSQL function EXECUTE.
REVOKE EXECUTE ON FUNCTION public.cc_capture_competition_standings_history_v1()
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable()
  FROM PUBLIC, anon, authenticated;

DO $verify$
BEGIN
  IF has_function_privilege('anon',
      'public.cc_capture_competition_standings_history_v1()','EXECUTE')
    OR has_function_privilege('authenticated',
      'public.cc_capture_competition_standings_history_v1()','EXECUTE')
    OR has_function_privilege('anon','public.rls_auto_enable()','EXECUTE')
    OR has_function_privilege('authenticated','public.rls_auto_enable()','EXECUTE')
  THEN
    RAISE EXCEPTION 'CC_TRIGGER_SECURITY_POSTCHECK: trigger execute still public';
  END IF;
  IF NOT has_function_privilege('anon',
      'public.cc_mass_public_catalog_v1(text)','EXECUTE')
  THEN
    RAISE EXCEPTION 'CC_TRIGGER_SECURITY_POSTCHECK: public catalog access lost';
  END IF;
END
$verify$;
COMMIT;
