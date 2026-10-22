-- Phase 2: privileged read only feed lookup, NOT deployed.
-- Returns only event details needed by an ICS client, never bookings/rosters.
begin;
create or replace function public.cc_calendar_feed_read_v1(p_token_sha256 text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v private.cc_calendar_feed_tokens_v1%rowtype;
  v_events jsonb;
begin
  if p_token_sha256 is null or p_token_sha256 !~ '^[0-9a-f]{64}$' then return null; end if;
  select * into v
    from private.cc_calendar_feed_tokens_v1 t
    where t.token_sha256=p_token_sha256 and t.revoked_at is null;
  if not found then return null; end if;
  if not exists (
    select 1 from public.players p
    where p.id=v.player_id and p.auth_user_id=v.auth_user_id and p.active is true
  ) then return null; end if;
  -- A deleted, anonymous or suspended account cannot keep using a leaked URL.
  if not exists (
    select 1 from auth.users u
    where u.id=v.auth_user_id
      and u.deleted_at is null
      and u.is_anonymous is not true
      and (u.banned_until is null or u.banned_until <= now())
  ) then return null; end if;
  if v.scope='team' and not exists (
    select 1 from public.team_memberships m
    where m.player_id=v.player_id and m.team_id=v.team_id
      and m.active is true and m.starts_on <= (now() AT TIME ZONE 'Europe/Budapest')::date
      and (m.ends_on is null or m.ends_on >= (now() AT TIME ZONE 'Europe/Budapest')::date)
  ) then return null; end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'id',e.id,'title',e.title,'type',e.event_type,
    'start',e.starts_at,'end',e.ends_at,
    'venue',e.venue,'address',e.address,'court',e.court,
    'status',e.status,'updatedAt',e.updated_at,'createdAt',e.created_at
  ) order by e.starts_at,e.id),'[]'::jsonb)
  into v_events
  from public.events e
  where e.event_type in ('training','match')
    and (
      (v.scope='team' and e.team_id=v.team_id)
      or
      (v.scope='mine' and exists (
        select 1 from public.availability a
        where a.event_id=e.id and a.player_id=v.player_id
          and a.status='going'
      ))
    );
  return jsonb_build_object('events',v_events);
end
$$;
revoke all on function public.cc_calendar_feed_read_v1(text) from public,anon,authenticated;
grant execute on function public.cc_calendar_feed_read_v1(text) to service_role;
commit;
