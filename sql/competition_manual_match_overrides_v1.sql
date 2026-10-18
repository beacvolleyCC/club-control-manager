-- Club Control · source-preserving competition match manual corrections
-- Staged migration: NO source table changes, NO existing production match rows rewritten.
-- Apply only before enabling the matching UI / v2 readers.
create table if not exists public.cc_competition_match_overrides_v1 (
  source_system text not null check (source_system in ('snapshot','brsz')),
  season text not null,
  source_key text not null,
  patch jsonb not null check (jsonb_typeof(patch)='object'),
  version integer not null default 1 check (version>0),
  updated_by uuid not null references public.manager_accounts(id),
  updated_at timestamptz not null default now(),
  primary key (source_system,season,source_key)
);
alter table public.cc_competition_match_overrides_v1 enable row level security;
revoke all on public.cc_competition_match_overrides_v1 from public, anon, authenticated;

create table if not exists public.cc_competition_match_override_audit_v1 (
  audit_id bigint generated always as identity primary key,
  source_system text not null,
  season text not null,
  source_key text not null,
  action text not null check (action in ('save','reset')),
  old_patch jsonb,
  new_patch jsonb,
  old_version integer not null,
  new_version integer not null,
  actor_manager_id uuid not null references public.manager_accounts(id),
  happened_at timestamptz not null default now()
);
alter table public.cc_competition_match_override_audit_v1 enable row level security;
revoke all on public.cc_competition_match_override_audit_v1 from public, anon, authenticated;

create or replace function private.cc_competition_match_source_v1(p_system text,p_season text,p_key text)
returns jsonb language plpgsql stable security invoker set search_path = '' as $function$
declare v jsonb;
begin
  if p_system='snapshot' then
    select s.data into v from public.cc_competition_mrsz_screenshot_v1 s
    where s.season=p_season and s.source_key=p_key and s.record_kind in ('fixture','match');
  elsif p_system='brsz' then
    select jsonb_build_object(
      'season',s.season,'source',s.source,'sourceMatchKey',s.source_match_key,
      'competitionLabel',(select m.competition_label from public.competition_source_team_maps m
        where m.source=s.source and m.season=s.season and m.internal_team_id=s.internal_team_id
        order by m.enabled desc limit 1),
      'homeName',s.home_name,'awayName',s.away_name,'startsAt',s.starts_at,
      'venue',s.venue,'homeSets',s.home_sets,'awaySets',s.away_sets,
      'setScores',coalesce(s.set_scores,'[]'::jsonb),'status',s.source_status,
      'sourceUrl',s.source_url
    ) into v
    from public.competition_source_matches s
    where s.source='brsz' and s.season=p_season and s.source_match_key=p_key;
  else
    raise exception 'MATCH_SOURCE_INVALID' using errcode='22023';
  end if;
  if v is null then raise exception 'MATCH_SOURCE_NOT_FOUND' using errcode='22023'; end if;
  return v;
end;
$function$;

create or replace function private.cc_competition_match_patch_validate_v1(p_base jsonb,p_patch jsonb)
returns jsonb language plpgsql stable security invoker set search_path = '' as $function$
declare
  v_key text; v jsonb; v_h integer; v_a integer; v_sets jsonb;
  v_set jsonb; v_sh integer; v_sa integer; v_homewins integer:=0; v_awaywins integer:=0;
  v_time timestamptz;
