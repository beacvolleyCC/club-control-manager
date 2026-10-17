-- Club Control mass sport: scheduled activation, Budapest local time.
-- Adding a nullable column leaves all existing events unchanged.
alter table public.mass_events
  add column if not exists activation_scheduled_at timestamptz;

create index if not exists cc_mass_events_activation_due_idx
  on public.mass_events(activation_scheduled_at)
  where active is false and activation_scheduled_at is not null;

create or replace function private.cc_mass_clear_activation_on_active_change_v1()
returns trigger language plpgsql
set search_path = ''
as $fn$
begin
  if old.active is distinct from new.active then
    new.activation_scheduled_at := null;
  end if;
  return new;
end;
$fn$;

drop trigger if exists cc_mass_activation_clear_when_toggled on public.mass_events;
create trigger cc_mass_activation_clear_when_toggled
before update of active on public.mass_events
for each row execute function private.cc_mass_clear_activation_on_active_change_v1();

create or replace function public.cc_manager_mass_event_activation_schedule_v1(
  p_event_id text,
  p_enabled boolean,
  p_local_date date default null,
  p_local_time time without time zone default null
)
returns jsonb language plpgsql security definer
set search_path = ''
as $fn$
declare
  v_event public.mass_events%rowtype;
  v_actor text;
  v_manager uuid;
  v_at timestamptz;
begin
  v_manager := private.cc_manager_require_any_v1('mass.trainings','edit');
  select email into v_actor from public.manager_accounts where id=v_manager;
  select * into v_event from public.mass_events
    where id=nullif(trim(coalesce(p_event_id,'')),'')
      and upper(coalesce(session_type,''))<>'VERSENYSPORT'
    for update;
  if not found then raise exception 'MASS_EVENT_NOT_FOUND'; end if;
  if coalesce(p_enabled,false) then
    if v_event.active is distinct from false then
      raise exception 'MASS_ACTIVATION_REQUIRES_INACTIVE_EVENT';
    end if;
    if p_local_date is null or p_local_time is null then
      raise exception 'MASS_ACTIVATION_DATE_TIME_REQUIRED';
    end if;
    v_at := (p_local_date + p_local_time) at time zone 'Europe/Budapest';
    if v_at <= now() then raise exception 'MASS_ACTIVATION_MUST_BE_FUTURE'; end if;
    if v_at >= ((v_event.event_date + v_event.start_time) at time zone 'Europe/Budapest') then
      raise exception 'MASS_ACTIVATION_MUST_PRECEDE_TRAINING';
    end if;
  else
    v_at := null;
  end if;

  update public.mass_events
    set activation_scheduled_at=v_at,updated_at=now()
    where id=v_event.id;
  insert into public.mass_live_write_audit(
    source_workbook_id,operation,entity_type,entity_id,actor,payload
  ) values (
    v_event.source_workbook_id,
    case when v_at is null then 'cancel_activation_schedule' else 'schedule_activation' end,
    'mass_event',v_event.id,nullif(trim(v_actor),''),
    jsonb_build_object('scheduledAt',v_at,'zone','Europe/Budapest')
  );
  return jsonb_build_object(
    'ok',true,'eventId',v_event.id,'scheduledAt',v_at,
    'timeZone','Europe/Budapest'
  );
end;
$fn$;

create or replace function public.cc_manager_mass_event_activation_get_v1(p_event_id text)
returns jsonb language plpgsql security definer
set search_path = ''
as $fn$
declare v_event public.mass_events%rowtype;
begin
  perform private.cc_manager_require_any_v1('mass.trainings','view');
  select * into v_event from public.mass_events
    where id=nullif(trim(coalesce(p_event_id,'')),'')
      and upper(coalesce(session_type,''))<>'VERSENYSPORT'
    limit 1;
  if not found then raise exception 'MASS_EVENT_NOT_FOUND'; end if;
  return jsonb_build_object(
    'eventId',v_event.id,'active',v_event.active,
    'scheduledAt',v_event.activation_scheduled_at,
    'localDate',case when v_event.activation_scheduled_at is null then null
      else to_char(v_event.activation_scheduled_at at time zone 'Europe/Budapest','YYYY-MM-DD') end,
    'localTime',case when v_event.activation_scheduled_at is null then null
      else to_char(v_event.activation_scheduled_at at time zone 'Europe/Budapest','HH24:MI') end,
    'timeZone','Europe/Budapest'
  );
end;
$fn$;

create or replace function public.cc_mass_activate_scheduled_v1()
returns integer language plpgsql security definer
set search_path = ''
as $fn$
declare v_count integer := 0;
begin
  with due as (
    select id
    from public.mass_events
    where active is false
      and activation_scheduled_at <= now()
      and activation_scheduled_at is not null
      and ((event_date + start_time) at time zone 'Europe/Budapest') > now()
    for update skip locked
  ),
  updated as (
    update public.mass_events e
      set active=true,activation_scheduled_at=null,updated_at=now()
    from due
    where e.id=due.id and e.active is false
    returning e.id,e.source_workbook_id
  ),
  logged as (
    insert into public.mass_live_write_audit(
      source_workbook_id,operation,entity_type,entity_id,actor,payload
    )
    select source_workbook_id,'auto_activate','mass_event',id,'cc_mass_activation_scheduler',
      jsonb_build_object('active',true,'scheduler','cc-mass-activation-v1')
    from updated
    returning 1
  )
  select count(*) into v_count from logged;
  return v_count;
end;
$fn$;

revoke all on function public.cc_manager_mass_event_activation_schedule_v1(text,boolean,date,time without time zone) from public,anon;
revoke all on function public.cc_manager_mass_event_activation_get_v1(text) from public,anon;
grant execute on function public.cc_manager_mass_event_activation_schedule_v1(text,boolean,date,time without time zone) to authenticated;
grant execute on function public.cc_manager_mass_event_activation_get_v1(text) to authenticated;
revoke all on function public.cc_mass_activate_scheduled_v1() from public,anon,authenticated;

-- Persistent server-side worker: independent of whether Manager is open.
select cron.schedule(
  'cc-mass-activation-v1',
  '* * * * *',
  'select public.cc_mass_activate_scheduled_v1();'
);
