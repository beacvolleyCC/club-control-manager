-- Exact read-only canonical view definition retrieved from current LIVE schema.
-- Checked into the isolated fixture to detect changes affecting identity.
CREATE VIEW private.cc_canonical_competition_matches_v1 AS
WITH raw AS (
         SELECT s.source_key,
            s.season,
            s.competition_label,
            s.record_kind,
            s.data,
            COALESCE(a.match_id, md5('cc:protocol:'::text || COALESCE(NULLIF(s.data ->> 'matchCode'::text, ''::text), s.source_key))::uuid) AS match_id,
            NULLIF("left"(s.data ->> 'startsAt'::text, 19), ''::text)::timestamp without time zone AS kickoff_local,
            (s.data ->> 'homeSets'::text)::integer AS home_sets,
            (s.data ->> 'awaySets'::text)::integer AS away_sets,
            s.data ->> 'homeName'::text AS home_name,
            s.data ->> 'awayName'::text AS away_name,
            NULLIF(s.data ->> 'matchCode'::text, ''::text) AS protocol_code
           FROM cc_competition_mrsz_screenshot_v1 s
             LEFT JOIN private.cc_canonical_match_aliases_v1 a ON a.source_system = 'mrsz_protocol'::text AND a.source_key = s.source_key
          WHERE (s.record_kind = ANY (ARRAY['fixture'::text, 'match'::text])) AND s.season = '2026/27'::text AND COALESCE(s.data ->> 'homeName'::text, ''::text) <> COALESCE(s.data ->> 'awayName'::text, ''::text) AND (s.source_key <> ALL (ARRAY['20261001:fixture:31'::text, '20261001:fixture:32'::text, '20261001:fixture:33'::text, '20261001:fixture:34'::text, '20261001:fixture:35'::text, '20261001:fixture:36'::text, '20261001:fixture:40'::text, '20261001:fixture:62'::text, '20261001:fixture:63'::text, '20261001:fixture:91'::text, '20261001:fixture:92'::text, '20261001:fixture:0'::text, '20261001:fixture:1'::text]))
        ), ranked AS (
         SELECT raw.source_key,
            raw.season,
            raw.competition_label,
            raw.record_kind,
            raw.data,
            raw.match_id,
            raw.kickoff_local,
            raw.home_sets,
            raw.away_sets,
            raw.home_name,
            raw.away_name,
            raw.protocol_code,
            row_number() OVER (PARTITION BY raw.season, raw.competition_label, (
                CASE
                    WHEN raw.protocol_code IS NOT NULL THEN 'protocol:'::text || raw.protocol_code
                    ELSE (((('fixture:'::text || regexp_replace(lower(raw.home_name), '[^[:alnum:]]'::text, ''::text, 'g'::text)) || ':'::text) || regexp_replace(lower(raw.away_name), '[^[:alnum:]]'::text, ''::text, 'g'::text)) || ':'::text) || COALESCE(raw.kickoff_local::date::text, 'postponed'::text)
                END) ORDER BY (
                CASE
                    WHEN raw.source_key ~~ 'mrsz:2026/27:protocol:%'::text THEN 0
                    WHEN raw.record_kind = 'match'::text THEN 1
                    ELSE 2
                END), raw.source_key) AS rn
           FROM raw
        )
 SELECT match_id,
    source_key,
    season,
    competition_label,
    record_kind,
    home_name,
    away_name,
    kickoff_local,
    home_sets,
    away_sets,
    data -> 'setScores'::text AS set_scores,
    data ->> 'protocolUrl'::text AS protocol_url,
    data ->> 'venue'::text AS venue,
    COALESCE(NULLIF(data ->> 'status'::text, ''::text),
        CASE
            WHEN home_sets IS NOT NULL AND away_sets IS NOT NULL THEN 'played'::text
            ELSE 'scheduled'::text
        END) AS match_status,
    data ->> 'homeSourceTeamId'::text AS home_source_team_id,
    data ->> 'awaySourceTeamId'::text AS away_source_team_id
   FROM ranked
  WHERE rn = 1;
