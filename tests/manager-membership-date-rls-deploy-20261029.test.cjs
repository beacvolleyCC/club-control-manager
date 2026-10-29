'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const staged=read('docs/security/TEST_RLS_MEMBERSHIP_DATE_DEPLOY_20261029.sql');
const candidate=read('docs/security/TEST_RLS_MEMBERSHIP_DATE_CANDIDATE_DO_NOT_APPLY_20261028.sql');
const rollback=read('tests/sql/TEST_RLS_MEMBERSHIP_EFFECTIVE_DATE_ROLLBACK_20261029.sql');
const clean=sql=>sql.replace(/^--.*$/gm,'').trim();
const body=sql=>clean(sql).slice(clean(sql).indexOf('CREATE OR REPLACE FUNCTION'));
const bodyParts=body(staged).split(/CREATE OR REPLACE FUNCTION\s+/i).filter(Boolean);
test('same exact SQL helper bodies as the separately reviewed candidate',()=>{
 assert.equal(body(staged),body(candidate));
 assert.equal(bodyParts.length,2);
 assert.match(staged,/szzoubvhlwnojtzqjebc/);
 assert.doesNotMatch(staged,/snqsxlyhontaepembaic|sb_secret_|service_role/);
});
test('only two private helpers replaced and no other database object or grant changes',()=>{
 assert.match(bodyParts[0],/^private\.current_team_ids\(\)/);
 assert.match(bodyParts[1],/^private\.player_in_my_team\(target_player uuid\)/);
 assert.doesNotMatch(body(staged),/\b(?:DROP|ALTER|TRUNCATE|INSERT|UPDATE|DELETE|GRANT|REVOKE|CREATE POLICY|CREATE TABLE)\b/i);
 assert.equal((body(staged).match(/SECURITY DEFINER/g)||[]).length,2);
 assert.equal((body(staged).match(/SET search_path TO ''/g)||[]).length,2);
});
test('current team IDs are scoped to linked authenticated player and active dated membership',()=>{
 const x=bodyParts[0];
 for(const required of ['public.team_memberships','public.players','public.teams','p.auth_user_id = (SELECT auth.uid())','p.active = TRUE','t.active = TRUE','tm.active = TRUE','tm.starts_on <= CURRENT_DATE','tm.ends_on IS NULL OR tm.ends_on >= CURRENT_DATE'])assert.ok(x.includes(required),required);
});
test('target teammate must share an effective team and cannot leak future or expired membership',()=>{
 const x=bodyParts[1];
 for(const required of ['tm.player_id = target_player','target_p.active = TRUE','t.active = TRUE','tm.active = TRUE','tm.starts_on <= CURRENT_DATE','tm.ends_on IS NULL OR tm.ends_on >= CURRENT_DATE','tm.team_id IN (SELECT private.current_team_ids())'])assert.ok(x.includes(required),required);
});
test('rollback SQL has all critical real PostgreSQL RLS test cases',()=>{
 assert.match(rollback,/^BEGIN;/m);
 assert.match(rollback,/^ROLLBACK;/m);
 assert.match(rollback,/SET LOCAL ROLE authenticated/);
 for(const name of ['baseline','target_future','future','expired','inactive_membership','inactive_player','inactive_team','inclusive','no_auth'])assert.ok(rollback.includes('DO $'+name+'$'),name);
 for(const issue of ['QA_UNRELATED_PLAYER_VISIBLE','QA_FUTURE_TEAM_RLS_LEAK','QA_FUTURE_EVENT_RLS_LEAK','QA_FUTURE_RSVP_RLS_LEAK','QA_FUTURE_TEAMMATE_RLS_LEAK','QA_NO_AUTH_EVENT_LEAK'])assert.ok(rollback.includes(issue),issue);
});
test('rollback verification executes the same candidate that is being deployed',()=>{
 assert.ok(rollback.includes(body(staged)));
 assert.doesNotMatch(rollback,/snqsxlyhontaepembaic|service_role|sb_secret_/);
});
test('migration only narrows athlete access; does not touch Manager permission paths',()=>{
 assert.doesNotMatch(body(staged),/manager_module_permissions|cc_manager_|public\.audit_log|pg_net|http_post|stripe|notify|push_outbox/i);
});
