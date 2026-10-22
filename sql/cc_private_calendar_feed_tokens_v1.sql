-- CC private Apple Calendar: phase 1 (NOT deployed to LIVE)
-- No existing event, booking, or membership rows are modified.
begin;
create table if not exists private.cc_calendar_feed_tokens_v1 (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  auth_user_id uuid not null,
  scope text not null check (scope in ('mine','team')),
  team_id uuid references public.teams(id),
  token_sha256 text not null unique check (token_sha256 ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  last_access_at timestamptz,
  constraint cc_calendar_scope_team_ck check (
    (scope = 'mine' and team_id is null) or
    (scope = 'team' and team_id is not null)
  )
);
create unique index if not exists cc_calendar_tokens_one_active_scope_v1
  on private.cc_calendar_feed_tokens_v1 (player_id,scope,coalesce(team_id,'00000000-0000-0000-0000-000000000000'::uuid))
  where revoked_at is null;
create index if not exists cc_calendar_tokens_subject_v1
  on private.cc_calendar_feed_tokens_v1 (auth_user_id, revoked_at);
alter table private.cc_calendar_feed_tokens_v1 enable row level security;
revoke all on private.cc_calendar_feed_tokens_v1 from public,anon,authenticated;
-- Only a personally authenticated athlete may mint and revoke the subscription URL.
-- Rotation is transactional: previous token is revoked before a new URL is issued.
create or replace function public.cc_player_calendar_token_rotate_v1(
  p_scope text,
  p_team_id uuid default null
) returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_player_id uuid;
  v_token text;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if p_scope is null or p_scope not in ('mine','team')
     or (p_scope = 'mine' and p_team_id is not null)
     or (p_scope = 'team' and p_team_id is null)
  then raise exception 'INVALID_SCOPE'; end if;
  select p.id into v_player_id
    from public.players p
    where p.auth_user_id = v_uid and p.active is true
    order by p.id limit 1;
  if v_player_id is null then raise exception 'PLAYER_REQUIRED'; end if;
  if p_scope = 'team' and not exists (
    select 1 from public.team_memberships m
    where m.player_id = v_player_id and m.team_id = p_team_id
      and m.active is true
      and m.starts_on <= (now() at time zone 'Europe/Budapest')::date
      and (m.ends_on is null or m.ends_on >= (now() at time zone 'Europe/Budapest')::date)
  ) then raise exception 'TEAM_MEMBERSHIP_REQUIRED'; end if;
  -- Serialize rotations for a player+scope+team, also across concurrent devices.
  perform pg_advisory_xact_lock(hashtextextended(v_player_id::text||':'||p_scope||':'||coalesce(p_team_id::text,''),0));
  update private.cc_calendar_feed_tokens_v1 set revoked_at = now()
    where player_id = v_player_id and scope = p_scope
      and team_id is not distinct from p_team_id and revoked_at is null;
  v_token := encode(extensions.gen_random_bytes(32),'hex');
  insert into private.cc_calendar_feed_tokens_v1
    (player_id, auth_user_id, scope, team_id, token_sha256)
  values (v_player_id, v_uid, p_scope, p_team_id,
          encode(extensions.digest(v_token,'sha256'),'hex'));
  -- The raw bearer token is returned only here; never stored in the database.
  return jsonb_build_object('token',v_token,'scope',p_scope,'teamId',p_team_id);
end
$$;
revoke all on function public.cc_player_calendar_token_rotate_v1(text,uuid) from public,anon;
grant execute on function public.cc_player_calendar_token_rotate_v1(text,uuid) to authenticated;
create or replace function public.cc_player_calendar_token_revoke_v1(
  p_scope text, p_team_id uuid default null
) returns boolean
language plpgsql security definer
set search_path = ''
as $$
declare v_uid uuid := (select auth.uid());
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if p_scope is null or p_scope not in ('mine','team')
     or (p_scope = 'mine' and p_team_id is not null)
     or (p_scope = 'team' and p_team_id is null)
  then raise exception 'INVALID_SCOPE'; end if;
  update private.cc_calendar_feed_tokens_v1
     set revoked_at=now()
   where auth_user_id=v_uid and scope=p_scope
     and team_id is not distinct from p_team_id and revoked_at is null;
  return found;
end
$$;
revoke all on function public.cc_player_calendar_token_revoke_v1(text,uuid) from public,anon;
grant execute on function public.cc_player_calendar_token_revoke_v1(text,uuid) to authenticated;
-- Return subscription state only. A raw token is deliberately never retrievable.
create or replace function public.cc_player_calendar_token_status_v1(
  p_scope text, p_team_id uuid default null
) returns jsonb language plpgsql security definer
set search_path = ''
as $$
declare v_uid uuid := (select auth.uid()); v_player_id uuid;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if p_scope is null or p_scope not in ('mine','team')
    or (p_scope='mine' and p_team_id is not null)
    or (p_scope='team' and p_team_id is null)
  then raise exception 'INVALID_SCOPE'; end if;
  select id into v_player_id from public.players
    where auth_user_id=v_uid and active is true order by id limit 1;
  if v_player_id is null then raise exception 'PLAYER_REQUIRED'; end if;
  return jsonb_build_object('active',exists(
    select 1 from private.cc_calendar_feed_tokens_v1
    where player_id=v_player_id and auth_user_id=v_uid
      and scope=p_scope and team_id is not distinct from p_team_id
      and revoked_at is null
  ));
end
$$;
revoke all on function public.cc_player_calendar_token_status_v1(text,uuid) from public,anon;
grant execute on function public.cc_player_calendar_token_status_v1(text,uuid) to authenticated;
commit;
