-- After the proposed hardening runs in a disposable database.
DO $checks$
BEGIN
 IF has_function_privilege('anon',
     'public.cc_capture_competition_standings_history_v1()','EXECUTE')
 OR has_function_privilege('authenticated',
     'public.cc_capture_competition_standings_history_v1()','EXECUTE')
 OR has_function_privilege('anon','public.rls_auto_enable()','EXECUTE')
 OR has_function_privilege('authenticated','public.rls_auto_enable()','EXECUTE')
 THEN
   RAISE EXCEPTION 'QA FAILED: trigger execute must be denied to API roles';
 END IF;
 IF NOT has_function_privilege('anon','public.cc_mass_public_catalog_v1(text)','EXECUTE')
 THEN
   RAISE EXCEPTION 'QA FAILED: public training catalog must remain readable';
 END IF;
 IF has_function_privilege('anon','public.cc_manager_competition_mrsz_snapshot_v2()','EXECUTE')
 OR has_function_privilege('anon','public.cc_player_competition_mrsz_snapshot_v2()','EXECUTE')
 OR NOT has_function_privilege('authenticated','public.cc_manager_competition_mrsz_snapshot_v2()','EXECUTE')
 OR NOT has_function_privilege('authenticated','public.cc_player_competition_mrsz_snapshot_v2()','EXECUTE')
 THEN
   RAISE EXCEPTION 'QA FAILED: canonical RPC privileges changed';
 END IF;
END $checks$;

SET ROLE authenticated;
-- A PostgreSQL row trigger still runs from a DML statement after EXECUTE was revoked.
INSERT INTO public.competition_source_standings(id,source_label)
 VALUES (1,'controlled fixture');
-- An event trigger still runs from DDL after EXECUTE was revoked.
CREATE TABLE public.cc_acl_rls_probe(id integer);
RESET ROLE;

DO $checks$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.competition_source_standings_history
               WHERE id=1 AND source_label='controlled fixture')
 THEN
   RAISE EXCEPTION 'QA FAILED: standings history trigger stopped firing';
 END IF;
 IF NOT (SELECT relrowsecurity FROM pg_class
     WHERE oid='public.cc_acl_rls_probe'::regclass)
 THEN
   RAISE EXCEPTION 'QA FAILED: RLS event trigger stopped firing';
 END IF;
END $checks$;
