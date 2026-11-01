'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const s=fs.readFileSync('docs/security/CC_TEST_MASS_SERVICE_CAPACITY_OFFER_SQL_EDITOR_20261101.sql','utf8');
test('TEST-only guarded installer and three service-only APIs',()=>{
 assert.match(s,/cc_test_bb2_rsvp_20261106/);
 assert.match(s,/WRONG_PROJECT_ABORT/);
 assert.match(s,/BEGIN;/);assert.match(s,/COMMIT;/);
 assert.equal((s.match(/CREATE FUNCTION public\.cc_vnext_mass_/g)||[]).length,3);
 assert.equal((s.match(/SET search_path TO ''/g)||[]).length,3);
 for(const n of ['cc_vnext_mass_capacity_v1','cc_vnext_mass_offer_next_v1','cc_vnext_mass_offer_expire_v1']){
  assert.ok(s.includes('CREATE FUNCTION public.'+n+'('));
  assert.ok(s.includes('REVOKE ALL ON FUNCTION public.'+n+'('));
  assert.ok(s.includes('GRANT EXECUTE ON FUNCTION public.'+n+'('));
 }
 assert.equal((s.match(/FROM PUBLIC,anon,authenticated/g)||[]).length,3);
 assert.equal((s.match(/TO service_role/g)||[]).length,3);
 assert.doesNotMatch(s,/GRANT EXECUTE ON FUNCTION[^;]+TO anon|GRANT EXECUTE ON FUNCTION[^;]+TO authenticated/i);
});
test('locked FIFO offers, bounded expiry, SHA256-hash and no emails',()=>{
 assert.match(s,/FOR UPDATE/);
 assert.match(s,/ORDER BY x\.submitted_at ASC NULLS LAST,x\.id ASC LIMIT 1 FOR UPDATE SKIP LOCKED/);
 assert.match(s,/p_token_hash !~ '\^sha256:\[a-f0-9\]\{64\}\$'/);
 assert.match(s,/interval '2 hours'/);
 assert.match(s,/OFFER_ALREADY_ACTIVE/);
 assert.match(s,/CAPACITY_FULL/);
 assert.match(s,/mass_waitlist/);
 assert.match(s,/mailQueued',false/);
 assert.doesNotMatch(s,/INSERT INTO private\.cc_mass_mail_outbox|cc_mass_mail_claim|cc_push_enqueue/i);
 assert.doesNotMatch(s,/snqsxlyhontaepembaic|sb_secret_|http:\/\/|https:\/\//);
});
