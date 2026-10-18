-- BEAC pre-match meeting logistics and optional Player-visible notes.
-- This is *not* the BRSZ federation record. Never use these values to change scores.
create table if not exists public.cc_competition_match_arrangements_v1(
 source_system text not null check(source_system in ('snapshot','brsz','user')),
 season text not null,
 source_key text not null,
 meeting_at timestamptz,
 meeting_place text,
 player_note text,
 version integer not null default 1 check(version>0),
 updated_by uuid not null references public.manager_accounts(id),
 updated_at timestamptz not null default now(),
 primary key(source_system,season,source_key),
 check(length(coalesce(meeting_place,''))<=300),
 check(length(coalesce(player_note,''))<=1000)
);
alter table public.cc_competition_match_arrangements_v1 enable row level security;
revoke all on public.cc_competition_match_arrangements_v1 from public,anon,authenticated;

create or replace function private.cc_competition_match_arrangement_defaults_v1(
 p_system text,p_season text,p_source_key text,p_starts timestamptz,
 p_home text,p_away text,p_venue text,p_league text
) returns jsonb language plpgsql stable security invoker set search_path='' as $function$
declare
  v_home boolean:=lower(coalesce(p_home,'')) ~ '^beac([ .]|$)';
  v_away boolean:=lower(coalesce(p_away,'')) ~ '^beac([ .]|$)';
  v_court text;
  v_meet timestamptz;
  v_place text;
  v_saved public.cc_competition_match_arrangements_v1%rowtype;
begin
  if not (v_home or v_away) then return '{}'::jsonb; end if;
  v_court:=case when p_league='Női Budapest II. osztály – B csoport' then '2. pálya'
    else '3. pálya' end;
  if v_home and p_starts is not null then
    v_meet:=((p_starts at time zone 'Europe/Budapest')::date+'18:30'::time) at time zone 'Europe/Budapest';
  elsif v_away then
    v_meet:=p_starts-interval '1 hour';
  end if;
  v_place:=case when v_home then 'Bogdánfy csarnok · '||v_court
    else nullif(trim(coalesce(p_venue,'')),'') end;
  select * into v_saved from public.cc_competition_match_arrangements_v1
  where source_system=p_system and season=p_season and source_key=p_source_key;
  return jsonb_build_object(
    'meetingAt',coalesce(v_saved.meeting_at,v_meet),
    'meetingPlace',coalesce(v_saved.meeting_place,v_place),
    'playerNote',nullif(trim(coalesce(v_saved.player_note,'')),''),
    '_ccArrangementVersion',coalesce(v_saved.version,0),
    '_ccHasMeetingOverride',v_saved.version is not null);
end;
$function$;

create or replace function public.cc_manager_competition_match_arrangement_save_v1(
 p_source_system text,p_season text,p_source_key text,
 p_meeting_at timestamptz,p_meeting_place text,p_player_note text,
 p_expected_version integer default 0
) returns jsonb language plpgsql security definer set search_path='' as $function$
declare
 v_actor uuid;v_old public.cc_competition_match_arrangements_v1%rowtype;
 v_base jsonb;v_name text;v_starts timestamptz;v_next integer;
begin
 v_actor:=private.cc_manager_require_v1('competition.matches','edit',null);
 v_base:=private.cc_competition_match_source_v1(p_source_system,p_season,p_source_key);
 if lower(coalesce(v_base->>'homeName','')) !~ '^beac([ .]|$)'
    and lower(coalesce(v_base->>'awayName','')) !~ '^beac([ .]|$)'
 then raise exception 'ARRANGEMENTS_REQUIRE_BEAC_MATCH' using errcode='22023'; end if;
 if p_expected_version is null or p_expected_version<0
 then raise exception 'ARRANGEMENT_VERSION_INVALID' using errcode='22023'; end if;
 if length(coalesce(p_meeting_place,''))>300 or length(coalesce(p_player_note,''))>1000
 then raise exception 'ARRANGEMENTS_TOO_LONG' using errcode='22023'; end if;
 -- User fixture has an exact kickoff. Other source systems may use local offset
 -- stamps, whose cast is timezone dependent; compare only known offset-aware values.
 if p_meeting_at is not null and (v_base->>'startsAt') ~
     '(Z|[+-][0-9]{2}:[0-9]{2})$' then
   v_starts:=(v_base->>'startsAt')::timestamptz;
   if p_meeting_at>v_starts
   then raise exception 'MEETING_AFTER_KICKOFF' using errcode='22023'; end if;
 end if;
 select * into v_old from public.cc_competition_match_arrangements_v1
  where source_system=p_source_system and season=p_season and source_key=p_source_key for update;
 if coalesce(v_old.version,0)<>p_expected_version
 then raise exception 'ARRANGEMENT_VERSION_CONFLICT' using errcode='40001'; end if;
 v_next:=p_expected_version+1;
 insert into public.cc_competition_match_arrangements_v1(
   source_system,season,source_key,meeting_at,meeting_place,player_note,version,updated_by)
 values(p_source_system,p_season,p_source_key,p_meeting_at,
   nullif(trim(coalesce(p_meeting_place,'')),''),
   nullif(trim(coalesce(p_player_note,'')),''),v_next,v_actor)
 on conflict(source_system,season,source_key)
 do update set meeting_at=excluded.meeting_at,meeting_place=excluded.meeting_place,
 player_note=excluded.player_note,version=excluded.version,updated_by=excluded.updated_by,updated_at=now();
 -- Standard Manager audit log (no player notification on save by itself).
 perform private.cc_manager_audit(
    (select email from public.manager_accounts where id=v_actor),
    'manager_update_match_arrangements','competition_match',
    p_source_system||':'||p_season||':'||p_source_key,
    to_jsonb(v_old),jsonb_build_object('meetingAt',p_meeting_at,
      'meetingPlace',p_meeting_place,'playerNote',p_player_note,'version',v_next));
 return jsonb_build_object('meetingAt',p_meeting_at,'meetingPlace',p_meeting_place,
   'playerNote',nullif(trim(coalesce(p_player_note,'')),''),'_ccArrangementVersion',v_next);
end;
$function$;

revoke all on function public.cc_manager_competition_match_arrangement_save_v1(
 text,text,text,timestamptz,text,text,integer) from public,anon,authenticated;
grant execute on function public.cc_manager_competition_match_arrangement_save_v1(
 text,text,text,timestamptz,text,text,integer) to authenticated;
