-- TEST ONLY. Run twice after installing CC_TEST_MASS_EMAIL_PROOF_SQL_EDITOR_20261101.sql.
-- All test records roll back; no mail/push side effects.
BEGIN;
DO $guard$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM public.events WHERE legacy_manager_id='cc_test_bb2_rsvp_20261106')
 THEN RAISE EXCEPTION 'WRONG_SUPABASE_PROJECT_ABORT'; END IF;
 IF to_regclass('private.cc_mass_email_otp_v1') IS NULL
 THEN RAISE EXCEPTION 'MAIL_OTP_NOT_INSTALLED'; END IF;
 IF EXISTS(SELECT 1 FROM private.cc_mass_email_otp_v1
 WHERE email='cc-otp-qa-20261101@example.invalid')
 THEN RAISE EXCEPTION 'MAIL_QA_FIXTURE_COLLISION'; END IF;

 IF has_function_privilege('anon','public.cc_vnext_mass_email_start_v1(text,text)','execute')
 OR has_function_privilege('authenticated','public.cc_vnext_mass_email_start_v1(text,text)','execute')
 OR NOT has_function_privilege('service_role','public.cc_vnext_mass_email_start_v1(text,text)','execute')
 OR has_function_privilege('anon','public.cc_vnext_mass_email_verify_v1(text,text)','execute')
 OR has_function_privilege('authenticated','public.cc_vnext_mass_email_verify_v1(text,text)','execute')
 OR NOT has_function_privilege('service_role','public.cc_vnext_mass_email_verify_v1(text,text)','execute')
 THEN RAISE EXCEPTION 'OTP_FUNCTION_GRANT_LEAK'; END IF;

END $guard$;
SELECT set_config('cc.qa.mail_before',(SELECT count(*)::text FROM private.cc_mass_mail_outbox_v1),true);
SELECT set_config('cc.qa.push_before',(SELECT count(*)::text FROM public.player_push_outbox),true);

SET LOCAL ROLE service_role;
DO $otp_success$
DECLARE x jsonb;
BEGIN
 x:=public.cc_vnext_mass_email_start_v1('cc-otp-qa-20261101@example.invalid','sha256:'||repeat('a',64));
 IF x->>'accepted'<>'true' THEN RAISE EXCEPTION 'OTP_START_FAILED'; END IF;
 x:=public.cc_vnext_mass_email_start_v1('cc-otp-qa-20261101@example.invalid','sha256:'||repeat('b',64));
 IF x->>'accepted'<>'false' THEN RAISE EXCEPTION 'OTP_RESEND_THROTTLE_FAILED'; END IF;
 x:=public.cc_vnext_mass_email_verify_v1('cc-otp-qa-20261101@example.invalid','sha256:'||repeat('c',64));
 IF x->>'verified'<>'false' THEN RAISE EXCEPTION 'OTP_BAD_CODE_ACCEPTED'; END IF;
 x:=public.cc_vnext_mass_email_verify_v1('cc-otp-qa-20261101@example.invalid','sha256:'||repeat('a',64));
 IF x->>'verified'<>'true' THEN RAISE EXCEPTION 'OTP_CORRECT_CODE_REJECTED'; END IF;
 x:=public.cc_vnext_mass_email_verify_v1('cc-otp-qa-20261101@example.invalid','sha256:'||repeat('a',64));
 IF x->>'verified'<>'false' THEN RAISE EXCEPTION 'OTP_REPLAY_ACCEPTED'; END IF;
END $otp_success$;
RESET ROLE;
DO $inspect$
BEGIN
 IF (SELECT used_at FROM private.cc_mass_email_otp_v1 WHERE email='cc-otp-qa-20261101@example.invalid') IS NULL
 THEN RAISE EXCEPTION 'OTP_USED_MARKER_MISSING'; END IF;
 -- Simulate a later request after the 90-second cooldown, still within rolled-back transaction.
 UPDATE private.cc_mass_email_otp_v1
 SET issued_at=now()-interval '3 minutes',expires_at=now()-interval '1 minute'
 WHERE email='cc-otp-qa-20261101@example.invalid';
END $inspect$;
SET LOCAL ROLE service_role;
DO $otp_attempts$
DECLARE x jsonb;
BEGIN
 x:=public.cc_vnext_mass_email_start_v1('cc-otp-qa-20261101@example.invalid','sha256:'||repeat('d',64));
 IF x->>'accepted'<>'true' THEN RAISE EXCEPTION 'OTP_REISSUE_AFTER_COOLDOWN_FAILED'; END IF;
 FOR i IN 1..5 LOOP
  x:=public.cc_vnext_mass_email_verify_v1('cc-otp-qa-20261101@example.invalid','sha256:'||repeat('e',64));
  IF x->>'verified'<>'false' THEN RAISE EXCEPTION 'OTP_BAD_ATTEMPT_ACCEPTED'; END IF;
 END LOOP;
 x:=public.cc_vnext_mass_email_verify_v1('cc-otp-qa-20261101@example.invalid','sha256:'||repeat('d',64));
 IF x->>'verified'<>'false' THEN RAISE EXCEPTION 'OTP_FIFTH_ATTEMPT_BYPASS'; END IF;
END $otp_attempts$;
RESET ROLE;
DO $no_sending$
BEGIN
 IF (SELECT count(*) FROM private.cc_mass_mail_outbox_v1)::int<>current_setting('cc.qa.mail_before')::int
 OR (SELECT count(*) FROM public.player_push_outbox)::int<>current_setting('cc.qa.push_before')::int
 THEN RAISE EXCEPTION 'OTP_TEST_SENT_NOTIFICATION'; END IF;
END $no_sending$;
ROLLBACK;
SELECT 'PASS TEST OTP: issue, throttle, correct, replay, attempts, secret privileges, no mail; rollback' AS result;
