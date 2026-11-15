-- V2 TEST: conditional bookings remain real capacity allocations, with pass_status awaiting Manager review.
-- No authorization change, no payment confirmation, no PII exposed.
create or replace function public.cc_v2_mass_self_book_v1(
 p_event_id text, p_mode text, p_claimed_paid boolean default false
) returns jsonb language plpgsql volatile security definer set search_path to ''
as $body$
declare v_owner jsonb; v_event public.mass_events%rowtype;
 v_pass jsonb; v_person jsonb; v_result jsonb; v_pass_no text:='';
 v_month text;v_mode text:=lower(btrim(coalesce(p_mode,'')));
 v_token text;v_active_sanctions integer;v_import_until timestamptz;
 v_review text:=null;
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
  v_pass_no:='';v_review:='sales_unavailable_grace';
 elsif (v_pass->>'status') in ('pending_import','missing') and p_claimed_paid is true then
  -- A player's own claim never creates entitlement on its own.
  -- Allow only while the Manager explicitly enables a short import-delay grace.
  select s.import_grace_until into v_import_until
  from public.cc_v2_mass_pass_sales_windows_v1 s where s.valid_month=v_month;
  if v_import_until is null or v_import_until<=now()
   then raise exception 'MASS_SELF_IMPORT_CLAIM_AWAITING_MANAGER' using errcode='42501';
  end if;
  v_pass_no:='';v_review:='pending_import';
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
 -- Conditional bookings are counted normally in capacity but NEVER verified as paid.
 -- Flag them explicitly in the existing Manager detail list for follow-up.
 if v_review is not null and coalesce((v_result->>'ok')::boolean,false) then
   if v_mode='wait' then
     update public.mass_waitlist w
     set pass_status='ELLENŐRZÉSRE VÁR',updated_at=now()
     where w.id=v_result->>'waitlistId'
       and w.event_id=p_event_id and w.source_workbook_id='CC-QA-SYNTHETIC'
       and lower(btrim(w.email))=v_owner->>'email';
   else
     update public.mass_bookings b
     set pass_status='ELLENŐRZÉSRE VÁR',updated_at=now()
     where b.id=v_result->>'bookingId'
       and b.event_id=p_event_id and b.source_workbook_id='CC-QA-SYNTHETIC'
       and lower(btrim(b.email))=v_owner->>'email';
   end if;
 end if;
 return v_result || jsonb_build_object('schemaVersion',1,
   'passReviewState',coalesce(v_review,v_pass->>'status'),
   'emailQueued',false,'testOnly',true);
end $body$;
revoke all on function public.cc_v2_mass_self_book_v1(text,text,boolean) from public,anon,authenticated;
grant execute on function public.cc_v2_mass_self_book_v1(text,text,boolean) to authenticated;

