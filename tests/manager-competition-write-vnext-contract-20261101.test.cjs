'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const install=fs.readFileSync('docs/security/CC_TEST_COMPETITION_WRITES_SQL_EDITOR_INSTALL_20261101.sql','utf8');
const qa=fs.readFileSync('tests/sql/CC_TEST_COMPETITION_WRITES_POSTDEPLOY_ROLLBACK_20261101.sql','utf8');
const rpcs={
 save:'cc_manager_competition_event_save_v1',
 cancel:'cc_manager_competition_event_cancel_v1',
 rsvp:'cc_manager_competition_rsvp_v1',
 series:'cc_manager_competition_event_series_create_v1'
};
test('TEST-only guard and atomic SQL Editor installation',()=>{
 assert.match(install,/BEGIN;/);
 assert.match(install,/COMMIT;/);
 assert.match(install,/legacy_manager_id='cc_test_bb2_rsvp_20261106'/);
 assert.match(install,/WRONG_SUPABASE_PROJECT_ABORT/);
 assert.match(install,/WRITE_API_ALREADY_INSTALLED_REVIEW_REQUIRED/);
 assert.doesNotMatch(install,/snqsxlyhontaepembaic|sb_secret_|service_role/i);
});
test('four existing Manager UI write API signatures, only authenticated, no push',()=>{
 assert.equal((install.match(/CREATE FUNCTION public\.cc_manager_competition_/g)||[]).length,4);
 for(const rpc of Object.values(rpcs)){
  assert.match(install,new RegExp('CREATE FUNCTION public\\.'+rpc+'\\('));
  assert.match(install,new RegExp('REVOKE ALL ON FUNCTION public\\.'+rpc+'\\('));
  assert.match(install,new RegExp('GRANT EXECUTE ON FUNCTION public\\.'+rpc+'\\('));
 }
 assert.equal((install.match(/MANAGER_AUTH_REQUIRED/g)||[]).length,4);
 assert.equal((install.match(/SECURITY DEFINER SET search_path TO ''/g)||[]).length,4);
 assert.equal((install.match(/TEST_NOTIFICATION_SENDING_DISABLED/g)||[]).length,3);
 assert.doesNotMatch(install,/cc_push_enqueue_v1\s*\(|cc_manager_event_enqueue_change_v1\s*\(|smtp|send_email\s*\(/i);
});
test('write endpoints check team permissions, preserve RSVP note, log changes',()=>{
 assert.match(install,/private\.cc_manager_require_v1\(v_module,'edit',v_team\)/);
 assert.match(install,/private\.cc_manager_require_v1\(v_module,'edit',v_before\.team_id\)/);
 assert.match(install,/private\.cc_manager_require_v1\([\s\S]*'edit',v_event\.team_id\)/);
 assert.match(install,/EVENT_TEAM_TRANSFER_REQUIRES_SEPARATE_WORKFLOW/);
 assert.match(install,/EVENT_TYPE_IMMUTABLE/);
 assert.match(install,/EVENT_ALREADY_ENDED/);
 assert.match(install,/tm\.starts_on<=v_day/);
 assert.match(install,/ON CONFLICT \(event_id,player_id\) DO UPDATE SET status=excluded\.status,updated_at=now\(\)/);
 assert.equal((install.match(/INSERT INTO public\.audit_log/g)||[]).length,3);
 assert.match(install,/v_count NOT BETWEEN 1 AND 26/);
});
test('postdeploy QA is rollback-only with full writes + negative controls',()=>{
 assert.match(qa,/^BEGIN;/m);
 assert.match(qa,/^ROLLBACK;/m);
 for(const key of ['create_edit_rsvp','note_roundtrip','preserve','series_cancel','cross_team','no_session','integrity'])
  assert.ok(qa.includes('DO $'+key+'$'),key);
 for(const marker of ['EVENT_TYPE_CHANGED','UNEXPECTED_PUSH_ENQUEUED','CROSS_TEAM_CREATE_ALLOWED',
   'CROSS_TEAM_SERIES_ALLOWED','HISTORICAL_NOTE_LOST','CANCEL_DELETED_NOTE','NO_SESSION_WRITE_ALLOWED'])
  assert.ok(qa.includes(marker),marker);
 assert.match(qa,/SET LOCAL ROLE authenticated/);
 assert.match(qa,/cc\.qa\.manager_uid/);
 assert.doesNotMatch(qa,/snqsxlyhontaepembaic|sb_secret_|service_role/i);
});
