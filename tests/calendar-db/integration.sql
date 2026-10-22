-- Disposable fixture only. One test transaction; intentionally ROLLBACK.
\set ON_ERROR_STOP on
BEGIN;
-- 01/02: Call privilege boundary. Anonymous cannot issue even without a JWT.
SET LOCAL ROLE anon;
DO $$
DECLARE rejected boolean:=false;
BEGIN
  BEGIN
    PERFORM public.cc_player_calendar_token_rotate_v1('mine',null);
  EXCEPTION WHEN insufficient_privilege THEN rejected:=true;
  END;
  IF NOT rejected THEN RAISE EXCEPTION 'QA: anonymous issuance allowed'; END IF;
END
$$;
RESET ROLE;
-- An authenticated user gets only their own, currently joined scopes.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000101',true);
DO $$
DECLARE token text; token2 text; denied boolean:=false; data jsonb;
BEGIN
  token:=public.cc_player_calendar_token_rotate_v1('mine')->>'token';
  IF length(token)<>64 OR token !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'QA: raw token is not 256 bits';
  END IF;
  PERFORM set_config('cc.qa.hash1',encode(sha256(convert_to(token,'UTF8')),'hex'),true);
  IF (public.cc_player_calendar_token_status_v1('mine')->>'active')::boolean IS DISTINCT FROM TRUE THEN
    RAISE EXCEPTION 'QA: status not active';
  END IF;
  BEGIN
    PERFORM public.cc_calendar_feed_read_v1(encode(sha256(convert_to(token,'UTF8')),'hex'));
  EXCEPTION WHEN insufficient_privilege THEN denied:=true;
  END;
  IF NOT denied THEN RAISE EXCEPTION 'QA: authenticated role can call privileged read'; END IF;
  token2:=public.cc_player_calendar_token_rotate_v1('mine')->>'token';
  IF token2=token THEN RAISE EXCEPTION 'QA: rotation returned same token'; END IF;
  PERFORM set_config('cc.qa.hash2',encode(sha256(convert_to(token2,'UTF8')),'hex'),true);
  IF public.cc_player_calendar_token_revoke_v1('mine') IS DISTINCT FROM TRUE THEN
    RAISE EXCEPTION 'QA: revoke did not revoke token'; END IF;
  token:=public.cc_player_calendar_token_rotate_v1('mine')->>'token';
  PERFORM set_config('cc.qa.hash3',encode(sha256(convert_to(token,'UTF8')),'hex'),true);
  -- Additional authorized team token, protected by current membership.
  token:=public.cc_player_calendar_token_rotate_v1('team','00000000-0000-4000-8000-000000000301')->>'token';
  PERFORM set_config('cc.qa.teamhash',encode(sha256(convert_to(token,'UTF8')),'hex'),true);
  denied:=false;
  BEGIN
    PERFORM public.cc_player_calendar_token_rotate_v1('team','00000000-0000-4000-8000-000000000302');
  EXCEPTION WHEN others THEN
    denied:=sqlerrm='TEAM_MEMBERSHIP_REQUIRED';
  END;
  IF NOT denied THEN RAISE EXCEPTION 'QA: unauthorized team token issued'; END IF;
  denied:=false;
  BEGIN
    PERFORM public.cc_player_calendar_token_rotate_v1(NULL,NULL);
  EXCEPTION WHEN others THEN
    denied:=sqlerrm='INVALID_SCOPE';
  END;
  IF NOT denied THEN RAISE EXCEPTION 'QA: invalid scope accepted'; END IF;
END
$$;
RESET ROLE;
-- 03/04: Service-only feed confirms revoked tokens and strict membership/booking.
SET LOCAL ROLE service_role;
DO $$
DECLARE own_feed jsonb; team_feed jsonb;
BEGIN
  IF public.cc_calendar_feed_read_v1(current_setting('cc.qa.hash1')) IS NOT NULL
    OR public.cc_calendar_feed_read_v1(current_setting('cc.qa.hash2')) IS NOT NULL THEN
    RAISE EXCEPTION 'QA: old or revoked token remains valid';
  END IF;
  IF public.cc_calendar_feed_read_v1(repeat('a',64)) IS NOT NULL THEN
    RAISE EXCEPTION 'QA: invalid bearer was accepted';
  END IF;
  own_feed:=public.cc_calendar_feed_read_v1(current_setting('cc.qa.hash3'));
  IF own_feed IS NULL OR jsonb_array_length(own_feed->'events')<>2 THEN
    RAISE EXCEPTION 'QA: own going count should be exactly 2';
  END IF;
  IF NOT EXISTS(SELECT 1 FROM jsonb_array_elements(own_feed->'events') v
                WHERE v->>'status'='cancelled')
     OR EXISTS(SELECT 1 FROM jsonb_array_elements(own_feed->'events') v
                WHERE v->>'id' IN ('00000000-0000-4000-8000-000000000402',
                                   '00000000-0000-4000-8000-000000000404')) THEN
    RAISE EXCEPTION 'QA: cancelled / not_going / unknown inclusion invalid';
  END IF;
  team_feed:=public.cc_calendar_feed_read_v1(current_setting('cc.qa.teamhash'));
  IF team_feed IS NULL OR jsonb_array_length(team_feed->'events')<>4 THEN
    RAISE EXCEPTION 'QA: team feed should include exactly four team events';
  END IF;
  IF EXISTS(SELECT 1 FROM jsonb_array_elements(team_feed->'events') v
    WHERE v->>'id'='00000000-0000-4000-8000-000000000402') THEN
    RAISE EXCEPTION 'QA: other team's event leaked';
  END IF;
