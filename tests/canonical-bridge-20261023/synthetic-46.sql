-- Isolated synthetic PostgreSQL 17 fixtures. NEVER run in production.
-- Model 42 exact scoped matches, 2 official date-drift matches,
-- and 2 invalid BEAC self-matches. No player names or real UUIDs used.
CREATE SCHEMA private;
CREATE TABLE private.cc_canonical_match_aliases_v1 (
  source_system text NOT NULL, source_key text NOT NULL,
  match_id uuid NOT NULL,
  PRIMARY KEY (source_system, source_key)
);
CREATE TABLE public.competition_source_matches (
  source_match_key text PRIMARY KEY, source_team_id text, season text,
  home_source_team_id text, away_source_team_id text,
  starts_at timestamptz, source_status text, needs_review boolean
);
CREATE TABLE private.cc_canonical_competition_matches_v1 (
  source_key text PRIMARY KEY, match_id uuid NOT NULL, season text,
  competition_label text, home_source_team_id text,
  away_source_team_id text, kickoff_local timestamp, match_status text
);
CREATE TABLE public.events (id uuid PRIMARY KEY, event_type text, status text);
CREATE TABLE public.availability (event_id uuid NOT NULL REFERENCES public.events(id));

INSERT INTO public.competition_source_matches
  (source_match_key,source_team_id,season,home_source_team_id,
   away_source_team_id,starts_at,source_status,needs_review)
SELECT 'qa:legacy:'||i,'299','2026/27','299',
       '9'||lpad(i::text,3,'0'),
       '2026-11-01 19:30:00+01'::timestamptz+i*interval '1 day',
       'scheduled',false
FROM generate_series(1,42) i;
INSERT INTO private.cc_canonical_competition_matches_v1
 (source_key,match_id,season,competition_label,home_source_team_id,
  away_source_team_id,kickoff_local,match_status)
SELECT 'qa:canonical:'||i,md5('canonical:'||i)::uuid,
       '2026/27','Női Budapest I. osztály',
       '299','9'||lpad(i::text,3,'0'),
       '2026-11-01 19:30:00'::timestamp+i*interval '1 day','scheduled'
FROM generate_series(1,42) i;

INSERT INTO public.competition_source_matches VALUES
 ('qa:legacy:date:menB','709','2026/27','709','1214',
  '2026-10-12 19:30:00+02','scheduled',false),
 ('qa:legacy:date:womenIIB','959','2026/27','959','1223',
  '2026-10-13 19:30:00+02','scheduled',false),
 ('qa:legacy:self:womenI','299','2026/27','299','299',
  '2026-11-10 19:30:00+01','scheduled',true),
 ('qa:legacy:self:menB','709','2026/27','709','709',
  '2027-01-13 20:30:00+01','scheduled',true);
INSERT INTO private.cc_canonical_competition_matches_v1 VALUES
 ('qa:canonical:played:2699',md5('canonical:2699')::uuid,'2026/27',
  'Férfi Budapest I. osztály – B csoport','709','1214',
  '2026-10-19 19:30:00','played'),
 ('qa:canonical:played:2348',md5('canonical:2348')::uuid,'2026/27',
  'Női Budapest II. osztály – B csoport','959','1223',
  '2026-10-20 19:30:00','played');

INSERT INTO private.cc_canonical_match_aliases_v1
SELECT 'brsz_fixture',source_match_key,
       md5('legacy:'||source_match_key)::uuid
FROM public.competition_source_matches;
-- 44 regular Manager aliases, then 2 additional aliases pointing at
-- distinct existing legacy match IDs (46 linked Manager event records).
INSERT INTO private.cc_canonical_match_aliases_v1
SELECT 'manager_event',md5('manager:'||source_key)::uuid::text,match_id
FROM private.cc_canonical_match_aliases_v1
WHERE source_system='brsz_fixture'
  AND source_key NOT LIKE 'qa:legacy:self:%';
INSERT INTO private.cc_canonical_match_aliases_v1
SELECT 'manager_event',
       md5('manager:second:'||source_key)::uuid::text,match_id
FROM private.cc_canonical_match_aliases_v1
WHERE source_system='brsz_fixture' AND source_key IN ('qa:legacy:1','qa:legacy:2');
INSERT INTO public.events
SELECT source_key::uuid,'match','active'
FROM private.cc_canonical_match_aliases_v1 WHERE source_system='manager_event';
INSERT INTO public.events
SELECT md5('unlinked:'||i)::uuid,'match',
       CASE WHEN i IN (1,2) THEN 'archived' ELSE 'active' END
FROM generate_series(1,7) i;
INSERT INTO public.availability
SELECT md5('unlinked:1')::uuid FROM generate_series(1,12);
INSERT INTO public.availability
SELECT md5('unlinked:2')::uuid FROM generate_series(1,2);
INSERT INTO public.availability VALUES (md5('unlinked:3')::uuid);

-- We deliberately DO NOT insert any alias linking either unlinked event
-- or canonical projection ID. The bridge is strictly a review report.
