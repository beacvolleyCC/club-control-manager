-- TEST-ONLY PostgreSQL rollback QA: intentionally executes candidate inside BEGIN/ROLLBACK.
-- Expects existing linked synthetic TEST player and membership. Never run on LIVE.
-- No Auth credentials or persistent fixture changes are used.
BEGIN;
CREATE OR REPLACE FUNCTION private.current_team_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT DISTINCT tm.team_id
  FROM public.team_memberships tm
  JOIN public.players p ON p.id = tm.player_id
  JOIN public.teams t ON t.id = tm.team_id
  WHERE p.auth_user_id = (SELECT auth.uid())
    AND p.active = TRUE
    AND t.active = TRUE
    AND tm.active = TRUE
    AND tm.starts_on <= CURRENT_DATE
    AND (tm.ends_on IS NULL OR tm.ends_on >= CURRENT_DATE)
$function$;

CREATE OR REPLACE FUNCTION private.player_in_my_team(target_player uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_memberships tm
    JOIN public.players target_p ON target_p.id = tm.player_id
    JOIN public.teams t ON t.id = tm.team_id
    WHERE tm.player_id = target_player
      AND target_p.active = TRUE
      AND t.active = TRUE
      AND tm.active = TRUE
      AND tm.starts_on <= CURRENT_DATE
      AND (tm.ends_on IS NULL OR tm.ends_on >= CURRENT_DATE)
      AND tm.team_id IN (SELECT private.current_team_ids())
  )
$function$;

SELECT set_config('cc.qa.actor',
 (SELECT p.id::text FROM public.players p
  JOIN public.team_memberships tm ON tm.player_id=p.id
  JOIN public.teams t ON t.id=tm.team_id
  WHERE p.auth_user_id IS NOT NULL AND p.active AND tm.active AND t.active
    AND tm.starts_on<=CURRENT_DATE AND (tm.ends_on IS NULL OR tm.ends_on>=CURRENT_DATE)
    AND EXISTS(SELECT 1 FROM public.events e WHERE e.team_id=tm.team_id)
  ORDER BY p.id LIMIT 1),true);
SELECT set_config('cc.qa.team',
 (SELECT tm.team_id::text FROM public.team_memberships tm WHERE tm.player_id=current_setting('cc.qa.actor')::uuid AND tm.active AND tm.starts_on<=CURRENT_DATE AND (tm.ends_on IS NULL OR tm.ends_on>=CURRENT_DATE) ORDER BY tm.team_id LIMIT 1),true);
SELECT set_config('cc.qa.membership',
 (SELECT tm.id::text FROM public.team_memberships tm WHERE tm.player_id=current_setting('cc.qa.actor')::uuid AND tm.team_id=current_setting('cc.qa.team')::uuid AND tm.active AND tm.starts_on<=CURRENT_DATE AND (tm.ends_on IS NULL OR tm.ends_on>=CURRENT_DATE) ORDER BY tm.id LIMIT 1),true);
SELECT set_config('cc.qa.target_membership',
 (SELECT tm.id::text FROM public.team_memberships tm JOIN public.players p ON p.id=tm.player_id
  WHERE tm.team_id=current_setting('cc.qa.team')::uuid AND tm.player_id<>current_setting('cc.qa.actor')::uuid
  AND tm.active AND p.active AND tm.starts_on<=CURRENT_DATE AND (tm.ends_on IS NULL OR tm.ends_on>=CURRENT_DATE)
  ORDER BY tm.id LIMIT 1),true);
SELECT set_config('cc.qa.target',
 (SELECT tm.player_id::text FROM public.team_memberships tm WHERE tm.id=current_setting('cc.qa.target_membership')::uuid),true);
SELECT set_config('cc.qa.other',
 (SELECT p.id::text FROM public.players p
  WHERE p.active AND p.id<>current_setting('cc.qa.actor')::uuid
  AND NOT EXISTS(
    SELECT 1 FROM public.team_memberships tm WHERE tm.player_id=p.id
      AND tm.team_id=current_setting('cc.qa.team')::uuid
      AND tm.active AND tm.starts_on<=CURRENT_DATE AND (tm.ends_on IS NULL OR tm.ends_on>=CURRENT_DATE)
  ) ORDER BY p.id LIMIT 1),true);
SELECT set_config('cc.qa.event',
 (SELECT e.id::text FROM public.events e
  WHERE e.team_id=current_setting('cc.qa.team')::uuid
   AND EXISTS(SELECT 1 FROM public.availability av WHERE av.event_id=e.id)
  ORDER BY e.id LIMIT 1),true);
