-- TEST-only migration. Preserve mass events as distinct domain entities; never cross-link to competition events by date.
create table if not exists public.cc_v2_mass_event_registry (
 id uuid primary key default gen_random_uuid(),
 mass_event_id text not null unique references public.mass_events(id) on delete cascade,
 source_system text not null default 'mass_events',
 created_at timestamptz not null default now(),
 constraint cc_v2_mass_registry_source_check check (source_system='mass_events')
);
alter table public.cc_v2_mass_event_registry enable row level security;
revoke all on public.cc_v2_mass_event_registry from anon,authenticated;
insert into public.cc_v2_mass_event_registry(mass_event_id)
select id from public.mass_events on conflict(mass_event_id) do nothing;
create or replace function private.cc_v2_mass_event_registry_sync_v1()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.cc_v2_mass_event_registry(mass_event_id) values(new.id)
 on conflict(mass_event_id) do nothing;
 return new;
end $$;
drop trigger if exists cc_v2_mass_event_registry_sync on public.mass_events;
create trigger cc_v2_mass_event_registry_sync after insert on public.mass_events
for each row execute function private.cc_v2_mass_event_registry_sync_v1();
revoke all on function private.cc_v2_mass_event_registry_sync_v1() from public,anon,authenticated;
create or replace function public.cc_v2_mass_event_registry_health_v1()
returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 perform private.cc_manager_require_any_v1('mass.overview','view');
 return (select jsonb_build_object('schemaVersion',1,'sourceEvents',(select count(*) from public.mass_events),
 'registeredEvents',(select count(*) from public.cc_v2_mass_event_registry),
 'unregisteredEvents',(select count(*) from public.mass_events e where not exists(select 1 from public.cc_v2_mass_event_registry r where r.mass_event_id=e.id)),
 'orphanRegistry',(select count(*) from public.cc_v2_mass_event_registry r where not exists(select 1 from public.mass_events e where e.id=r.mass_event_id))));
end $$;
revoke all on function public.cc_v2_mass_event_registry_health_v1() from public,anon;
grant execute on function public.cc_v2_mass_event_registry_health_v1() to authenticated;
