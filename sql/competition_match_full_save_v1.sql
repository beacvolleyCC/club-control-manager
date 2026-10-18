-- Save official fixture correction and BEAC logistics atomically.
-- No direct player-event mutation here; notification/publishing is a separate explicit step.
create or replace function public.cc_manager_competition_match_full_save_v1(
 p_source_system text,p_season text,p_source_key text,p_patch jsonb,
 p_expected_match_version integer,p_arrangement jsonb default null,
 p_expected_arrangement_version integer default 0
) returns jsonb language plpgsql security definer set search_path='' as $function$
declare v_match jsonb;v_arr jsonb;v_meet timestamptz;v_kickoff timestamptz;
begin
 perform private.cc_manager_require_v1('competition.matches','edit',null);
 if p_arrangement is not null then
   if jsonb_typeof(p_arrangement)<>'object' or
      exists(select 1 from jsonb_object_keys(p_arrangement) k
        where k not in ('meetingAt','meetingPlace','playerNote'))
   then raise exception 'ARRANGEMENT_FIELDS_INVALID' using errcode='22023'; end if;
   begin v_meet:=nullif(p_arrangement->>'meetingAt','')::timestamptz;
   exception when others then raise exception 'MEETING_TIME_INVALID' using errcode='22023'; end;
   begin v_kickoff:=(p_patch->>'startsAt')::timestamptz;
   exception when others then raise exception 'MATCH_START_INVALID' using errcode='22023'; end;
   if v_meet is not null and v_kickoff is not null and v_meet>v_kickoff
   then raise exception 'MEETING_AFTER_KICKOFF' using errcode='22023'; end if;
 end if;
 v_match:=public.cc_manager_competition_match_override_save_v1(
   p_source_system,p_season,p_source_key,p_patch,p_expected_match_version);
 if p_arrangement is not null then
   v_arr:=public.cc_manager_competition_match_arrangement_save_v1(
     p_source_system,p_season,p_source_key,v_meet,p_arrangement->>'meetingPlace',
     p_arrangement->>'playerNote',p_expected_arrangement_version);
   v_match:=v_match||v_arr;
 end if;
 return v_match;
end;
$function$;
revoke all on function public.cc_manager_competition_match_full_save_v1(
 text,text,text,jsonb,integer,jsonb,integer) from public,anon,authenticated;
grant execute on function public.cc_manager_competition_match_full_save_v1(
 text,text,text,jsonb,integer,jsonb,integer) to authenticated;
