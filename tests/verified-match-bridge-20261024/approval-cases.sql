-- Disposable-only approval cases: two correct proofs, three deliberate
-- bad approvals and one rejected self-match. NEVER connect to production.
INSERT INTO private.cc_verified_match_bridge_v1 (
 legacy_match_id,canonical_match_id,legacy_source_key,
 canonical_source_key,season,competition_label,
 home_source_team_id,away_source_team_id,
 official_proof_kind,official_proof_ref,reviewer,reviewed_at
)
VALUES
 (md5('qa:old:1')::uuid,md5('qa:new:1')::uuid,'qa:brsz:1',
  'qa:canonical:1','2026/27','Női Budapest I. osztály','299','5001',
  'brsz_official_fixture_id','BRSZ:2026/27:12345','qa_reviewer',
  '2026-10-24T00:00:00Z'),
 -- The original older kickoff is different: an independently verified MRSZ
 -- report must still allow the correct source identity, without editing it.
 (md5('qa:old:43')::uuid,md5('qa:new:43')::uuid,'qa:brsz:43',
  'mrsz:2026/27:protocol:2699','2026/27',
  'Férfi Budapest I. osztály – B csoport','709','1214',
  'mrsz_match_code','MRSZ:2026/27:2699','qa_reviewer',
  '2026-10-24T00:00:00Z'),

 -- Valid-looking proof string, but a WRONG competition; never expose it.
 (md5('qa:old:2')::uuid,md5('qa:new:2')::uuid,'qa:brsz:2',
  'qa:canonical:2','2026/27',
  'Női Budapest II. osztály – B csoport','299','5002',
  'brsz_official_fixture_id','BRSZ:2026/27:12346','qa_reviewer',
  '2026-10-24T00:00:00Z'),

 -- Reversed home/away: must be invisible in BOTH clients.
 (md5('qa:old:3')::uuid,md5('qa:new:3')::uuid,'qa:brsz:3',
  'qa:canonical:3','2026/27','Női Budapest I. osztály','5003','299',
  'brsz_official_fixture_id','BRSZ:2026/27:12347','qa_reviewer',
  '2026-10-24T00:00:00Z'),

 -- Canonical UUID does not correspond to canonical sourceKey.
 (md5('qa:old:4')::uuid,md5('qa:new:5')::uuid,'qa:brsz:4',
  'qa:canonical:4','2026/27','Női Budapest I. osztály','299','5004',
  'brsz_official_fixture_id','BRSZ:2026/27:12348','qa_reviewer',
  '2026-10-24T00:00:00Z'),

 -- Correct league/teams but wrong official MRSZ match code:
 -- own sourceKey for 2699 must never accept 2686.
 (md5('qa:old:44')::uuid,md5('qa:new:44')::uuid,'qa:brsz:44',
  'qa:canonical:44','2026/27',
  'Női Budapest II. osztály – B csoport','959','1223',
  'mrsz_match_code','MRSZ:2026/27:2686','qa_reviewer',
  '2026-10-24T00:00:00Z');

-- An accidental self-match or wrong proof type is rejected on WRITE as well.
DO $cc_guard$
BEGIN
 BEGIN
  INSERT INTO private.cc_verified_match_bridge_v1
  (legacy_match_id,canonical_match_id,legacy_source_key,canonical_source_key,
    season,competition_label,home_source_team_id,away_source_team_id,
    official_proof_kind,official_proof_ref,reviewer,reviewed_at)
  VALUES (md5('qa:old:45')::uuid,md5('qa:new:45')::uuid,
   'qa:brsz:45','qa:canonical:45','2026/27','Női Budapest I. osztály',
   '299','299','brsz_official_fixture_id','BRSZ:2026/27:12349',
   'qa_reviewer',now());
  RAISE EXCEPTION 'CC_SELF_MATCH_INCORRECTLY_ACCEPTED';
 EXCEPTION WHEN check_violation THEN NULL;
 END;
 BEGIN
  INSERT INTO private.cc_verified_match_bridge_v1
  (legacy_match_id,canonical_match_id,legacy_source_key,canonical_source_key,
    season,competition_label,home_source_team_id,away_source_team_id,
    official_proof_kind,official_proof_ref,reviewer,reviewed_at)
  VALUES (md5('qa:old:46')::uuid,md5('qa:new:46')::uuid,
   'qa:brsz:46','qa:canonical:46','2026/27',
   'Férfi Budapest I. osztály – B csoport',
   '709','1213','mrsz_match_code','BRSZ:2026/27:12350',
   'qa_reviewer',now());
  RAISE EXCEPTION 'CC_PROOF_TYPE_MISMATCH_ACCEPTED';
 EXCEPTION WHEN check_violation THEN NULL;
 END;
END $cc_guard$;
