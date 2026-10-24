-- STAGED reversible bridge rollback. Must not silently delete reviewed proofs.
-- If any approval exists, abort; first export/audit and revoke approvals
-- in a separately reviewed release operation. NO changes to v2 or RSVP.
BEGIN;
DO $cc_rollback$
BEGIN
 IF EXISTS (SELECT 1 FROM private.cc_verified_match_bridge_v1)
 THEN RAISE EXCEPTION 'CC_BRIDGE_ROLLBACK_BLOCKED_NONEMPTY_APPROVALS'; END IF;
END $cc_rollback$;
DROP FUNCTION public.cc_manager_competition_mrsz_snapshot_v3();
DROP FUNCTION public.cc_player_competition_mrsz_snapshot_v3();
DROP FUNCTION private.cc_competition_verified_match_bridge_v1();
DROP VIEW private.cc_verified_match_bridge_resolved_v1;
DROP TABLE private.cc_verified_match_bridge_v1;
COMMIT;
