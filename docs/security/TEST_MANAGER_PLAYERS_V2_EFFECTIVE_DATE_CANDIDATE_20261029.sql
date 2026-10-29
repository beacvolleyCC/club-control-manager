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

