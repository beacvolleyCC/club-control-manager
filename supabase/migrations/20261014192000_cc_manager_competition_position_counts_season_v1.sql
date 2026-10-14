-- Applied in Supabase production. Read-only season position totals; no RSVP or identity writes.
CREATE OR REPLACE FUNCTION public.cc_manager_competition_position_counts_v1(p_from timestamp with time zone, p_to timestamp with time zone)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_manager_id uuid;
  v_result jsonb;
begin
  if p_from is null or p_to is null or p_to<=p_from
     or p_to-p_from>interval '400 days' then
    raise exception 'MANAGER_POSITION_RANGE_INVALID';
  end if;

  v_manager_id:=private.cc_manager_require_any_v1('competition.overview','view');

  with event_players as (
    select e.id as event_id, a.player_id,
      case
        when a.player_id is null then null
        when translate(lower(coalesce(p.position,'')),'áéíóöőúüű','aeiooouuu') like '%felado%' then 'f'
        when translate(lower(coalesce(p.position,'')),'áéíóöőúüű','aeiooouuu') like '%szelso%' then 'sz'
        when translate(lower(coalesce(p.position,'')),'áéíóöőúüű','aeiooouuu') like '%center%' or lower(coalesce(p.position,'')) like '%centre%' then 'c'
        when translate(lower(coalesce(p.position,'')),'áéíóöőúüű','aeiooouuu') like '%atlo%' then 'a'
        when translate(lower(coalesce(p.position,'')),'áéíóöőúüű','aeiooouuu') like '%libero%' then 'l'
        else '?'
      end as role
    from public.events e
    left join public.availability a on a.event_id=e.id and a.status='going'
    left join public.players p on p.id=a.player_id
    where e.starts_at>=p_from and e.starts_at<p_to
      and e.status<>'cancelled' and e.event_type in ('match','training')
      and exists (
        select 1 from public.manager_module_permissions mp
        where mp.manager_id=v_manager_id and mp.module_key='competition.overview'
          and mp.can_view=true
          and (mp.team_id is null or mp.team_id=e.team_id)
      )
  ), totals as (
    select event_id,
      count(*) filter(where role='f')::integer as f,
      count(*) filter(where role='sz')::integer as sz,
      count(*) filter(where role='c')::integer as c,
      count(*) filter(where role='a')::integer as a,
      count(*) filter(where role='l')::integer as l,
      count(*) filter(where role='?')::integer as unknown,
      count(player_id)::integer as going
    from event_players group by event_id
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'eventId',event_id,'f',f,'sz',sz,'c',c,'a',a,'l',l,'unknown',unknown,'going',going
  ) order by event_id),'[]'::jsonb) into v_result from totals;
  return v_result;
end
$function$

revoke all on function public.cc_manager_competition_position_counts_v1(timestamptz,timestamptz) from public, anon;
grant execute on function public.cc_manager_competition_position_counts_v1(timestamptz,timestamptz) to authenticated;
