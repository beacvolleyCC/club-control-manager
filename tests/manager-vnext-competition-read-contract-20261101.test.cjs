'use strict';
// Static contract QA; requires real postdeploy PostgreSQL QA before release.
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const candidate=fs.readFileSync(path.join(root,'docs/security/CC_TEST_VNEXT_COMPETITION_READ_FACADE_V1_CANDIDATE_20261101.sql'),'utf8');
const qa=fs.readFileSync(path.join(root,'tests/sql/CC_TEST_VNEXT_COMPETITION_READ_POSTDEPLOY_ROLLBACK_20261101.sql'),'utf8');
const db=JSON.parse(fs.readFileSync(path.join(root,'docs/architecture/CC_TEST_API_CONTRACT_INVENTORY_20261101.json'),'utf8'));
const routes={
  teams:'cc_manager_teams_v1',
  players:'cc_manager_players_v2',
  overview:'cc_manager_overview_v1',
  events:'cc_manager_events_v1',
  calendar:'cc_manager_calendar_v3',
  roster:'cc_manager_event_roster_v1',
  rsvp_matrix:'cc_manager_rsvp_matrix_v1',
  results:'cc_manager_competition_results_v1',
  position_counts:'cc_manager_competition_position_counts_v1'
};
test('candidate clearly TEST-only, versioned and does not overwrite old RPC',()=>{
  assert.match(candidate,/TEST only\. NOT DEPLOYED/);
  assert.match(candidate,/CREATE FUNCTION public\.cc_vnext_competition_read_v1\(/);
  assert.doesNotMatch(candidate,/CREATE OR REPLACE FUNCTION/);
  assert.match(candidate,/apiVersion',1/);
  assert.doesNotMatch(candidate,/snqsxlyhontaepembaic|sb_secret_|service_role|https?:\/\//i);
});
test('invoker-only, explicit auth, only authenticated EXECUTE; no table access or writes',()=>{
  assert.match(candidate,/SECURITY INVOKER/);
  assert.match(candidate,/SET search_path TO ''/);
  assert.match(candidate,/auth\.uid\(\)\) IS NULL/);
  assert.match(candidate,/REVOKE ALL ON FUNCTION public\.cc_vnext_competition_read_v1\(/);
  assert.match(candidate,/FROM PUBLIC, anon/);
  assert.match(candidate,/GRANT EXECUTE ON FUNCTION public\.cc_vnext_competition_read_v1\(/);
  assert.match(candidate,/TO authenticated/);
  const body=candidate.slice(candidate.indexOf('AS $cc$'),candidate.indexOf('$cc$;',candidate.indexOf('AS $cc$')));
  assert.doesNotMatch(body,/\bINSERT\s+INTO\b|\bUPDATE\s+public\.|\bDELETE\s+FROM\b|\bEXECUTE\b|\bFROM\s+public\.[a-z_]+\b/i);
  assert.doesNotMatch(candidate,/CREATE\s+(?:TABLE|POLICY|TRIGGER)|ALTER\s+TABLE|DROP\s+TABLE/i);
});
test('all 9 routes delegate existing, separately authorized Manager RPCs',()=>{
  const installed=new Set(db.database_public_apis.filter(p=>p.authenticated_execute&&!p.anon_execute).map(p=>p.name));
  for(const [route,rpc] of Object.entries(routes)){
    assert.match(candidate,new RegExp("WHEN '"+route+"' THEN"),route);
    assert.ok(candidate.includes('public.'+rpc+'('),rpc);
    assert.ok(installed.has(rpc),'missing approved TEST DB RPC '+rpc);
  }
});
test('invalid resources/IDs/ranges bounded before delegating',()=>{
  for(const message of ['VNEXT_UNKNOWN_RESOURCE','VNEXT_EVENT_REQUIRED','VNEXT_INVALID_DATE_RANGE',
    'VNEXT_RSVP_RANGE_TOO_LARGE','VNEXT_EVENT_TYPE_INVALID','VNEXT_SEARCH_TOO_LONG'])
    assert.ok(candidate.includes(message),message);
  assert.match(candidate,/interval '400 days'/);
  assert.match(candidate,/interval '62 days'/);
  assert.match(candidate,/length\(coalesce\(p_search,''\)\)>120/);
});
test('transactional real-DB QA covers anon, unauthenticated, real manager, cross-team, rollback',()=>{
  assert.match(qa,/^BEGIN;$/m);
  assert.match(qa,/^ROLLBACK;$/m);
  for(const name of ['check_install','anonymous','empty_auth','valid_read','bad_inputs','scoped'])
    assert.ok(qa.includes('DO $'+name+'$'),name);
  assert.match(qa,/SET LOCAL ROLE anon/);
  assert.match(qa,/SET LOCAL ROLE authenticated/);
  assert.match(qa,/VNEXT_CROSS_TEAM_CATALOG_LEAK/);
  assert.match(qa,/VNEXT_CROSS_TEAM_ROSTER_ALLOWED/);
  assert.match(qa,/request\.jwt\.claims/);
  assert.doesNotMatch(qa,/snqsxlyhontaepembaic|sb_secret_|service_role/i);
});
