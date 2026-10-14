-- Applied in Supabase production: 2026-10-14, migration cc_preserve_competition_match_identity_v1.
-- The deployed trigger protects event identity and associated RSVP/attendance/source links.
-- Never recreate a match to change its date/opponent/venue: edit the existing event UUID.

CREATE OR REPLACE FUNCTION private.cc_preserve_competition_match_identity_v1()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if old.event_type is distinct from 'match' then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;

  -- A real match must never be deleted, even before its first registration:
  -- future source-sync, notification, and audit records need its stable UUID.
  if tg_op = 'DELETE' then
    raise exception 'MATCH_HARD_DELETE_FORBIDDEN'
      using errcode='23503',
            hint='Cancel the existing match instead. Keep the same event UUID and registrations.';
  end if;

  if new.event_type is distinct from old.event_type then
    raise exception 'MATCH_EVENT_TYPE_IMMUTABLE'
      using errcode='23514',
            hint='Match identity must remain linked to the original event.';
  end if;

  -- Moving a match to another team could make registrations inaccessible.
  -- If it has participation or federation links, require a separate reviewed migration.
  if new.team_id is distinct from old.team_id and (
       exists(select 1 from public.availability a where a.event_id=old.id)
       or exists(select 1 from public.cc_coach_event_availability_v1 a where a.event_id=old.id)
       or exists(select 1 from public.competition_source_matches s where s.linked_event_id=old.id)
     ) then
    raise exception 'MATCH_TEAM_MOVE_WITH_ACTIVITY_FORBIDDEN'
      using errcode='23503',
            hint='Keep the original team and event UUID until registrations and mappings can be migrated safely.';
  end if;

  return new;
end;
$function$
;

CREATE TRIGGER trg_cc_preserve_competition_match_identity_v1 BEFORE DELETE OR UPDATE OF team_id, event_type ON public.events FOR EACH ROW EXECUTE FUNCTION private.cc_preserve_competition_match_identity_v1();
