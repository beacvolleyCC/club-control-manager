-- TEST only: verified-email mass profile + owner-only pass/read domain.
-- Builds on existing mass_athletes, mass_bookings, mass_waitlist, mass_passes.
-- Restrict first deployment to CC-QA-SYNTHETIC; no LIVE data.
create or replace function private.cc_v2_mass_verified_auth_v1()
returns jsonb language plpgsql stable security definer set search_path to ''
as $body$
declare v_uid uuid := (select auth.uid());
 v_mail text; v_confirmed timestamptz; v_anonymous boolean;
begin
 if v_uid is null then
  raise exception 'MASS_LOGIN_REQUIRED' using errcode='42501';
 end if;
 select lower(btrim(u.email)),u.email_confirmed_at,coalesce(u.is_anonymous,false)
 into v_mail,v_confirmed,v_anonymous
 from auth.users u where u.id=v_uid;
 if v_mail is null or v_confirmed is null or v_anonymous
  or v_mail !~* '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' then
  raise exception 'MASS_VERIFIED_EMAIL_REQUIRED' using errcode='42501';
 end if;
 return jsonb_build_object('uid',v_uid,'email',v_mail);
end $body$;
revoke all on function private.cc_v2_mass_verified_auth_v1() from public,anon,authenticated;

create or replace function public.cc_v2_mass_profile_register_v1(
 p_name text,p_level text default 'Kezdő'
) returns jsonb language plpgsql volatile security definer set search_path to ''
as $body$
declare v_auth jsonb;v_uid uuid;v_mail text;v_name text;
 v_level text;v_id text;v_previous record;v_count int;
begin
 v_auth:=private.cc_v2_mass_verified_auth_v1();
 v_uid:=(v_auth->>'uid')::uuid;v_mail:=v_auth->>'email';
 v_name:=btrim(coalesce(p_name,''));
 v_level:=upper(btrim(coalesce(p_level,'')));
 if length(v_name)<2 or length(v_name)>100 or v_name ~ '[[:cntrl:]]'
  or v_level not in ('KEZDŐ','KÖZÉPHALADÓ','HALADÓ') then
  raise exception 'MASS_PROFILE_INVALID' using errcode='22023';
 end if;
 -- Exactly one isolated, synthetic source workbook exists in this TEST phase.
 if not exists (select 1 from public.mass_events
   where source_workbook_id='CC-QA-SYNTHETIC') then
  raise exception 'MASS_TEST_SOURCE_MISSING' using errcode='42501';
 end if;
 perform pg_advisory_xact_lock(hashtextextended('cc-v2-mass-email:'||v_mail,0));
 select l.mass_athlete_id into v_id from public.cc_v2_mass_verified_account_links_v1 l
 where l.auth_user_id=v_uid;
 if v_id is not null then
  return jsonb_build_object('schemaVersion',1,'registered',true,'existing',true);
 end if;
 select count(*) into v_count from public.mass_athletes a
 where a.source_workbook_id='CC-QA-SYNTHETIC'
  and lower(btrim(a.email))=v_mail;
 if v_count>1 then
  raise exception 'MASS_DUPLICATE_PROFILE_REQUIRES_MANAGER' using errcode='23505';
 end if;
 if v_count=1 then
  select a.id,a.name into v_previous from public.mass_athletes a
  where a.source_workbook_id='CC-QA-SYNTHETIC'
   and lower(btrim(a.email))=v_mail limit 1;
  if lower(regexp_replace(btrim(coalesce(v_previous.name,'')),'[[:space:]]+',' ','g'))
   <>lower(regexp_replace(v_name,'[[:space:]]+',' ','g')) then
   raise exception 'MASS_EXISTING_NAME_NEEDS_MANAGER_CHECK' using errcode='42501';
  end if;
  v_id:=v_previous.id;
 else
  v_id:='CC-V2-TEST-MASS-'||pg_catalog.gen_random_uuid()::text;
  insert into public.mass_athletes
   (id,source_workbook_id,name,email,level,status,migration_run_id,legacy_row)
  values(v_id,'CC-QA-SYNTHETIC',v_name,v_mail,initcap(lower(v_level)),
   'AKTÍV','CC-V2-TEST-SELF-20261115',
   '{"v2TestRegistration":true,"noLiveImport":true}'::jsonb);
 end if;
 insert into public.cc_v2_mass_verified_account_links_v1
  (auth_user_id,mass_athlete_id,verified_method,verified_at)
 values(v_uid,v_id,'verified_email_otp',now());
 return jsonb_build_object('schemaVersion',1,'registered',true,'existing',v_count=1);
end $body$;
revoke all on function public.cc_v2_mass_profile_register_v1(text,text) from public,anon,authenticated;
grant execute on function public.cc_v2_mass_profile_register_v1(text,text) to authenticated;

