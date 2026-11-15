-- V2 TEST: expose ONLY a boolean edit grant to Manager UI.
-- Actual edits remain fully authorized by the existing server-side setter.
create or replace function public.cc_v2_manager_pass_sales_status_v1(p_month text)
returns jsonb language plpgsql stable security definer set search_path to ''
as $$
declare v_state public.cc_v2_mass_pass_sales_windows_v1%rowtype;
begin
 perform private.cc_manager_require_any_v1('mass.passes','view');
 if p_month is null or p_month !~ '^20[0-9]{2}-(0[1-9]|1[0-2])$' then
  raise exception 'CC_V2_PASS_MONTH_INVALID' using errcode='22023';
 end if;
 select * into v_state from public.cc_v2_mass_pass_sales_windows_v1
 where valid_month=p_month;
 return jsonb_build_object(
  'schemaVersion',1,'validMonth',p_month,
  'salesState',coalesce(v_state.sales_state,'unknown'),
  'graceUntil',v_state.grace_until,
  'reason',coalesce(v_state.reason,''),
  'updatedAt',v_state.updated_at,
  'canEdit',private.cc_manager_has_any_v1('mass.passes','edit'),
  'salesAvailabilityVerified',false
 );
end $$;
revoke all on function public.cc_v2_manager_pass_sales_status_v1(text) from public,anon,authenticated;
grant execute on function public.cc_v2_manager_pass_sales_status_v1(text) to authenticated;