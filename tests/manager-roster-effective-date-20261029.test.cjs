'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const sql=fs.readFileSync(path.join(root,'docs/security/TEST_MANAGER_PLAYERS_V2_EFFECTIVE_DATE_CANDIDATE_20261029.sql'),'utf8');
const qa=fs.readFileSync(path.join(root,'tests/sql/TEST_MANAGER_PLAYERS_V2_EFFECTIVE_DATE_ROLLBACK_20261029.sql'),'utf8');
test('TEST source only and single existing public read function',()=>{
 assert.match(sql,/TEST only, #82/);assert.equal((sql.match(/CREATE OR REPLACE FUNCTION/g)||[]).length,1);
 assert.match(sql,/public\.cc_manager_players_v2\(p_team_id uuid DEFAULT NULL::uuid, p_query text DEFAULT ''::text\)/);
 assert.match(sql,/\$function\$;/);assert.doesNotMatch(sql,/snqsxlyhontaepembaic|service_role|sb_secret_/);
});
test('preserves scoped Manager permission and existing payload',()=>{
 for(const x of ["private.cc_manager_require_any_v1('competition.players','view')","private.cc_manager_require_v1('competition.players','view',p_team_id)","mp.can_view=true","amp.can_view=true","'playerId'","'licenseNo'","'medicalValidUntil'","'teamName'","'membershipStartsOn'"])assert.ok(sql.includes(x),x);
});
test('prevents future/expired/inactive membership and inactive team',()=>{
 for(const x of ["tm.active=true","tm.starts_on<=current_date","tm.ends_on is null or tm.ends_on>=current_date","t.active=true","m.team_id is not null"])assert.ok(sql.includes(x),x);
});
test('does not widen ACL, overwrite data, or create notification',()=>{
 const body=sql.replace(/^--.*$/gm,'');
 assert.doesNotMatch(body,/\b(?:INSERT INTO|UPDATE public\.|DELETE FROM|GRANT|REVOKE|DROP TABLE|CREATE TABLE)\b/i);
 assert.doesNotMatch(body,/push_outbox|notification|smtp/i);
});
test('transactional PostgreSQL QA covers valid current/future/expired/date boundary/team/JWT',()=>{
 assert.match(qa,/^BEGIN;/m);assert.match(qa,/^ROLLBACK;/m);
 for(const name of ['baseline','future','boundary','expired','inactive','team_inactive','no_auth'])assert.ok(qa.includes('DO $'+name+'$'),name);
 assert.match(qa,/SET LOCAL ROLE authenticated/);
 assert.doesNotMatch(qa,/snqsxlyhontaepembaic|sb_secret_/);
});
