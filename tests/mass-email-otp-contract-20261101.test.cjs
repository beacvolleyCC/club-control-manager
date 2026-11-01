'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const install=fs.readFileSync('docs/security/CC_TEST_MASS_EMAIL_PROOF_SQL_EDITOR_20261101.sql','utf8');
const qa=fs.readFileSync('tests/sql/CC_TEST_MASS_EMAIL_OTP_POSTDEPLOY_ROLLBACK_20261101.sql','utf8');
const gateway=fs.readFileSync('vnext/mass-gateway/src/worker.mjs','utf8');
const wrangler=fs.readFileSync('vnext/mass-gateway/wrangler.jsonc','utf8');
test('TEST-only atomic installation of private OTP storage with RLS',()=>{
 assert.match(install,/^BEGIN;/m);
 assert.match(install,/^COMMIT;/m);
 assert.match(install,/cc_test_bb2_rsvp_20261106/);
 assert.match(install,/WRONG_SUPABASE_PROJECT_ABORT/);
 assert.match(install,/MAIL_OTP_TABLE_ALREADY_PRESENT_REVIEW_REQUIRED/);
 assert.match(install,/CREATE TABLE private\.cc_mass_email_otp_v1/);
 assert.match(install,/ENABLE ROW LEVEL SECURITY/);
 assert.match(install,/REVOKE ALL ON TABLE private\.cc_mass_email_otp_v1 FROM PUBLIC,anon,authenticated/);
 assert.doesNotMatch(install,/snqsxlyhontaepembaic|sb_secret_|service_role_key/);
});
test('OTP issue/verify functions are server-only and serialize attempts',()=>{
 assert.equal((install.match(/CREATE FUNCTION public\.cc_vnext_mass_email_/g)||[]).length,2);
 assert.equal((install.match(/SECURITY DEFINER SET search_path TO ''/g)||[]).length,2);
 for(const name of ['cc_vnext_mass_email_start_v1','cc_vnext_mass_email_verify_v1']){
  assert.ok(install.includes('CREATE FUNCTION public.'+name+'('),name);
  assert.ok(install.includes('REVOKE ALL ON FUNCTION public.'+name+'('),name);
  assert.ok(install.includes('GRANT EXECUTE ON FUNCTION public.'+name+'('),name);
 }
 assert.equal((install.match(/FROM PUBLIC,anon,authenticated/g)||[]).length,3);
 assert.equal((install.match(/TO service_role/g)||[]).length,2);
 assert.match(install,/interval '90 seconds'/);
 assert.match(install,/interval '5 minutes'/);
 assert.match(install,/FOR UPDATE/);
 assert.match(install,/v_record\.attempts>=5/);
 assert.match(install,/SET used_at=now\(\),attempts=5/);
});
test('TEST gateway sends OTP only to allowlisted address with secrets and default disabled flags',()=>{
 assert.match(gateway,/function otpReady/);
 assert.match(gateway,/env\.TEST_ALLOWED_EMAIL/);
 assert.match(gateway,/env\.EMAIL_DELIVERY_ENABLED==='true'/);
 assert.match(gateway,/RESEND_TEST_API_KEY/);
 assert.match(gateway,/cc_vnext_mass_email_start_v1/);
 assert.match(gateway,/cc_vnext_mass_email_verify_v1/);
 assert.match(gateway,/function otpCode/);
 assert.match(gateway,/crypto\.getRandomValues/);
 assert.match(gateway,/scope:'mass'/);
 assert.match(wrangler,/"EMAIL_DELIVERY_ENABLED": "false"/);
 assert.match(wrangler,/"PUBLIC_WRITES_ENABLED": "false"/);
 assert.match(wrangler,/"workers_dev": false/);
 assert.doesNotMatch(wrangler,/re_[A-Za-z0-9]{16,}|sb_secret_[A-Za-z0-9]{16,}/);
});
test('rollback QA verifies throttle, replay, attempts, unauthorized roles and no messages',()=>{
 assert.match(qa,/^BEGIN;/m);assert.match(qa,/^ROLLBACK;/m);
 for(const key of ['OTP_START_FAILED','OTP_RESEND_THROTTLE_FAILED','OTP_BAD_CODE_ACCEPTED',
  'OTP_CORRECT_CODE_REJECTED','OTP_REPLAY_ACCEPTED','OTP_FIFTH_ATTEMPT_BYPASS',
  'OTP_FUNCTION_GRANT_LEAK','OTP_TEST_SENT_NOTIFICATION'])assert.ok(qa.includes(key),key);
 assert.match(qa,/SET LOCAL ROLE service_role/);
 assert.match(qa,/example\.invalid/);
 assert.doesNotMatch(qa,/snqsxlyhontaepembaic|sb_secret_|@gmail\./);
});
