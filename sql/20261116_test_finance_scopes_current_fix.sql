-- TEST ONLY. Deployed to Supabase szzoubvhlwnojtzqjebc. Do NOT run on LIVE.
CREATE OR REPLACE FUNCTION public.cc_manager_finance_scopes_v1(p_manager_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE v_actor uuid; v_target uuid; v_rows jsonb;
BEGIN
  SELECT id INTO v_actor FROM public.manager_accounts WHERE auth_user_id=auth.uid() AND active LIMIT 1;
  IF v_actor IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED' USING errcode='42501'; END IF;
  v_target:=coalesce(p_manager_id,v_actor);
  IF v_target<>v_actor AND NOT private.cc_manager_can_v1('settings','edit',NULL) THEN
    RAISE EXCEPTION 'MANAGER_NOT_ALLOWED' USING errcode='42501'; END IF;
  SELECT coalesce(jsonb_agg(to_jsonb(a) ORDER BY a.category,a."teamName"),'[]'::jsonb)
  INTO v_rows FROM (
    WITH categories(category) AS (VALUES('beac_pass'),('coach_fee'),('permission_fee'),('mass_pass'),('mass_training'),('audit'),('settings')),
    target_roles AS (
      SELECT p.team_id,p.can_view,p.can_edit FROM public.manager_module_permissions p
      WHERE p.manager_id=v_target AND p.module_key='competition.fees'
    ),
    legacy AS (
      SELECT t.id AS team_id,t.name AS team_name,c.category,
        bool_or(tr.can_view OR tr.can_edit) AS can_view,bool_or(tr.can_edit) AS can_edit,true AS inherited
      FROM categories c
      LEFT JOIN public.teams t ON c.category IN ('beac_pass','coach_fee','permission_fee') AND t.active=true
      JOIN target_roles tr ON ((c.category IN ('beac_pass','coach_fee','permission_fee')
        AND (tr.team_id IS NULL OR tr.team_id=t.id))
        OR (c.category IN ('mass_pass','mass_training','audit','settings') AND tr.team_id IS NULL))
      WHERE c.category IN ('beac_pass','coach_fee','permission_fee') OR tr.team_id IS NULL
      GROUP BY t.id,t.name,c.category
    ),
    granted AS (
      SELECT a.team_id,t.name AS team_name,a.category,
        (a.can_view OR a.can_edit) AS can_view,a.can_edit,false AS inherited
      FROM public.cc_finance_acl_v1 a
      LEFT JOIN public.teams t ON t.id=a.team_id
      WHERE a.manager_id=v_target
    ),
    combined AS (SELECT * FROM granted UNION ALL SELECT * FROM legacy)
    SELECT coalesce(a.team_id::text,'') AS "teamId",coalesce(a.team_name,'') AS "teamName",
      a.category AS "category",bool_or(a.can_view) AS "canView",
      bool_or(a.can_edit) AS "canEdit",bool_or(a.inherited) AS "inherited"
    FROM combined a GROUP BY a.team_id,a.team_name,a.category
  ) a;
  RETURN coalesce(v_rows,'[]'::jsonb);
END $function$
;
