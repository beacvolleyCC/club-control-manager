-- Club Control LIVE Manager gated debug preview (disabled by default).
-- No guest records, event rows or RSVPs are created or modified by this migration.
create table if not exists private.cc_manager_debug_access_v1 (
  manager_id uuid primary key references public.manager_accounts(id) on delete cascade,
  enabled boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table private.cc_manager_debug_access_v1 enable row level security;
revoke all on table private.cc_manager_debug_access_v1 from public,anon,authenticated;

create or replace function public.cc_manager_debug_access_v1()
returns boolean
language plpgsql security definer
set search_path to ''
as $$
declare
  v_manager public.manager_accounts%rowtype;
begin
  if auth.uid() is null then return false; end if;
  -- This resolves the already verified Manager account using the existing
  -- LIVE authentication binding. Never grant from a client-provided email.
  v_manager := private.cc_manager_current_account_v1();
  if v_manager.id is null
    or not v_manager.active
    or v_manager.auth_user_id is distinct from auth.uid()
    or lower(v_manager.email) is distinct from lower(coalesce(auth.jwt()->>'email',''))
  then
    return false;
  end if;
  return exists(
    select 1
    from private.cc_manager_debug_access_v1 d
    where d.manager_id=v_manager.id and d.enabled=true
  );
exception when others then
  -- Fail closed; a missing Manager account never gains debug access.
  return false;
end $$;
revoke all on function public.cc_manager_debug_access_v1() from public,anon,authenticated;
grant execute on function public.cc_manager_debug_access_v1() to authenticated;
