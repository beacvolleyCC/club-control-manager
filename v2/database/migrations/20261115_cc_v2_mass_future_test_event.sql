-- TEST-only, explicitly fake future training for manual E2E on a real date.
-- Never run on LIVE.
insert into public.mass_events
 (id,source_workbook_id,event_date,start_time,end_time,level,court,capacity,
  active,public_registration_active,session_type,migration_run_id,legacy_row,new_limit,old_limit)
values
 ('CC-QA-FUTURE-20261119','CC-QA-SYNTHETIC','2026-11-19','18:00','19:30',
 'Kezdő','TEST',4,true,true,'TÖMEGSPORT','CC-QA-20261115',
 '{"synthetic":true,"notARealTraining":true}'::jsonb,4,0)
on conflict (id) do nothing;