-- Club Control V2 TEST only. Irreversibly fake QA records; never from LIVE.
-- Fail closed unless the isolated TEST-only synthetic workbook already exists.
do $fixture$
begin
 if not exists (
  select 1 from public.mass_events where source_workbook_id='CC-QA-SYNTHETIC'
 ) then
  raise exception 'QA_FIXTURES_REQUIRE_SYNTHETIC_WORKBOOK';
 end if;
 insert into public.mass_athletes
  (id,source_workbook_id,name,email,level,status,migration_run_id,legacy_row)
 values
  ('CC-QA-ATHLETE-VERIFIED','CC-QA-SYNTHETIC','QA Verified','qa-verified@example.invalid','Kezdő','AKTÍV','CC-QA-20261114','{"synthetic":true,"notRealPerson":true}'::jsonb),
  ('CC-QA-ATHLETE-STALE','CC-QA-SYNTHETIC','QA Stale Import','qa-stale@example.invalid','Kezdő','AKTÍV','CC-QA-20261114','{"synthetic":true,"notRealPerson":true}'::jsonb),
  ('CC-QA-ATHLETE-NOPASS','CC-QA-SYNTHETIC','QA No Pass','qa-nopass@example.invalid','Kezdő','AKTÍV','CC-QA-20261114','{"synthetic":true,"notRealPerson":true}'::jsonb)
 on conflict(id) do nothing;

 insert into public.mass_passes
  (source_workbook_id,pass_number,product,pass_group,email,purchase_date,valid_month,imported_at,raw_row)
 values
  ('CC-QA-SYNTHETIC','CC-QA-PAID-VERIFY','QA TEST VALID – NOT REAL','QA',
   'qa-verified@example.invalid',now()-interval '1 day',
   to_char(now() at time zone 'Europe/Budapest','YYYY-MM'),now(),
   '{"synthetic":true,"notRealPurchase":true}'::jsonb),
  ('CC-QA-SYNTHETIC','CC-QA-PAID-STALE','QA TEST STALE – NOT REAL','QA',
   'qa-stale@example.invalid',now()-interval '5 days',
   to_char(now() at time zone 'Europe/Budapest','YYYY-MM'),now()-interval '48 hours',
   '{"synthetic":true,"notRealPurchase":true}'::jsonb)
 on conflict (source_workbook_id,pass_number) do nothing;
end $fixture$;
