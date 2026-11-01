-- Club Control TEST ONLY. Read-only catalog/API contract preflight; no data writes.
-- Run in TEST SQL Editor; never point this at LIVE.
BEGIN READ ONLY;
DO $qa$
DECLARE v_functions integer; v_missing text; v_count integer;
BEGIN
 IF NOT EXISTS (SELECT 1 FROM public.events WHERE legacy_manager_id='cc_test_bb2_rsvp_20261106')
 THEN RAISE EXCEPTION 'WRONG_PROJECT_TEST_GUARD'; END IF;
 SELECT count(*) INTO v_functions FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND p.proname IN
 ('cc_manager_mass_booking_add_v1','cc_manager_mass_booking_patch_v1','cc_manager_mass_booking_remove_v1');
 IF v_functions<>3 THEN RAISE EXCEPTION 'MASS_BOOKING_APIS_MISSING'; END IF;
 IF to_regclass('public.mass_live_write_audit') IS NULL THEN
 RAISE EXCEPTION 'MASS_AUDIT_TABLE_MISSING'; END IF;
 IF EXISTS (
 SELECT 1 FROM information_schema.role_table_grants
 WHERE table_schema='public' AND table_name='mass_live_write_audit'
 AND grantee IN ('anon','authenticated')
 ) THEN RAISE EXCEPTION 'MASS_AUDIT_DIRECT_ROLE_GRANT'; END IF;
 IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid='public.mass_bookings'::regclass)
 OR NOT (SELECT relrowsecurity FROM pg_class WHERE oid='public.mass_events'::regclass)
 THEN RAISE EXCEPTION 'MASS_RLS_DISABLED'; END IF;
 IF EXISTS (
 SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND p.proname IN
 ('cc_manager_mass_booking_add_v1','cc_manager_mass_booking_patch_v1','cc_manager_mass_booking_remove_v1')
 AND (has_function_privilege('anon',p.oid,'EXECUTE')
 OR NOT has_function_privilege('authenticated',p.oid,'EXECUTE')
 OR NOT p.prosecdef)
 ) THEN RAISE EXCEPTION 'MASS_MANAGER_RPC_EXECUTE_GRANTS_OR_SECURITY_INVALID'; END IF;
 IF EXISTS (
 SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND p.proname IN
 ('cc_manager_mass_booking_add_v1','cc_manager_mass_booking_patch_v1','cc_manager_mass_booking_remove_v1')
 AND (pg_get_functiondef(p.oid) NOT ILIKE '%mass_live_write_audit%'
 OR pg_get_functiondef(p.oid) NOT ILIKE '%cc_manager_require_any_v1%'
 OR pg_get_functiondef(p.oid) NOT ILIKE '%updated_at%')
 ) THEN RAISE EXCEPTION 'MASS_API_AUDIT_OR_ROLE_CONTRACT_MISSING'; END IF;
 RAISE NOTICE 'PASS mass booking static contract. Data/E2E concurrency NOT tested.';
END $qa$;
ROLLBACK;
