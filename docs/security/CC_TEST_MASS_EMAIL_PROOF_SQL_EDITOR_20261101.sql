-- CC Club Control · TEST-only mail ownership code storage.
-- NOT DEPLOYED. Run only in the Supabase TEST SQL Editor after QA review.
-- No e-mails are sent from PostgreSQL; raw OTP never reaches this table.
BEGIN;
DO $cc_test_gate$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.events WHERE legacy_manager_id='cc_test_bb2_rsvp_20261106')
 THEN RAISE EXCEPTION 'WRONG_SUPABASE_PROJECT_ABORT' USING ERRCODE='42501'; END IF;
 IF to_regclass('private.cc_mass_email_otp_v1') IS NOT NULL
 THEN RAISE EXCEPTION 'MAIL_OTP_TABLE_ALREADY_PRESENT_REVIEW_REQUIRED' USING ERRCODE='22023'; END IF;
END $cc_test_gate$;
CREATE TABLE private.cc_mass_email_otp_v1 (
 email text PRIMARY KEY,
 code_hash text NOT NULL CHECK (code_hash ~ '^sha256:[a-f0-9]{64}$'),
 issued_at timestamptz NOT NULL DEFAULT now(),
 expires_at timestamptz NOT NULL,
 attempts integer NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 5),
 used_at timestamptz,
 CHECK (expires_at > issued_at)
);
ALTER TABLE private.cc_mass_email_otp_v1 ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE private.cc_mass_email_otp_v1 FROM PUBLIC,anon,authenticated;

CREATE FUNCTION public.cc_vnext_mass_email_start_v1(p_email text,p_code_hash text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $fn$
DECLARE v_email text:=lower(btrim(coalesce(p_email,'')));v_inserted text;
BEGIN
 IF length(v_email)>254 OR v_email !~* '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
 THEN RAISE EXCEPTION 'EMAIL_INVALID' USING ERRCODE='22023'; END IF;
 IF p_code_hash IS NULL OR p_code_hash !~ '^sha256:[a-f0-9]{64}$'
 THEN RAISE EXCEPTION 'OTP_HASH_INVALID' USING ERRCODE='22023'; END IF;
 INSERT INTO private.cc_mass_email_otp_v1 AS existing
  (email,code_hash,issued_at,expires_at,attempts,used_at)
 VALUES (v_email,p_code_hash,now(),now()+interval '5 minutes',0,NULL)
 ON CONFLICT (email) DO UPDATE SET
  code_hash=excluded.code_hash,
  issued_at=excluded.issued_at,
  expires_at=excluded.expires_at,
  attempts=0,used_at=NULL
 WHERE existing.issued_at < now()-interval '90 seconds'
 RETURNING email INTO v_inserted;
 RETURN jsonb_build_object('ok',true,'accepted',v_inserted IS NOT NULL,'expiresInSeconds',300);
END $fn$;

CREATE FUNCTION public.cc_vnext_mass_email_verify_v1(p_email text,p_code_hash text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $fn$
DECLARE v_email text:=lower(btrim(coalesce(p_email,'')));
        v_record private.cc_mass_email_otp_v1%rowtype;
BEGIN
 IF length(v_email)>254 OR v_email !~* '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
 OR p_code_hash IS NULL OR p_code_hash !~ '^sha256:[a-f0-9]{64}$'
 THEN RAISE EXCEPTION 'OTP_INPUT_INVALID' USING ERRCODE='22023'; END IF;
 SELECT * INTO v_record FROM private.cc_mass_email_otp_v1
 WHERE email=v_email FOR UPDATE;
 IF NOT FOUND OR v_record.used_at IS NOT NULL
 OR v_record.expires_at<=now() OR v_record.attempts>=5
 THEN RETURN jsonb_build_object('ok',true,'verified',false); END IF;
 IF v_record.code_hash<>p_code_hash THEN
  UPDATE private.cc_mass_email_otp_v1 SET attempts=least(attempts+1,5)
  WHERE email=v_email;
  RETURN jsonb_build_object('ok',true,'verified',false);
 END IF;
 UPDATE private.cc_mass_email_otp_v1 SET used_at=now(),attempts=5
 WHERE email=v_email;
 RETURN jsonb_build_object('ok',true,'verified',true);
END $fn$;

REVOKE ALL ON FUNCTION public.cc_vnext_mass_email_start_v1(text,text) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.cc_vnext_mass_email_verify_v1(text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cc_vnext_mass_email_start_v1(text,text) TO service_role;
GRANT EXECUTE ON FUNCTION public.cc_vnext_mass_email_verify_v1(text,text) TO service_role;
COMMIT;
SELECT p.proname,
 has_function_privilege('anon',p.oid,'execute') AS anon_execute,
 has_function_privilege('authenticated',p.oid,'execute') AS authenticated_execute,
 has_function_privilege('service_role',p.oid,'execute') AS service_execute
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public' AND p.proname IN (
 'cc_vnext_mass_email_start_v1','cc_vnext_mass_email_verify_v1'
) ORDER BY p.proname;