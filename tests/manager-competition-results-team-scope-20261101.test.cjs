'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const fix=fs.readFileSync('docs/security/CC_TEST_COMPETITION_RESULTS_TEAM_SCOPE_FIX_20261101.sql','utf8');
const qa=fs.readFileSync('tests/sql/CC_TEST_COMPETITION_RESULTS_SCOPE_ROLLBACK_20261101.sql','utf8');
test('candidate preserves existing results contract',()=>{
 for(const field of ['eventId','teamId','sourceMatchKey','homeSets','awaySets','setScores','resultSeenAt'])assert.ok(fix.includes('"'+field+'"'),field);
 assert.match(fix,/CREATE OR REPLACE FUNCTION public\.cc_manager_competition_results_v1\(p_team_ids uuid\[\]/);
 assert.match(fix,/SECURITY DEFINER SET search_path TO ''/);
});
test('requires Manager privilege for each actual result team',()=>{
 assert.match(fix,/private\.cc_manager_require_any_v1\('competition.matches','view'\)/);
 assert.match(fix,/mp\.manager_id=v_manager_id/);
 assert.match(fix,/mp\.module_key='competition.matches'/);
 assert.match(fix,/mp\.can_view IS TRUE/);
 assert.match(fix,/mp\.team_id=s\.internal_team_id/);
 assert.match(fix,/s\.internal_team_id IS NOT NULL/);
 assert.match(fix,/REVOKE ALL ON FUNCTION.*FROM PUBLIC,anon/s);
 assert.match(fix,/GRANT EXECUTE ON FUNCTION.*TO authenticated/s);
});
test('TEST only and postdeploy acceptance is rollback, no LIVE edits',()=>{
 assert.match(fix,/TEST ONLY/);
 assert.match(qa,/^BEGIN;/m);
 assert.match(qa,/^ROLLBACK;/m);
 assert.match(qa,/CROSS_TEAM_RESULT_LEAK/);
 assert.match(qa,/EXPLICIT_TEAM_SCOPE_LEAK/);
 assert.match(qa,/NO_AUTH_WAS_ALLOWED/);
 assert.match(qa,/SET LOCAL ROLE authenticated/);
 for(const s of [fix,qa])assert.doesNotMatch(s,/snqsxlyhontaepembaic|service_role|sb_secret_/);
});
