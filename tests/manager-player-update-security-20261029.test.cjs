'use strict';
// Static gate for a review-only function. Actual RLS/write QA is in a rollback SQL.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const sql=fs.readFileSync(path.join(root,'docs/security/TEST_MANAGER_PLAYER_UPDATE_CANDIDATE_20261029.sql'),'utf8');
const code=sql.replace(/^--[^\n]*$/gm,'');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
test('SQL is isolated to TEST, no LIVE credentials or external actions',()=>{
 assert.match(sql,/TEST project: szzoubvhlwnojtzqjebc/);
 assert.doesNotMatch(sql,/snqsxlyhontaepembaic|sb_secret_|service_role|BEGIN PRIVATE KEY/);
 assert.doesNotMatch(code,/net\.http|http_post|smtp|stripe|push_outbox/i);
 assert.equal((code.match(/CREATE OR REPLACE FUNCTION/g)||[]).length,1);
});
test('Manager form calls this exact authenticated RPC with payload',()=>{
 assert.match(app,/rpc\('cc_manager_player_update_v1',\{p_payload:payload\}\)/);
 assert.match(code,/FUNCTION public\.cc_manager_player_update_v1\(p_payload jsonb\)/);
 assert.match(code,/SECURITY DEFINER\s+SET search_path TO ''/i);
});
test('only authenticated can execute; no direct grants on player tables',()=>{
 assert.match(code,/REVOKE ALL ON FUNCTION public\.cc_manager_player_update_v1\(jsonb\) FROM PUBLIC/);
 assert.match(code,/REVOKE ALL ON FUNCTION public\.cc_manager_player_update_v1\(jsonb\) FROM anon/);
 assert.match(code,/GRANT EXECUTE ON FUNCTION public\.cc_manager_player_update_v1\(jsonb\) TO authenticated/);
 assert.doesNotMatch(code,/\bGRANT\s+(?:UPDATE|INSERT|SELECT|DELETE|ALL)\s+ON\s+(?:TABLE\s+)?public\./i);
});
test('require verified Manager identity and edit right before reading player record',()=>{
 const actor=code.indexOf("private.cc_manager_require_any_v1('competition.players','edit')");
 const select=code.indexOf("SELECT * INTO v_before FROM public.players");
 assert.ok(actor>=0&&select>actor);
 assert.match(code,/IF \(SELECT auth\.uid\(\)\) IS NULL/);
});
test('every effective team must permit edit; no empty roster or future membership shortcut',()=>{
 assert.match(code,/FROM public\.team_memberships tm\s+JOIN public\.teams t ON t\.id=tm\.team_id/);
 assert.match(code,/tm\.starts_on<=CURRENT_DATE/);
 assert.match(code,/tm\.ends_on IS NULL OR tm\.ends_on>=CURRENT_DATE/);
 assert.match(code,/tm\.active=TRUE AND t\.active=TRUE/);
 assert.match(code,/NOT private\.cc_manager_can_v1\('competition.players','edit',v_team\.team_id\)/);
 assert.match(code,/IF v_memberships=0 THEN/);
});
test('all 10 existing UI fields are required and unknown fields rejected',()=>{
 for(const key of ['playerId','name','displayName','email','position','jerseyNo','licenseNo','medicalValidUntil','jerseySize','shortsSize'])assert.ok(code.includes("'"+key+"'"),key);
 assert.match(code,/PLAYER_FIELD_NOT_EDITABLE/);
 assert.match(code,/PLAYER_PAYLOAD_FIELDS_REQUIRED/);
 assert.match(code,/PLAYER_EMAIL_READ_ONLY/);
 assert.doesNotMatch(code,/\bSET\s+email\s*=|\bSET\s+auth_user_id\s*=/i);
});
test('player and private profile are updated atomically with identity-safe audit and no whole-row PII audit',()=>{
 assert.equal((code.match(/UPDATE public\.players\s+SET/g)||[]).length,1);
 assert.equal((code.match(/INSERT INTO public\.player_private/g)||[]).length,1);
 assert.equal((code.match(/INSERT INTO public\.audit_log/g)||[]).length,1);
 assert.match(code,/ON CONFLICT \(player_id\) DO UPDATE/);
 assert.match(code,/actor_user_id,action,entity_type,entity_id,old_data,new_data/);
 assert.doesNotMatch(code,/nextval\(|OVERRIDING SYSTEM VALUE/);
 assert.doesNotMatch(code,/to_jsonb\(v_before\)|to_jsonb\(v_priv_before\)/);
});
test('bounded values prevent unexpectedly large profile writes',()=>{
 for(const cap of ['160','64','128','32','254'])assert.ok(code.includes(cap));
 assert.match(code,/INVALID_JERSEY_NO/);
 assert.match(code,/INVALID_MEDICAL_DATE/);
 assert.match(code,/PLAYER_FIELD_LENGTH_INVALID/);
});
