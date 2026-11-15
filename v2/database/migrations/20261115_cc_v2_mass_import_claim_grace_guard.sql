-- V2 TEST-only security: import-delay claim is never an automatic booking entitlement.
-- A Manager may permit a short capped import-delay grace without marking payment verified.
alter table public.cc_v2_mass_pass_sales_windows_v1
 add column if not exists import_grace_until timestamptz;

create or replace function public.cc_v2_manager_pass_sales_status_v1(p_month text)
returns jsonb language plpgsql stable security definer set search_path to ''
as $body$
declare v_state public.cc_v2_mass_pass_sales_windows_v1%rowtype;
begin
 perform private.cc_manager_require_any_v1('mass.passes','view');
 if p_month is null or p_month !~ '^20[0-9]{2}-(0[1-9]|1[0-2])$'
  then raise exception 'CC_V2_PASS_MONTH_INVALID' using errcode='22023'; end if;
 select * into v_state from public.cc_v2_mass_pass_sales_windows_v1
 where valid_month=p_month;
 return jsonb_build_object(
  'schemaVersion',1,'validMonth',p_month,
  'salesState',coalesce(v_state.sales_state,'unknown'),
  'graceUntil',v_state.grace_until,'importGraceUntil',v_state.import_grace_until,
  'reason',coalesce(v_state.reason,''),'updatedAt',v_state.updated_at,
  'canEdit',private.cc_manager_has_any_v1('mass.passes','edit'),
  'salesAvailabilityVerified',false
 );
end $body$;
revoke all on function public.cc_v2_manager_pass_sales_status_v1(text) from public,anon,authenticated;
grant execute on function public.cc_v2_manager_pass_sales_status_v1(text) to authenticated;

create or replace function public.cc_v2_manager_pass_sales_set_v2(
 p_month text, p_state text, p_grace_until timestamptz,
 p_import_grace_until timestamptz, p_reason text
) returns jsonb language plpgsql volatile security definer set search_path to ''
as $body$
declare v_actor uuid;v_old public.cc_v2_mass_pass_sales_windows_v1%rowtype;
 v_after public.cc_v2_mass_pass_sales_windows_v1%rowtype;
begin
 v_actor:=private.cc_manager_require_any_v1('mass.passes','edit');
 if p_month is null or p_month !~ '^20[0-9]{2}-(0[1-9]|1[0-2])$'
  or p_state is null or p_state not in ('unknown','available','unavailable')
  or length(coalesce(p_reason,''))>800
  or (p_state<>'unavailable' and p_grace_until is not null)
  or (p_grace_until is not null and
   (p_grace_until<=now() or p_grace_until>now()+interval '45 days'))
  or (p_import_grace_until is not null and
   (p_import_grace_until<=now() or p_import_grace_until>now()+interval '7 days'))
  then raise exception 'CC_V2_PASS_SALES_INVALID' using errcode='22023'; end if;
 select * into v_old from public.cc_v2_mass_pass_sales_windows_v1
 where valid_month=p_month for update;
 insert into public.cc_v2_mass_pass_sales_windows_v1
  (valid_month,sales_state,grace_until,import_grace_until,reason,updated_by,updated_at)
 values (p_month,p_state,p_grace_until,p_import_grace_until,coalesce(p_reason,''),v_actor,now())
 on conflict(valid_month) do update set
  sales_state=excluded.sales_state,grace_until=excluded.grace_until,
  import_grace_until=excluded.import_grace_until,reason=excluded.reason,
  updated_by=excluded.updated_by,updated_at=excluded.updated_at
 returning * into v_after;
 insert into public.cc_v2_mass_pass_sales_audit_v1
  (valid_month,old_state,new_state,changed_by)
 values(p_month,
  case when v_old.valid_month is null then null else
   jsonb_build_object('salesState',v_old.sales_state,'graceUntil',v_old.grace_until,
    'importGraceUntil',v_old.import_grace_until,'reason',v_old.reason) end,
  jsonb_build_object('salesState',v_after.sales_state,'graceUntil',v_after.grace_until,
   'importGraceUntil',v_after.import_grace_until,'reason',v_after.reason),v_actor);
 return jsonb_build_object('schemaVersion',1,'validMonth',p_month,
  'salesState',v_after.sales_state,'graceUntil',v_after.grace_until,
  'importGraceUntil',v_after.import_grace_until,
  'updatedAt',v_after.updated_at,'auditRecorded',true);
end $body$;
revoke all on function public.cc_v2_manager_pass_sales_set_v2(text,text,timestamptz,timestamptz,text)
 from public,anon,authenticated;
grant execute on function public.cc_v2_manager_pass_sales_set_v2(text,text,timestamptz,timestamptz,text)
 to authenticated;

