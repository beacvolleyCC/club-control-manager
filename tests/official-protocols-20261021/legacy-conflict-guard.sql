-- Assert raw legacy sources and postponed dates remain untouched across
-- canonical PDF-result overlay, idempotent rerun, rollback and reimport.
-- Executed in each of TWO entirely disposable PostgreSQL 17 databases.
DO $cc_legacy$
DECLARE
 orig_count int; orig_fingerprint text;
 actual_count int; actual_fingerprint text;
 dates_ok int; postp int; undated int; women_postp int; men_postp int;
BEGIN
 SELECT row_count,fingerprint INTO STRICT orig_count,orig_fingerprint
 FROM private.cc_qa_legacy_schedule_baseline;
 SELECT count(*),md5(string_agg(to_jsonb(l)::text, '|' ORDER BY l.source_key))
 INTO actual_count,actual_fingerprint
 FROM public.cc_competition_user_schedule_v1 l;
 IF actual_count<>7 OR orig_count<>7 OR actual_fingerprint<>orig_fingerprint
 THEN RAISE EXCEPTION 'CC_LEGACY_SCHEDULE_MUTATED'; END IF;
 SELECT count(*) INTO dates_ok FROM public.cc_competition_user_schedule_v1
 WHERE (source_key='ui20261018:womenI:mtk:panoramase:1'
    AND league_key='womenI' AND source_status='scheduled'
    AND (starts_at AT TIME ZONE 'Europe/Budapest')='2026-10-28 20:45'::timestamp)
 OR (source_key='ui20261018:menB:mozduljse:mafcvasarhelyi:1'
    AND league_key='menB' AND source_status='scheduled'
    AND (starts_at AT TIME ZONE 'Europe/Budapest')='2026-10-28 20:00'::timestamp);
 IF dates_ok<>2 THEN RAISE EXCEPTION 'CC_LEGACY_DATES_NOT_PRESERVED'; END IF;
 SELECT count(*),count(*) FILTER(WHERE starts_at IS NULL AND match_date IS NULL),
        count(*) FILTER(WHERE league_key='womenIIA'),
        count(*) FILTER(WHERE league_key='menB')
 INTO postp,undated,women_postp,men_postp
 FROM public.cc_competition_user_schedule_v1
 WHERE source_status='postponed';
 IF postp<>5 OR undated<>5 OR women_postp<>4 OR men_postp<>1
 THEN RAISE EXCEPTION 'CC_POSTPONED_TIME_FABRICATED: %/%/%/%',
 postp,undated,women_postp,men_postp; END IF;
 IF (SELECT count(*) FROM private.cc_canonical_competition_matches_v1)<>298
 THEN RAISE EXCEPTION 'CC_LEGACY_CANONICAL_COUNT_CHANGED'; END IF;
 IF (SELECT count(DISTINCT match_id) FROM private.cc_canonical_competition_matches_v1)<>298
 THEN RAISE EXCEPTION 'CC_LEGACY_CANONICAL_UUID_COLLISION'; END IF;
 RAISE NOTICE 'CC_LEGACY_CONFLICT_QA_OK: 2 old date conflicts, 5 undated postponements, 298 unique IDs';
END $cc_legacy$;
