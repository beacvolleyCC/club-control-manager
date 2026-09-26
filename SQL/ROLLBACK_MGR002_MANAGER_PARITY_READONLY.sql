-- MGR002 rollback — removes only the additive MGR002 RPCs.
begin;
drop function if exists public.cc_manager_event_roster_v1(uuid);
drop function if exists public.cc_manager_calendar_v2(timestamptz,timestamptz,uuid);
drop function if exists public.cc_manager_events_v1(timestamptz,timestamptz,text,uuid);
drop function if exists public.cc_manager_rsvp_matrix_v1(timestamptz,timestamptz,uuid);
drop function if exists public.cc_manager_players_v2(uuid,text);
commit;
