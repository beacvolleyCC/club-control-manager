-- Applied to TEST on 2026-11-09. Do not deploy to LIVE without approval.
create or replace function public.cc_v2_manager_finance_read_v1(p_team_id uuid,p_season text default null)
returns jsonb language plpgsql stable security invoker set search_path to ''
as $$
begin
 if p_team_id is null then raise exception 'V2_TEAM_REQUIRED' using errcode='22023'; end if;
 if length(coalesce(p_season,''))>40 then raise exception 'V2_INVALID_SEASON' using errcode='22023'; end if;
 return jsonb_build_object('schemaVersion',1,'domain','competition','teamId',p_team_id,'matrix',public.cc_manager_finance_matrix_v1(p_team_id,p_season),'settings',public.cc_manager_finance_settings_get_v2(p_team_id,p_season));
end $$;
create or replace function public.cc_v2_manager_mass_passes_read_v1(p_query text default '',p_month text default '')
returns jsonb language plpgsql stable security invoker set search_path to ''
as $$
begin
 if length(coalesce(p_query,''))>150 or (coalesce(p_month,'')<>'' and p_month !~ '^20[0-9]{2}-(0[1-9]|1[0-2])$') then raise exception 'V2_INVALID_FILTER' using errcode='22023'; end if;
 return jsonb_build_object('schemaVersion',1,'domain','mass','passes',public.cc_manager_mass_passes_v1(p_query,p_month));
end $$;
create or replace function public.cc_v2_player_finance_read_v1()
returns jsonb language sql stable security invoker set search_path to ''
as $$select jsonb_build_object('schemaVersion',1,'overrides',public.cc_player_finance_overrides_v1())$$;
revoke all on function public.cc_v2_manager_finance_read_v1(uuid,text),public.cc_v2_manager_mass_passes_read_v1(text,text),public.cc_v2_player_finance_read_v1() from public,anon;
grant execute on function public.cc_v2_manager_finance_read_v1(uuid,text),public.cc_v2_manager_mass_passes_read_v1(text,text),public.cc_v2_player_finance_read_v1() to authenticated;
