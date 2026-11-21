-- CC PATCH 2026-11-21: deployment of this SQL requires explicit environment-specific approval.
-- Never replay historical TEST migrations on LIVE; never copy financial records.
-- Club Control TEST only: scoped finance/analytics authorization foundation 2026-11-16.
-- No LIVE migration. Raw tables are not directly exposed to browser roles.
CREATE TABLE IF NOT EXISTS public.cc_finance_acl_v1 (
  manager_id uuid NOT NULL REFERENCES public.manager_accounts(id) ON DELETE CASCADE,
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  category text NOT NULL CHECK(category IN ('beac_pass','coach_fee','permission_fee','mass_pass','mass_training','audit','settings')),
  can_view boolean NOT NULL DEFAULT false,
  can_edit boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cc_finance_acl_category_team_ck CHECK (
    (category IN ('beac_pass','coach_fee','permission_fee') AND team_id IS NOT NULL)
    OR (category IN ('mass_pass','mass_training','audit','settings') AND team_id IS NULL)
  ),
  CONSTRAINT cc_finance_acl_some_access_ck CHECK(can_view OR can_edit),
  CONSTRAINT cc_finance_acl_scope_unique UNIQUE NULLS NOT DISTINCT (manager_id,team_id,category)
);
CREATE INDEX IF NOT EXISTS cc_finance_acl_v1_scope_idx ON public.cc_finance_acl_v1 (manager_id,category,team_id);
ALTER TABLE public.cc_finance_acl_v1 ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.cc_finance_acl_v1 FROM PUBLIC,anon,authenticated;

