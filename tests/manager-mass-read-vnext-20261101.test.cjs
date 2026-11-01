'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const sql=fs.readFileSync('docs/security/CC_TEST_MASS_READ_APIS_SQL_EDITOR_INSTALL_20261101.sql','utf8');
const qa=fs.readFileSync('tests/sql/CC_TEST_MASS_READ_APIS_ROLLBACK_QA_20261101.sql','utf8');
const names=[
  'cc_manager_mass_calendar_v1','cc_manager_mass_trainings_v1','cc_manager_mass_training_history_v1',
  'cc_manager_mass_athletes_v1','cc_manager_mass_passes_v1','cc_manager_mass_event_detail_v1',
  'cc_manager_mass_attendance_snapshot_r1_v1','cc_manager_mass_cancellations_v1'
];
test('TEST-only guarded atomic installer never silently overwrites live schema',()=>{
 assert.match(sql,/BEGIN;/);
 assert.match(sql,/COMMIT;/);
 assert.match(sql,/cc_test_bb2_rsvp_20261106/);
 assert.match(sql,/CC_TEST_MASS_INSTALL_WRONG_PROJECT_OR_NONEMPTY_SOURCE_ABORT/);
 assert.match(sql,/CC_TEST_MASS_API_ALREADY_EXISTS_REVIEW_BEFORE_INSTALL/);
 assert.doesNotMatch(sql,/CREATE OR REPLACE FUNCTION/);
 assert.doesNotMatch(sql,/snqsxlyhontaepembaic|service_role|sb_secret_|https?:\/\//i);
});
test('eight original Manager RPC contracts with per-module guard and restrictive grants',()=>{
 assert.equal((sql.match(/CREATE FUNCTION public\.cc_manager_mass_/g)||[]).length,8);
 assert.equal((sql.match(/SECURITY DEFINER/g)||[]).length,8);
 assert.equal((sql.match(/SET search_path TO ''/g)||[]).length,8);
 assert.equal((sql.match(/private\.cc_manager_require_any_v1\(/g)||[]).length,8);
 for(const name of names){
  assert.match(sql,new RegExp('CREATE FUNCTION public\\.'+name+'\\('),name);
  assert.match(sql,new RegExp('REVOKE ALL ON FUNCTION public\\.'+name+'\\('),name);
  assert.match(sql,new RegExp('GRANT EXECUTE ON FUNCTION public\\.'+name+'\\('),name);
 }
 assert.equal((sql.match(/FROM PUBLIC,anon/g)||[]).length,8);
 assert.equal((sql.match(/TO authenticated/g)||[]).length,8);
});
test('only read-only RPCs, no public table grants, notifications, secret retrieval or writes',()=>{
 const bodies=sql.split('-- Expected: all eight rows')[0].replace(/--.*$/gm,'');
 assert.doesNotMatch(bodies,/\bINSERT INTO\b|\bUPDATE public\.|\bDELETE FROM\b|\bDROP TABLE\b|\bALTER TABLE\b|cc_push_enqueue|smtp|cc_mass_mail_claim/i);
 assert.doesNotMatch(sql,/GRANT (?:SELECT|INSERT|UPDATE|DELETE) ON (?:TABLE )?public\./i);
 assert.match(sql,/waitlistCount/);
 assert.match(sql,/cancellationHours/);
 assert.match(sql,/registrationMode/);
 assert.match(sql,/currentPassMonth/);
});
test('synthetic rollback integration QA has required scopes, no external emails or durable data writes',()=>{
 assert.match(qa,/^BEGIN;/m);assert.match(qa,/^ROLLBACK;/m);
 for(const key of ['guard','read_smoke','deny_modules','deny_no_auth']){
  assert.ok(qa.includes('DO $'+key+'$'),key);
 }
 for(const msg of ['TRAINING_CAPACITY_CONTRACT_FAILURE','EVENT_DETAIL_CONTRACT_FAILURE','PASS_MONTH_CONTRACT_FAILURE',
  'ATTENDANCE_SNAPSHOT_CONTRACT_FAILURE','CANCELLATION_CONTRACT_FAILURE',
  'ATHLETE_MODULE_PERMISSION_LEAK','PASS_MODULE_PERMISSION_LEAK','NO_AUTH_ALLOWED']){
   assert.ok(qa.includes(msg),msg);
 }
 assert.match(qa,/example\.invalid/);
 assert.match(qa,/CC_TEST_VNEXT_MASS_QA/);
 assert.doesNotMatch(qa,/snqsxlyhontaepembaic|sb_secret_|service_role|@gmail\.|@elte\./i);
});
