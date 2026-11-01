-- Club Control TEST-only read-only membership visibility baseline.
BEGIN READ ONLY;
DO $qa$
DECLARE v_future integer; v_multi integer; v_current integer;
BEGIN
 IF NOT EXISTS (SELECT 1 FROM public.events WHERE legacy_manager_id='cc_test_bb2_rsvp_20261106')
 THEN RAISE EXCEPTION 'WRONG_TEST_PROJECT'; END IF;
 SELECT count(DISTINCT player_id) FILTER (WHERE active AND starts_on>current_date AND (ends_on IS NULL OR ends_on>=current_date)),
 count(DISTINCT player_id) FILTER (WHERE active AND (starts_on IS NULL OR starts_on<=current_date) AND (ends_on IS NULL OR ends_on>=current_date))
 INTO v_future,v_current FROM public.team_memberships;
 SELECT count(*) INTO v_multi FROM (
 SELECT tm.player_id FROM public.team_memberships tm JOIN public.teams t ON t.id=tm.team_id
 WHERE tm.active AND t.active AND (tm.starts_on IS NULL OR tm.starts_on<=current_date)
 AND (tm.ends_on IS NULL OR tm.ends_on>=current_date)
 GROUP BY tm.player_id HAVING count(DISTINCT tm.team_id)>1) q;
 RAISE NOTICE 'MEMBERSHIP BASELINE: current=%, future=%, multiple-current=%',v_current,v_future,v_multi;
 IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid='public.cc_player_bootstrap()'::regprocedure)
 THEN RAISE EXCEPTION 'PLAYER_BOOTSTRAP_MISSING'; END IF;
END $qa$;
ROLLBACK;
