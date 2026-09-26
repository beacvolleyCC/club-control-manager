-- MGR002 post-install QA — READ ONLY
with checks as (
  select 'function'::text object_type,'public.cc_manager_players_v2(uuid,text)'::text name,
         to_regprocedure('public.cc_manager_players_v2(uuid,text)') is not null as ok,
         coalesce(to_regprocedure('public.cc_manager_players_v2(uuid,text)')::text,'missing') detail
  union all select 'function','public.cc_manager_rsvp_matrix_v1(timestamptz,timestamptz,uuid)',to_regprocedure('public.cc_manager_rsvp_matrix_v1(timestamptz,timestamptz,uuid)') is not null,coalesce(to_regprocedure('public.cc_manager_rsvp_matrix_v1(timestamptz,timestamptz,uuid)')::text,'missing')
  union all select 'function','public.cc_manager_calendar_v2(timestamptz,timestamptz,uuid)',to_regprocedure('public.cc_manager_calendar_v2(timestamptz,timestamptz,uuid)') is not null,coalesce(to_regprocedure('public.cc_manager_calendar_v2(timestamptz,timestamptz,uuid)')::text,'missing')
  union all select 'function','public.cc_manager_events_v1(timestamptz,timestamptz,text,uuid)',to_regprocedure('public.cc_manager_events_v1(timestamptz,timestamptz,text,uuid)') is not null,coalesce(to_regprocedure('public.cc_manager_events_v1(timestamptz,timestamptz,text,uuid)')::text,'missing')
  union all select 'function','public.cc_manager_event_roster_v1(uuid)',to_regprocedure('public.cc_manager_event_roster_v1(uuid)') is not null,coalesce(to_regprocedure('public.cc_manager_event_roster_v1(uuid)')::text,'missing')
  union all select 'security','authenticated execute players_v2',has_function_privilege('authenticated','public.cc_manager_players_v2(uuid,text)','EXECUTE'),'must be true'
  union all select 'security','authenticated execute rsvp_matrix',has_function_privilege('authenticated','public.cc_manager_rsvp_matrix_v1(timestamptz,timestamptz,uuid)','EXECUTE'),'must be true'
  union all select 'security','authenticated execute calendar_v2',has_function_privilege('authenticated','public.cc_manager_calendar_v2(timestamptz,timestamptz,uuid)','EXECUTE'),'must be true'
  union all select 'security','authenticated execute events_v1',has_function_privilege('authenticated','public.cc_manager_events_v1(timestamptz,timestamptz,text,uuid)','EXECUTE'),'must be true'
  union all select 'security','authenticated execute event_roster',has_function_privilege('authenticated','public.cc_manager_event_roster_v1(uuid)','EXECUTE'),'must be true'
  union all select 'security','anon execute players_v2',not has_function_privilege('anon','public.cc_manager_players_v2(uuid,text)','EXECUTE'),'must be false/no execute'
  union all select 'security','anon execute rsvp_matrix',not has_function_privilege('anon','public.cc_manager_rsvp_matrix_v1(timestamptz,timestamptz,uuid)','EXECUTE'),'must be false/no execute'
  union all select 'security','anon execute calendar_v2',not has_function_privilege('anon','public.cc_manager_calendar_v2(timestamptz,timestamptz,uuid)','EXECUTE'),'must be false/no execute'
  union all select 'security','anon execute events_v1',not has_function_privilege('anon','public.cc_manager_events_v1(timestamptz,timestamptz,text,uuid)','EXECUTE'),'must be false/no execute'
  union all select 'security','anon execute event_roster',not has_function_privilege('anon','public.cc_manager_event_roster_v1(uuid)','EXECUTE'),'must be false/no execute'
)
select object_type,name,ok,detail from checks order by object_type,name;