SELECT set_config('cc.qa.claim.sub',(SELECT p.auth_user_id::text FROM public.players p WHERE p.id=current_setting('cc.qa.actor')::uuid),true);
SELECT set_config('request.jwt.claim.sub',current_setting('cc.qa.claim.sub'),true);
SELECT set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('cc.qa.claim.sub'),'role','authenticated')::text,true);

DO $fixture$
BEGIN
  IF current_setting('cc.qa.actor',true) IS NULL OR current_setting('cc.qa.team',true) IS NULL OR
     current_setting('cc.qa.target',true) IS NULL OR current_setting('cc.qa.other',true) IS NULL OR
     current_setting('cc.qa.event',true) IS NULL THEN
    RAISE EXCEPTION 'QA_REQUIRED_TEST_FIXTURES_NOT_FOUND';
  END IF;
  IF has_function_privilege('anon','private.current_team_ids()','EXECUTE') OR
     has_function_privilege('anon','private.player_in_my_team(uuid)','EXECUTE') OR
     NOT has_function_privilege('authenticated','private.current_team_ids()','EXECUTE') OR
     NOT has_function_privilege('authenticated','private.player_in_my_team(uuid)','EXECUTE') THEN
    RAISE EXCEPTION 'QA_BAD_FUNCTION_GRANTS';
  END IF;
END;
$fixture$;

SET LOCAL ROLE authenticated;
DO $baseline$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM private.current_team_ids() AS c(id) WHERE c.id=current_setting('cc.qa.team')::uuid) THEN RAISE EXCEPTION 'QA_CURRENT_TEAM_NOT_VISIBLE'; END IF;
  IF NOT private.player_in_my_team(current_setting('cc.qa.target')::uuid) THEN RAISE EXCEPTION 'QA_CURRENT_TEAMMATE_NOT_VISIBLE'; END IF;
  IF private.player_in_my_team(current_setting('cc.qa.other')::uuid) THEN RAISE EXCEPTION 'QA_UNRELATED_PLAYER_VISIBLE'; END IF;
  IF NOT private.event_in_my_team(current_setting('cc.qa.event')::uuid) THEN RAISE EXCEPTION 'QA_CURRENT_EVENT_HELPER_DENIED'; END IF;
  IF (SELECT count(*) FROM public.teams WHERE id=current_setting('cc.qa.team')::uuid)<>1 THEN RAISE EXCEPTION 'QA_TEAM_RLS_DENIED'; END IF;
  IF (SELECT count(*) FROM public.events WHERE id=current_setting('cc.qa.event')::uuid)<>1 THEN RAISE EXCEPTION 'QA_EVENT_RLS_DENIED'; END IF;
  IF (SELECT count(*) FROM public.availability WHERE event_id=current_setting('cc.qa.event')::uuid)<1 THEN RAISE EXCEPTION 'QA_RSVP_RLS_DENIED'; END IF;
  IF (SELECT count(*) FROM public.players WHERE id=current_setting('cc.qa.target')::uuid)<>1 THEN RAISE EXCEPTION 'QA_TEAMMATE_RLS_DENIED'; END IF;
  IF (SELECT count(*) FROM public.players WHERE id=current_setting('cc.qa.other')::uuid)<>0 THEN RAISE EXCEPTION 'QA_CROSS_TEAM_RLS_LEAK'; END IF;
END;
$baseline$;
RESET ROLE;

-- Teammate future start -> player_in_my_team and players RLS deny; own membership stays current.
UPDATE public.team_memberships SET starts_on=CURRENT_DATE+INTERVAL '1 day',ends_on=NULL
 WHERE id=current_setting('cc.qa.target_membership')::uuid;
SET LOCAL ROLE authenticated;
DO $target_future$
BEGIN
  IF private.player_in_my_team(current_setting('cc.qa.target')::uuid) THEN RAISE EXCEPTION 'QA_FUTURE_TEAMMATE_HELPER_LEAK'; END IF;
  IF (SELECT count(*) FROM public.players WHERE id=current_setting('cc.qa.target')::uuid)<>0 THEN RAISE EXCEPTION 'QA_FUTURE_TEAMMATE_RLS_LEAK'; END IF;
END;
$target_future$;
RESET ROLE;
UPDATE public.team_memberships SET starts_on=CURRENT_DATE-INTERVAL '1 day',ends_on=NULL
 WHERE id=current_setting('cc.qa.target_membership')::uuid;

-- Actor's own membership future -> no team/event/RVSP exposure.
UPDATE public.team_memberships SET starts_on=CURRENT_DATE+INTERVAL '1 day',ends_on=NULL
 WHERE id=current_setting('cc.qa.membership')::uuid;
