-- TEST ONLY: restricted fee adjustment with per-category, per-team authorization.
CREATE OR REPLACE FUNCTION public.cc_manager_finance_override_scoped_v1(
  p_player_id uuid,p_fee_type text,p_period_key text,p_season text,
  p_status text,p_payment_method text,p_amount_huf integer,
  p_paid_at timestamptz,p_paid_to text,p_note text,p_override_active boolean DEFAULT true
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $fn$
DECLARE v_team uuid;v_email text;v_old jsonb;v_new jsonb;v_actor text;v_count integer;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED' USING errcode='42501'; END IF;
  IF p_fee_type NOT IN ('beac_pass','coach_fee','permission_fee')
    OR p_status NOT IN ('due','paid','prior_paid','waived')
    OR coalesce(p_payment_method,'') NOT IN ('','online','cash','revolut','transfer','other','previous_season')
    OR p_period_key IS NULL OR (p_period_key<>'' AND p_period_key !~ '^[0-9]{4}-(0[1-9]|1[0-2])$')
    OR p_season IS NULL OR p_season !~ '^[0-9]{4}/[0-9]{2}$'
    OR (p_amount_huf IS NOT NULL AND (p_amount_huf<0 OR p_amount_huf>100000000))
    OR length(coalesce(p_paid_to,''))>200 OR length(coalesce(p_note,''))>2000
    THEN RAISE EXCEPTION 'FINANCE_INVALID_INPUT' USING errcode='22023'; END IF;
  SELECT count(DISTINCT tm.team_id),min(tm.team_id::text)::uuid
    INTO v_count,v_team
  FROM public.team_memberships tm
  WHERE tm.player_id=p_player_id AND tm.active
    AND tm.starts_on<=current_date AND (tm.ends_on IS NULL OR tm.ends_on>=current_date);
  IF v_count<>1 OR v_team IS NULL THEN
    RAISE EXCEPTION 'FINANCE_AMBIGUOUS_OR_MISSING_TEAM' USING errcode='42501'; END IF;
  IF NOT private.cc_finance_allowed_v1(p_fee_type,v_team,'edit') THEN
    RAISE EXCEPTION 'MANAGER_NOT_ALLOWED' USING errcode='42501'; END IF;
  SELECT email INTO v_email FROM public.players WHERE id=p_player_id AND active=true;
  IF v_email IS NULL THEN RAISE EXCEPTION 'FINANCE_PLAYER_NOT_FOUND'; END IF;
  v_actor:=auth.uid()::text;
  PERFORM pg_advisory_xact_lock(hashtextextended(p_player_id::text||'|'||p_fee_type||'|'||p_period_key||'|'||p_season,0));
  SELECT to_jsonb(m) INTO v_old FROM public.cc_player_fee_meta_v2382 m
   WHERE m.player_id=p_player_id::text AND m.fee_type=p_fee_type
    AND m.period_key=p_period_key AND m.season=p_season FOR UPDATE;
  INSERT INTO public.cc_player_fee_meta_v2382
    (player_id,player_email,fee_type,period_key,season,status,payment_method,
     override_active,amount_huf,paid_at,paid_to,note,updated_by)
  VALUES(p_player_id::text,v_email,p_fee_type,p_period_key,p_season,p_status,
    coalesce(p_payment_method,''),coalesce(p_override_active,true),p_amount_huf,
    p_paid_at,coalesce(p_paid_to,''),coalesce(p_note,''),v_actor)
  ON CONFLICT (player_id,fee_type,period_key,season) DO UPDATE SET
    player_email=excluded.player_email,status=excluded.status,
    payment_method=excluded.payment_method,override_active=excluded.override_active,
    amount_huf=excluded.amount_huf,paid_at=excluded.paid_at,
    paid_to=excluded.paid_to,note=excluded.note,updated_by=excluded.updated_by,updated_at=now();
  SELECT to_jsonb(m) INTO v_new FROM public.cc_player_fee_meta_v2382 m
   WHERE m.player_id=p_player_id::text AND m.fee_type=p_fee_type
    AND m.period_key=p_period_key AND m.season=p_season;
  INSERT INTO public.cc_player_fee_audit_v2382
    (player_id,player_email,fee_type,period_key,season,action,old_state,new_state,actor_email)
  VALUES(p_player_id::text,v_email,p_fee_type,p_period_key,p_season,
    CASE WHEN v_old IS NULL THEN 'create' ELSE 'update' END,
    v_old,v_new,coalesce((SELECT a.email FROM public.manager_accounts a
      WHERE a.auth_user_id=auth.uid() AND a.active LIMIT 1),v_actor));
  RETURN jsonb_build_object('saved',true,'teamId',v_team,'feeType',p_fee_type);
END $fn$;
REVOKE ALL ON FUNCTION public.cc_manager_finance_override_scoped_v1(uuid,text,text,text,text,text,integer,timestamptz,text,text,boolean) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.cc_manager_finance_override_scoped_v1(uuid,text,text,text,text,text,integer,timestamptz,text,text,boolean) TO authenticated;
