-- TEST ONLY. Deployed to Supabase szzoubvhlwnojtzqjebc. Do NOT run on LIVE.
CREATE OR REPLACE FUNCTION public.cc_manager_finance_analytics_v1(p_season text DEFAULT '2026/27'::text, p_from date DEFAULT NULL::date, p_to date DEFAULT NULL::date)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE v_finance jsonb;v_passes jsonb;v_trainings jsonb;v_scopes jsonb;
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS(
    SELECT 1 FROM public.manager_accounts WHERE auth_user_id=auth.uid() AND active=true
  ) THEN RAISE EXCEPTION 'AUTH_REQUIRED' USING errcode='42501'; END IF;
  IF p_from IS NOT NULL AND p_to IS NOT NULL AND p_to<p_from
    THEN RAISE EXCEPTION 'INVALID_PERIOD' USING errcode='22023'; END IF;
  v_scopes:=public.cc_manager_finance_scopes_v1(NULL);
  IF jsonb_array_length(v_scopes)=0 THEN
    RAISE EXCEPTION 'MANAGER_NOT_ALLOWED' USING errcode='42501'; END IF;

  WITH unique_member AS (
    SELECT tm.player_id, min(tm.team_id::text)::uuid AS team_id
    FROM public.team_memberships tm
    WHERE tm.active AND (tm.ends_on IS NULL OR tm.ends_on>=current_date)
    GROUP BY tm.player_id
    HAVING count(DISTINCT tm.team_id)=1
  ),
  base AS (
    SELECT DISTINCT ON (f.player_id,f.fee_type,coalesce(f.period_key,''))
      f.player_id,f.fee_type,coalesce(f.period_key,'') period_key,
      f.status,f.amount_huf,f.paid_at,f.source,f.updated_at
    FROM public.player_fees f
    WHERE f.archived_at IS NULL AND (p_season IS NULL OR f.season IS NULL OR f.season=p_season)
      AND f.fee_type IN ('beac_pass','coach_fee','permission_fee')
    ORDER BY f.player_id,f.fee_type,coalesce(f.period_key,''),f.updated_at DESC,f.id DESC
  ),
  merged AS (
    SELECT coalesce(b.player_id,m.player_id) player_id,coalesce(b.fee_type,m.fee_type) fee_type,
      coalesce(b.period_key,m.period_key) period_key,b.status base_status,b.amount_huf base_amount,
      b.paid_at base_paid_at,b.source,
      m.status meta_status,m.amount_huf meta_amount,m.paid_at meta_paid_at,m.paid_to,m.payment_method,
      m.override_active,m.note
    FROM base b FULL JOIN public.cc_player_fee_meta_v2382 m
      ON b.player_id=m.player_id AND b.fee_type=m.fee_type AND b.period_key=m.period_key
      AND (p_season IS NULL OR m.season=p_season)
    WHERE coalesce(b.fee_type,m.fee_type) IN ('beac_pass','coach_fee','permission_fee')
      AND (b.player_id IS NOT NULL OR (p_season IS NULL OR m.season=p_season))
  ), allowed AS (
    SELECT p.id AS player_id,p.display_name,p.name,t.id team_id,t.name team_name,
      m.fee_type,m.period_key,
      CASE WHEN coalesce(m.override_active,false) AND coalesce(m.note,'') NOT ILIKE 'AUTO_BEAC_IMPORT%'
           THEN m.meta_status ELSE coalesce(m.base_status,m.meta_status) END AS status,
      CASE WHEN coalesce(m.override_active,false) AND coalesce(m.note,'') NOT ILIKE 'AUTO_BEAC_IMPORT%'
           THEN m.meta_amount ELSE coalesce(m.base_amount,m.meta_amount) END AS amount,
      CASE WHEN coalesce(m.override_active,false) AND coalesce(m.note,'') NOT ILIKE 'AUTO_BEAC_IMPORT%'
           THEN m.meta_paid_at ELSE coalesce(m.base_paid_at,m.meta_paid_at) END AS paid_at,
      m.payment_method,m.paid_to,coalesce(m.source,'manual') source,
      coalesce(m.override_active,false) override_active
    FROM merged m JOIN public.players p ON p.id::text=m.player_id
    JOIN unique_member um ON um.player_id=p.id
    JOIN public.teams t ON t.id=um.team_id
    WHERE private.cc_finance_allowed_v1(m.fee_type,um.team_id,'view')
  )
  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'playerId',x.player_id,'playerName',coalesce(nullif(x.display_name,''),x.name),
    'teamId',x.team_id,'teamName',x.team_name,'feeType',x.fee_type,'period',x.period_key,
    'status',x.status,'amountHuf',x.amount,'paidAt',x.paid_at,
    'paymentMethod',x.payment_method,'paidTo',x.paid_to,'source',x.source,
    'overrideActive',x.override_active
  ) ORDER BY x.team_name,x.player_name,x.period_key),'[]'::jsonb)
  INTO v_finance
  FROM (SELECT a.*,coalesce(nullif(a.display_name,''),a.name) player_name FROM allowed a
        WHERE (p_from IS NULL OR a.paid_at IS NULL OR (a.paid_at AT TIME ZONE 'Europe/Budapest')::date>=p_from)
          AND (p_to IS NULL OR a.paid_at IS NULL OR (a.paid_at AT TIME ZONE 'Europe/Budapest')::date<=p_to)) x;

  IF private.cc_finance_allowed_v1('mass_pass',NULL,'view') THEN
    SELECT coalesce(jsonb_agg(jsonb_build_object(
      'level',coalesce(mp.pass_group,'Ismeretlen'),'product',coalesce(mp.product,''),
      'validMonth',coalesce(mp.valid_month,''),'purchaseDate',mp.purchase_date,
      'amountHuf',CASE WHEN coalesce(mp.raw_row->>'amountHuf','') ~ '^[0-9]{1,9}$'
         THEN (mp.raw_row->>'amountHuf')::integer
         WHEN coalesce(mp.raw_row->>'priceHuf','') ~ '^[0-9]{1,9}$'
         THEN (mp.raw_row->>'priceHuf')::integer ELSE NULL END
    ) ORDER BY mp.purchase_date),'[]'::jsonb)
    INTO v_passes
    FROM public.mass_passes mp
    WHERE (p_season IS NULL OR mp.season IS NULL OR mp.season=p_season)
      AND coalesce(mp.raw_row->>'synthetic','false')<>'true'
      AND coalesce(mp.raw_row->>'notRealPurchase','false')<>'true'
      AND (p_from IS NULL OR (mp.purchase_date AT TIME ZONE 'Europe/Budapest')::date>=p_from)
      AND (p_to IS NULL OR (mp.purchase_date AT TIME ZONE 'Europe/Budapest')::date<=p_to);
  ELSE v_passes:='[]'::jsonb; END IF;

  IF private.cc_finance_allowed_v1('mass_training',NULL,'view') THEN
    SELECT coalesce(jsonb_agg(jsonb_build_object(
      'eventDate',e.event_date,'startTime',e.start_time,'level',e.level,'court',e.court,
      'capacity',e.capacity,'booked',coalesce(a.booked,0),'attended',coalesce(a.attended,0),
      'cancelled',coalesce(a.cancelled,0),'unknownAttendance',coalesce(a.unknown,0)
    ) ORDER BY e.event_date DESC,e.start_time),'[]'::jsonb)
    INTO v_trainings
    FROM public.mass_events e LEFT JOIN LATERAL(
      SELECT count(DISTINCT lower(trim(b.email))) FILTER (
          WHERE b.cancelled_at IS NULL AND upper(coalesce(b.booking_status,'')) NOT LIKE '%CANCEL%'
            AND upper(coalesce(b.booking_status,'')) NOT LIKE '%LEMOND%'
        ) AS booked,
        count(DISTINCT lower(trim(b.email))) FILTER (
          WHERE upper(coalesce(b.attendance,'')) IN ('JELEN','RÉSZT VETT','RESZT VETT','ATTENDED','PRESENT')
        ) AS attended,
        count(DISTINCT lower(trim(b.email))) FILTER (
          WHERE b.cancelled_at IS NOT NULL OR upper(coalesce(b.booking_status,'')) LIKE '%LEMOND%'
        ) AS cancelled,
        count(DISTINCT lower(trim(b.email))) FILTER (
          WHERE b.cancelled_at IS NULL AND nullif(trim(coalesce(b.attendance,'')),'') IS NULL
        ) AS unknown
      FROM public.mass_bookings b WHERE b.event_id=e.id
    ) a ON true
    WHERE e.event_date IS NOT NULL
      AND (p_from IS NULL OR e.event_date>=p_from)
      AND (p_to IS NULL OR e.event_date<=p_to);
  ELSE v_trainings:='[]'::jsonb; END IF;

  RETURN jsonb_build_object('scopes',v_scopes,'finance',coalesce(v_finance,'[]'::jsonb),
    'passes',coalesce(v_passes,'[]'::jsonb),'trainings',coalesce(v_trainings,'[]'::jsonb),
    'period',jsonb_build_object('from',p_from,'to',p_to),'source','test_live_data');
END $function$
;
REVOKE ALL ON FUNCTION public.cc_manager_finance_analytics_v1(text,date,date) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.cc_manager_finance_analytics_v1(text,date,date) TO authenticated;