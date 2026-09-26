-- CLUB CONTROL / BEAC
-- MGR002 — MANAGER PARITY READ-ONLY RPC EXTENSION — PREFLIGHT
-- READ ONLY. Safe to run multiple times.

with checks as (
  select 'table'::text as object_type,'public.manager_accounts'::text as name,
         (to_regclass('public.manager_accounts') is not null) as ok,
         coalesce(to_regclass('public.manager_accounts')::text,'missing') as detail
  union all select 'table','public.manager_module_permissions',to_regclass('public.manager_module_permissions') is not null,coalesce(to_regclass('public.manager_module_permissions')::text,'missing')
  union all select 'table','public.player_settings',to_regclass('public.player_settings') is not null,coalesce(to_regclass('public.player_settings')::text,'missing')
  union all select 'column','player_settings.avatar_id',exists(select 1 from information_schema.columns where table_schema='public' and table_name='player_settings' and column_name='avatar_id'),'required for Manager roster avatars'
  union all select 'function','private.cc_manager_can_v1(text,text,uuid)',to_regprocedure('private.cc_manager_can_v1(text,text,uuid)') is not null,coalesce(to_regprocedure('private.cc_manager_can_v1(text,text,uuid)')::text,'missing')
  union all select 'function','public.cc_manager_players_v1(uuid,text)',to_regprocedure('public.cc_manager_players_v1(uuid,text)') is not null,coalesce(to_regprocedure('public.cc_manager_players_v1(uuid,text)')::text,'missing')
  union all select 'future_function','public.cc_manager_players_v2(uuid,text)',to_regprocedure('public.cc_manager_players_v2(uuid,text)') is null,coalesce(to_regprocedure('public.cc_manager_players_v2(uuid,text)')::text,'missing')
  union all select 'future_function','public.cc_manager_rsvp_matrix_v1(timestamptz,timestamptz,uuid)',to_regprocedure('public.cc_manager_rsvp_matrix_v1(timestamptz,timestamptz,uuid)') is null,coalesce(to_regprocedure('public.cc_manager_rsvp_matrix_v1(timestamptz,timestamptz,uuid)')::text,'missing')
  union all select 'future_function','public.cc_manager_calendar_v2(timestamptz,timestamptz,uuid)',to_regprocedure('public.cc_manager_calendar_v2(timestamptz,timestamptz,uuid)') is null,coalesce(to_regprocedure('public.cc_manager_calendar_v2(timestamptz,timestamptz,uuid)')::text,'missing')
  union all select 'future_function','public.cc_manager_events_v1(timestamptz,timestamptz,text,uuid)',to_regprocedure('public.cc_manager_events_v1(timestamptz,timestamptz,text,uuid)') is null,coalesce(to_regprocedure('public.cc_manager_events_v1(timestamptz,timestamptz,text,uuid)')::text,'missing')
  union all select 'future_function','public.cc_manager_event_roster_v1(uuid)',to_regprocedure('public.cc_manager_event_roster_v1(uuid)') is null,coalesce(to_regprocedure('public.cc_manager_event_roster_v1(uuid)')::text,'missing')
)
select object_type,name,ok,detail from checks order by object_type,name;
