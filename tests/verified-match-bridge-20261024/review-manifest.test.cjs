'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path='data/competition/2026-27/verified-bridge-review-20261024.json';
const snapshot=JSON.parse(fs.readFileSync(path,'utf8'));
const uuid=/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const leagues=new Map([
 ['299','Női Budapest I. osztály'],
 ['959','Női Budapest II. osztály – B csoport'],
 ['709','Férfi Budapest I. osztály – B csoport']
]);
test('all historical BRSZ aliases, including already canonical and self fixtures, remain visible',()=>{
 assert.equal(snapshot.total,46);
 assert.equal(snapshot.entries.length,46);
 assert.deepEqual(snapshot.statuses,{
  CANDIDATE_REQUIRES_OFFICIAL_PROOF:41,
  ALREADY_CANONICAL_SAME_ID:3,
  BLOCK_SELF_MATCH:2
 });
 assert.equal(new Set(snapshot.entries.map(r=>r.legacySourceKey)).size,46);
});
test('there are zero approvals and zero invented BRSZ fixture IDs',()=>{
 assert.ok(snapshot.entries.every(r=>r.approved===false));
 assert.ok(snapshot.entries.every(r=>r.officialFixtureId===null));
 assert.ok(snapshot.entries.every(r=>r.approvalReviewer===null));
 assert.ok(snapshot.entries.every(r=>r.officialMatchSpecificProofUrl===null));
 assert.ok(snapshot.warning.includes('NEVER'));
});
test('41 candidate IDs cannot already be canonically identical or cross league',()=>{
 const candidates=snapshot.entries.filter(r=>r.state==='CANDIDATE_REQUIRES_OFFICIAL_PROOF');
 assert.equal(candidates.length,41);
 assert.equal(new Set(candidates.map(r=>r.legacyMatchId)).size,41);
 assert.equal(new Set(candidates.map(r=>r.canonicalMatchId)).size,41);
 for(const r of candidates){
  assert.equal(r.proofStatus,'AWAITING_EXTERNAL_OFFICIAL_MATCH_ID');
  assert.match(r.legacyMatchId,uuid);
  assert.match(r.canonicalMatchId,uuid);
  assert.notEqual(r.legacyMatchId,r.canonicalMatchId);
  assert.equal(r.scopedCandidateCount,1);
  assert.equal(r.season,'2026/27');
  assert.equal(r.league,leagues.get(r.sourceTeamId));
  assert.notEqual(r.homeSourceTeamId,r.awaySourceTeamId);
  assert.equal(r.alreadyCanonical,false);
  assert.ok(r.legacyLocalKickoff);
  assert.equal(r.legacyLocalKickoff,r.canonicalLocalKickoff);
 }
});
test('three existing official MRSZ IDs are identical and require no bridge',()=>{
 const existing=snapshot.entries.filter(r=>r.state==='ALREADY_CANONICAL_SAME_ID');
 assert.equal(existing.length,3);
 for(const r of existing){
  assert.equal(r.alreadyCanonical,true);
  assert.equal(r.proofStatus,'EXISTING_CANONICAL_ID');
  assert.match(r.legacyMatchId,uuid);
  assert.equal(r.legacyMatchId,r.canonicalMatchId);
  assert.ok(r.officialMrszCode);
 }
});
test('self matches cannot be silently approved or matched',()=>{
 const bad=snapshot.entries.filter(r=>r.state==='BLOCK_SELF_MATCH');
 assert.equal(bad.length,2);
 for(const r of bad){
  assert.equal(r.homeSourceTeamId,r.awaySourceTeamId);
  assert.equal(r.canonicalMatchId,null);
  assert.equal(r.proofStatus,'REJECTED');
 }
});
test('review source URLs are only trusted BRSZ/Hunvolley addresses, not official match-level proofs',()=>{
 const allowed=new Set(['brsz.hu','www.brsz.hu','hunvolley.info','www.hunvolley.info']);
 for(const r of snapshot.entries){
  const u=new URL(r.sourceUrl);
  assert.equal(u.protocol,'https:');
  assert.ok(allowed.has(u.hostname),'Untrusted source host: '+u.hostname);
  assert.match(r.sourceHashPrefix,/^[0-9a-f]{12}$/);
 }
});
