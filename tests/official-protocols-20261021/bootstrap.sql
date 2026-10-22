-- Disposable synthetic PostgreSQL fixtures: 283 scheduled + 13 played + 2 new = 298.
-- Never connect this test suite to Club Control LIVE.
CREATE SCHEMA private;
CREATE TABLE public.cc_competition_mrsz_screenshot_v1 (
 source_key text PRIMARY KEY,
 season text NOT NULL,
 competition_label text NOT NULL,
 record_kind text NOT NULL,
 data jsonb NOT NULL,
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE private.cc_canonical_match_aliases_v1 (
 source_system text,
 source_key text,
 match_id uuid
);
INSERT INTO public.cc_competition_mrsz_screenshot_v1
 (source_key,season,competition_label,record_kind,data)
SELECT
 'synthetic:fixture:'||i,'2026/27','Synthetic QA','fixture',
 jsonb_build_object('homeName','Home'||i,'awayName','Away'||i,
  'startsAt','2026-11-01T18:00:00','status','scheduled',
  'homeSets',null,'awaySets',null,'setScores','[]'::jsonb)
FROM generate_series(1,283) i;
INSERT INTO public.cc_competition_mrsz_screenshot_v1
 (source_key,season,competition_label,record_kind,data)
SELECT
 'mrsz:2026/27:protocol:'||(90000+i),'2026/27','Synthetic QA','match',
 jsonb_build_object('homeName','Archived Home'||i,'awayName','Archived Away'||i,
  'startsAt','2026-10-01T18:00:00+02:00','homeSets',3,'awaySets',0,
  'matchCode',90000+i,'setScores','[]'::jsonb)
FROM generate_series(1,13) i;
INSERT INTO public.cc_competition_mrsz_screenshot_v1
 (source_key,season,competition_label,record_kind,data)
VALUES
('20261001:fixture:39','2026/27','Női Budapest I. osztály','fixture',
  jsonb_build_object('homeName','MTK','awayName','Panoráma SE',
   'homeSourceTeamId','1092','awaySourceTeamId','753',
   'startsAt','2026-10-21T21:00:00','status','scheduled',
   'homeSets',null,'awaySets',null,'venue','XII. ker. Szamos u.2/C')),
('brsz:2026/27:menB:userofficial:01','2026/27',
 'Férfi Budapest I. osztály – B csoport','fixture',
 jsonb_build_object('homeName','Mozdulj SE','awayName','MAFC-Vásárhelyi',
  'homeSourceTeamId','1213','awaySourceTeamId','45',
  'startsAt','2026-10-21T20:00:00','status','scheduled',
  'homeSets',null,'awaySets',null,'venue','X. ker. Monori út 15.'));
