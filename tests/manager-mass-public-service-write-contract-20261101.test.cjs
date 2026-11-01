'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const sql=fs.readFileSync('docs/security/CC_TEST_MASS_PUBLIC_SERVICE_WRITE_SQL_EDITOR_20261101.sql','utf8');
const qa=fs.readFileSync('tests/sql/CC_TEST_MASS_PUBLIC_SERVICE_WRITE_POSTDEPLOY_ROLLBACK_20261101.sql','utf8');
const funcs=['cc_vnext_mass_public_book_v1','cc_vnext_mass_public_wait_v1',
 'cc_vnext_mass_public_cancel_v1','cc_vnext_mass_public_decide_v1'];
test('guarded and atomic TEST-only installer with four stable service-only function contracts',()=>{
 assert.match(sql,/BEGIN;/);
 assert.match(sql,/COMMIT;/);
 assert.match(sql,/cc_test_bb2_rsvp_20261106/);
 assert.match(sql,/CC_WRONG_PROJECT_ABORT/);
 assert.match(sql,/CC_VNEXT_PUBLIC_MASS_ALREADY_INSTALLED_ABORT/);
 assert.equal((sql.match(/CREATE FUNCTION public\.cc_vnext_mass_public_/g)||[]).length,4);
 assert.equal((sql.match(/SECURITY DEFINER SET search_path TO ''/g)||[]).length,4);
 for(const name of funcs){
   assert.ok(sql.includes('CREATE FUNCTION public.'+name+'('),name);
   assert.ok(sql.includes('REVOKE ALL ON FUNCTION public.'+name+'('),name);
   assert.ok(sql.includes('GRANT EXECUTE ON FUNCTION public.'+name+'('),name);
 }
 assert.equal((sql.match(/FROM PUBLIC,anon,authenticated/g)||[]).length,4);
 assert.equal((sql.match(/TO service_role/g)||[]).length,4);
 assert.doesNotMatch(sql,/GRANT EXECUTE ON FUNCTION[^;]*TO (?:anon|authenticated)/i);
 assert.doesNotMatch(sql,/snqsxlyhontaepembaic|sb_secret_|service_role_key/i);
});
test('token hashes only, expected expiry and no externally caused side effects',()=>{
 assert.match(sql,/\^sha256:\[a-f0-9\]\{64\}\$/);
 assert.match(sql,/cancellation_token='USED:'\|\|p_cancellation_hash/);
 assert.match(sql,/token_hash='USED:'\|\|p_offer_hash/);
 assert.match(sql,/FIRST_TRAINING_USED/);
 assert.match(sql,/PUBLIC_BOOK_CLOSED_2H/);
 assert.match(sql,/PUBLIC_WAIT_CLOSED_2H/);
 assert.match(sql,/OFFER_ACCEPT_EVENT_CLOSED/);
 assert.match(sql,/PUBLIC_BOOK_WAITLIST_HAS_PRIORITY/);
 assert.match(sql,/PUBLIC_WAIT_QUEUE_FULL/);
 assert.match(sql,/PUBLIC_BOOK_MODE_MISMATCH/);
 assert.match(sql,/OFFER_ACCEPT_CAPACITY_FULL/);
 assert.doesNotMatch(sql,/INSERT INTO private\.cc_mass_mail_outbox|cc_mass_mail_claim\s*\(|cc_push_enqueue\s*\(|no_show_sanction_eval\s*\(/);
});
test('race-safe: email lock BEFORE event lock in all same-person mutations',()=>{
 assert.equal((sql.match(/hashtextextended\('cc-mass-person:/g)||[]).length,3);
 const sections=sql.split('CREATE FUNCTION public.cc_vnext_mass_public_').slice(1);
 for(const n of ['book_v1','wait_v1','decide_v1']){
   const body=sections.find(x=>x.startsWith(n+'('));
   assert.ok(body,n);
   assert.ok(body.indexOf("hashtextextended('cc-mass-person:")>0,n);
   assert.ok(body.indexOf("hashtextextended('cc-mass-person:")<body.indexOf('FOR UPDATE'),n);
 }
 assert.match(sql,/w\.offer_expires_at>now\(\)/);
 assert.match(sql,/v_total\+v_reserved>=greatest/);
 assert.match(sql,/FOR UPDATE/);
});
test('rollback QA includes 2+ bookings, waitlist, offer accept/replay/decline, and forbidden calls',()=>{
 assert.match(qa,/^BEGIN;/m);assert.match(qa,/^ROLLBACK;/m);
 for(const marker of [
 'FIRST_BOOKING_FAILED','SECOND_BOOKING_FAILED','CAPACITY_OVERBOOK_ALLOWED',
 'DUPLICATE_BOOKING_ALLOWED','DUPLICATE_WAITLIST_ALLOWED','EARLY_CANCELLATION_FAILED',
 'CANCELLATION_TOKEN_REUSE_ALLOWED','WAITLIST_PRIORITY_BYPASSED','OFFER_ACCEPT_FAILED',
 'OFFER_ACCEPT_IDEMPOTENCY_FAILED','OFFER_DECLINE_IDEMPOTENCY_FAILED',
 'LATE_CANCELLATION_NOT_RECOGNIZED','UNEXPECTED_EMAIL_OR_PUSH',
 'FIRST_TRAINING_REUSE_ALLOWED','FIRST_TRAINING_WAITLIST_REUSE_ALLOWED','ANON_BOOKING_EXECUTED',
 'AUTHENTICATED_WAITLIST_EXECUTED','MASS_ASSIGNMENT_PAYLOAD_INJECTION_ALLOWED'
 ])assert.ok(qa.includes(marker),marker);
 assert.match(qa,/SET LOCAL ROLE service_role/);
 assert.match(qa,/SET LOCAL ROLE anon/);
 assert.match(qa,/SET LOCAL ROLE authenticated/);
 assert.doesNotMatch(qa,/snqsxlyhontaepembaic|sb_secret_|@gmail\.|@elte\./i);
});
