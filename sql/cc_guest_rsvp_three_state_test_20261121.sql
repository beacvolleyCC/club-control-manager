-- Club Control guest 3-position RSVP (TEST-only as of 2026-11-21).
-- Matches the Player and Manager: Jövök / Nincs jelzés / Nem jövök.
create or replace function public.cc_guest_rsvp_v1(p_token text,p_event_id uuid,p_status text)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $$
declare v_player uuid; v_found boolean;
begin
  if p_status is null or p_status not in ('going','unknown','not_going') then
    raise exception 'INVALID_GUEST_RSVP_STATUS' using errcode='22023';
  end if;
  v_player:=private.cc_guest_session_player_v1(p_token);
  select true into v_found from public.events e
  join public.teams t on t.id=e.team_id and t.active
  join public.cc_guest_team_access_v1 ga on ga.team_id=e.team_id and ga.player_id=v_player
  where e.id=p_event_id and e.event_type='training' and e.status='active'
    and e.starts_at>now()
    and (e.starts_at at time zone 'Europe/Budapest')::date>=date_trunc('week',now() at time zone 'Europe/Budapest')::date
    and (e.starts_at at time zone 'Europe/Budapest')::date<date_trunc('week',now() at time zone 'Europe/Budapest')::date+7;
  if not coalesce(v_found,false) then
    raise exception 'GUEST_TRAINING_NOT_AVAILABLE' using errcode='42501';
  end if;
  insert into public.availability(event_id,player_id,status,updated_at)
  values(p_event_id,v_player,p_status,now())
  on conflict(event_id,player_id) do update
  set status=excluded.status,updated_at=now();
  return jsonb_build_object('ok',true,'eventId',p_event_id,'status',p_status);
end $$;
revoke all on function public.cc_guest_rsvp_v1(text,uuid,text) from public,anon,authenticated;
grant execute on function public.cc_guest_rsvp_v1(text,uuid,text) to anon,authenticated;
