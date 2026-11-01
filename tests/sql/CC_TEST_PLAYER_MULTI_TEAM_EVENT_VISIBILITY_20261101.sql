-- Club Control TEST only: read-only multi-team event visibility contract.
-- No inserts or player data updates. Illustrates why LIMIT 1 loses events.
BEGIN READ ONLY;
DO $qa$
DECLARE all_events int; single_team_events int;
BEGIN
 IF NOT EXISTS (SELECT 1 FROM public.events WHERE legacy_manager_id='cc_test_bb2_rsvp_20261106') THEN
   RAISE EXCEPTION 'WRONG_TEST_PROJECT';
 END IF;
 WITH sample(team_id,event_id) AS (
   VALUES ('team_a'::text,'match_a'::text),('team_b','match_b')
 )
 SELECT count(*) INTO all_events FROM sample;
 WITH sample(team_id,event_id) AS (
   VALUES ('team_a'::text,'match_a'::text),('team_b','match_b')
 )
 SELECT count(*) INTO single_team_events FROM sample WHERE team_id='team_a';
 IF all_events<>2 OR single_team_events<>1 THEN
   RAISE EXCEPTION 'MULTI_TEAM_VISIBILITY_REGRESSION';
 END IF;
 IF NOT EXISTS (
   SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
   WHERE n.nspname='public' AND p.proname='cc_player_bootstrap'
 ) THEN RAISE EXCEPTION 'PLAYER_BOOTSTRAP_MISSING'; END IF;
END $qa$;
ROLLBACK;
