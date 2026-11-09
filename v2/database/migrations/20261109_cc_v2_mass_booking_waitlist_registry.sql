-- TEST-only: preserve legacy mass identities; UUID registry does not imply a competition-player identity.
create table if not exists public.cc_v2_mass_booking_registry (
 id uuid primary key default gen_random_uuid(),
 mass_booking_id text not null unique references public.mass_bookings(id) on delete cascade,
 mass_event_id uuid not null references public.cc_v2_mass_event_registry(id),
 created_at timestamptz not null default now()
);
create table if not exists public.cc_v2_mass_waitlist_registry (
 id uuid primary key default gen_random_uuid(),
 mass_waitlist_id text not null unique references public.mass_waitlist(id) on delete cascade,
 mass_event_id uuid not null references public.cc_v2_mass_event_registry(id),
 created_at timestamptz not null default now()
);
alter table public.cc_v2_mass_booking_registry enable row level security;
alter table public.cc_v2_mass_waitlist_registry enable row level security;
revoke all on public.cc_v2_mass_booking_registry from anon,authenticated;
revoke all on public.cc_v2_mass_waitlist_registry from anon,authenticated;
insert into public.cc_v2_mass_booking_registry(mass_booking_id,mass_event_id)
select b.id,r.id from public.mass_bookings b join public.cc_v2_mass_event_registry r on r.mass_event_id=b.event_id
on conflict(mass_booking_id) do update set mass_event_id=excluded.mass_event_id;
insert into public.cc_v2_mass_waitlist_registry(mass_waitlist_id,mass_event_id)
select w.id,r.id from public.mass_waitlist w join public.cc_v2_mass_event_registry r on r.mass_event_id=w.event_id
on conflict(mass_waitlist_id) do update set mass_event_id=excluded.mass_event_id;
create or replace function private.cc_v2_mass_booking_registry_sync_v1()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_event uuid;
begin
 select id into v_event from public.cc_v2_mass_event_registry where mass_event_id=new.event_id;
 if v_event is null then raise exception 'V2_MASS_EVENT_NOT_REGISTERED'; end if;
 insert into public.cc_v2_mass_booking_registry(mass_booking_id,mass_event_id)
 values(new.id,v_event) on conflict(mass_booking_id) do update set mass_event_id=excluded.mass_event_id;
 return new;
end $$;
create or replace function private.cc_v2_mass_waitlist_registry_sync_v1()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_event uuid;
begin
 select id into v_event from public.cc_v2_mass_event_registry where mass_event_id=new.event_id;
 if v_event is null then raise exception 'V2_MASS_EVENT_NOT_REGISTERED'; end if;
 insert into public.cc_v2_mass_waitlist_registry(mass_waitlist_id,mass_event_id)
 values(new.id,v_event) on conflict(mass_waitlist_id) do update set mass_event_id=excluded.mass_event_id;
 return new;
end $$;
drop trigger if exists cc_v2_mass_booking_registry_sync on public.mass_bookings;
create trigger cc_v2_mass_booking_registry_sync after insert or update of event_id on public.mass_bookings
for each row execute function private.cc_v2_mass_booking_registry_sync_v1();
drop trigger if exists cc_v2_mass_waitlist_registry_sync on public.mass_waitlist;
create trigger cc_v2_mass_waitlist_registry_sync after insert or update of event_id on public.mass_waitlist
for each row execute function private.cc_v2_mass_waitlist_registry_sync_v1();
revoke all on function private.cc_v2_mass_booking_registry_sync_v1() from public,anon,authenticated;
revoke all on function private.cc_v2_mass_waitlist_registry_sync_v1() from public,anon,authenticated;
create or replace function public.cc_v2_mass_registry_health_v1()
returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 perform private.cc_manager_require_any_v1('mass.overview','view');
 return jsonb_build_object('schemaVersion',1,
 'events',(select count(*) from public.cc_v2_mass_event_registry),
 'bookings',(select count(*) from public.cc_v2_mass_booking_registry),
 'waitlist',(select count(*) from public.cc_v2_mass_waitlist_registry),
 'missingBookings',(select count(*) from public.mass_bookings b where not exists(select 1 from public.cc_v2_mass_booking_registry r where r.mass_booking_id=b.id)),
 'missingWaitlist',(select count(*) from public.mass_waitlist w where not exists(select 1 from public.cc_v2_mass_waitlist_registry r where r.mass_waitlist_id=w.id)),
 'mismatchedBookings',(select count(*) from public.cc_v2_mass_booking_registry r join public.mass_bookings b on b.id=r.mass_booking_id join public.cc_v2_mass_event_registry e on e.id=r.mass_event_id where e.mass_event_id<>b.event_id),
 'mismatchedWaitlist',(select count(*) from public.cc_v2_mass_waitlist_registry r join public.mass_waitlist w on w.id=r.mass_waitlist_id join public.cc_v2_mass_event_registry e on e.id=r.mass_event_id where e.mass_event_id<>w.event_id));
end $$;
revoke all on function public.cc_v2_mass_registry_health_v1() from public,anon;
grant execute on function public.cc_v2_mass_registry_health_v1() to authenticated;
