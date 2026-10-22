-- Disposable push helper contract fixture. Does not replace production helpers.
CREATE FUNCTION public.cc_push_event_team_v1(e jsonb) RETURNS text LANGUAGE sql IMMUTABLE
AS $$ SELECT coalesce(e->>'team_id','') $$;
CREATE FUNCTION public.cc_push_event_kind_v1(e jsonb) RETURNS text LANGUAGE sql IMMUTABLE
AS $$ SELECT coalesce(e->>'event_type','training') $$;
CREATE FUNCTION public.cc_push_event_start_v1(e jsonb) RETURNS timestamptz LANGUAGE sql IMMUTABLE
AS $$ SELECT nullif(e->>'starts_at','')::timestamptz $$;
CREATE FUNCTION public.cc_push_event_active_v1(e jsonb) RETURNS boolean LANGUAGE sql IMMUTABLE
AS $$ SELECT coalesce(e->>'status','')='active' $$;
CREATE FUNCTION public.cc_push_event_place_v1(e jsonb) RETURNS text LANGUAGE sql IMMUTABLE
AS $$ SELECT concat_ws(' • ',nullif(e->>'venue',''),nullif(e->>'court','')) $$;
CREATE FUNCTION public.cc_push_event_display_datetime_v1(e jsonb) RETURNS text LANGUAGE sql IMMUTABLE
AS $$ SELECT coalesce(e->>'starts_at','') $$;
CREATE FUNCTION public.cc_push_event_display_place_v1(e jsonb) RETURNS text LANGUAGE sql IMMUTABLE
AS $$ SELECT coalesce(e->>'venue','') $$;
CREATE FUNCTION public.cc_push_match_opponent_v1(e jsonb,p_team_name text DEFAULT '') RETURNS text LANGUAGE sql IMMUTABLE
AS $$ SELECT coalesce(e->>'opponent','') $$;