CREATE TABLE IF NOT EXISTS public.cc_finance_saved_views_v1 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id uuid NOT NULL REFERENCES public.manager_accounts(id) ON DELETE CASCADE,
  title text NOT NULL CHECK(length(title) BETWEEN 1 AND 100),
  config jsonb NOT NULL DEFAULT '{}'::jsonb CHECK(jsonb_typeof(config)='object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS cc_finance_saved_views_owner_idx ON public.cc_finance_saved_views_v1(manager_id,updated_at DESC);
ALTER TABLE public.cc_finance_saved_views_v1 ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.cc_finance_saved_views_v1 FROM PUBLIC,anon,authenticated;

-- Security definer only for the narrow auth-backed access check; all references schema qualified.
CREATE OR REPLACE FUNCTION private.cc_finance_allowed_v1(p_category text,p_team_id uuid DEFAULT NULL,p_action text DEFAULT 'view')
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=''
AS $fn$
DECLARE v_manager_id uuid;
BEGIN
  IF auth.uid() IS NULL OR p_category NOT IN ('beac_pass','coach_fee','permission_fee','mass_pass','mass_training','audit','settings')
     OR p_action NOT IN ('view','edit') THEN RETURN false; END IF;
  SELECT id INTO v_manager_id FROM public.manager_accounts
  WHERE auth_user_id=auth.uid() AND active=true LIMIT 1;
  IF v_manager_id IS NULL THEN RETURN false; END IF;
  IF EXISTS (
    SELECT 1 FROM public.manager_module_permissions p
    WHERE p.manager_id=v_manager_id AND p.module_key='competition.fees'
      AND (p.team_id IS NULL OR (p_team_id IS NOT NULL AND p.team_id=p_team_id))
      AND (CASE WHEN p_action='edit' THEN p.can_edit ELSE p.can_view OR p.can_edit END)
  ) THEN RETURN true; END IF;
  RETURN EXISTS(
    SELECT 1 FROM public.cc_finance_acl_v1 p
    WHERE p.manager_id=v_manager_id AND p.category=p_category
      AND p.team_id IS NOT DISTINCT FROM p_team_id
      AND (CASE WHEN p_action='edit' THEN p.can_edit ELSE p.can_view OR p.can_edit END)
  );
END $fn$;

-- Scoped and inherited legacy permissions. Admin can inspect another manager's grants.
CREATE OR REPLACE FUNCTION public.cc_manager_finance_scopes_v1(p_manager_id uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=''
AS $fn$
DECLARE v_actor uuid; v_target uuid; v_rows jsonb;
BEGIN
  SELECT id INTO v_actor FROM public.manager_accounts WHERE auth_user_id=auth.uid() AND active LIMIT 1;
  IF v_actor IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED' USING errcode='42501'; END IF;
  v_target:=coalesce(p_manager_id,v_actor);
  IF v_target<>v_actor AND NOT private.cc_manager_can_v1('settings','edit',NULL) THEN
    RAISE EXCEPTION 'MANAGER_NOT_ALLOWED' USING errcode='42501'; END IF;
  SELECT coalesce(jsonb_agg(to_jsonb(a) ORDER BY a.category,a.team_name),'[]'::jsonb)
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
END $fn$;

-- Manages only the new granular grants. Legacy competition.fees grants remain separately editable.
CREATE OR REPLACE FUNCTION public.cc_manager_finance_acl_save_v1(p_manager_id uuid,p_scopes jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $fn$
DECLARE v_actor uuid; v_row jsonb; v_team uuid; v_category text; v_view boolean; v_edit boolean; v_count integer:=0;
BEGIN
  SELECT id INTO v_actor FROM public.manager_accounts WHERE auth_user_id=auth.uid() AND active LIMIT 1;
  IF v_actor IS NULL OR NOT private.cc_manager_can_v1('settings','edit',NULL)
    THEN RAISE EXCEPTION 'MANAGER_NOT_ALLOWED' USING errcode='42501'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.manager_accounts WHERE id=p_manager_id)
    THEN RAISE EXCEPTION 'MANAGER_TARGET_NOT_FOUND'; END IF;
  IF jsonb_typeof(p_scopes)<>'array' OR jsonb_array_length(p_scopes)>100 THEN
    RAISE EXCEPTION 'FINANCE_SCOPES_INVALID'; END IF;
  -- A validation phase before any deletion to avoid destructive partial operations.
  FOR v_row IN SELECT value FROM jsonb_array_elements(p_scopes) LOOP
    v_category:=v_row->>'category';
    IF v_category NOT IN ('beac_pass','coach_fee','permission_fee','mass_pass','mass_training','audit','settings') THEN
      RAISE EXCEPTION 'FINANCE_SCOPE_CATEGORY_INVALID'; END IF;
    IF (v_row->>'teamId') IS NOT NULL AND (v_row->>'teamId')<>'' THEN
      v_team:=(v_row->>'teamId')::uuid;
    ELSE v_team:=NULL; END IF;
    IF ((v_category IN ('beac_pass','coach_fee','permission_fee')) <> (v_team IS NOT NULL))
      THEN RAISE EXCEPTION 'FINANCE_SCOPE_TEAM_INVALID'; END IF;
    IF v_team IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.teams WHERE id=v_team AND active)
      THEN RAISE EXCEPTION 'FINANCE_SCOPE_UNKNOWN_TEAM'; END IF;
  END LOOP;
  DELETE FROM public.cc_finance_acl_v1 WHERE manager_id=p_manager_id;
  FOR v_row IN SELECT value FROM jsonb_array_elements(p_scopes) LOOP
    v_category:=v_row->>'category';
    v_team:=NULLIF(v_row->>'teamId','')::uuid;
    v_view:=coalesce((v_row->>'canView')::boolean,false);
    v_edit:=coalesce((v_row->>'canEdit')::boolean,false);
    IF v_view OR v_edit THEN
      INSERT INTO public.cc_finance_acl_v1(manager_id,team_id,category,can_view,can_edit)
      VALUES(p_manager_id,v_team,v_category,v_view OR v_edit,v_edit)
      ON CONFLICT(manager_id,team_id,category) DO UPDATE
      SET can_view=excluded.can_view,can_edit=excluded.can_edit,updated_at=now();
      v_count:=v_count+1;
    END IF;
  END LOOP;
  RETURN jsonb_build_object('ok',true,'count',v_count,'managerId',p_manager_id);
END $fn$;

-- Saving a report changes only personal presentation preferences, never permissions or finance rows.
CREATE OR REPLACE FUNCTION public.cc_manager_finance_saved_views_v1(
  p_action text DEFAULT 'list',p_id uuid DEFAULT NULL,p_title text DEFAULT NULL,p_config jsonb DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $fn$
DECLARE v_manager uuid;v_item jsonb;v_source text;v_group text;v_metric text;
BEGIN
  SELECT id INTO v_manager FROM public.manager_accounts WHERE auth_user_id=auth.uid() AND active LIMIT 1;
  IF v_manager IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED' USING errcode='42501'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.cc_finance_acl_v1 a WHERE a.manager_id=v_manager AND (a.can_view OR a.can_edit))
    AND NOT EXISTS (SELECT 1 FROM public.manager_module_permissions p WHERE p.manager_id=v_manager AND p.module_key='competition.fees' AND (p.can_view OR p.can_edit))
    THEN RAISE EXCEPTION 'MANAGER_NOT_ALLOWED' USING errcode='42501'; END IF;
  IF p_action='list' THEN
    RETURN coalesce((SELECT jsonb_agg(jsonb_build_object('id',id,'title',title,'config',config,'updatedAt',updated_at) ORDER BY updated_at DESC)
      FROM public.cc_finance_saved_views_v1 WHERE manager_id=v_manager),'[]'::jsonb);
  ELSIF p_action='delete' THEN
    DELETE FROM public.cc_finance_saved_views_v1 WHERE id=p_id AND manager_id=v_manager;
    RETURN jsonb_build_object('ok',true);
  ELSIF p_action='save' THEN
    v_source:=p_config->>'source';v_group:=p_config->>'groupBy';v_metric:=p_config->>'metric';
    IF length(coalesce(trim(p_title),'')) NOT BETWEEN 1 AND 100
      OR jsonb_typeof(p_config)<>'object'
      OR v_source NOT IN ('finance','passes','trainings')
      OR v_group NOT IN ('team','month','type','method','recipient','level','slot')
      OR v_metric NOT IN ('count','paid','due','amount','attendance','capacity','occupancy')
      OR (SELECT count(*) FROM public.cc_finance_saved_views_v1 WHERE manager_id=v_manager)>49
    THEN RAISE EXCEPTION 'FINANCE_SAVED_VIEW_INVALID'; END IF;
    IF p_id IS NULL THEN
      INSERT INTO public.cc_finance_saved_views_v1(manager_id,title,config) VALUES(v_manager,trim(p_title),p_config)
      RETURNING jsonb_build_object('id',id,'title',title,'config',config) INTO v_item;
    ELSE
      UPDATE public.cc_finance_saved_views_v1 SET title=trim(p_title),config=p_config,updated_at=now()
      WHERE id=p_id AND manager_id=v_manager
      RETURNING jsonb_build_object('id',id,'title',title,'config',config) INTO v_item;
      IF v_item IS NULL THEN RAISE EXCEPTION 'FINANCE_SAVED_VIEW_NOT_FOUND'; END IF;
    END IF;
    RETURN v_item;
  END IF;
  RAISE EXCEPTION 'FINANCE_SAVED_VIEW_ACTION_INVALID';
END $fn$;

REVOKE ALL ON FUNCTION private.cc_finance_allowed_v1(text,uuid,text) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.cc_manager_finance_scopes_v1(uuid) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.cc_manager_finance_acl_save_v1(uuid,jsonb) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.cc_manager_finance_saved_views_v1(text,uuid,text,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.cc_manager_finance_scopes_v1(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cc_manager_finance_acl_save_v1(uuid,jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cc_manager_finance_saved_views_v1(text,uuid,text,jsonb) TO authenticated;
