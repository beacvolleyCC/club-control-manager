CREATE OR REPLACE FUNCTION public.cc_competition_sync_apply_team_v1(p_run_id uuid, p_source text, p_season text, p_source_team_id text, p_matches jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_map public.competition_source_team_maps%rowtype;
  v_item jsonb;
  v_existing public.competition_source_matches%rowtype;
  v_event public.events%rowtype;
  v_before jsonb;
  v_after jsonb;
  v_start timestamptz;
  v_old_start timestamptz;
  v_old_end timestamptz;
  v_new_end timestamptz;
  v_duration interval;
  v_key text;
  v_home_id text;
  v_away_id text;
  v_home_name text;
  v_away_name text;
  v_title text;
  v_venue text;
  v_referee text;
  v_source_url text;
  v_hash text;
  v_home_away text;
  v_review boolean;
  v_review_reason text;
  v_change_type text;
  v_created integer:=0;
  v_updated integer:=0;
  v_linked integer:=0;
  v_unchanged integer:=0;
  v_review_count integer:=0;
  v_changes integer:=0;
  v_count integer:=0;
  v_pair_candidate_count integer:=0;
  v_pair_candidate_id uuid;
begin
  if lower(trim(coalesce(p_source,''))) not in ('brsz','mrsz') then raise exception 'SYNC_SOURCE_INVALID'; end if;
  if jsonb_typeof(coalesce(p_matches,'null'::jsonb))<>'array' then raise exception 'SYNC_MATCH_ARRAY_REQUIRED'; end if;
  v_count:=jsonb_array_length(p_matches);
  if v_count>250 then raise exception 'SYNC_MATCH_ARRAY_TOO_LARGE:%',v_count; end if;
  -- MGR015_SAFE_IDENTITY_V2: distinct incoming rows for the same pair
  -- must not silently overwrite a source event with RSVP data.
  if exists (
    select 1 from jsonb_array_elements(p_matches) item
    where nullif(trim(coalesce(item->>'homeSourceTeamId','')),'') is not null
      and nullif(trim(coalesce(item->>'awaySourceTeamId','')),'') is not null
    group by item->>'homeSourceTeamId',item->>'awaySourceTeamId'
    having count(*)>1
  ) then raise exception 'SYNC_AMBIGUOUS_PAIR_IN_INCOMING_SCHEDULE'; end if;

  select * into v_map
  from public.competition_source_team_maps m
  where m.source=lower(trim(p_source))
    and m.season=trim(p_season)
    and m.source_team_id=trim(p_source_team_id)
    and m.enabled=true
  for share;
  if not found then raise exception 'SYNC_TEAM_MAP_NOT_FOUND:%:%:%',p_source,p_season,p_source_team_id; end if;

  for v_item in select value from jsonb_array_elements(p_matches)
  loop
    v_key:=nullif(trim(coalesce(v_item->>'sourceMatchKey','')),'');
    if v_key is null then raise exception 'SYNC_MATCH_KEY_REQUIRED'; end if;

    v_home_id:=nullif(trim(coalesce(v_item->>'homeSourceTeamId','')),'');
    v_away_id:=nullif(trim(coalesce(v_item->>'awaySourceTeamId','')),'');
    v_home_name:=trim(coalesce(v_item->>'homeName',''));
    v_away_name:=trim(coalesce(v_item->>'awayName',''));
    v_title:=trim(concat_ws(' – ',nullif(v_home_name,''),nullif(v_away_name,'')));
    v_venue:=nullif(trim(coalesce(v_item->>'venue','')),'');
    v_referee:=nullif(trim(coalesce(v_item->>'referee','')),'');
    v_source_url:=nullif(trim(coalesce(v_item->>'sourceUrl','')),'');
    v_hash:=nullif(trim(coalesce(v_item->>'sourceHash','')),'');
    v_review:=coalesce((v_item->>'needsReview')::boolean,false);
    v_review_reason:=nullif(trim(coalesce(v_item->>'reviewReason','')),'');

    begin
      v_start:=nullif(v_item->>'startsAt','')::timestamptz;
    exception when others then
      v_start:=null;
      v_review:=true;
      v_review_reason:=coalesce(v_review_reason,'Érvénytelen kezdési idő.');
    end;

    if v_home_id=v_map.source_team_id and v_away_id=v_map.source_team_id then
      v_review:=true;
      v_review_reason:=coalesce(v_review_reason,'A forrásban ugyanaz a csapat szerepel mindkét oldalon.');
    end if;

    if v_home_id=v_map.source_team_id then v_home_away:='home';
    elsif v_away_id=v_map.source_team_id then v_home_away:='away';
    else
      v_home_away:=null;
      v_review:=true;
      v_review_reason:=coalesce(v_review_reason,'A figyelt BRSZ/MRSZ csapat nincs a párosításban.');
    end if;

    select * into v_existing
    from public.competition_source_matches s
    where s.source=v_map.source and s.season=v_map.season and s.source_match_key=v_key
    for update;

    -- MGR015_SYNC_PAIR_IDENTITY_RECOVERY_V1
    -- If BRSZ changes/rebuilds its technical row key, recover the already linked
    -- source row only when the exact home/away pairing is unique in this context.
    -- Kickoff time is intentionally NOT part of this identity check: schedule
    -- changes must update the same canonical event and preserve its availability.
    if v_existing.id is null and v_home_id is not null and v_away_id is not null then
      select count(*)::integer,min(s.id::text)::uuid
      into v_pair_candidate_count,v_pair_candidate_id
      from public.competition_source_matches s
      where s.source=v_map.source
        and s.season=v_map.season
        and s.source_team_id=v_map.source_team_id
        and s.internal_team_id=v_map.internal_team_id
        and s.home_source_team_id=v_home_id
        and s.away_source_team_id=v_away_id
        and s.linked_event_id is not null
        and s.needs_review=false;

      if v_pair_candidate_count=1 and v_pair_candidate_id is not null then
        select * into v_existing
        from public.competition_source_matches s
        where s.id=v_pair_candidate_id
        for update;

        if v_existing.source_match_key is distinct from v_key then
          update public.competition_source_matches s
          set source_match_key=v_key,updated_at=now(),last_run_id=p_run_id
          where s.id=v_existing.id
          returning * into v_existing;
        end if;
      end if;
    end if;

    -- MGR015_SAFE_IDENTITY_V2: changed key with pre-existing pairing;
    -- unique linked pairs are already recovered above.
    if v_existing.id is null and v_home_id is not null and v_away_id is not null
       and exists (
         select 1 from public.competition_source_matches s
         where s.source=v_map.source and s.season=v_map.season
           and s.source_team_id=v_map.source_team_id
           and s.internal_team_id=v_map.internal_team_id
           and s.home_source_team_id=v_home_id
           and s.away_source_team_id=v_away_id
       ) then
      v_review:=true;
      v_review_reason:=coalesce(v_review_reason,
        'Az új BRSZ-azonosító meglévő párosítással ütközik; a jelentkezések védelmében kézi egyeztetés szükséges.');
    end if;

    -- Different opponent at the same start cannot adopt or replace an RSVP-linked match.
    if v_existing.linked_event_id is null and v_start is not null
       and exists (
         select 1 from public.events e
         where e.team_id=v_map.internal_team_id and e.event_type='match'
           and e.status<>'archived' and e.starts_at=v_start
           and lower(trim(coalesce(e.title,'')))<>lower(v_title)
           and (
             exists(select 1 from public.availability a where a.event_id=e.id)
             or exists(select 1 from public.competition_source_matches s where s.linked_event_id=e.id)
           )
       ) then
      v_review:=true;
      v_review_reason:=coalesce(v_review_reason,
        'A kezdési időpont más ellenfélhez tartozó, már használt meccsel ütközik. Az eredeti jelentkezések megmaradnak.');
    end if;

    if v_review or v_start is null then
      insert into public.competition_source_matches(
        source,season,source_match_key,source_team_id,internal_team_id,
        home_source_team_id,away_source_team_id,home_name,away_name,starts_at,
        venue,referee,source_status,source_url,source_hash,needs_review,review_reason,
        linked_event_id,raw_payload,last_seen_at,last_run_id,updated_at
      ) values(
        v_map.source,v_map.season,v_key,v_map.source_team_id,v_map.internal_team_id,
        v_home_id,v_away_id,v_home_name,v_away_name,v_start,
        v_venue,v_referee,coalesce(nullif(v_item->>'sourceStatus',''),'scheduled'),v_source_url,v_hash,true,v_review_reason,
        v_existing.linked_event_id,coalesce(v_item,'{}'::jsonb),now(),p_run_id,now()
      )
      on conflict(source,season,source_match_key) do update set
        source_team_id=excluded.source_team_id,internal_team_id=excluded.internal_team_id,
        home_source_team_id=excluded.home_source_team_id,away_source_team_id=excluded.away_source_team_id,
        home_name=excluded.home_name,away_name=excluded.away_name,starts_at=excluded.starts_at,
        venue=excluded.venue,referee=excluded.referee,source_status=excluded.source_status,
        source_url=excluded.source_url,source_hash=excluded.source_hash,needs_review=true,
        review_reason=excluded.review_reason,raw_payload=excluded.raw_payload,last_seen_at=now(),last_run_id=p_run_id,updated_at=now();
      v_review_count:=v_review_count+1;
      continue;
    end if;

    -- Existing source link wins. Otherwise safely adopt an exact slot/title match.
    v_event.id:=null;
    if v_existing.linked_event_id is not null then
      select * into v_event from public.events e where e.id=v_existing.linked_event_id for update;
    end if;

    if v_event.id is null then
      select * into v_event
      from public.events e
      where e.team_id=v_map.internal_team_id
        and e.event_type='match'
        and e.status<>'archived'
        and lower(trim(coalesce(e.title,'')))=lower(v_title)
        and (
          e.starts_at=v_start
          or (
            (e.starts_at at time zone 'Europe/Budapest')::date=(v_start at time zone 'Europe/Budapest')::date
            and lower(trim(coalesce(e.title,'')))=lower(v_title)
          )
        )
      order by case when e.starts_at=v_start then 0 else 1 end,abs(extract(epoch from (e.starts_at-v_start)))
      limit 1
      for update;
      if v_event.id is not null then v_linked:=v_linked+1; end if;
    end if;

    if v_event.id is null then
      perform set_config('cc.suppress_event_notification','on',true);
      insert into public.events(
        team_id,event_type,title,starts_at,ends_at,venue,address,court,color,home_away,
        meeting_at,meeting_place,series_id,status
      )
      select
        v_map.internal_team_id,'match',coalesce(nullif(v_title,''),'Meccs'),v_start,null,v_venue,null,null,t.color,v_home_away,
        null,null,null,'active'
      from public.teams t where t.id=v_map.internal_team_id
      returning * into v_event;

      v_created:=v_created+1;
      v_changes:=v_changes+1;
      insert into public.competition_source_changes(
        run_id,source,season,source_match_key,internal_team_id,event_id,change_type,before_data,after_data
      ) values(
        p_run_id,v_map.source,v_map.season,v_key,v_map.internal_team_id,v_event.id,'created',null,to_jsonb(v_event)
      );
    else
      v_before:=to_jsonb(v_event);
      v_old_start:=v_event.starts_at;
      v_old_end:=v_event.ends_at;
      v_new_end:=v_old_end;
      if v_old_start is distinct from v_start and v_old_end is not null and v_old_end>v_old_start then
        v_duration:=v_old_end-v_old_start;
        if v_duration>interval '0 minutes' and v_duration<interval '8 hours' then v_new_end:=v_start+v_duration; end if;
      end if;

      if v_event.title is distinct from coalesce(nullif(v_title,''),v_event.title)
         or v_event.starts_at is distinct from v_start
         or v_event.ends_at is distinct from v_new_end
         or v_event.venue is distinct from v_venue
         or v_event.home_away is distinct from v_home_away then
        perform set_config('cc.suppress_event_notification','on',true);
        update public.events e set
          title=coalesce(nullif(v_title,''),e.title),
          starts_at=v_start,
          ends_at=v_new_end,
          venue=v_venue,
          home_away=v_home_away,
          updated_at=now()
        where e.id=v_event.id
        returning * into v_event;
        v_after:=to_jsonb(v_event);

        v_change_type:=case
          when (v_before->>'starts_at') is distinct from (v_after->>'starts_at')
               and (v_before->>'venue') is distinct from (v_after->>'venue') then 'multiple'
          when (v_before->>'starts_at') is distinct from (v_after->>'starts_at') then 'schedule'
          when (v_before->>'venue') is distinct from (v_after->>'venue') then 'venue'
          when (v_before->>'title') is distinct from (v_after->>'title') then 'opponent'
          when (v_before->>'home_away') is distinct from (v_after->>'home_away') then 'home_away'
          else 'multiple'
        end;
        v_updated:=v_updated+1;
        v_changes:=v_changes+1;
        insert into public.competition_source_changes(
          run_id,source,season,source_match_key,internal_team_id,event_id,change_type,before_data,after_data
        ) values(
          p_run_id,v_map.source,v_map.season,v_key,v_map.internal_team_id,v_event.id,v_change_type,v_before,v_after
        );
      else
        v_unchanged:=v_unchanged+1;
      end if;
    end if;

    insert into public.competition_source_matches(
      source,season,source_match_key,source_team_id,internal_team_id,
      home_source_team_id,away_source_team_id,home_name,away_name,starts_at,
      venue,referee,source_status,source_url,source_hash,needs_review,review_reason,
      linked_event_id,raw_payload,last_seen_at,last_run_id,updated_at
    ) values(
      v_map.source,v_map.season,v_key,v_map.source_team_id,v_map.internal_team_id,
      v_home_id,v_away_id,v_home_name,v_away_name,v_start,
      v_venue,v_referee,coalesce(nullif(v_item->>'sourceStatus',''),'scheduled'),v_source_url,v_hash,false,null,
      v_event.id,coalesce(v_item,'{}'::jsonb),now(),p_run_id,now()
    )
    on conflict(source,season,source_match_key) do update set
      source_team_id=excluded.source_team_id,internal_team_id=excluded.internal_team_id,
      home_source_team_id=excluded.home_source_team_id,away_source_team_id=excluded.away_source_team_id,
      home_name=excluded.home_name,away_name=excluded.away_name,starts_at=excluded.starts_at,
      venue=excluded.venue,referee=excluded.referee,source_status=excluded.source_status,
      source_url=excluded.source_url,source_hash=excluded.source_hash,needs_review=false,review_reason=null,
      linked_event_id=excluded.linked_event_id,raw_payload=excluded.raw_payload,last_seen_at=now(),last_run_id=p_run_id,updated_at=now();
  end loop;

  return jsonb_build_object(
    'ok',true,'source',v_map.source,'season',v_map.season,'sourceTeamId',v_map.source_team_id,
    'teamId',v_map.internal_team_id,'fetched',v_count,'created',v_created,'updated',v_updated,
    'linked',v_linked,'unchanged',v_unchanged,'review',v_review_count,'changes',v_changes
  );
end
$function$

