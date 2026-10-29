'use strict';
// CI checks the saved metadata inventory; it does NOT connect to Supabase
// and does not certify live RLS, auth or browser behavior.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'docs/architecture/CC_TEST_API_CONTRACT_INVENTORY_20261029.json'),'utf8'));
const managerSource=fs.readFileSync(path.join(root,'app.js'),'utf8');
const sourceNames=[...new Set([...managerSource.matchAll(/cc_manager_[a-z0-9_]+/g)].map(m=>m[0]))].sort();
const unique=list=>new Set(list).size===list.length;

test('inventory is explicitly for the isolated TEST project and contains no privileged credentials',()=>{
 assert.equal(manifest.test_project_ref,'szzoubvhlwnojtzqjebc');
 assert.equal(manifest.manager_test.branch,'test/20261026-manager-document-intake');
 assert.equal(manifest.player_test.branch,'test/20261026-isolated-player-mobile');
 const text=JSON.stringify(manifest);
 assert.doesNotMatch(text,/snqsxlyhontaepembaic|sb_secret_|service_role|-----BEGIN .*PRIVATE KEY-----/i);
 assert.equal(manifest.database_public_apis.every(x=>x.schema==='public'),true);
});
test('current Manager source tokens match the saved API inventory without omissions',()=>{
 const recorded=manifest.source_tokens.manager.map(x=>x.name).sort();
 assert.deepEqual(recorded,sourceNames);
 assert.ok(unique(recorded));
 assert.ok(unique(manifest.source_tokens.player.map(x=>x.name)));
});
test('all inventory RPCs deny anon execution and only claim DB-callability when present',()=>{
 const db=manifest.database_public_apis;
 const deployed=new Set(db.map(x=>x.name));
 assert.ok(unique(db.map(x=>x.name)));
 for(const endpoint of db)assert.equal(endpoint.anon_execute,false,endpoint.name);
 for(const [kind,refs] of Object.entries(manifest.source_tokens)){
  for(const ref of refs){
   assert.equal(ref.db_callable,deployed.has(ref.name),kind+': '+ref.name);
   assert.equal(ref.runtime_not_verified,true,kind+': '+ref.name);
  }
 }
});
test('required Manager read endpoints exist but Manager write parity remains visibly incomplete',()=>{
 const deployed=new Map(manifest.database_public_apis.map(x=>[x.name,x]));
 for(const name of ['cc_manager_bootstrap_v1','cc_manager_teams_v1',
  'cc_manager_overview_v1','cc_manager_players_v2','cc_manager_calendar_v3',
  'cc_manager_events_v1','cc_manager_rsvp_matrix_v1','cc_manager_competition_results_v1']){
  assert.equal(deployed.get(name)?.authenticated_execute,true,name);
  assert.equal(deployed.get(name)?.anon_execute,false,name);
 }
 assert.equal(manifest.source_tokens.manager.some(x=>!x.db_callable),true);
 assert.equal(manifest.release_blockers.some(x=>x.includes('Manager write')),true);
});
test('every captured public table had RLS enabled at audit time',()=>{
 assert.ok(unique(manifest.public_tables.map(x=>x.table)));
 assert.equal(manifest.public_tables.every(x=>x.rls_enabled===true),true);
});
test('module rebuild remains blocked on real E2E login and date-bounded membership security',()=>{
 assert.equal(manifest.release_blockers.some(x=>x.includes('#81')),true);
 assert.equal(manifest.release_blockers.some(x=>x.includes('#31')),true);
 assert.equal(manifest.release_blockers.some(x=>x.includes('Cloudflare')),true);
});
