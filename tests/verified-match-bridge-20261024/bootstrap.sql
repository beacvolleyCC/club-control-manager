-- Disposable PostgreSQL 17 synthetic QA. NEVER run on Club Control LIVE.
-- Shape reflects existing tables; values are synthetic and non-identifying.
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE SCHEMA private;
CREATE TABLE private.cc_canonical_matches_v1 (
 id uuid PRIMARY KEY, season text NOT NULL, competition_label text NOT NULL
);
CREATE TABLE private.cc_canonical_match_aliases_v1 (
 source_system text NOT NULL, source_key text NOT NULL,
 match_id uuid REFERENCES private.cc_canonical_matches_v1(id),
 PRIMARY KEY (source_system,source_key)
);
CREATE TABLE public.competition_source_matches (
 source text NOT NULL,season text NOT NULL,source_match_key text PRIMARY KEY,
 source_team_id text,home_source_team_id text,away_source_team_id text,
 starts_at timestamptz,source_status text,needs_review boolean NOT NULL DEFAULT false
);
CREATE TABLE private.cc_canonical_competition_matches_v1 (
 match_id uuid PRIMARY KEY,source_key text UNIQUE NOT NULL,season text NOT NULL,
 competition_label text NOT NULL,
 home_source_team_id text,away_source_team_id text,
 kickoff_local timestamp,match_status text
);
CREATE TABLE public.cc_competition_mrsz_screenshot_v1 (
 source_key text PRIMARY KEY, data jsonb NOT NULL
);
CREATE TABLE public.events(id uuid PRIMARY KEY,event_type text NOT NULL,status text NOT NULL);
CREATE TABLE public.availability(event_id uuid REFERENCES public.events(id),player_id uuid);

CREATE OR REPLACE FUNCTION public.cc_manager_competition_mrsz_snapshot_v2()
RETURNS jsonb LANGUAGE sql STABLE AS $$
 SELECT jsonb_build_object('marker','manager_v2_original',
 'canonicalMatches',jsonb_build_array(),'fixtures',jsonb_build_array(),
 'tables',jsonb_build_array())
$$;
CREATE OR REPLACE FUNCTION public.cc_player_competition_mrsz_snapshot_v2()
RETURNS jsonb LANGUAGE sql STABLE AS $$
 SELECT jsonb_build_object('marker','player_v2_original',
 'canonicalMatches',jsonb_build_array(),'fixtures',jsonb_build_array(),
 'tables',jsonb_build_array())
$$;

INSERT INTO private.cc_canonical_matches_v1
SELECT md5('qa:old:'||i)::uuid,'2026/27',
 CASE WHEN i<=46 THEN 'BRSZ imported fixture' ELSE 'Archive official QA' END
FROM generate_series(1,56) AS n(i);

WITH t AS (
 SELECT i,
 CASE WHEN i<=15 OR i=45 THEN '299'
      WHEN i<=30 OR i=44 THEN '959'
      ELSE '709' END AS seed
 FROM generate_series(1,46) n(i)
)
INSERT INTO public.competition_source_matches
(source,season,source_match_key,source_team_id,home_source_team_id,
 away_source_team_id,starts_at,source_status,needs_review)
SELECT 'brsz','2026/27','qa:brsz:'||i,seed,seed,
CASE WHEN i IN (45,46) THEN seed
     WHEN i=43 THEN '1214'
     WHEN i=44 THEN '1223'
     ELSE (5000+i)::text END,
CASE WHEN i=43 THEN '2026-10-12 19:30+02'::timestamptz
     WHEN i=44 THEN '2026-10-13 19:30+02'::timestamptz
     ELSE '2026-11-01 19:30+01'::timestamptz+i*interval '1 day' END,
'scheduled',i IN (45,46)
FROM t;

WITH t AS (
 SELECT i,CASE WHEN i<=15 OR i=45 THEN '299'
               WHEN i<=30 OR i=44 THEN '959' ELSE '709' END seed
 FROM generate_series(1,44) n(i)
)
INSERT INTO private.cc_canonical_competition_matches_v1
(match_id,source_key,season,competition_label,home_source_team_id,
 away_source_team_id,kickoff_local,match_status)
SELECT md5('qa:new:'||i)::uuid,
CASE WHEN i=43 THEN 'mrsz:2026/27:protocol:2699'
     ELSE 'qa:canonical:'||i END,'2026/27',
CASE seed WHEN '299' THEN 'Női Budapest I. osztály'
          WHEN '959' THEN 'Női Budapest II. osztály – B csoport'
          ELSE 'Férfi Budapest I. osztály – B csoport' END,
seed,CASE WHEN i=43 THEN '1214'
          WHEN i=44 THEN '1223' ELSE (5000+i)::text END,
CASE WHEN i=43 THEN '2026-10-19 19:30'::timestamp
     WHEN i=44 THEN '2026-10-20 19:30'::timestamp
     ELSE '2026-11-01 19:30'::timestamp+i*interval '1 day' END,
CASE WHEN i IN (43,44) THEN 'played' ELSE 'scheduled' END
FROM t;
INSERT INTO private.cc_canonical_competition_matches_v1
SELECT md5('qa:extra:'||i)::uuid,'qa:synthetic:'||i,'2026/27',
 'Synthetic QA','999','9999',
 '2027-01-01 18:00'::timestamp+i*interval '1 day','scheduled'
FROM generate_series(1,254) n(i);

INSERT INTO private.cc_canonical_match_aliases_v1
SELECT 'brsz_fixture','qa:brsz:'||i,md5('qa:old:'||i)::uuid
FROM generate_series(1,46) n(i);
INSERT INTO private.cc_canonical_match_aliases_v1
SELECT 'manager_event',md5('qa:manager:'||i)::uuid::text,md5('qa:old:'||i)::uuid
FROM generate_series(1,46) n(i);
INSERT INTO public.events
SELECT md5('qa:manager:'||i)::uuid,'match','active'
FROM generate_series(1,46) n(i);
INSERT INTO public.events
SELECT md5('qa:unlinked:'||i)::uuid,'match',
CASE WHEN i IN (1,2) THEN 'archived' ELSE 'active' END
FROM generate_series(1,7) n(i);
INSERT INTO public.events
SELECT md5('qa:training:'||i)::uuid,'training','active'
FROM generate_series(1,226) n(i);
INSERT INTO public.availability
SELECT md5('qa:manager:'||((i-1)%46+1))::uuid,md5('qa:player:'||i)::uuid
FROM generate_series(1,657) n(i);
INSERT INTO public.availability
SELECT md5('qa:unlinked:'||CASE WHEN i<=12 THEN 1
 WHEN i<=14 THEN 3 ELSE 6 END)::uuid,
 md5('qa:unlinked-player:'||i)::uuid
FROM generate_series(1,15) n(i);

-- Production-like baseline, but all data entirely synthetic:
DO $qa$
BEGIN
IF (SELECT count(*) FROM public.events)<>279
OR (SELECT count(*) FROM public.events WHERE event_type='match')<>53
OR (SELECT count(*) FROM public.availability)<>672
OR (SELECT count(*) FROM private.cc_canonical_matches_v1)<>56
OR (SELECT count(*) FROM private.cc_canonical_competition_matches_v1)<>298
OR (SELECT count(*) FROM private.cc_canonical_match_aliases_v1 WHERE source_system='manager_event')<>46
OR (SELECT count(*) FROM private.cc_canonical_match_aliases_v1 WHERE source_system='brsz_fixture')<>46
THEN RAISE EXCEPTION 'QA_BOOTSTRAP_WRONG_BASELINE'; END IF;
END $qa$;
