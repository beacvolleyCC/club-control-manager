-- STAGED ONLY: stable-ID MRSZ official results for #2686 and #2700.
-- Never INSERT another canonical match or alter Manager events / bookings.
-- The original fixture JSON remains intact under sourceFixtureSnapshot.
BEGIN;
SET LOCAL statement_timeout='45s';
DO $cc_apply$
DECLARE
  item jsonb; original jsonb; official jsonb; k text; code text;
  old_id uuid; new_id uuid; applied int:=0;
  old_count int; new_count int; old_played int; new_played int;
  old_identity text; new_identity text;
  proofs jsonb := $cc_proofs$[{"sourceKey":"mrsz:2026/27:protocol:2686","fixtureKey":"20261001:fixture:39","fileSha256":"b72d1dd8d4e1a6db04a5ddc7fc7c2ea0c021a4a67d755bdaea85aef3b890c9c1","data":{"matchCode":2686,"season":"2026/27","source":"mrsz_official_protocol_pdf","originalFile":"mtk-panorama_bb1.pdf","leagueKey":"womenI","competitionLabel":"Női Budapest I. osztály","homeName":"MTK Budapest","awayName":"Panoráma SE","homeSourceTeamId":"1092","awaySourceTeamId":"753","startsAt":"2026-10-21T21:00:00+02:00","venue":"MTK RÖPLABDA CSARNOK BUDAPEST SZAMOS UTCA 2/C","homeSets":3,"awaySets":1,"status":"played","setScores":[{"set":1,"home":25,"away":20},{"set":2,"home":25,"away":9},{"set":3,"home":20,"away":25},{"set":4,"home":25,"away":15}],"referee":{"name":"HERR ZSUZSANNA","registrationId":27000},"scorekeeper":{"name":"SELMECZI VANDA","registrationId":21008},"officials":{"home":[{"name":"PUENTES RIVERY YULIEL","designation":"vezetőedző","registrationId":58769}],"away":[{"name":"RÉDEY LUCA JULIANNA","designation":"vezetőedző","registrationId":23161}]},"rosters":{"home":[{"name":"JUHOS ROZÁLIA","jersey":1,"designation":"Cs","registrationId":21301},{"name":"SVIGRUHA ESZTER","jersey":4,"designation":"K","registrationId":26251},{"name":"KISS VIRÁG BARBARA","jersey":5,"designation":"K","registrationId":21303,"captain":true},{"name":"EHMANN KATA","jersey":7,"designation":"Cs","registrationId":21570},{"name":"CZENE DORKA","jersey":8,"designation":"Cs","registrationId":31340},{"name":"CSÓKA ESZTER LUCA","jersey":10,"designation":"K","registrationId":53808},{"name":"PUSKÁS IVETT","jersey":11,"designation":null,"registrationId":21232},{"name":"SOÓS BRIGITTA","jersey":12,"designation":"Cs","registrationId":27270},{"name":"RÓNYAI ERIKA","jersey":14,"designation":"K","registrationId":25162},{"name":"FÖLDI LUCA","jersey":23,"designation":"K","registrationId":22178},{"name":"DEÁK DORKA PANNA","jersey":27,"designation":"K","registrationId":58742},{"name":"DELI-GERMANN OLGA","jersey":13,"designation":"Cs","registrationId":21482,"libero":"L1"}],"away":[{"name":"BAGDI ZITA","jersey":7,"designation":"K","registrationId":26110},{"name":"FERENCZ ÉVA","jersey":9,"designation":"K","registrationId":24058},{"name":"HORVÁTH BARBARA","jersey":14,"designation":"K","registrationId":22396},{"name":"MOLNÁR FLÓRA","jersey":16,"designation":"K","registrationId":71563},{"name":"RÉDEY LUCA JULIANNA","jersey":17,"designation":"K","registrationId":23161,"captain":true},{"name":"HORVÁTH JÚLIA DOROTTYA","jersey":18,"designation":"K","registrationId":34055},{"name":"KOVÁCS ANDREA","jersey":20,"designation":"Cs","registrationId":21911}]},"canonicalFixtureSourceKey":"20261001:fixture:39"}},{"sourceKey":"mrsz:2026/27:protocol:2700","fixtureKey":"brsz:2026/27:menB:userofficial:01","fileSha256":"e0dbe1e1e9b83d7324ad396b34d00879f7a07352084845008e81b8020a7c0736","data":{"matchCode":2700,"season":"2026/27","source":"mrsz_official_protocol_pdf","originalFile":"mozdulj-vasarhelyi_bb1.pdf","leagueKey":"menB","competitionLabel":"Férfi Budapest I. osztály – B csoport","homeName":"Mozdulj SE","awayName":"MAFC-Vásárhelyi","homeSourceTeamId":"1213","awaySourceTeamId":"45","startsAt":"2026-10-21T20:00:00+02:00","venue":"MOZDULJ SPORTCSARNOK BUDAPEST MONORI ÚT 15","homeSets":3,"awaySets":2,"status":"played","setScores":[{"set":1,"home":25,"away":18},{"set":2,"home":25,"away":23},{"set":3,"home":21,"away":25},{"set":4,"home":18,"away":25},{"set":5,"home":15,"away":11}],"referee":{"name":"VIG DIÁNA","registrationId":42098},"officials":{"home":[{"name":"HACKL SZILVIA","designation":"vezetőedző","registrationId":21345}],"away":[]},"rosters":{"home":[{"name":"BORSOS DÁVID","jersey":2,"designation":"Cs","registrationId":75227},{"name":"NÉMETI BENCE","jersey":6,"designation":"K","registrationId":80471},{"name":"BALÁZSI KRISZTIÁN","jersey":7,"designation":null,"registrationId":61342},{"name":"ONTKÓ ÁRON","jersey":9,"designation":"K","registrationId":31787},{"name":"TEMLEITNER LEÓ LEVENTE","jersey":10,"designation":"K","registrationId":75229},{"name":"STARK SÁNDOR","jersey":12,"designation":"K","registrationId":77930,"captain":true},{"name":"LÁSZLÓ KÁROLY","jersey":17,"designation":"K","registrationId":75202},{"name":"KOMÁN HUNOR","jersey":18,"designation":"K","registrationId":82845},{"name":"GÁLIK ANDRÁS MÁRTON","jersey":28,"designation":null,"registrationId":76211},{"name":"RAB LEVENTE RÓBERT","jersey":8,"designation":"Cs","registrationId":75203,"libero":"L1"}],"away":[{"name":"SCHULCZ ISTVÁN","jersey":1,"designation":"K","registrationId":20407},{"name":"DOBOS VIKTOR","jersey":2,"designation":"K","registrationId":23320,"captain":true},{"name":"MELICHER PÉTER","jersey":4,"designation":"K","registrationId":20174},{"name":"VARGA DÁNIEL","jersey":6,"designation":"Cs","registrationId":66302},{"name":"CSIZMADIA PÉTER DR.","jersey":7,"designation":"K","registrationId":23321},{"name":"SÓS GERGELY","jersey":8,"designation":"K","registrationId":23314},{"name":"ECKERT ISTVÁN","jersey":9,"designation":"K","registrationId":20550},{"name":"SZEBELLÉDY BALÁZS LAJOS","jersey":11,"designation":"Cs","registrationId":22913},{"name":"FARNADY ERNŐ","jersey":14,"designation":"Cs","registrationId":22046,"libero":"L1"}]},"canonicalFixtureSourceKey":"brsz:2026/27:menB:userofficial:01"}}]$cc_proofs$::jsonb;
