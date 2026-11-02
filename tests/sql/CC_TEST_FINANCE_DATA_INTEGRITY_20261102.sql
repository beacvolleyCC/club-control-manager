-- Club Control TEST finance persistence prerequisites (read-only).
-- No INSERT, UPDATE, DELETE, or actual privileged Manager session.
WITH checks AS (
 SELECT
 EXISTS (
  SELECT 1 FROM pg_index i
  JOIN pg_class t ON t.oid=i.indrelid
  JOIN pg_namespace n ON n.oid=t.relnamespace
  WHERE n.nspname='public' AND t.relname='cc_player_fee_meta_v2382'
  AND i.indisunique AND i.indisvalid
  AND (SELECT array_agg(a.attname ORDER BY u.ord)
       FROM unnest(i.indkey) WITH ORDINALITY u(attnum,ord)
       JOIN pg_attribute a ON a.attrelid=t.oid AND a.attnum=u.attnum)
   = ARRAY['player_id','fee_type','period_key','season']::name[]
 ) AS composite_upsert_key_present,
 (SELECT count(*) FROM pg_trigger tr
  JOIN pg_class t ON t.oid=tr.tgrelid
  JOIN pg_namespace n ON n.oid=t.relnamespace
  WHERE n.nspname='public'
  AND t.relname IN ('cc_club_finance_settings_v1','cc_team_finance_settings_v1')
  AND NOT tr.tgisinternal AND tr.tgenabled<>'D') >= 2 AS settings_audit_triggers_active,
 EXISTS (
  SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public' AND p.proname='cc_manager_finance_override_set_v1'
  AND pg_get_functiondef(p.oid) LIKE '%p_fee_type is null%'
  AND pg_get_functiondef(p.oid) LIKE '%p_status is null%'
  AND pg_get_functiondef(p.oid) LIKE '%insert into public.cc_player_fee_audit_v2382%'
 ) AS override_validates_nullable_enums_and_audits
)
SELECT to_jsonb(checks) AS finance_integrity_qa FROM checks;
