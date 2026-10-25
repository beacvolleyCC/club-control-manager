-- Club Control synthetic PostgreSQL 17-only Manager/Player authorization QA.
-- Run in TWO disposable PG17 DBs AFTER staging official #2686/#2700.
-- Mirrors inspected LIVE v1 auth predicates and v2 canonical payload flow.
-- Does NOT use real auth tokens and does NOT touch LIVE Supabase.
DO $roles$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon')
 THEN CREATE ROLE anon NOLOGIN; END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated')
 THEN CREATE ROLE authenticated NOLOGIN; END IF;
END $roles$;
CREATE SCHEMA IF NOT EXISTS auth;
GRANT USAGE ON SCHEMA auth,public TO authenticated,anon;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE
 SET search_path TO '' AS $f$
 SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid;
$f$;
REVOKE ALL ON FUNCTION auth.uid() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated;
CREATE TABLE private.cc_qa_manager_permissions (
 auth_user_id uuid PRIMARY KEY, competition_view boolean NOT NULL
);
CREATE TABLE public.players (
 id uuid PRIMARY KEY,auth_user_id uuid NOT NULL,active boolean NOT NULL
);
CREATE TABLE public.teams (
 id uuid PRIMARY KEY,active boolean NOT NULL
);
CREATE TABLE public.team_memberships (
 player_id uuid NOT NULL,team_id uuid NOT NULL,active boolean NOT NULL,
 starts_on date,ends_on date
);
-- Four distinct JWT actors, with a fifth expired/inactive membership state:
-- Manager 1 -> allowed Manager; active Player 2 -> allowed Player;
-- inactive 3 -> forbidden; expired 4 -> forbidden; unrelated 5 -> forbidden.
INSERT INTO private.cc_qa_manager_permissions VALUES
 ('10000000-0000-4000-8000-000000000001',true),
 ('10000000-0000-4000-8000-000000000005',false);
INSERT INTO public.teams VALUES
 ('20000000-0000-4000-8000-000000000001',true),
 ('20000000-0000-4000-8000-000000000002',false);
INSERT INTO public.players VALUES
 ('30000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000002',true),
 ('30000000-0000-4000-8000-000000000003',
  '10000000-0000-4000-8000-000000000003',false),
 ('30000000-0000-4000-8000-000000000004',
  '10000000-0000-4000-8000-000000000004',true),
 ('30000000-0000-4000-8000-000000000006',
  '10000000-0000-4000-8000-000000000006',true);
INSERT INTO public.team_memberships VALUES
 ('30000000-0000-4000-8000-000000000002',
  '20000000-0000-4000-8000-000000000001',true,current_date-7,current_date+30),
 ('30000000-0000-4000-8000-000000000003',
  '20000000-0000-4000-8000-000000000001',true,current_date-7,current_date+30),
 ('30000000-0000-4000-8000-000000000004',
  '20000000-0000-4000-8000-000000000001',true,current_date-60,current_date-1),
 ('30000000-0000-4000-8000-000000000006',
  '20000000-0000-4000-8000-000000000002',true,current_date-7,current_date+30);