begin
  if p_patch is null or jsonb_typeof(p_patch)<>'object' or p_patch='{}'::jsonb
  then raise exception 'MATCH_PATCH_INVALID' using errcode='22023'; end if;
  for v_key in select jsonb_object_keys(p_patch) loop
    if v_key not in ('homeName','awayName','startsAt','venue','homeSets','awaySets','setScores','status')
    then raise exception 'MATCH_FIELD_NOT_EDITABLE:%',v_key using errcode='22023'; end if;
  end loop;
  v:=p_base||p_patch;
  if length(btrim(coalesce(v->>'homeName',''))) not between 1 and 160
    or length(btrim(coalesce(v->>'awayName',''))) not between 1 and 160
  then raise exception 'MATCH_TEAMS_REQUIRED' using errcode='22023'; end if;
  if lower(btrim(v->>'homeName'))=lower(btrim(v->>'awayName'))
  then raise exception 'MATCH_TEAMS_MUST_DIFFER' using errcode='22023'; end if;
  if jsonb_typeof(v->'startsAt')<>'string' or
     (v->>'startsAt') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}'
  then raise exception 'MATCH_START_INVALID' using errcode='22023'; end if;
  begin v_time:=(v->>'startsAt')::timestamptz;
  exception when others then raise exception 'MATCH_START_INVALID' using errcode='22023'; end;
  if v_time<'2010-01-01'::timestamptz or v_time>'2100-01-01'::timestamptz
  then raise exception 'MATCH_START_OUT_OF_RANGE' using errcode='22023'; end if;
  if jsonb_typeof(v->'venue') not in ('string','null') or length(coalesce(v->>'venue',''))>300
  then raise exception 'MATCH_VENUE_INVALID' using errcode='22023'; end if;
  if v ? 'status' and jsonb_typeof(v->'status') not in ('string','null')
  then raise exception 'MATCH_STATUS_INVALID' using errcode='22023'; end if;
  if (v->>'status') is not null and lower(v->>'status') not in
     ('scheduled','played','completed','postponed','cancelled','canceled','pending')
  then raise exception 'MATCH_STATUS_INVALID' using errcode='22023'; end if;
  if (v->'homeSets'='null'::jsonb) <> (v->'awaySets'='null'::jsonb)
  then raise exception 'MATCH_PARTIAL_RESULT' using errcode='22023'; end if;
  if jsonb_typeof(v->'homeSets')='null' and jsonb_typeof(v->'awaySets')='null' then
    v_h:=null; v_a:=null;
  else
    if jsonb_typeof(v->'homeSets')<>'number' or jsonb_typeof(v->'awaySets')<>'number'
      or (v->>'homeSets') !~ '^[0-3]$' or (v->>'awaySets') !~ '^[0-3]$'
    then raise exception 'MATCH_RESULT_INVALID' using errcode='22023'; end if;
    v_h:=(v->>'homeSets')::int;v_a:=(v->>'awaySets')::int;
    if greatest(v_h,v_a)<>3 or least(v_h,v_a)>2
    then raise exception 'MATCH_RESULT_INVALID' using errcode='22023'; end if;
  end if;
  v_sets:=coalesce(v->'setScores','[]'::jsonb);
  if jsonb_typeof(v_sets)<>'array' then raise exception 'MATCH_SETS_INVALID' using errcode='22023'; end if;
  if jsonb_array_length(v_sets)>5 or (v_h is null and jsonb_array_length(v_sets)>0)
  then raise exception 'MATCH_SETS_INVALID' using errcode='22023'; end if;
  for v_set in select value from jsonb_array_elements(v_sets) loop
    if jsonb_typeof(v_set)<>'object' or jsonb_typeof(v_set->'home')<>'number'
      or jsonb_typeof(v_set->'away')<>'number'
      or (v_set->>'home') !~ '^[0-9]{1,2}$' or (v_set->>'away') !~ '^[0-9]{1,2}$'
    then raise exception 'MATCH_SET_POINTS_INVALID' using errcode='22023'; end if;
    v_sh:=(v_set->>'home')::int;v_sa:=(v_set->>'away')::int;
    if v_sh=v_sa then raise exception 'MATCH_SET_TIE_INVALID' using errcode='22023'; end if;
    v_homewins:=v_homewins+(v_sh>v_sa)::int;
    v_awaywins:=v_awaywins+(v_sa>v_sh)::int;
  end loop;
  if v_h is not null and (v_homewins>v_h or v_awaywins>v_a or
     jsonb_array_length(v_sets)>v_h+v_a or
     (jsonb_array_length(v_sets)=v_h+v_a and (v_homewins<>v_h or v_awaywins<>v_a)))
  then raise exception 'MATCH_SETS_SCORE_MISMATCH' using errcode='22023'; end if;
  return v;
end;
$function$;

