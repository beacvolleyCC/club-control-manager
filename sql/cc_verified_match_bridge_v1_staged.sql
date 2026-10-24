-- STAGED ONLY / NOT DEPLOYED: additive, fail-closed v1 match-ID compatibility.
-- A legacy match UUID and a canonical fixture UUID are distinct namespaces.
-- Existing events, availability, original aliases, v2 RPCs are NEVER updated.
-- No candidate from the 42 scoped/time matches is enrolled automatically.
BEGIN;

CREATE TABLE private.cc_verified_match_bridge_v1 (
 legacy_match_id uuid PRIMARY KEY
   REFERENCES private.cc_canonical_matches_v1(id) ON DELETE RESTRICT,
 canonical_match_id uuid NOT NULL UNIQUE,
 legacy_source_key text NOT NULL UNIQUE,
 canonical_source_key text NOT NULL UNIQUE,
 season text NOT NULL CHECK (season='2026/27'),
 competition_label text NOT NULL CHECK (competition_label IN (
   'Női Budapest I. osztály',
   'Női Budapest II. osztály – B csoport',
   'Férfi Budapest I. osztály – B csoport'
 )),
 home_source_team_id text NOT NULL CHECK (length(trim(home_source_team_id))>0),
 away_source_team_id text NOT NULL CHECK (length(trim(away_source_team_id))>0),
 official_proof_kind text NOT NULL CHECK
   (official_proof_kind IN ('mrsz_match_code','brsz_official_fixture_id')),
 official_proof_ref text NOT NULL CHECK (length(trim(official_proof_ref))>=8),
 reviewer text NOT NULL CHECK (length(trim(reviewer))>=3),
 reviewed_at timestamptz NOT NULL,
 CHECK (home_source_team_id<>away_source_team_id),
 CHECK (official_proof_ref ~ '^((MRSZ|BRSZ):2026/27:[0-9]+)$'),
 CHECK (
  (official_proof_kind='mrsz_match_code' AND official_proof_ref LIKE 'MRSZ:%')
  OR
  (official_proof_kind='brsz_official_fixture_id' AND official_proof_ref LIKE 'BRSZ:%')
 )
);
-- No client or application role may insert or read the private approval source.
ALTER TABLE private.cc_verified_match_bridge_v1 ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE private.cc_verified_match_bridge_v1 FROM PUBLIC, anon, authenticated;

-- Revalidate the manually curated identity against the current legacy AND
-- canonical source whenever read. A stale/mismatching approval fails closed.
-- This is NOT a guess from team title or approximate date.
CREATE OR REPLACE VIEW private.cc_verified_match_bridge_resolved_v1
WITH (security_invoker=true) AS
SELECT b.legacy_match_id, b.canonical_match_id,
 b.legacy_source_key, b.canonical_source_key,
 b.season, b.competition_label,
 b.home_source_team_id,b.away_source_team_id,
 b.official_proof_kind,b.official_proof_ref
FROM private.cc_verified_match_bridge_v1 b
JOIN private.cc_canonical_matches_v1 lm
  ON lm.id=b.legacy_match_id AND lm.season=b.season
JOIN private.cc_canonical_match_aliases_v1 la
  ON la.source_system='brsz_fixture'
 AND la.source_key=b.legacy_source_key AND la.match_id=b.legacy_match_id
JOIN public.competition_source_matches raw
  ON raw.source='brsz'
 AND raw.season=b.season
 AND raw.source_match_key=b.legacy_source_key
 AND raw.needs_review IS DISTINCT FROM TRUE
 AND raw.home_source_team_id=b.home_source_team_id
 AND raw.away_source_team_id=b.away_source_team_id
 AND CASE raw.source_team_id
  WHEN '299' THEN 'Női Budapest I. osztály'
  WHEN '959' THEN 'Női Budapest II. osztály – B csoport'
  WHEN '709' THEN 'Férfi Budapest I. osztály – B csoport'
  ELSE NULL END=b.competition_label
JOIN private.cc_canonical_competition_matches_v1 cm
  ON cm.source_key=b.canonical_source_key
 AND cm.match_id=b.canonical_match_id
 AND cm.season=b.season
 AND cm.competition_label=b.competition_label
 AND cm.home_source_team_id=b.home_source_team_id
 AND cm.away_source_team_id=b.away_source_team_id
 AND (
   b.official_proof_kind='brsz_official_fixture_id'
   OR cm.source_key='mrsz:'||b.season||':protocol:'||
                     split_part(b.official_proof_ref,':',3)
   OR EXISTS (
     SELECT 1 FROM public.cc_competition_mrsz_screenshot_v1 report
     WHERE report.source_key=cm.source_key
       AND report.season=b.season
       AND report.competition_label=b.competition_label
       AND report.record_kind='match'
       AND report.data->>'matchCode'=
           split_part(b.official_proof_ref,':',3)
   )
 )
WHERE b.home_source_team_id<>b.away_source_team_id
AND lm.competition_label='BRSZ imported fixture';
REVOKE ALL ON TABLE private.cc_verified_match_bridge_resolved_v1 FROM PUBLIC, anon, authenticated;

-- No raw approval metadata, event UUIDs, players or attendance is sent
-- across client boundaries. Only verified aliases are returned.
CREATE OR REPLACE FUNCTION private.cc_competition_verified_match_bridge_v1()
RETURNS jsonb
LANGUAGE sql STABLE SECURITY INVOKER
SET search_path TO ''
AS $cc_bridge$
 SELECT coalesce(jsonb_agg(jsonb_build_object(
  'legacyMatchId',b.legacy_match_id,
  'canonicalMatchId',b.canonical_match_id,
  'canonicalSourceKey',b.canonical_source_key,
  'season',b.season,
  'competitionLabel',b.competition_label,
  'verification','official_identity_manually_verified',
  'verified',true
 ) ORDER BY b.canonical_source_key),'[]'::jsonb)
 FROM private.cc_verified_match_bridge_resolved_v1 b
$cc_bridge$;
REVOKE ALL ON FUNCTION private.cc_competition_verified_match_bridge_v1()
FROM PUBLIC, anon, authenticated;

-- Opt-in v3 RPCs preserve the exact existing v2 response shape and auth gate.
-- Current Manager and Player stay on v2 until a later approved release.
-- Security definer is necessary here ONLY to retain v2's existing private
-- data-reader mechanism; v2 must still enforce caller authorization.
CREATE OR REPLACE FUNCTION public.cc_manager_competition_mrsz_snapshot_v3()
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path TO ''
AS $cc_v3$
DECLARE result jsonb;
BEGIN
 result:=public.cc_manager_competition_mrsz_snapshot_v2();
 RETURN result||jsonb_build_object(
   'verifiedLegacyMatchBridge',private.cc_competition_verified_match_bridge_v1()
 );
END $cc_v3$;

CREATE OR REPLACE FUNCTION public.cc_player_competition_mrsz_snapshot_v3()
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path TO ''
AS $cc_v3$
DECLARE result jsonb;
BEGIN
 result:=public.cc_player_competition_mrsz_snapshot_v2();
 RETURN result||jsonb_build_object(
   'verifiedLegacyMatchBridge',private.cc_competition_verified_match_bridge_v1()
 );
END $cc_v3$;

REVOKE ALL ON FUNCTION public.cc_manager_competition_mrsz_snapshot_v3()
FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.cc_player_competition_mrsz_snapshot_v3()
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cc_manager_competition_mrsz_snapshot_v3()
TO authenticated;
GRANT EXECUTE ON FUNCTION public.cc_player_competition_mrsz_snapshot_v3()
TO authenticated;

COMMIT;