BEGIN
 SELECT count(*),count(*) FILTER(WHERE match_status='played'),
        md5(string_agg(match_id::text||':'||source_key,',' ORDER BY source_key))
 INTO old_count,old_played,old_identity FROM private.cc_canonical_competition_matches_v1;
 IF old_count<>298 OR old_played NOT IN (13,15) THEN
  RAISE EXCEPTION 'CC_PROTOCOL_BASELINE_DRIFT: count %, played %',old_count,old_played;
 END IF;
 FOR item IN SELECT value FROM jsonb_array_elements(proofs) AS x(value) LOOP
  k:=item->>'fixtureKey'; official:=item->'data'; code:=official->>'matchCode';
  IF code NOT IN ('2686','2700') OR item->>'sourceKey'<>'mrsz:2026/27:protocol:'||code THEN
   RAISE EXCEPTION 'CC_PROTOCOL_SOURCE_MISMATCH: %',code;
  END IF;
  IF EXISTS(SELECT 1 FROM public.cc_competition_mrsz_screenshot_v1
            WHERE source_key=item->>'sourceKey')
   OR EXISTS(SELECT 1 FROM private.cc_canonical_match_aliases_v1
             WHERE source_system='mrsz_protocol' AND source_key=item->>'sourceKey')
  THEN RAISE EXCEPTION 'CC_PROTOCOL_DUPLICATE_SOURCE: %',code; END IF;
  SELECT match_id INTO STRICT old_id FROM private.cc_canonical_competition_matches_v1
   WHERE source_key=k;
  SELECT data INTO STRICT original FROM public.cc_competition_mrsz_screenshot_v1
   WHERE source_key=k AND season='2026/27'
     AND record_kind='fixture'
     AND competition_label=official->>'competitionLabel'
   FOR UPDATE;
  IF original->>'officialProtocolMatchCode'=code THEN
   IF original->'officialProtocolEvidence' IS DISTINCT FROM official
    OR original->>'officialProtocolFileSha256'<>item->>'fileSha256'
    OR original->>'status'<>'played'
   THEN RAISE EXCEPTION 'CC_PROTOCOL_RERUN_DRIFT: %',code; END IF;
  ELSE
   IF original ? 'sourceFixtureSnapshot' OR original ? 'officialProtocolEvidence'
     OR original ? 'officialProtocolMatchCode' OR original->>'status'<>'scheduled'
     OR original->>'homeSets' IS NOT NULL OR original->>'awaySets' IS NOT NULL
     OR original->>'startsAt'<>left(official->>'startsAt',19)
     OR original->>'awayName'<>official->>'awayName'
     OR original->>'homeSourceTeamId'<>official->>'homeSourceTeamId'
     OR original->>'awaySourceTeamId'<>official->>'awaySourceTeamId'
     OR (code='2686' AND original->>'homeName'<>'MTK')
     OR (code='2700' AND original->>'homeName'<>'Mozdulj SE')
     OR original->>'matchCode' IS NOT NULL
   THEN RAISE EXCEPTION 'CC_PROTOCOL_FIXTURE_DRIFT: %',k; END IF;
   UPDATE public.cc_competition_mrsz_screenshot_v1 s
   SET data=s.data||jsonb_build_object(
      'sourceFixtureSnapshot',s.data,
      'officialProtocolMatchCode',code,
      'officialProtocolSourceKey',item->>'sourceKey',
      'officialProtocolFileSha256',item->>'fileSha256',
      'officialProtocolEvidence',official,
      'homeSets',official->'homeSets','awaySets',official->'awaySets',
      'setScores',official->'setScores','rosters',official->'rosters',
      'status','played'
    ),updated_at=now()
   WHERE source_key=k;
   IF NOT FOUND THEN RAISE EXCEPTION 'CC_PROTOCOL_UPDATE_MISSED: %',k; END IF;
   applied:=applied+1;
  END IF;
  SELECT match_id INTO STRICT new_id FROM private.cc_canonical_competition_matches_v1
   WHERE source_key=k;
  IF old_id<>new_id THEN RAISE EXCEPTION 'CC_PROTOCOL_MATCH_UUID_CHANGED: %',k; END IF;
 END LOOP;
 SELECT count(*),count(*) FILTER(WHERE match_status='played'),
        md5(string_agg(match_id::text||':'||source_key,',' ORDER BY source_key))
 INTO new_count,new_played,new_identity FROM private.cc_canonical_competition_matches_v1;
 IF new_count<>old_count OR old_identity<>new_identity
   OR new_played<>old_played+applied OR applied NOT IN (0,2) THEN
  RAISE EXCEPTION 'CC_PROTOCOL_REGRESSION (total %/% played %/% applied %)',
   old_count,new_count,old_played,new_played,applied;
 END IF;
 RAISE NOTICE 'CC_PROTOCOL_RESULT_OVERLAY_OK applied=% total=% played=%',applied,new_count,new_played;
