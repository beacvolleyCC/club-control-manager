-- Club Control official protocol RELEASE preflight. READ-ONLY SELECT only.
-- Does not impersonate a signed-in user, does not print athlete details,
-- and does not grant, update or install anything in LIVE Supabase.
WITH permitted_rpc AS (
 SELECT p.proname,
   p.prosecdef AS security_definer,
   has_function_privilege('anon',p.oid,'EXECUTE') AS anon_exec,
   has_function_privilege('authenticated',p.oid,'EXECUTE') AS signed_exec,
   has_function_privilege('public',p.oid,'EXECUTE') AS public_exec,
   pg_get_functiondef(p.oid) AS definition
 FROM pg_proc p
 JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND p.proname IN
   ('cc_manager_competition_mrsz_snapshot_v1',
    'cc_manager_competition_mrsz_snapshot_v2',
    'cc_player_competition_mrsz_snapshot_v1',
    'cc_player_competition_mrsz_snapshot_v2')
), fixture AS (
 SELECT source_key,season,competition_label,record_kind,
   data ? 'officialProtocolEvidence' AS has_new_overlay,
   data->>'officialProtocolMatchCode' AS match_code
 FROM public.cc_competition_mrsz_screenshot_v1
 WHERE source_key IN ('20261001:fixture:39',
   'brsz:2026/27:menB:userofficial:01')
)
SELECT jsonb_build_object(
 'checkedAt',now(),
 'canonicalCount',(SELECT count(*) FROM private.cc_canonical_competition_matches_v1),
 'playedCount',(SELECT count(*) FROM private.cc_canonical_competition_matches_v1
  WHERE match_status='played'),
 'eventsCount',(SELECT count(*) FROM public.events),
 'availabilityCount',(SELECT count(*) FROM public.availability),
 'expectedSourceRows',(SELECT count(*) FROM fixture),
 'installedProtocolOverlays',(SELECT count(*) FROM fixture WHERE has_new_overlay),
 'sourceLabels',(SELECT coalesce(jsonb_agg(jsonb_build_object(
   'key',source_key,'season',season,'division',competition_label,
   'recordKind',record_kind,'overlayPresent',has_new_overlay) ORDER BY source_key),'[]'::jsonb)
  FROM fixture),
 'rpcCount',(SELECT count(*) FROM permitted_rpc),
 'rpcAccess',(SELECT jsonb_agg(jsonb_build_object(
   'name',proname,'definer',security_definer,
   'anonExec',anon_exec,'authenticatedExec',signed_exec,
   'publicExec',public_exec,
   'callsManagerGate',definition LIKE '%cc_manager_require_any_v1%',
   'callsPlayerMembership',definition LIKE '%PLAYER_NOT_ALLOWED%',
   'callsManagerV1',definition LIKE '%cc_manager_competition_mrsz_snapshot_v1%',
   'callsPlayerV1',definition LIKE '%cc_player_competition_mrsz_snapshot_v1%')
 ORDER BY proname) FROM permitted_rpc),
 'anonDirectSourceSelect',has_table_privilege('anon',
   'public.cc_competition_mrsz_screenshot_v1','SELECT'),
 'signedDirectSourceSelect',has_table_privilege('authenticated',
   'public.cc_competition_mrsz_screenshot_v1','SELECT'),
 'anonPrivatePayloadExecute',has_function_privilege('anon',
   'private.cc_competition_canonical_payload_v1()','EXECUTE'),
 'signedPrivatePayloadExecute',has_function_privilege('authenticated',
   'private.cc_competition_canonical_payload_v1()','EXECUTE')
) AS release_preflight;