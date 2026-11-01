-- CC TEST: pure read-only regression for membership selection semantics.
-- No fixture rows are inserted and no real players are modified.
BEGIN READ ONLY;
DO $qa$
DECLARE selected_old text; selected_valid text; simultaneous_count integer;
BEGIN
 IF NOT EXISTS (SELECT 1 FROM public.events WHERE legacy_manager_id='cc_test_bb2_rsvp_20261106') THEN
  RAISE EXCEPTION 'WRONG_TEST_PROJECT'; END IF;
 WITH fixture(team_key, start_day, end_day) AS
 (VALUES ('current'::text,current_date-20,NULL::date),
         ('future'::text,current_date+20,NULL::date))
 SELECT team_key INTO selected_old FROM fixture
 WHERE end_day IS NULL OR end_day>=current_date
 ORDER BY start_day DESC LIMIT 1;
 WITH fixture(team_key, start_day, end_day) AS
 (VALUES ('current'::text,current_date-20,NULL::date),
         ('future'::text,current_date+20,NULL::date))
 SELECT team_key INTO selected_valid FROM fixture
 WHERE start_day<=current_date AND (end_day IS NULL OR end_day>=current_date)
 ORDER BY start_day DESC LIMIT 1;
 IF selected_old<>'future' OR selected_valid<>'current' THEN
  RAISE EXCEPTION 'FUTURE_START_REGRESSION'; END IF;
 WITH fixture(team_key, start_day) AS
 (VALUES ('team-a'::text,current_date-20),('team-b'::text,current_date-10))
 SELECT count(*) INTO simultaneous_count FROM fixture WHERE start_day<=current_date;
 IF simultaneous_count<>2 THEN RAISE EXCEPTION 'MULTI_TEAM_REGRESSION'; END IF;
END $qa$;
ROLLBACK;