-- Reuse verified authenticated owner identity. Never trust a caller-supplied email.
create or replace function private.cc_v2_mass_owner_v1()
returns jsonb language plpgsql stable security definer set search_path to ''
as $body$
declare v_auth jsonb;v_uid uuid;v_mail text;v_athlete record;
begin
 v_auth:=private.cc_v2_mass_verified_auth_v1();
 v_uid:=(v_auth->>'uid')::uuid;v_mail:=v_auth->>'email';
 select a.id,a.name,a.email,a.level,a.source_workbook_id,a.first_training_date,a.level_override
 into v_athlete
 from public.cc_v2_mass_verified_account_links_v1 l
 join public.mass_athletes a on a.id=l.mass_athlete_id
 where l.auth_user_id=v_uid and l.verified_at is not null;
 if v_athlete.id is null or lower(btrim(v_athlete.email))<>v_mail
  or v_athlete.source_workbook_id<>'CC-QA-SYNTHETIC' then
  raise exception 'MASS_PROFILE_LINK_REQUIRED' using errcode='42501';
 end if;
 return jsonb_build_object('uid',v_uid,'email',v_mail,'athleteId',v_athlete.id,
 'name',v_athlete.name,'level',v_athlete.level,
 'effectiveLevel',coalesce(nullif(v_athlete.level_override,''),v_athlete.level),
 'firstTrainingDate',v_athlete.first_training_date,'source',v_athlete.source_workbook_id);
end $body$;
revoke all on function private.cc_v2_mass_owner_v1() from public,anon,authenticated;

create or replace function private.cc_v2_mass_pass_state_v1(p_owner jsonb,p_month text)
returns jsonb language plpgsql stable security definer set search_path to ''
as $body$
declare v_sale public.cc_v2_mass_pass_sales_windows_v1%rowtype;
 v_pass public.mass_passes%rowtype; v_latest timestamptz;
 v_state text:='missing'; v_age text:='unknown';v_real boolean:=false;
begin
 if p_month !~ '^20[0-9]{2}-(0[1-9]|1[0-2])$' then
  raise exception 'MASS_PASS_MONTH_INVALID' using errcode='22023';
 end if;
 select * into v_sale from public.cc_v2_mass_pass_sales_windows_v1
 where valid_month=p_month;
 select * into v_pass from public.mass_passes p
 where p.source_workbook_id=p_owner->>'source'
 and lower(btrim(p.email))=p_owner->>'email'
 and p.valid_month=p_month
 order by p.purchase_date desc nulls last limit 1;
 select max(p.imported_at) into v_latest from public.mass_passes p
 where p.source_workbook_id=p_owner->>'source';
 if v_latest is not null then
  v_age:=case when v_latest>=now()-interval '12 hours' then 'fresh'
   when v_latest>=now()-interval '24 hours' then 'aging' else 'stale' end;
 end if;
 if v_pass.pass_number is not null then
  v_real:=not coalesce((v_pass.raw_row->>'notRealPurchase')::boolean,false);
  if v_real then v_state:='verified';
  else v_state:='qa_mock_pass'; end if;
 elsif v_sale.sales_state='unavailable'
  and v_sale.grace_until is not null and v_sale.grace_until>now() then
  v_state:='sales_unavailable_grace';
 elsif v_age in ('stale','unknown') then v_state:='pending_import';
 else v_state:='missing'; end if;
 return jsonb_build_object(
  'validMonth',p_month,'status',v_state,'importFreshness',v_age,
  'salesState',coalesce(v_sale.sales_state,'unknown'),
  'graceUntil',v_sale.grace_until,
  'purchaseVerified',v_state='verified',
  'testOnly',v_state='qa_mock_pass'
 );
end $body$;
revoke all on function private.cc_v2_mass_pass_state_v1(jsonb,text) from public,anon,authenticated;

create or replace function public.cc_v2_mass_self_read_v1()
returns jsonb language plpgsql stable security definer set search_path to ''
as $body$
declare v_owner jsonb;v_month text;
 v_bookings jsonb;v_waitlist jsonb;v_pass jsonb;
begin
 v_owner:=private.cc_v2_mass_owner_v1();
 v_month:=to_char(now() at time zone 'Europe/Budapest','YYYY-MM');
 v_pass:=private.cc_v2_mass_pass_state_v1(v_owner,v_month);
 select coalesce(jsonb_agg(jsonb_build_object('bookingId',b.id,
  'eventId',b.event_id,'eventDate',e.event_date,'startTime',e.start_time,
  'level',e.level,'status',b.booking_status,'passStatus',b.pass_status,
  'attendance',b.attendance,'cancellationDeadline',b.cancellation_deadline
 ) order by e.event_date desc,e.start_time desc),'[]'::jsonb)
 into v_bookings from public.mass_bookings b
 join public.mass_events e on e.id=b.event_id and e.source_workbook_id=b.source_workbook_id
 where b.source_workbook_id=v_owner->>'source'
 and lower(btrim(b.email))=v_owner->>'email';
 select coalesce(jsonb_agg(jsonb_build_object(
  'waitlistId',w.id,'eventId',w.event_id,'eventDate',e.event_date,
  'startTime',e.start_time,'level',e.level,'status',w.waitlist_status,
  'offeredAt',w.offered_at,'offerExpiresAt',w.offer_expires_at
 ) order by e.event_date desc,e.start_time desc),'[]'::jsonb)
 into v_waitlist from public.mass_waitlist w
 join public.mass_events e on e.id=w.event_id and e.source_workbook_id=w.source_workbook_id
 where w.source_workbook_id=v_owner->>'source'
 and lower(btrim(w.email))=v_owner->>'email';
 return jsonb_build_object('schemaVersion',1,
  'domain','mass','name',v_owner->>'name','level',v_owner->>'effectiveLevel',
  'bookings',v_bookings,'waitlist',v_waitlist,'pass',v_pass);
end $body$;
revoke all on function public.cc_v2_mass_self_read_v1() from public,anon,authenticated;
grant execute on function public.cc_v2_mass_self_read_v1() to authenticated;
