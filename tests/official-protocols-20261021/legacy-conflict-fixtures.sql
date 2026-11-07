-- Synthetic data in disposable PostgreSQL only.
-- The legacy user schedule is a separate historic record source. The
-- authoritative PDF results are for 21 October; these old 28 October rows
-- must not be silently rewritten by a canonical overlay migration.
CREATE TABLE public.cc_competition_user_schedule_v1 (
 source_key text PRIMARY KEY,
 season text NOT NULL,
 league_key text NOT NULL,
 record_kind text NOT NULL,
 home_name text NOT NULL,
 away_name text NOT NULL,
 match_date date,
 starts_at timestamptz,
 source_status text NOT NULL
);
INSERT INTO public.cc_competition_user_schedule_v1
(source_key,season,league_key,record_kind,home_name,away_name,match_date,starts_at,source_status)
VALUES
('ui20261018:womenI:mtk:panoramase:1','2026/27','womenI','fixture','MTK','Panoráma SE','2026-10-28','2026-10-28 20:45:00+01','scheduled'),
('ui20261018:menB:mozduljse:mafcvasarhelyi:1','2026/27','menB','fixture','Mozdulj SE','MAFC-Vásárhelyi','2026-10-28','2026-10-28 20:00:00+01','scheduled'),
('ui20261018:menB:mozduljse:mafcschonherz:1','2026/27','menB','fixture','Mozdulj SE','MAFC-Schönherz',NULL,NULL,'postponed'),
('ui20261018:womenIIA:bdg:bdtsetaksony:1','2026/27','womenIIA','fixture','BDG','BDTSE Taksony',NULL,NULL,'postponed'),
('ui20261018:womenIIA:budaixic:budapestbunnies:1','2026/27','womenIIA','fixture','Budai XI. C','Budapest Bunnies',NULL,NULL,'postponed'),
('ui20261018:womenIIA:budapestbunnies:bdtsetaksony:1','2026/27','womenIIA','fixture','Budapest Bunnies','BDTSE Taksony',NULL,NULL,'postponed'),
('ui20261018:womenIIA:budapestbunnies:budaixic:1','2026/27','womenIIA','fixture','Budapest Bunnies','Budai XI. C',NULL,NULL,'postponed');
CREATE TABLE private.cc_qa_legacy_schedule_baseline (
 row_count int NOT NULL,
 fingerprint text NOT NULL
);
INSERT INTO private.cc_qa_legacy_schedule_baseline
SELECT count(*),md5(string_agg(to_jsonb(l)::text, '|' ORDER BY l.source_key))
FROM public.cc_competition_user_schedule_v1 l;
