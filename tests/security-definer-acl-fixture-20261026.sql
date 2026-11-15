-- Runs only on a disposable PostgreSQL 17 test database.
DO $roles$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN
   CREATE ROLE anon NOLOGIN;
 END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN
   CREATE ROLE authenticated NOLOGIN;
 END IF;
END $roles$;

CREATE TABLE public.competition_source_standings (
 id integer PRIMARY KEY, source_label text NOT NULL
);
CREATE TABLE public.competition_source_standings_history (
 id integer PRIMARY KEY, source_label text NOT NULL
);
CREATE FUNCTION public.cc_capture_competition_standings_history_v1()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $body$ BEGIN
 INSERT INTO public.competition_source_standings_history(id,source_label)
 VALUES(NEW.id,NEW.source_label);
 RETURN NEW;
END $body$;
CREATE TRIGGER cc_history_insert AFTER INSERT
 ON public.competition_source_standings
 FOR EACH ROW EXECUTE FUNCTION public.cc_capture_competition_standings_history_v1();

CREATE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger LANGUAGE plpgsql SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $body$
DECLARE rec record;
BEGIN
 FOR rec IN SELECT * FROM pg_event_trigger_ddl_commands()
   WHERE command_tag='CREATE TABLE' AND schema_name='public'
     AND object_type='table'
 LOOP
   EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY',rec.object_identity);
 END LOOP;
END $body$;
CREATE EVENT TRIGGER ensure_rls ON ddl_command_end
 WHEN TAG IN ('CREATE TABLE') EXECUTE FUNCTION public.rls_auto_enable();

CREATE FUNCTION public.cc_mass_public_catalog_v1(p_mode text DEFAULT 'NORMAL')
 RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path TO ''
AS $body$ SELECT jsonb_build_object('ok',true,'trainings',jsonb_build_array()) $body$;

-- Simulate secured canonical API: authenticated only, not changed by the ACL patch.
CREATE FUNCTION public.cc_manager_competition_mrsz_snapshot_v2()
 RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path TO ''
AS $body$ SELECT '{}'::jsonb $body$;
CREATE FUNCTION public.cc_player_competition_mrsz_snapshot_v2()
 RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path TO ''
AS $body$ SELECT '{}'::jsonb $body$;
REVOKE EXECUTE ON FUNCTION public.cc_manager_competition_mrsz_snapshot_v2() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.cc_player_competition_mrsz_snapshot_v2() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cc_manager_competition_mrsz_snapshot_v2() TO authenticated;
GRANT EXECUTE ON FUNCTION public.cc_player_competition_mrsz_snapshot_v2() TO authenticated;

-- Allow authenticated to perform the fixture's intended write and DDL operation.
GRANT USAGE, CREATE ON SCHEMA public TO authenticated;
GRANT INSERT ON public.competition_source_standings TO authenticated;