create or replace function public.cc_manager_competition_match_override_save_v1(
 p_source_system text,p_season text,p_source_key text,p_patch jsonb,p_expected_version integer default 0
) returns jsonb language plpgsql security definer set search_path='' as $function$
declare
 v_actor uuid;v_base jsonb;v_old public.cc_competition_match_overrides_v1%rowtype;
 v_patch jsonb;v_new_version integer;v_effective jsonb;
begin
 v_actor:=private.cc_manager_require_any_v1('competition.matches','edit');
 if coalesce(length(p_source_key),0)<1 or coalesce(length(p_source_key),0)>250
   or coalesce(length(p_season),0)<4 or coalesce(length(p_season),0)>20
   or p_expected_version<0
 then raise exception 'MATCH_IDENTITY_INVALID' using errcode='22023'; end if;
 v_base:=private.cc_competition_match_source_v1(p_source_system,p_season,p_source_key);
 select * into v_old from public.cc_competition_match_overrides_v1
  where source_system=p_source_system and season=p_season and source_key=p_source_key for update;
 if coalesce(v_old.version,0)<>p_expected_version
 then raise exception 'MATCH_VERSION_CONFLICT' using errcode='40001'; end if;
 v_patch:=coalesce(v_old.patch,'{}'::jsonb)||p_patch;
 v_effective:=private.cc_competition_match_patch_validate_v1(v_base,v_patch);
 v_new_version:=p_expected_version+1;
 if v_old.version is null then
   insert into public.cc_competition_match_overrides_v1
     (source_system,season,source_key,patch,version,updated_by)
   values(p_source_system,p_season,p_source_key,v_patch,1,v_actor);
 else
   update public.cc_competition_match_overrides_v1 set
    patch=v_patch,version=v_new_version,updated_by=v_actor,updated_at=now()
   where source_system=p_source_system and season=p_season and source_key=p_source_key;
 end if;
 insert into public.cc_competition_match_override_audit_v1
 (source_system,season,source_key,action,old_patch,new_patch,old_version,new_version,actor_manager_id)
 values(p_source_system,p_season,p_source_key,'save',v_old.patch,v_patch,p_expected_version,v_new_version,v_actor);
 return v_effective||jsonb_build_object('_ccSourceSystem',p_source_system,
  '_ccSourceKey',p_source_key,'_ccOverrideVersion',v_new_version,'_ccManualOverride',true);
end;
$function$;

create or replace function public.cc_manager_competition_match_override_reset_v1(
 p_source_system text,p_season text,p_source_key text,p_expected_version integer
) returns jsonb language plpgsql security definer set search_path='' as $function$
declare v_actor uuid;v_base jsonb;v_old public.cc_competition_match_overrides_v1%rowtype;
begin
 v_actor:=private.cc_manager_require_any_v1('competition.matches','edit');
 v_base:=private.cc_competition_match_source_v1(p_source_system,p_season,p_source_key);
 select * into v_old from public.cc_competition_match_overrides_v1
 where source_system=p_source_system and season=p_season and source_key=p_source_key for update;
 if v_old.version is null or v_old.version<>p_expected_version
 then raise exception 'MATCH_VERSION_CONFLICT' using errcode='40001'; end if;
 delete from public.cc_competition_match_overrides_v1
 where source_system=p_source_system and season=p_season and source_key=p_source_key;
 insert into public.cc_competition_match_override_audit_v1
 (source_system,season,source_key,action,old_patch,new_patch,old_version,new_version,actor_manager_id)
 values(p_source_system,p_season,p_source_key,'reset',v_old.patch,null,p_expected_version,0,v_actor);
 return v_base||jsonb_build_object('_ccSourceSystem',p_source_system,'_ccSourceKey',p_source_key,
  '_ccOverrideVersion',0,'_ccManualOverride',false);
end;
$function$;

create or replace function private.cc_competition_snapshot_effective_rows_v1(p_kind text)
returns jsonb language sql stable security invoker set search_path='' as $function$
select coalesce(jsonb_agg(
 s.data || coalesce(o.patch,'{}'::jsonb) ||
 jsonb_build_object('_ccSourceSystem','snapshot','_ccSourceKey',s.source_key,
  '_ccSourceKind',s.record_kind,'_ccOverrideVersion',coalesce(o.version,0),
  '_ccManualOverride',o.version is not null)
 order by s.data->>'startsAt',s.source_key),'[]'::jsonb)
