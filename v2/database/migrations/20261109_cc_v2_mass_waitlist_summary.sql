-- TEST only. Manager-scoped aggregate, no guest PII or offer tokens exposed.
create or replace function public.cc_v2_manager_mass_waitlist_summary_v1(p_from date default current_date,p_to date default current_date+120)
returns jsonb language plpgsql stable security definer set search_path to ''
as $$
declare v_result jsonb;
begin
 perform private.cc_manager_require_any_v1('mass.trainings','view');
 if p_from is null or p_to is null or p_to<=p_from or p_to-p_from>366 then
  raise exception 'V2_INVALID_DATE_RANGE' using errcode='22023';
 end if;
 select coalesce(jsonb_agg(jsonb_build_object(
  'sourceSystem','mass_events','eventId',e.id,'eventDate',e.event_date,
  'waiting',coalesce(x.waiting,0),'offered',coalesce(x.offered,0),
  'expired',coalesce(x.expired,0),'other',coalesce(x.other,0)
 ) order by e.event_date,e.start_time,e.id),'[]'::jsonb) into v_result
 from public.mass_events e
 left join lateral (
  select count(*) filter(where w.waitlist_status='VÁRAKOZIK') waiting,
  count(*) filter(where w.waitlist_status='HELY FELAJÁNLVA' and (w.offer_expires_at is null or w.offer_expires_at>now())) offered,
  count(*) filter(where w.waitlist_status='LEJÁRT' or (w.waitlist_status='HELY FELAJÁNLVA' and w.offer_expires_at<=now())) expired,
  count(*) filter(where w.waitlist_status not in ('VÁRAKOZIK','HELY FELAJÁNLVA','LEJÁRT')) other
  from public.mass_waitlist w where w.event_id=e.id and w.source_workbook_id=e.source_workbook_id
 ) x on true
 where e.event_date>=p_from and e.event_date<p_to and e.active is true
 and upper(coalesce(e.session_type,''))<>'VERSENYSPORT';
 return jsonb_build_object('schemaVersion',1,'domain','mass','events',v_result);
end $$;
revoke all on function public.cc_v2_manager_mass_waitlist_summary_v1(date,date) from public,anon;
grant execute on function public.cc_v2_manager_mass_waitlist_summary_v1(date,date) to authenticated;