END $cc_apply$;
-- Only change the matchCode projection; keep every other existing protocol,
-- roster, statistic and match projection expression unchanged.
CREATE OR REPLACE FUNCTION private.cc_competition_canonical_payload_v1()
 RETURNS jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO ''
AS $function$
select coalesce(jsonb_agg(jsonb_build_object(
'matchId',m.match_id,'sourceKey',m.source_key,'season',m.season,
'competitionLabel',m.competition_label,
'homeName',coalesce(s.data->'officialProtocolEvidence'->>'homeName',m.home_name),
'awayName',coalesce(s.data->'officialProtocolEvidence'->>'awayName',m.away_name),
'startsAt',case when m.kickoff_local is null then null else to_char(m.kickoff_local,'YYYY-MM-DD"T"HH24:MI:SS') end,
'homeSets',m.home_sets,'awaySets',m.away_sets,'setScores',m.set_scores,
'protocolUrl',m.protocol_url,'matchCode',coalesce(s.data->>'matchCode',s.data->>'officialProtocolMatchCode'),'rosters',s.data->'rosters',
'protocol',coalesce(
   case when jsonb_typeof(pr.data->'protocol'->'teams')='array' and jsonb_array_length(pr.data->'protocol'->'teams')=2
     then pr.data->'protocol'||jsonb_build_object('sourceUrl',m.protocol_url) else null end,
   case when jsonb_typeof(s.data->'rosters'->'home')='array' and jsonb_typeof(s.data->'rosters'->'away')='array'
     then jsonb_build_object('sourceUrl',m.protocol_url,'teams',jsonb_build_array(
       jsonb_build_object('name',coalesce(s.data->'officialProtocolEvidence'->>'homeName',m.home_name),'players',coalesce(
         (select jsonb_agg(jsonb_build_object('name',pl.v->>'name','number',pl.v->>'jersey',
          'code',pl.v->>'registrationId','captain',pl.v->'captain','libero',pl.v->>'libero','designation',case when upper(coalesce(pl.v->>'designation',''))='CS' then 'CS' else pl.v->>'designation' end) order by pl.ord)
          from jsonb_array_elements(s.data->'rosters'->'home') with ordinality pl(v,ord)),'[]'::jsonb),
       'staff',coalesce((select jsonb_agg(
          jsonb_build_object('name',o.v->>'name','role',o.v->>'designation',
                             'code',o.v->>'registrationId') order by o.ord)
          from jsonb_array_elements(case
             when jsonb_typeof(s.data->'officialProtocolEvidence'->'officials'->'home')='array'
             then s.data->'officialProtocolEvidence'->'officials'->'home'
             else '[]'::jsonb end) with ordinality o(v,ord)),'[]'::jsonb)),
       jsonb_build_object('name',coalesce(s.data->'officialProtocolEvidence'->>'awayName',m.away_name),'players',coalesce(
         (select jsonb_agg(jsonb_build_object('name',pl.v->>'name','number',pl.v->>'jersey',
          'code',pl.v->>'registrationId','captain',pl.v->'captain','libero',pl.v->>'libero','designation',case when upper(coalesce(pl.v->>'designation',''))='CS' then 'CS' else pl.v->>'designation' end) order by pl.ord)
          from jsonb_array_elements(s.data->'rosters'->'away') with ordinality pl(v,ord)),'[]'::jsonb),
       'staff',coalesce((select jsonb_agg(
          jsonb_build_object('name',o.v->>'name','role',o.v->>'designation',
                             'code',o.v->>'registrationId') order by o.ord)
          from jsonb_array_elements(case
             when jsonb_typeof(s.data->'officialProtocolEvidence'->'officials'->'away')='array'
             then s.data->'officialProtocolEvidence'->'officials'->'away'
             else '[]'::jsonb end) with ordinality o(v,ord)),'[]'::jsonb))
       ),
       'officials',coalesce((select jsonb_agg(jsonb_build_object(
            'name',z.person->>'name','role',z.role,'code',z.person->>'registrationId'
          ) order by z.priority)
          from (values
            (1,s.data->'officialProtocolEvidence'->'referee','Játékvezető'::text),
            (2,s.data->'officialProtocolEvidence'->'scorekeeper','Jegyzőkönyvvezető'::text)
          ) z(priority,person,role)
          where jsonb_typeof(z.person)='object'),'[]'::jsonb)
       ) else null end),
'venue',m.venue,'status',m.match_status,'source',s.data->>'source',
'homeSourceTeamId',m.home_source_team_id,'awaySourceTeamId',m.away_source_team_id)
order by m.competition_label,m.kickoff_local nulls last,m.source_key),'[]'::jsonb)
from private.cc_canonical_competition_matches_v1 m
left join public.cc_competition_mrsz_screenshot_v1 s on s.source_key=m.source_key
left join lateral (
 select other.data from public.cc_competition_mrsz_screenshot_v1 other
 where other.competition_label=m.competition_label
 and other.record_kind='match'
 and other.data->>'matchCode'=s.data->>'matchCode'
 and jsonb_typeof(other.data->'protocol'->'teams')='array'
 order by other.source_key limit 1
) pr on true;
$function$;
-- A verified internally stored PDF-derived report counts as a linked protocol,
-- even when the federation URL has not been independently verified.
CREATE OR REPLACE FUNCTION private.cc_competition_canonical_coverage_v1()
 RETURNS jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO ''