from public.cc_competition_mrsz_screenshot_v1 s
left join public.cc_competition_match_overrides_v1 o on
  o.source_system='snapshot' and o.season=s.season and o.source_key=s.source_key
where s.record_kind=p_kind and p_kind in ('fixture','match');
$function$;

create or replace function public.cc_manager_competition_mrsz_snapshot_v2()
returns jsonb language plpgsql stable security definer set search_path='' as $function$
declare v jsonb;
begin
 v:=public.cc_manager_competition_mrsz_snapshot_v1();
 return v||jsonb_build_object(
  'fixtures',private.cc_competition_snapshot_effective_rows_v1('fixture'),
  'matches',private.cc_competition_snapshot_effective_rows_v1('match'));
end;
$function$;

create or replace function public.cc_player_competition_mrsz_snapshot_v2()
returns jsonb language plpgsql stable security definer set search_path='' as $function$
declare v jsonb;
begin
 v:=public.cc_player_competition_mrsz_snapshot_v1();
 return v||jsonb_build_object(
  'fixtures',private.cc_competition_snapshot_effective_rows_v1('fixture'),
  'matches',private.cc_competition_snapshot_effective_rows_v1('match'));
end;
$function$;

-- Returns both scheduled and played BRSZ source records and effective admin corrections.
-- This does not rewrite internal events or official standings; consumers decide how to
-- merge them with separately captured screenshot evidence.
create or replace function public.cc_manager_competition_source_matches_effective_v1()
returns jsonb language plpgsql stable security definer set search_path='' as $function$
declare v_rows jsonb;
begin
 perform private.cc_manager_require_any_v1('competition.matches','view');
 select coalesce(jsonb_agg(
  jsonb_build_object('source',s.source,'season',s.season,'sourceMatchKey',s.source_match_key,
   'competitionLabel',m.competition_label,'homeName',s.home_name,'awayName',s.away_name,
   'startsAt',s.starts_at,'venue',s.venue,'homeSets',s.home_sets,'awaySets',s.away_sets,
   'setScores',coalesce(s.set_scores,'[]'::jsonb),'status',s.source_status,'sourceUrl',s.source_url)
  ||coalesce(o.patch,'{}'::jsonb)||
   jsonb_build_object('_ccSourceSystem','brsz','_ccSourceKey',s.source_match_key,
   '_ccOverrideVersion',coalesce(o.version,0),'_ccManualOverride',o.version is not null)
  order by s.starts_at,s.source_match_key),'[]'::jsonb) into v_rows
 from public.competition_source_matches s
 left join public.competition_source_team_maps m on
   m.source=s.source and m.season=s.season and m.internal_team_id=s.internal_team_id and m.enabled=true
 left join public.cc_competition_match_overrides_v1 o on
   o.source_system='brsz' and o.season=s.season and o.source_key=s.source_match_key
 where s.source='brsz';
 return v_rows;
end;
$function$;

revoke all on function public.cc_manager_competition_match_override_save_v1(text,text,text,jsonb,integer)
 from public, anon, authenticated;
revoke all on function public.cc_manager_competition_match_override_reset_v1(text,text,text,integer)
 from public, anon, authenticated;
revoke all on function public.cc_manager_competition_mrsz_snapshot_v2()
 from public, anon, authenticated;
revoke all on function public.cc_player_competition_mrsz_snapshot_v2()
 from public, anon, authenticated;
revoke all on function public.cc_manager_competition_source_matches_effective_v1()
 from public, anon, authenticated;
grant execute on function public.cc_manager_competition_match_override_save_v1(text,text,text,jsonb,integer) to authenticated;
grant execute on function public.cc_manager_competition_match_override_reset_v1(text,text,text,integer) to authenticated;
grant execute on function public.cc_manager_competition_mrsz_snapshot_v2() to authenticated;
grant execute on function public.cc_player_competition_mrsz_snapshot_v2() to authenticated;
grant execute on function public.cc_manager_competition_source_matches_effective_v1() to authenticated;