create or replace function public.cc_v2_mass_self_book_v1(
 p_event_id text, p_mode text, p_claimed_paid boolean default false
) returns jsonb language plpgsql volatile security definer set search_path to ''
as $body$
declare v_owner jsonb; v_event public.mass_events%rowtype;
 v_pass jsonb; v_person jsonb; v_result jsonb; v_pass_no text:='';
 v_month text;v_mode text:=lower(btrim(coalesce(p_mode,'')));
 v_token text;v_active_sanctions integer;v_import_until timestamptz;
begin
 v_owner:=private.cc_v2_mass_owner_v1();
 if p_event_id is null or length(p_event_id)>200 or v_mode not in ('book','wait','first_training')
 then raise exception 'MASS_SELF_BOOK_INVALID' using errcode='22023';end if;
 select * into v_event from public.mass_events where id=p_event_id;
 if v_event.id is null or v_event.source_workbook_id<>'CC-QA-SYNTHETIC'
  or v_event.active is not true or v_event.public_registration_active is not true
  or upper(coalesce(v_event.session_type,'')) not in ('TÖMEGSPORT','TOMEGSPORT','SPORT7')
 then raise exception 'MASS_SELF_EVENT_UNAVAILABLE' using errcode='22023';end if;
 if lower(btrim(coalesce(v_event.level,'')))<>lower(btrim(coalesce(v_owner->>'effectiveLevel','')))
  and upper(coalesce(v_event.session_type,''))<>'SPORT7'
 then raise exception 'MASS_SELF_LEVEL_MISMATCH' using errcode='42501';end if;
 select count(*) into v_active_sanctions from public.mass_sanctions s
 where s.source_workbook_id=v_event.source_workbook_id
  and (s.athlete_id=v_owner->>'athleteId' or lower(btrim(s.email))=v_owner->>'email')
  and s.starts_at<=now() and s.ends_at>now()
  and upper(coalesce(s.status,'AKTÍV')) not in ('INAKTÍV','LEJÁRT','TÖRÖLVE');
 if v_active_sanctions>0 then
  raise exception 'MASS_SELF_SANCTION_ACTIVE' using errcode='42501';
 end if;
 v_month:=to_char(v_event.event_date,'YYYY-MM');
 v_pass:=private.cc_v2_mass_pass_state_v1(v_owner,v_month);
 if v_mode='first_training' then
  v_pass_no:='';
 elsif upper(v_event.session_type)='SPORT7' then
  v_pass_no:='SPORT7';
 elsif v_pass->>'status'='verified' then
  select p.pass_number into v_pass_no from public.mass_passes p
  where p.source_workbook_id=v_event.source_workbook_id
   and lower(btrim(p.email))=v_owner->>'email' and p.valid_month=v_month
   and not coalesce((p.raw_row->>'notRealPurchase')::boolean,false)
  order by p.purchase_date desc nulls last limit 1;
 elsif v_pass->>'status'='sales_unavailable_grace' then
  v_pass_no:='';
 elsif (v_pass->>'status')='pending_import' and p_claimed_paid is true then
  -- A player's own claim never creates entitlement on its own.
  -- Allow only while the Manager explicitly enables a short import-delay grace.
  select s.import_grace_until into v_import_until
  from public.cc_v2_mass_pass_sales_windows_v1 s where s.valid_month=v_month;
  if v_import_until is null or v_import_until<=now()
   then raise exception 'MASS_SELF_IMPORT_CLAIM_AWAITING_MANAGER' using errcode='42501';
  end if;
  v_pass_no:='';
 else
  raise exception 'MASS_SELF_PASS_REQUIRED' using errcode='42501';
 end if;
 if v_mode='first_training' then
  if upper(v_event.session_type)='SPORT7' then raise exception 'MASS_SELF_FIRST_SPORT7' using errcode='22023';end if;
  v_person:=jsonb_build_object('name',v_owner->>'name','email',v_owner->>'email',
   'firstTraining',true);
 else
  v_person:=jsonb_build_object('name',v_owner->>'name','email',v_owner->>'email',
   'passNumber',v_pass_no);
 end if;
 if v_mode='wait' then
  -- A dedicated waitlist helper accepts first-training as the pass label.
  v_result:=public.cc_vnext_mass_public_wait_v1(p_event_id,v_person);
 else
  -- Random, non-user-provided one-use cancellation secret; no raw token exposed.
  v_token:='sha256:'||encode(pg_catalog.sha256(convert_to(
    pg_catalog.gen_random_uuid()::text||':'||pg_catalog.gen_random_uuid()::text,'UTF8')),'hex');
  v_result:=public.cc_vnext_mass_public_book_v1(p_event_id,v_person,v_token);
 end if;
 return v_result || jsonb_build_object('schemaVersion',1,'passReviewState',v_pass->>'status',
   'emailQueued',false,'testOnly',true);
end $body$;
revoke all on function public.cc_v2_mass_self_book_v1(text,text,boolean) from public,anon,authenticated;
grant execute on function public.cc_v2_mass_self_book_v1(text,text,boolean) to authenticated;

