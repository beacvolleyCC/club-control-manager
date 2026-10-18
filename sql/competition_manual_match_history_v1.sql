-- Club Control — read-only audit history for manually corrected federation matches.
-- Append-only audit remains private; authenticated managers with global match-edit
-- permission may inspect only the known source record's last 30 audit entries.
create or replace function public.cc_manager_competition_match_override_history_v1(
  p_source_system text, p_season text, p_source_key text
) returns jsonb
language plpgsql stable security definer set search_path='' as $function$
declare
  v_history jsonb;
begin
  perform private.cc_manager_require_v1('competition.matches','edit',null);
  perform private.cc_competition_match_source_v1(p_source_system,p_season,p_source_key);
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'action',q.action,'oldPatch',q.old_patch,'newPatch',q.new_patch,
      'oldVersion',q.old_version,'newVersion',q.new_version,
      'actor',q.actor,'happenedAt',q.happened_at)
    order by q.happened_at desc,q.audit_id desc),'[]'::jsonb)
  into v_history
  from (
    select a.audit_id,a.action,a.old_patch,a.new_patch,a.old_version,
      a.new_version,a.happened_at,
      coalesce(nullif(btrim(m.display_name),''),'Admin') as actor
    from public.cc_competition_match_override_audit_v1 a
    left join public.manager_accounts m on m.id=a.actor_manager_id
    where a.source_system=p_source_system and a.season=p_season
      and a.source_key=p_source_key
    order by a.happened_at desc,a.audit_id desc
    limit 30
  ) q;
  return v_history;
end;
$function$;

revoke all on function public.cc_manager_competition_match_override_history_v1(text,text,text)
  from public,anon,authenticated;
grant execute on function public.cc_manager_competition_match_override_history_v1(text,text,text)
  to authenticated;
