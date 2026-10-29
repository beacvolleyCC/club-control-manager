BEGIN;
-- TEST only, #82, review candidate; no live changes.
CREATE OR REPLACE FUNCTION public.cc_manager_players_v2(p_team_id uuid DEFAULT NULL::uuid, p_query text DEFAULT ''::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'private', 'pg_temp'
AS $function$
declare
  v_query text:=lower(trim(coalesce(p_query,'')));
  v_manager_id uuid;
begin
  if p_team_id is null then
    v_manager_id:=private.cc_manager_require_any_v1('competition.players','view');
  else
    v_manager_id:=private.cc_manager_require_v1('competition.players','view',p_team_id);
  end if;

  return (
    with rows as (
      select
        p.id,p.email,p.name,p.display_name,p.position,p.jersey_no,p.jersey_size,p.shorts_size,p.active,p.auth_user_id,
        pp.license_no,pp.medical_valid_until,ps.avatar_id,
        m.team_id,m.starts_on,m.ends_on,t.name as team_name,
        coalesce(att.training_present,0) as training_present,
        coalesce(att.training_marked,0) as training_marked,
        coalesce(att.match_present,0) as match_present,
        coalesce(att.match_marked,0) as match_marked
      from public.players p
      left join public.player_private pp on pp.player_id=p.id
      left join public.player_settings ps on ps.player_id=p.id
      left join lateral (
        select tm.team_id,tm.starts_on,tm.ends_on
        from public.team_memberships tm
        where tm.player_id=p.id
          and tm.active=true
          and tm.starts_on<=current_date
          and (tm.ends_on is null or tm.ends_on>=current_date)
        order by tm.starts_on desc,tm.created_at desc
        limit 1
      ) m on true
      left join public.teams t on t.id=m.team_id AND t.active=true
      left join lateral (
        select
          count(*) filter (where e.event_type='training' and a.attendance_status='present')::int as training_present,
          count(*) filter (where e.event_type='training' and a.attendance_status in ('present','absent'))::int as training_marked,
          count(*) filter (where e.event_type='match' and a.attendance_status='present')::int as match_present,
          count(*) filter (where e.event_type='match' and a.attendance_status in ('present','absent'))::int as match_marked
        from public.availability a
        join public.events e on e.id=a.event_id
        where a.player_id=p.id
          and (p_team_id is null or e.team_id=p_team_id)
          and exists (
            select 1 from public.manager_module_permissions amp
            where amp.manager_id=v_manager_id
              and amp.module_key='competition.players'
              and amp.can_view=true
              and (amp.team_id is null or amp.team_id=e.team_id)
          )
      ) att on true
      where (p_team_id is null or m.team_id=p_team_id)
        and (
          v_query=''
          or lower(coalesce(p.display_name,p.name,'')) like '%'||v_query||'%'
          or lower(p.email::text) like '%'||v_query||'%'
          or lower(coalesce(pp.license_no,'')) like '%'||v_query||'%'
        )
        and exists (
          select 1 from public.manager_module_permissions mp
          where mp.manager_id=v_manager_id
            and mp.module_key='competition.players'
            and mp.can_view=true
            and m.team_id is not null and t.active=true
          and (mp.team_id is null or mp.team_id=m.team_id)
        )
      order by p.active desc,coalesce(p.display_name,p.name),p.email
      limit 500
    )
    select coalesce(jsonb_agg(jsonb_build_object(
      'playerId',r.id,'email',r.email,'name',r.name,'displayName',r.display_name,'position',r.position,
      'jerseyNo',r.jersey_no,'jerseySize',r.jersey_size,'shortsSize',r.shorts_size,'active',r.active,
      'licenseNo',r.license_no,'medicalValidUntil',r.medical_valid_until,'avatarId',r.avatar_id,
      'teamId',r.team_id,'teamName',r.team_name,'membershipStartsOn',r.starts_on,'membershipEndsOn',r.ends_on,
      'hasAccount',(r.auth_user_id is not null),
      'trainingPresent',r.training_present,'trainingMarked',r.training_marked,
      'matchPresent',r.match_present,'matchMarked',r.match_marked
    ) order by r.active desc,coalesce(r.display_name,r.name),r.email),'[]'::jsonb)
    from rows r
  );
end;
$function$


SELECT set_config('cc.qa.manager.uid',(SELECT auth_user_id::text FROM public.manager_accounts WHERE active=true AND auth_user_id IS NOT NULL AND EXISTS(SELECT 1 FROM public.manager_module_permissions mp WHERE mp.manager_id=manager_accounts.id AND mp.module_key='competition.players' AND mp.can_view=true) LIMIT 1),true);
SELECT set_config('cc.qa.manager.email',(SELECT email FROM public.manager_accounts WHERE auth_user_id=current_setting('cc.qa.manager.uid')::uuid),true);
SELECT set_config('cc.qa.membership',(SELECT tm.id::text FROM public.team_memberships tm JOIN public.players p ON p.id=tm.player_id JOIN public.teams t ON t.id=tm.team_id WHERE p.active AND tm.active AND t.active AND tm.starts_on<=current_date AND (tm.ends_on IS NULL OR tm.ends_on>=current_date) ORDER BY tm.id LIMIT 1),true);
SELECT set_config('cc.qa.target',(SELECT tm.player_id::text FROM public.team_memberships tm WHERE tm.id=current_setting('cc.qa.membership')::uuid),true);
SELECT set_config('cc.qa.team',(SELECT tm.team_id::text FROM public.team_memberships tm WHERE tm.id=current_setting('cc.qa.membership')::uuid),true);
SELECT set_config('request.jwt.claim.sub',current_setting('cc.qa.manager.uid'),true);
SELECT set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('cc.qa.manager.uid'),'email',current_setting('cc.qa.manager.email'),'role','authenticated')::text,true);
DO $qa$ BEGIN IF current_setting('cc.qa.team',true) IS NULL THEN RAISE EXCEPTION 'QA_FIXTURE_MISSING'; END IF; END $qa$;
SET LOCAL ROLE authenticated;
DO $baseline$ BEGIN
 IF (SELECT count(*) FROM jsonb_array_elements(public.cc_manager_players_v2(null,'')) x WHERE x->>'playerId'=current_setting('cc.qa.target'))<>1 THEN RAISE EXCEPTION 'VALID_GLOBAL_DENIED'; END IF;
 IF (SELECT count(*) FROM jsonb_array_elements(public.cc_manager_players_v2(current_setting('cc.qa.team')::uuid,'')) x WHERE x->>'playerId'=current_setting('cc.qa.target'))<>1 THEN RAISE EXCEPTION 'VALID_TEAM_DENIED'; END IF;