END
$$;
RESET ROLE;
-- 05: A membership transfer invalidates even an already-issued URL.
UPDATE public.team_memberships SET active=false
  WHERE player_id='00000000-0000-4000-8000-000000000201';
SET LOCAL ROLE service_role;
DO $$
BEGIN
  IF public.cc_calendar_feed_read_v1(current_setting('cc.qa.teamhash')) IS NOT NULL THEN
    RAISE EXCEPTION 'QA: transferred player retains team feed';
  END IF;
END
$$;
RESET ROLE;
UPDATE public.team_memberships SET active=true
  WHERE player_id='00000000-0000-4000-8000-000000000201';
-- 06: Banned and deleted auth identities must lose access.
UPDATE auth.users SET banned_until=now()+interval '2 days'
  WHERE id='00000000-0000-4000-8000-000000000101';
SET LOCAL ROLE service_role;
DO $$
BEGIN
  IF public.cc_calendar_feed_read_v1(current_setting('cc.qa.hash3')) IS NOT NULL THEN
    RAISE EXCEPTION 'QA: banned account retains calendar feed';
  END IF;
END
$$;
RESET ROLE;
UPDATE auth.users SET banned_until=NULL,deleted_at=now()
  WHERE id='00000000-0000-4000-8000-000000000101';
SET LOCAL ROLE service_role;
DO $$
BEGIN
  IF public.cc_calendar_feed_read_v1(current_setting('cc.qa.hash3')) IS NOT NULL THEN
    RAISE EXCEPTION 'QA: deleted account retains feed';
  END IF;
END
$$;
RESET ROLE;
-- 07: Anonymous, authenticated, service-role privileges and hashed storage.
DO $$
BEGIN
  IF has_function_privilege('anon','public.cc_player_calendar_token_rotate_v1(text,uuid)','execute')
     OR has_function_privilege('anon','public.cc_player_calendar_token_status_v1(text,uuid)','execute')
     OR has_function_privilege('authenticated','public.cc_calendar_feed_read_v1(text)','execute')
     OR NOT has_function_privilege('service_role','public.cc_calendar_feed_read_v1(text)','execute')
     OR has_table_privilege('anon','private.cc_calendar_feed_tokens_v1','select')
     OR has_table_privilege('authenticated','private.cc_calendar_feed_tokens_v1','select') THEN
    RAISE EXCEPTION 'QA: unauthorized execute/select grant';
  END IF;
  IF EXISTS(SELECT 1 FROM private.cc_calendar_feed_tokens_v1
     WHERE length(token_sha256)<>64 OR token_sha256 !~ '^[0-9a-f]{64}$')
  THEN RAISE EXCEPTION 'QA: persisted token is not SHA256 hex'; END IF;
END
$$;
-- 08: Unrelated user cannot produce a feed with player A's identity.
UPDATE auth.users SET deleted_at=NULL
  WHERE id='00000000-0000-4000-8000-000000000101';
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000102',true);
DO $$
DECLARE new_token text; denied boolean:=false;
BEGIN
  new_token:=public.cc_player_calendar_token_rotate_v1('mine')->>'token';
  PERFORM set_config('cc.qa.userb',encode(extensions.digest(new_token,'sha256'),'hex'),true);
  BEGIN
    PERFORM public.cc_player_calendar_token_rotate_v1('team','00000000-0000-4000-8000-000000000301');
  EXCEPTION WHEN others THEN denied:=sqlerrm='TEAM_MEMBERSHIP_REQUIRED';
  END;
  IF NOT denied THEN RAISE EXCEPTION 'QA: another athlete can mint A team link'; END IF;
END
$$;
RESET ROLE;
SET LOCAL ROLE service_role;
DO $$
DECLARE s jsonb;
BEGIN
  s:=public.cc_calendar_feed_read_v1(current_setting('cc.qa.userb'));
  IF s IS NULL OR jsonb_array_length(s->'events')<>1 THEN
    RAISE EXCEPTION 'QA: foreign authenticated user feed is incorrect';
  END IF;
END
$$;
RESET ROLE;
-- 09: Missing authentication must fail even if role is authenticated.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','',true);
DO $$
DECLARE denied boolean:=false;
BEGIN
  BEGIN PERFORM public.cc_player_calendar_token_rotate_v1('mine');
  EXCEPTION WHEN others THEN denied:=sqlerrm='AUTH_REQUIRED'; END;
  IF NOT denied THEN RAISE EXCEPTION 'QA: token issuance without identity'; END IF;
END
$$;
RESET ROLE;
-- 10: Do not commit any synthetic token records in the fixture test.
ROLLBACK;
SELECT 'DISPOSABLE_CALENDAR_QA_PASS' AS result;
