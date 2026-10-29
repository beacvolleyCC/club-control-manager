'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const sql=fs.readFileSync(path.join(root,'docs/security/TEST_STAGE20_TRANSFER_PLANS_CANDIDATE_20261030.sql'),'utf8');
const rollback=fs.readFileSync(path.join(root,'tests/sql/TEST_STAGE20_TRANSFER_PLANS_ROLLBACK_20261030.sql'),'utf8');
const post=fs.readFileSync(path.join(root,'tests/sql/TEST_STAGE20_TRANSFER_PLANS_POSTDEPLOY_ROLLBACK_20261030.sql'),'utf8');
test('TEST scoped migration and RLS protected plan table',()=>{
 assert.match(sql,/Stage20 TEST only/);assert.match(sql,/ALTER TABLE public\.cc_manager_transfer_plans_v1 ENABLE ROW LEVEL SECURITY/);
 assert.match(sql,/REVOKE ALL ON TABLE public\.cc_manager_transfer_plans_v1 FROM PUBLIC, anon, authenticated/);
 assert.doesNotMatch(sql,/snqsxlyhontaepembaic|sb_secret_|service_role/);
});
test('unique pending plan, effective date and explicit no automatic execution',()=>{
 assert.match(sql,/CREATE UNIQUE INDEX.*cc_manager_transfer_plans_one_pending_per_player_v1/);
 assert.match(sql,/WHERE status='pending'/);assert.match(sql,/PLAN_FUTURE_DATE_WITHIN_YEAR_REQUIRED/);
 assert.match(sql,/automaticExecution',FALSE/);assert.doesNotMatch(sql,/pg_cron|cron\.schedule|DELETE FROM public\.availability/);
});
test('both source and target edit permission; scoped private list',()=>{
 assert.match(sql,/private\.cc_manager_can_v1\('competition.players','edit',v_membership.team_id\)/);
 assert.match(sql,/private\.cc_manager_can_v1\('competition.players','edit',p_team_id\)/);
 assert.match(sql,/private\.cc_manager_can_v1\('competition.players','view',x.source_team_id\)/);
 assert.match(sql,/private\.cc_manager_can_v1\('competition.players','view',x.target_team_id\)/);
});
test('all three RPCs are authenticated, audited writes are atomic',()=>{
 for(const name of ['cc_manager_player_transfer_plan_v1','cc_manager_player_transfer_plan_cancel_v1','cc_manager_player_transfer_plan_list_v1']){
  assert.match(sql,new RegExp('CREATE OR REPLACE FUNCTION public\\.'+name));
  assert.match(sql,new RegExp('GRANT EXECUTE ON FUNCTION public\\.'+name+'.*TO authenticated'));
 }
 assert.match(sql,/manager\.player_transfer\.plan_create/);
 assert.match(sql,/manager\.player_transfer\.plan_cancel/);
});
test('real SQL tests use rollback and do not mutate current memberships or RSVP',()=>{
 assert.match(rollback,/^BEGIN;/m);assert.match(rollback,/^ROLLBACK;/m);
 assert.match(post,/^BEGIN;/m);assert.match(post,/^ROLLBACK;/m);
 assert.doesNotMatch(post,/CREATE OR REPLACE FUNCTION|CREATE TABLE/);
 for(const v of ['TODAY_PLAN_ALLOWED','DUPLICATE_PLAN_ALLOWED','PLAN_CANCEL_FAILED','DATA_INTEGRITY_FAILED'])assert.ok(rollback.includes(v));
});