AS $function$
select coalesce(jsonb_agg(jsonb_build_object(
  'competitionLabel',s.competition_label,'season','2026/27',
  'total',s.total,'played',s.played,'scheduled',s.scheduled,'postponed',s.postponed,
  'protocolLinked',s.protocol_linked,
  'source','canonical_matches_2026_27',
  'officialStandingsVerified',false
) order by s.competition_label),'[]'::jsonb)
from (
 select m.competition_label,count(*) total,
 count(*) filter(where match_status='played') played,
 count(*) filter(where match_status='scheduled') scheduled,
 count(*) filter(where match_status='postponed') postponed,
 count(*) filter(where m.match_status='played' and (
   m.protocol_url is not null or (
     s.data->>'officialProtocolMatchCode'=s.data->'officialProtocolEvidence'->>'matchCode'
     and coalesce(s.data->>'officialProtocolFileSha256','') ~ '^[0-9a-f]{64}$'
     and jsonb_typeof(s.data->'officialProtocolEvidence'->'rosters'->'home')='array'
     and jsonb_typeof(s.data->'officialProtocolEvidence'->'rosters'->'away')='array'
   )
 )) protocol_linked
 from private.cc_canonical_competition_matches_v1 m
 left join public.cc_competition_mrsz_screenshot_v1 s on s.source_key=m.source_key
 group by m.competition_label
) s;
$function$;

COMMIT;
