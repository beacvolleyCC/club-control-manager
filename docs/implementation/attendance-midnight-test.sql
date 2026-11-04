-- TEST-only staged scheduler. Requires pg_cron activation first.
-- UTC hourly trigger with Budapest-local midnight guard handles DST.
create or replace function cc_internal.attendance_midnight_tick()
returns integer language plpgsql security invoker set search_path = ''
as $$
declare local_now timestamp;
begin
  local_now := now() at time zone 'Europe/Budapest';
  if extract(hour from local_now) <> 0 then return 0; end if;
  return cc_internal.autofill_training_attendance(local_now::date - 1);
end;
$$;
revoke all on function cc_internal.attendance_midnight_tick() from public, anon, authenticated;
-- When pg_cron is enabled in TEST:
-- select cron.schedule('cc-test-attendance-midnight', '5 * * * *',
--   'select cc_internal.attendance_midnight_tick()');
-- Coach reminders require verified event-to-coach account mapping.
