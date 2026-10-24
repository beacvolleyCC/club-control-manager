'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const bridge=require('../competition-match-bridge.js');

const ids={
  oldA:'11111111-1111-1111-1111-111111111111',
  newA:'22222222-2222-2222-2222-222222222222',
  oldB:'33333333-3333-3333-3333-333333333333',
  newB:'44444444-4444-4444-4444-444444444444',
  other:'55555555-5555-5555-5555-555555555555'
};
const rowA={
 legacyMatchId:ids.oldA,canonicalMatchId:ids.newA,
 canonicalSourceKey:'mrsz:2026/27:protocol:2699',season:'2026/27',
 competitionLabel:'Férfi Budapest I. osztály – B csoport',
 verification:'official_identity_manually_verified',verified:true
};
const rowB={
 legacyMatchId:ids.oldB,canonicalMatchId:ids.newB,
 canonicalSourceKey:'mrsz:2026/27:protocol:2337',season:'2026/27',
 competitionLabel:'Női Budapest II. osztály – B csoport',
 verification:'official_identity_manually_verified',verified:true
};

test('flag OFF: the existing v2 RPC is the only request for each client',async()=>{
 for(const kind of ['manager','player']){
  const calls=[];
  const result=await bridge.loadSnapshot(async name=>{
   calls.push(name);return {marker:'from-v2'};
  },kind,false);
  assert.deepEqual(calls,['cc_'+kind+'_competition_mrsz_snapshot_v2']);
  assert.equal(result.marker,'from-v2');
 }
});
test('flag ON: v3 used without additional requests',async()=>{
 for(const kind of ['manager','player']){
  const calls=[];
  const result=await bridge.loadSnapshot(async name=>{
   calls.push(name);return {marker:'from-v3'};
  },kind,true);
  assert.deepEqual(calls,['cc_'+kind+'_competition_mrsz_snapshot_v3']);
  assert.equal(result.marker,'from-v3');
 }
});
test('missing v3 only: known PGRST202 and 42883 errors permit v2 fallback',async()=>{
 for(const code of ['PGRST202','42883']){
  const calls=[];
  const value=await bridge.loadSnapshot(async name=>{
   calls.push(name);
   if(name.endsWith('_v3'))throw {code,message:'Could not find the function public.'+name+' in the schema cache'};
   return {ok:true};
  },'player',true);
  assert.equal(value.ok,true);
  assert.deepEqual(calls,['cc_player_competition_mrsz_snapshot_v3','cc_player_competition_mrsz_snapshot_v2']);
 }
});
test('RLS, auth and network failures never get silently downgraded to v2',async()=>{
 for(const failure of [
  {code:'42501',message:'permission denied'},
  {code:'PGRST301',message:'JWT expired'},
  {code:'PGRST202',message:'Could not find unrelated schema function'},
  {code:'ETIMEDOUT',message:'connect timeout'}
 ]){
  const calls=[];
  await assert.rejects(()=>bridge.loadSnapshot(async name=>{
   calls.push(name);throw Object.assign(new Error(failure.message),{code:failure.code});
  },'manager',true),err=>err.code===failure.code);
  assert.deepEqual(calls,['cc_manager_competition_mrsz_snapshot_v3']);
 }
});
test('only explicit, scoped, officially approved identities survive normalization',()=>{
 const malformed=[
  {...rowA,verified:false},
  {...rowA,verification:'name_and_time_only'},
  {...rowA,season:'2025/26'},
  {...rowA,competitionLabel:'Női Budapest I. osztály – B csoport'},
  {...rowA,canonicalMatchId:ids.oldA},
  {...rowA,legacyMatchId:'bad uuid'},
  {...rowA,canonicalSourceKey:''},
  null
 ];
 assert.deepEqual(bridge.normalize([rowA,rowB,...malformed]),[
  {legacyMatchId:ids.oldA,canonicalMatchId:ids.newA,
   canonicalSourceKey:rowA.canonicalSourceKey,season:'2026/27',
   competitionLabel:rowA.competitionLabel,verified:true},
  {legacyMatchId:ids.oldB,canonicalMatchId:ids.newB,
   canonicalSourceKey:rowB.canonicalSourceKey,season:'2026/27',
   competitionLabel:rowB.competitionLabel,verified:true}
 ]);
 assert.deepEqual(bridge.normalize(null),[]);
});
test('two claims for the same legacy UUID, canonical UUID, or source key are all blocked',()=>{
 const duplicateLegacy={...rowB,legacyMatchId:ids.oldA};
 const duplicateCanonical={...rowB,canonicalMatchId:ids.newA};
 const duplicateSource={...rowB,canonicalSourceKey:rowA.canonicalSourceKey};
 assert.deepEqual(bridge.normalize([rowA,duplicateLegacy]),[]);
 assert.deepEqual(bridge.normalize([rowA,duplicateCanonical]),[]);
 assert.deepEqual(bridge.normalize([rowA,duplicateSource]),[]);
 assert.deepEqual(bridge.normalize([rowA,rowA]),[]);
});
test('canonical decoration requires ID + source + league + season and preserves source objects',()=>{
 const original=[
  {matchId:ids.newA,sourceKey:rowA.canonicalSourceKey,
   season:'2026/27',competitionLabel:rowA.competitionLabel,homeSets:3,awaySets:0},
  {matchId:ids.newB,sourceKey:rowB.canonicalSourceKey,
   season:'2026/27',competitionLabel:'Női Budapest I. osztály'},
  {matchId:ids.other,sourceKey:rowA.canonicalSourceKey,
   season:'2026/27',competitionLabel:rowA.competitionLabel},
  {matchId:ids.newB,sourceKey:'incorrect-fixture-key',
   season:'2026/27',competitionLabel:rowB.competitionLabel}
 ];
 const before=JSON.stringify(original);
 const out=bridge.annotateCanonical(original,[rowA,rowB]);
 assert.equal(out[0]._ccVerifiedLegacyMatchId,ids.oldA);
 assert.equal(out[0]._ccBridgeVerified,true);
 for(let i=1;i<out.length;i++)assert.equal(out[i]._ccVerifiedLegacyMatchId,undefined);
 assert.equal(JSON.stringify(original),before);
 assert.equal(bridge.annotateCanonical(original,[])[0]._ccVerifiedLegacyMatchId,undefined);
});
test('source code is opt-in and never auto-links to event IDs or bookings',()=>{
 const config=fs.readFileSync('config.js','utf8');
 const html=fs.readFileSync('index.html','utf8');
 const app=fs.readFileSync('app.js','utf8');
 assert.match(config,/CANONICAL_BRIDGE_V3_ENABLED:\s*false/);
 assert.ok(html.indexOf('competition-match-bridge.js')>=0);
 assert.ok(html.indexOf('competition-match-bridge.js')<html.indexOf('app.js?v='));
 assert.match(app,/(?:CCVerifiedMatchBridge|ccBridgeApi)\.loadSnapshot/);
 assert.match(app,/CANONICAL_BRIDGE_V3_ENABLED===true/);
 assert.match(app,/verifiedLegacyMatchBridge/);
 assert.match(app,/ccVerifiedCanonical|ccCanonicalRows/);
 // The adapter must have no write path or event ID assigned to a match ID.
 const helper=fs.readFileSync('competition-match-bridge.js','utf8');
 assert.doesNotMatch(helper,/\.from\(['"]availability|\.upsert\(|\.insert\(|\.update\(/);
 assert.doesNotMatch(helper,/eventId\s*:/);
});
