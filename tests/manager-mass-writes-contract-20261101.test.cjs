'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const sql=fs.readFileSync('docs/security/CC_TEST_MASS_MANAGER_WRITES_SQL_EDITOR_INSTALL_20261101.sql','utf8');
const qa=fs.readFileSync('tests/sql/CC_TEST_MASS_MANAGER_WRITES_POSTDEPLOY_ROLLBACK_20261101.sql','utf8');
const names=['cc_manager_mass_registration_gate_v1','cc_manager_mass_booking_add_v1','cc_manager_mass_booking_patch_v1','cc_manager_mass_booking_remove_v1','cc_manager_mass_attendance_r1_v1'];
test('five TEST-only manager mass write RPCs are guarded and granted minimally',()=>{
 assert.match(sql,/WRONG_PROJECT_OR_NONEMPTY_MASS_SOURCE_ABORT/);
 assert.match(sql,/cc_test_bb2_rsvp_20261106/);
 assert.equal((sql.match(/CREATE FUNCTION public\.cc_manager_mass_/g)||[]).length,5);
 assert.equal((sql.match(/SECURITY DEFINER SET search_path TO ''/g)||[]).length,5);
 for(const n of names){
 assert.ok(sql.includes('CREATE FUNCTION public.'+n+'('),n);
 assert.ok(sql.includes('REVOKE ALL ON FUNCTION public.'+n+'('),n);
 assert.ok(sql.includes('GRANT EXECUTE ON FUNCTION public.'+n+'('),n);
 }
 assert.doesNotMatch(sql,/snqsxlyhontaepembaic|sb_secret_|service_role/i);
});
test('manager write permissions, row locking, capacity, waitlist and first-training rules',()=>{
 assert.equal((sql.match(/private\.cc_manager_require_any_v1\('mass.trainings','edit'\)/g)||[]).length,5);
 assert.match(sql,/FOR UPDATE/);
 assert.match(sql,/v_total\+v_reserved>=v_total_limit/);
 assert.match(sql,/v_new\+v_reserved>=v_new_limit/);
 assert.match(sql,/FIRST_TRAINING_ALREADY_USED_OR_EMAIL_REQUIRED/);
 assert.match(sql,/SAME_SLOT_CONFLICT/);
 assert.match(sql,/ATHLETE_ALREADY_IN_EVENT/);
 assert.match(sql,/managerWaitlistOnly/);
 assert.match(sql,/sanctionsAutomated',false/);
 assert.doesNotMatch(sql,/cc_push_enqueue\s*\(|cc_mass_mail_claim\s*\(|cc_mass_no_show_sanction_eval\s*\(/);
});
test('all five APIs record audit events, no durable fixtures or public grants',()=>{
 assert.equal((sql.match(/INSERT INTO public\.mass_live_write_audit/g)||[]).length,5);
 assert.match(qa,/^BEGIN;/m);assert.match(qa,/^ROLLBACK;/m);
 assert.match(qa,/CC_TEST_MASS_WRITE_QA/);
 assert.match(qa,/UNEXPECTED_MESSAGE_QUEUED/);
 assert.match(qa,/EDIT_PERMISSION_REVOKE_IGNORED/);
 assert.match(qa,/UNAUTHENTICATED_ADMIN_WRITE_ALLOWED/);
 assert.match(qa,/CAPACITY_OVERBOOK_ALLOWED/);
 assert.match(qa,/DUPLICATE_EMAIL_ALLOWED/);
 assert.match(qa,/ATTENDANCE_RESTORE_CONTRACT_FAILED/);
 assert.match(qa,/existingWaitlistOffer|EXISTING_WAITLIST_OFFER_CHANGED/);
 assert.doesNotMatch(sql,/GRANT (?:SELECT|INSERT|UPDATE|DELETE) ON public\./i);
});