SET LOCAL ROLE authenticated;
DO $future$
BEGIN
 IF EXISTS(SELECT 1 FROM private.current_team_ids()) THEN RAISE EXCEPTION 'QA_FUTURE_TEAM_HELPER_LEAK'; END IF;
 IF private.event_in_my_team(current_setting('cc.qa.event')::uuid) THEN RAISE EXCEPTION 'QA_FUTURE_EVENT_HELPER_LEAK'; END IF;
 IF (SELECT count(*) FROM public.teams WHERE id=current_setting('cc.qa.team')::uuid)<>0 THEN RAISE EXCEPTION 'QA_FUTURE_TEAM_RLS_LEAK'; END IF;
 IF (SELECT count(*) FROM public.events WHERE id=current_setting('cc.qa.event')::uuid)<>0 THEN RAISE EXCEPTION 'QA_FUTURE_EVENT_RLS_LEAK'; END IF;
 IF (SELECT count(*) FROM public.availability WHERE event_id=current_setting('cc.qa.event')::uuid)<>0 THEN RAISE EXCEPTION 'QA_FUTURE_RSVP_RLS_LEAK'; END IF;
END;
$future$;
RESET ROLE;

-- Actor's expired membership -> no team. Inactive membership -> no team.
UPDATE public.team_memberships SET starts_on=CURRENT_DATE-INTERVAL '10 days',ends_on=CURRENT_DATE-INTERVAL '1 day'
 WHERE id=current_setting('cc.qa.membership')::uuid;
SET LOCAL ROLE authenticated;
DO $expired$
BEGIN
 IF EXISTS(SELECT 1 FROM private.current_team_ids()) THEN RAISE EXCEPTION 'QA_EXPIRED_TEAM_LEAK'; END IF;
END;
$expired$;
RESET ROLE;
UPDATE public.team_memberships SET active=false,starts_on=CURRENT_DATE-INTERVAL '1 day',ends_on=NULL
 WHERE id=current_setting('cc.qa.membership')::uuid;
SET LOCAL ROLE authenticated;
DO $inactive_membership$
BEGIN
 IF EXISTS(SELECT 1 FROM private.current_team_ids()) THEN RAISE EXCEPTION 'QA_INACTIVE_MEMBERSHIP_LEAK'; END IF;
END;
$inactive_membership$;
RESET ROLE;

-- Inactive linked player and team -> no access.
UPDATE public.team_memberships SET active=true WHERE id=current_setting('cc.qa.membership')::uuid;
UPDATE public.players SET active=false WHERE id=current_setting('cc.qa.actor')::uuid;
SET LOCAL ROLE authenticated;
DO $inactive_player$
BEGIN
 IF EXISTS(SELECT 1 FROM private.current_team_ids()) THEN RAISE EXCEPTION 'QA_INACTIVE_PLAYER_LEAK'; END IF;
END;
$inactive_player$;
RESET ROLE;
UPDATE public.players SET active=true WHERE id=current_setting('cc.qa.actor')::uuid;
UPDATE public.teams SET active=false WHERE id=current_setting('cc.qa.team')::uuid;
SET LOCAL ROLE authenticated;
DO $inactive_team$
BEGIN
 IF EXISTS(SELECT 1 FROM private.current_team_ids()) THEN RAISE EXCEPTION 'QA_INACTIVE_TEAM_LEAK'; END IF;
END;
$inactive_team$;
RESET ROLE;

-- Today's start and end are INCLUSIVE.
UPDATE public.teams SET active=true WHERE id=current_setting('cc.qa.team')::uuid;
UPDATE public.team_memberships SET starts_on=CURRENT_DATE,ends_on=CURRENT_DATE,active=true WHERE id=current_setting('cc.qa.membership')::uuid;
SET LOCAL ROLE authenticated;
DO $inclusive$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM private.current_team_ids() AS c(id) WHERE c.id=current_setting('cc.qa.team')::uuid) THEN RAISE EXCEPTION 'QA_BOUNDARY_NOT_INCLUSIVE'; END IF;
END;
$inclusive$;
RESET ROLE;

-- JWT absent, even if PostgreSQL role is authenticated: no membership.
SELECT set_config('request.jwt.claim.sub','',true);
SELECT set_config('request.jwt.claims','',true);
SET LOCAL ROLE authenticated;
DO $no_auth$
BEGIN
 IF EXISTS(SELECT 1 FROM private.current_team_ids()) THEN RAISE EXCEPTION 'QA_NO_AUTH_LEAK'; END IF;
 IF (SELECT count(*) FROM public.events WHERE id=current_setting('cc.qa.event')::uuid)<>0 THEN RAISE EXCEPTION 'QA_NO_AUTH_EVENT_LEAK'; END IF;
END;
$no_auth$;
RESET ROLE;
ROLLBACK;
SELECT 'PASS TEST RLS transactional QA: current, teammate, cross-team, future, expired, inactive membership/player/team, boundary, JWT-null; all fixture and DDL changes rolled back' AS result;
