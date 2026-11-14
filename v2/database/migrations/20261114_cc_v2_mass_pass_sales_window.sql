-- V2 TEST-only: distinguish BEAC sales availability from imported purchase evidence.
-- This does not create passes, confirm payment, or bypass the booking gate.
create table if not exists public.cc_v2_mass_pass_sales_windows_v1 (
 valid_month text primary key check (valid_month ~ '^20[0-9]{2}-(0[1-9]|1[0-2])$'),
 sales_state text not null default 'unknown'
  check (sales_state in ('unknown','available','unavailable')),
 grace_until timestamptz,
 reason text not null default '' check (length(reason)<=800),
 updated_by uuid,
 updated_at timestamptz not null default now(),
 check (sales_state='unavailable' or grace_until is null)
);
create table if not exists public.cc_v2_mass_pass_sales_audit_v1 (
 id bigint generated always as identity primary key,
 valid_month text not null,
 old_state jsonb,
 new_state jsonb not null,
 changed_by uuid not null,
 changed_at timestamptz not null default now()
);
alter table public.cc_v2_mass_pass_sales_windows_v1 enable row level security;
alter table public.cc_v2_mass_pass_sales_audit_v1 enable row level security;
revoke all on table public.cc_v2_mass_pass_sales_windows_v1,public.cc_v2_mass_pass_sales_audit_v1 from public,anon,authenticated;

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
  'salesAvailabilityVerified',false
 );
end $$;
revoke all on function public.cc_v2_manager_pass_sales_status_v1(text) from public,anon,authenticated;
grant execute on function public.cc_v2_manager_pass_sales_status_v1(text) to authenticated;

create or replace function public.cc_v2_manager_pass_sales_set_v1(
 p_month text, p_state text, p_grace_until timestamptz, p_reason text
) returns jsonb language plpgsql volatile security definer set search_path to ''
as $$
declare v_actor uuid; v_old public.cc_v2_mass_pass_sales_windows_v1%rowtype;
 v_after public.cc_v2_mass_pass_sales_windows_v1%rowtype;
begin
 v_actor:=private.cc_manager_require_any_v1('mass.passes','edit');
 if p_month is null or p_month !~ '^20[0-9]{2}-(0[1-9]|1[0-2])$'
    or p_state is null or p_state not in ('unknown','available','unavailable')
    or length(coalesce(p_reason,''))>800
    or (p_state<>'unavailable' and p_grace_until is not null)
    or (p_state='unavailable' and p_grace_until is not null
         and p_grace_until > now()+interval '45 days') then
   raise exception 'CC_V2_PASS_SALES_INVALID' using errcode='22023';
 end if;
 select * into v_old from public.cc_v2_mass_pass_sales_windows_v1 where valid_month=p_month for update;
 insert into public.cc_v2_mass_pass_sales_windows_v1 as old
  (valid_month,sales_state,grace_until,reason,updated_by,updated_at)
 values (p_month,p_state,p_grace_until,coalesce(p_reason,''),v_actor,now())
 on conflict(valid_month) do update set
  sales_state=excluded.sales_state,grace_until=excluded.grace_until,
  reason=excluded.reason,updated_by=excluded.updated_by,updated_at=excluded.updated_at
 returning * into v_after;
 insert into public.cc_v2_mass_pass_sales_audit_v1(valid_month,old_state,new_state,changed_by)
 values (p_month,
   case when v_old.valid_month is null then null else
    jsonb_build_object('salesState',v_old.sales_state,'graceUntil',v_old.grace_until,'reason',v_old.reason)
   end,
   jsonb_build_object('salesState',v_after.sales_state,'graceUntil',v_after.grace_until,'reason',v_after.reason),
   v_actor);
 return jsonb_build_object('schemaVersion',1,'validMonth',p_month,
   'salesState',v_after.sales_state,'graceUntil',v_after.grace_until,
   'updatedAt',v_after.updated_at,'auditRecorded',true);
end $$;
revoke all on function public.cc_v2_manager_pass_sales_set_v1(text,text,timestamptz,text) from public,anon,authenticated;
grant execute on function public.cc_v2_manager_pass_sales_set_v1(text,text,timestamptz,text) to authenticated;