-- Production v1 Manager role gate also uses this exact permission/action.
CREATE FUNCTION private.cc_manager_require_any_v1(perm text,op text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $guard$
BEGIN
 IF perm<>'competition.matches' OR op<>'view'
 OR auth.uid() IS NULL OR NOT EXISTS (
  SELECT 1 FROM private.cc_qa_manager_permissions q
  WHERE q.auth_user_id=auth.uid() AND q.competition_view
 ) THEN
 RAISE EXCEPTION 'MANAGER_NOT_ALLOWED' USING ERRCODE='42501';
 END IF;
END $guard$;
REVOKE ALL ON FUNCTION private.cc_manager_require_any_v1(text,text)
 FROM PUBLIC,anon,authenticated;

CREATE FUNCTION public.cc_manager_competition_mrsz_snapshot_v1()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO ''
AS $v1$
BEGIN
 PERFORM private.cc_manager_require_any_v1('competition.matches','view');
 RETURN jsonb_build_object('ok',true,'season','2026/27',
  'source','mrsz_screenshot','fixtures','[]'::jsonb,'matches','[]'::jsonb,
  'tables','[]'::jsonb);
END $v1$;
CREATE FUNCTION public.cc_player_competition_mrsz_snapshot_v1()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO ''
AS $v1$
BEGIN
 IF auth.uid() IS NULL OR NOT EXISTS (
   SELECT 1 FROM public.players p
   JOIN public.team_memberships tm ON tm.player_id=p.id AND tm.active=true
   JOIN public.teams t ON t.id=tm.team_id AND t.active=true
   WHERE p.auth_user_id=auth.uid() AND p.active=true
     AND (tm.starts_on IS NULL OR tm.starts_on<=current_date)
     AND (tm.ends_on IS NULL OR tm.ends_on>=current_date)
 ) THEN RAISE EXCEPTION 'PLAYER_NOT_ALLOWED' USING ERRCODE='42501'; END IF;
 RETURN jsonb_build_object('ok',true,'season','2026/27',
  'source','mrsz_screenshot','fixtures','[]'::jsonb,'matches','[]'::jsonb,
  'tables','[]'::jsonb);
END $v1$;
-- The v2 route mirrors LIVE: v1 auth guard BEFORE any canonical JSON read.
CREATE FUNCTION public.cc_manager_competition_mrsz_snapshot_v2()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO ''
AS $v2$
DECLARE payload jsonb;
BEGIN
 payload:=public.cc_manager_competition_mrsz_snapshot_v1();
 RETURN payload || jsonb_build_object(
  'canonicalMatches',private.cc_competition_canonical_payload_v1());
END $v2$;
CREATE FUNCTION public.cc_player_competition_mrsz_snapshot_v2()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO ''
AS $v2$
DECLARE payload jsonb;
BEGIN
 payload:=public.cc_player_competition_mrsz_snapshot_v1();
 RETURN payload || jsonb_build_object(
  'canonicalMatches',private.cc_competition_canonical_payload_v1());
END $v2$;

-- Explicit grants after Supabase 2026-10-30 change; NEVER blanket grant.
REVOKE ALL ON TABLE public.cc_competition_mrsz_screenshot_v1
 FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION private.cc_competition_canonical_payload_v1()
 FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.cc_manager_competition_mrsz_snapshot_v1()
 FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.cc_manager_competition_mrsz_snapshot_v2()
 FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.cc_player_competition_mrsz_snapshot_v1()
 FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.cc_player_competition_mrsz_snapshot_v2()
 FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cc_manager_competition_mrsz_snapshot_v1() TO authenticated;
GRANT EXECUTE ON FUNCTION public.cc_manager_competition_mrsz_snapshot_v2() TO authenticated;
GRANT EXECUTE ON FUNCTION public.cc_player_competition_mrsz_snapshot_v1() TO authenticated;
GRANT EXECUTE ON FUNCTION public.cc_player_competition_mrsz_snapshot_v2() TO authenticated;

SET ROLE anon;
DO $anon$
DECLARE denied boolean;
BEGIN
 FOR denied IN SELECT false LOOP
  BEGIN PERFORM public.cc_manager_competition_mrsz_snapshot_v2();
   RAISE EXCEPTION 'CC_ANON_MANAGER_ACCESS_LEAKED';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM public.cc_player_competition_mrsz_snapshot_v2();
   RAISE EXCEPTION 'CC_ANON_PLAYER_ACCESS_LEAKED';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 END LOOP;
 RAISE NOTICE 'CC_ANON_NO_PROTOCOL_DATA_PASS';
END $anon$;
RESET ROLE;

SET ROLE authenticated;
DO $authcheck$
DECLARE actor text;mgr_ok boolean;player_ok boolean;target text;
 expected boolean;result jsonb;denied boolean;matches jsonb;
BEGIN
 FOR actor,mgr_ok,player_ok IN
 SELECT * FROM (VALUES
  ('',false,false),
  ('10000000-0000-4000-8000-000000000001',true,false),
  ('10000000-0000-4000-8000-000000000002',false,true),
  ('10000000-0000-4000-8000-000000000003',false,false),
  ('10000000-0000-4000-8000-000000000004',false,false),
  ('10000000-0000-4000-8000-000000000005',false,false),
  ('10000000-0000-4000-8000-000000000006',false,false)
 ) x(actor,mgr_ok,player_ok)
 LOOP
  PERFORM set_config('request.jwt.claim.sub',actor,false);
  FOREACH target IN ARRAY ARRAY['manager','player'] LOOP
   expected:=CASE WHEN target='manager' THEN mgr_ok ELSE player_ok END;
   result:=NULL;denied:=false;
   BEGIN
    IF target='manager' THEN
      result:=public.cc_manager_competition_mrsz_snapshot_v2();
    ELSE result:=public.cc_player_competition_mrsz_snapshot_v2();
    END IF;
   EXCEPTION WHEN insufficient_privilege THEN denied:=true;
   END;
   IF denied=expected THEN
    RAISE EXCEPTION 'CC_REPORT_AUTH_LEAK actor=% endpoint=% allowed=%',
      actor,target,expected;
   END IF;
   IF expected THEN
    matches:=result->'canonicalMatches';
    IF jsonb_array_length(matches)<>298 OR
       (SELECT count(*) FROM jsonb_array_elements(matches) v
        WHERE v->>'matchCode' IN ('2686','2700')
          AND v->>'status'='played')<>2 THEN
      RAISE EXCEPTION 'CC_ALLOWED_REPORT_INCOMPLETE actor=% endpoint=%',
         actor,target;
    END IF;
    IF (SELECT sum(jsonb_array_length(x.v->'protocol'->'teams'->0->'players')+
                   jsonb_array_length(x.v->'protocol'->'teams'->1->'players'))
        FROM jsonb_array_elements(matches) x(v)
        WHERE x.v->>'matchCode' IN ('2686','2700'))<>38
    THEN RAISE EXCEPTION 'CC_38_ROSTER_ROWS_MISSING'; END IF;
   END IF;
  END LOOP;
 END LOOP;
 RAISE NOTICE 'CC_AUTHENTICATED_PROTOCOL_READ_PASS: 7 actors x 2 endpoints';
END $authcheck$;
RESET ROLE;

-- Both API roles lack direct access to private source and canonical helpers.
DO $privacy$
BEGIN
 IF has_function_privilege('anon','private.cc_competition_canonical_payload_v1()','EXECUTE')
 OR has_function_privilege('authenticated','private.cc_competition_canonical_payload_v1()','EXECUTE')
 OR has_table_privilege('anon','public.cc_competition_mrsz_screenshot_v1','SELECT')
 OR has_table_privilege('authenticated','public.cc_competition_mrsz_screenshot_v1','SELECT')
 OR has_function_privilege('anon','public.cc_player_competition_mrsz_snapshot_v2()','EXECUTE')
 OR has_function_privilege('anon','public.cc_manager_competition_mrsz_snapshot_v2()','EXECUTE')
 THEN RAISE EXCEPTION 'CC_PROTOCOL_DIRECT_DATA_GRANT_LEAK'; END IF;
 RAISE NOTICE 'CC_PRIVATE_CANONICAL_REPORT_NO_DIRECT_GRANTS';
END $privacy$;

-- Preserve official source snapshot identity; no schedule, RSVP or event writes.
DO $finished$
BEGIN
 IF (SELECT count(*) FROM public.cc_competition_mrsz_screenshot_v1)<>298 OR
 (SELECT count(*) FROM public.cc_competition_mrsz_screenshot_v1
     WHERE data ? 'officialProtocolEvidence')<>2
 THEN RAISE EXCEPTION 'CC_REPORT_SOURCE_MUTATED'; END IF;
 RAISE NOTICE 'CC_PROTOCOL_AUTHORIZATION_PG17_PASS';
END $finished$;
