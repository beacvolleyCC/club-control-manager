-- Applied to production 2026-10-14; read-only match change history with current RSVP aggregates.
CREATE OR REPLACE FUNCTION public.cc_manager_competition_change_audit_v1(p_limit integer DEFAULT 60)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_limit integer := greatest(1,least(coalesce(p_limit,60),100));
  v_data jsonb;
begin
  perform private.cc_manager_require_any_v1('competition.matches','view');
  select coalesce(jsonb_agg(jsonb_build_object(
      'id',x.id,
      'eventId',x.event_id,
      'sourceMatchKey',x.source_match_key,
      'teamId',x.internal_team_id,
      'changeType',x.change_type,
      'detectedAt',x.detected_at,
      'acknowledgedAt',x.acknowledged_at,
      'before',jsonb_build_object('title',x.before_data->>'title','startsAt',x.before_data->>'starts_at','venue',x.before_data->>'venue','status',x.before_data->>'status'),
      'after',jsonb_build_object('title',x.after_data->>'title','startsAt',x.after_data->>'starts_at','venue',x.after_data->>'venue','status',x.after_data->>'status'),
      'eventExists',x.event_exists,
      'responses',jsonb_build_object('total',x.responses,'going',x.going,'notGoing',x.not_going,'unknown',x.unknown)
    ) order by x.detected_at desc,x.id desc),'[]'::jsonb)
  into v_data
  from (
    select c.id,c.source_match_key,c.internal_team_id,c.event_id,c.change_type,c.detected_at,c.acknowledged_at,c.before_data,c.after_data,
           (e.id is not null) event_exists,
           coalesce(a.total,0) responses,coalesce(a.going,0) going,
           coalesce(a.not_going,0) not_going,coalesce(a.unknown,0) unknown
    from public.competition_source_changes c
    left join public.events e on e.id=c.event_id
    left join lateral (
      select count(*)::integer total,
             count(*) filter (where status='going')::integer going,
             count(*) filter (where status='not_going')::integer not_going,
             count(*) filter (where status not in ('going','not_going'))::integer unknown
      from public.availability a where a.event_id=c.event_id
    ) a on true
    order by c.detected_at desc,c.id desc
    limit v_limit
  ) x;
  return v_data;
end
$function$

revoke all on function public.cc_manager_competition_change_audit_v1(integer) from public, anon;
grant execute on function public.cc_manager_competition_change_audit_v1(integer) to authenticated;
