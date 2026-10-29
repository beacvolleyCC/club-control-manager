'use strict';
// Static security review of a TEST-only proposal, NOT a PostgreSQL integration test.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const sql=fs.readFileSync(path.join(__dirname,'..','docs/security/TEST_MANAGER_TEAM_UPDATE_V1_REVIEW_20261029.sql'),'utf8');
const executable=sql.replace(/--[^\n]*/g,'');
function occurrence(re){return [...executable.matchAll(re)].length;}
test('candidate stays outside migrations and is explicitly TEST-review only',()=>{
 assert.match(sql,/Review-only SQL, NOT auto-deployed/);
 assert.match(sql,/szzoubvhlwnojtzqjebc/);
 assert.doesNotMatch(executable,/snqsxlyhontaepembaic|sb_secret_|service_role/i);
 assert.equal(occurrence(/CREATE OR REPLACE FUNCTION/gi),1);
 assert.match(executable,/FUNCTION public\.cc_manager_team_update_v1\(\s*p_team_id uuid,\s*p_payload jsonb/);
});
test('no anonymous access or direct table privilege expansion',()=>{
 assert.match(executable,/SECURITY DEFINER\s+SET search_path TO ''/i);
 assert.match(executable,/REVOKE ALL ON FUNCTION public\.cc_manager_team_update_v1\(uuid,jsonb\) FROM PUBLIC/i);
 assert.match(executable,/REVOKE ALL ON FUNCTION public\.cc_manager_team_update_v1\(uuid,jsonb\) FROM anon/i);
 assert.match(executable,/GRANT EXECUTE ON FUNCTION public\.cc_manager_team_update_v1\(uuid,jsonb\) TO authenticated/i);
 assert.doesNotMatch(executable,/GRANT (?:SELECT|INSERT|UPDATE|DELETE|ALL) ON (?:TABLE )/i);
 assert.doesNotMatch(executable,/\bEXECUTE\s+format\s*\(|\bEXECUTE\s+'|\bALTER\s+TABLE\b/i);
});
test('explicit auth + competition.teams edit check happen before acquiring team rows',()=>{
 const auth=executable.indexOf("(SELECT auth.uid()) IS NULL");
 const perm=executable.indexOf("private.cc_manager_require_v1('competition.teams','edit',p_team_id)");
 const lookup=executable.indexOf("SELECT * INTO v_before FROM public.teams");
 assert.ok(auth>=0&&perm>auth&&lookup>perm);
 assert.match(executable,/IF v_manager_id IS NULL THEN/);
});
test('only a defined team payload can change; protected identifiers never update',()=>{
 assert.match(executable,/v_key NOT IN \('name','season','color','coaches','defaultVenue','defaultCourt','active'\)/);
 for(const key of ['name','season','color','coaches','defaultVenue','defaultCourt','active'])assert.ok(executable.includes("'"+key+"'"));
 assert.match(executable,/jsonb_typeof\(v_value\) <> 'boolean'/);
 assert.match(executable,/jsonb_typeof\(v_value\) <> 'string'/);
 assert.match(executable,/jsonb_typeof\(p_payload\) <> 'object'/);
 assert.match(executable,/length\(btrim\(p_payload->>'name'\)\) > 160/);
 assert.match(executable,/WHERE t\.id=p_team_id/);
 assert.doesNotMatch(executable,/\bSET\s+(?:id|legacy_team_id|auth_user_id|team_id)\s*=/i);
});
test('write and audit are atomic in the single function body, with original and new state',()=>{
 assert.equal(occurrence(/UPDATE public\.teams AS t SET/gi),1);
 assert.equal(occurrence(/INSERT INTO public\.audit_log/gi),1);
 assert.match(executable,/FOR UPDATE;/);
 assert.match(executable,/nextval\('public\.audit_log_id_seq'::regclass\)/);
 assert.match(executable,/to_jsonb\(v_before\),to_jsonb\(v_after\)/);
 assert.match(executable,/RETURN jsonb_build_object\(/);
});
test('no notification, external payment or cross-system activity',()=>{
 assert.doesNotMatch(executable,/\b(?:net\.http|http_post|send_email|invoke|pg_net|push_outbox|smtp|stripe)\b/i);
 assert.equal(occurrence(/UPDATE public\./gi),1);
});