END $baseline$;
RESET ROLE;
UPDATE public.team_memberships SET starts_on=current_date+interval '20 days' WHERE id=current_setting('cc.qa.membership')::uuid;
SET LOCAL ROLE authenticated;
DO $future$ BEGIN
 IF (SELECT count(*) FROM jsonb_array_elements(public.cc_manager_players_v2(null,'')) x WHERE x->>'playerId'=current_setting('cc.qa.target'))<>0 THEN RAISE EXCEPTION 'FUTURE_GLOBAL_LEAK'; END IF;
 IF (SELECT count(*) FROM jsonb_array_elements(public.cc_manager_players_v2(current_setting('cc.qa.team')::uuid,'')) x WHERE x->>'playerId'=current_setting('cc.qa.target'))<>0 THEN RAISE EXCEPTION 'FUTURE_TEAM_LEAK'; END IF;
END $future$;
RESET ROLE;
UPDATE public.team_memberships SET starts_on=current_date,ends_on=current_date WHERE id=current_setting('cc.qa.membership')::uuid;
SET LOCAL ROLE authenticated;
DO $boundary$ BEGIN
 IF (SELECT count(*) FROM jsonb_array_elements(public.cc_manager_players_v2(null,'')) x WHERE x->>'playerId'=current_setting('cc.qa.target'))<>1 THEN RAISE EXCEPTION 'INCLUSIVE_BOUNDARY_DENIED'; END IF;
END $boundary$;
RESET ROLE;
UPDATE public.team_memberships SET starts_on=current_date-interval '30 days',ends_on=current_date-interval '1 day' WHERE id=current_setting('cc.qa.membership')::uuid;
SET LOCAL ROLE authenticated;
DO $expired$ BEGIN
 IF (SELECT count(*) FROM jsonb_array_elements(public.cc_manager_players_v2(null,'')) x WHERE x->>'playerId'=current_setting('cc.qa.target'))<>0 THEN RAISE EXCEPTION 'EXPIRED_LEAK'; END IF;
END $expired$;
RESET ROLE;
UPDATE public.team_memberships SET starts_on=current_date-interval '1 day',ends_on=NULL,active=false WHERE id=current_setting('cc.qa.membership')::uuid;
SET LOCAL ROLE authenticated;
DO $inactive$ BEGIN
 IF (SELECT count(*) FROM jsonb_array_elements(public.cc_manager_players_v2(null,'')) x WHERE x->>'playerId'=current_setting('cc.qa.target'))<>0 THEN RAISE EXCEPTION 'INACTIVE_MEMBERSHIP_LEAK'; END IF;
END $inactive$;
RESET ROLE;
UPDATE public.team_memberships SET active=true WHERE id=current_setting('cc.qa.membership')::uuid;
UPDATE public.teams SET active=false WHERE id=current_setting('cc.qa.team')::uuid;
SET LOCAL ROLE authenticated;
DO $team_inactive$ BEGIN
 IF (SELECT count(*) FROM jsonb_array_elements(public.cc_manager_players_v2(null,'')) x WHERE x->>'playerId'=current_setting('cc.qa.target'))<>0 THEN RAISE EXCEPTION 'INACTIVE_TEAM_LEAK'; END IF;
END $team_inactive$;
RESET ROLE;
SELECT set_config('request.jwt.claim.sub','',true);
SELECT set_config('request.jwt.claims','',true);
SET LOCAL ROLE authenticated;
DO $no_auth$ BEGIN
 BEGIN PERFORM public.cc_manager_players_v2(null,'');RAISE EXCEPTION 'NO_AUTH_ALLOWED';EXCEPTION WHEN insufficient_privilege THEN NULL;END;
END $no_auth$;
RESET ROLE;
ROLLBACK;
SELECT 'PASS: #82 TEST PostgreSQL rollback matrix; effective dates, active-team, JWT, global/scoped access' result;