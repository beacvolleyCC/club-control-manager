-- Synthetic PostgreSQL 17 security QA only. Never apply to LIVE Supabase.
-- Simulates the post-2026-10-30 NO-AUTOGRANT behavior for newly created
-- PUBLIC tables, without changing existing Club Control grants.
DO $roles$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='anon')
 THEN CREATE ROLE anon NOLOGIN; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='authenticated')
 THEN CREATE ROLE authenticated NOLOGIN; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='service_role')
 THEN CREATE ROLE service_role NOLOGIN; END IF;
END $roles$;

GRANT USAGE ON SCHEMA public TO anon,authenticated,service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
 REVOKE SELECT,INSERT,UPDATE,DELETE ON TABLES FROM anon,authenticated,service_role;

CREATE TABLE public.cc_qa_not_exposed (
 id uuid PRIMARY KEY,
 note text NOT NULL
);
ALTER TABLE public.cc_qa_not_exposed ENABLE ROW LEVEL SECURITY;

DO $no_default_grant$
BEGIN
 IF has_table_privilege('anon','public.cc_qa_not_exposed','SELECT')
 OR has_table_privilege('authenticated','public.cc_qa_not_exposed','SELECT')
 OR has_table_privilege('service_role','public.cc_qa_not_exposed','SELECT')
 THEN RAISE EXCEPTION 'CC_UNEXPECTED_PUBLIC_NEW_TABLE_AUTOGRANT'; END IF;
 RAISE NOTICE 'CC_NO_AUTOGRANT_OK: new public table is not implicitly reachable';
END $no_default_grant$;

-- This is a disposable example of an intended authenticated-only read.
CREATE TABLE public.cc_qa_user_scoped (
 id uuid PRIMARY KEY,
 owner_id uuid NOT NULL,
 note text NOT NULL
);
ALTER TABLE public.cc_qa_user_scoped ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.cc_qa_user_scoped FROM PUBLIC,anon,authenticated,service_role;
CREATE POLICY "cc_qa_select_own" ON public.cc_qa_user_scoped
 FOR SELECT TO authenticated
 USING (owner_id=NULLIF(current_setting('request.jwt.claim.sub',true),'')::uuid);
GRANT SELECT ON TABLE public.cc_qa_user_scoped TO authenticated;

INSERT INTO public.cc_qa_user_scoped(id,owner_id,note) VALUES
 ('10000000-0000-4000-8000-000000000011',
  '10000000-0000-4000-8000-000000000001','USER_A_PRIVATE'),
 ('10000000-0000-4000-8000-000000000022',
  '10000000-0000-4000-8000-000000000002','USER_B_PRIVATE');

DO $privileges$
BEGIN
 IF has_table_privilege('anon','public.cc_qa_user_scoped','SELECT')
 OR NOT has_table_privilege('authenticated','public.cc_qa_user_scoped','SELECT')
 OR has_table_privilege('authenticated','public.cc_qa_user_scoped','INSERT')
 OR has_table_privilege('authenticated','public.cc_qa_user_scoped','UPDATE')
 OR has_table_privilege('authenticated','public.cc_qa_user_scoped','DELETE')
 OR has_table_privilege('service_role','public.cc_qa_user_scoped','SELECT')
 THEN RAISE EXCEPTION 'CC_EXPLICIT_MINIMUM_PRIVILEGES_NOT_ENFORCED'; END IF;
 RAISE NOTICE 'CC_EXPLICIT_TABLE_ACL_OK: authenticated SELECT only';
END $privileges$;

SET ROLE anon;
DO $anon_denied$
DECLARE refused boolean:=false;
BEGIN
 BEGIN
  PERFORM count(*) FROM public.cc_qa_user_scoped;
 EXCEPTION WHEN insufficient_privilege THEN refused:=true; END;
 IF NOT refused THEN RAISE EXCEPTION 'CC_ANON_BYPASSED_EXPLICIT_GRANT'; END IF;
END $anon_denied$;
RESET ROLE;

SET ROLE authenticated;
DO $own_rows$
DECLARE cnt integer;
BEGIN
 PERFORM set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
 SELECT count(*) INTO cnt FROM public.cc_qa_user_scoped;
 IF cnt<>1 THEN RAISE EXCEPTION 'CC_RLS_USER_A_UNSCOPED: %',cnt; END IF;
 IF EXISTS(SELECT 1 FROM public.cc_qa_user_scoped WHERE note='USER_B_PRIVATE')
 THEN RAISE EXCEPTION 'CC_RLS_CROSSTEAM_DATA_LEAK'; END IF;

 PERFORM set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
 SELECT count(*) INTO cnt FROM public.cc_qa_user_scoped;
 IF cnt<>1 THEN RAISE EXCEPTION 'CC_RLS_USER_B_UNSCOPED: %',cnt; END IF;
 IF EXISTS(SELECT 1 FROM public.cc_qa_user_scoped WHERE note='USER_A_PRIVATE')
 THEN RAISE EXCEPTION 'CC_RLS_USER_A_DATA_LEAK'; END IF;

 PERFORM set_config('request.jwt.claim.sub','',true);
 SELECT count(*) INTO cnt FROM public.cc_qa_user_scoped;
 IF cnt<>0 THEN RAISE EXCEPTION 'CC_RLS_NO_USER_CAN_READ'; END IF;
 RAISE NOTICE 'CC_RLS_USER_ISOLATION_OK: own rows only, no JWT zero rows';
END $own_rows$;
RESET ROLE;

DO $unchanged$
BEGIN
 IF (SELECT count(*) FROM public.cc_qa_user_scoped)<>2
 THEN RAISE EXCEPTION 'CC_SAMPLE_DATA_CHANGED'; END IF;
 RAISE NOTICE 'CC_POST_20261030_GRANTS_PASS';
END $unchanged$;
