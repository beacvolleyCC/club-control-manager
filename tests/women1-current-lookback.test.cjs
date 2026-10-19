const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const {build,RECONCILIATION}=require('../scripts/history/build-women1-current-lookback.cjs');
test('All 2026/27 women I teams have a unique current BRSZ identity',()=>{
 const rows=build().teams;
 assert.equal(rows.length,12);
 assert.equal(new Set(rows.map(x=>x.currentBrszTeamId)).size,12);
 assert.equal(new Set(rows.map(x=>x.currentTeam)).size,12);
 assert.equal(rows.filter(x=>x.identityStatus.startsWith('supported_')).length,8);
 assert.equal(rows.filter(x=>x.identityStatus==='review_alias').length,2);
 assert.equal(rows.filter(x=>x.identityStatus==='no_women_i_history').length,2);
});
test('Current team strength always remains NULL and no continuity is inferred',()=>{
 const d=build();
 assert.equal(d.noPredictiveOrCurrentStrength,true);
 assert.equal(d.noPlayerOrRosterContinuityAssertion,true);
 for(const row of d.teams){
  assert.equal(row.currentStrengthRating,null);
  assert.equal(row.continuityConfirmed,false);
 }
});
test('New women I entries do not silently inherit women II or invented ratings',()=>{
 const byTeam=new Map(build().teams.map(x=>[x.currentTeam,x]));
 for(const name of ['Semmelweis Egyetem','Óbudai Egyetem-Kandó SC']){
  const r=byTeam.get(name);
  assert.ok(r);
  assert.equal(r.identityStatus,'no_women_i_history');
  assert.equal(r.historicalOfficialPlace,null);
  assert.equal(r.historicalExperimentalElo,null);
 }
});
test('Mozdulj and MTK use review states, not automatic exact identity',()=>{
 const byTeam=new Map(build().teams.map(x=>[x.currentTeam,x]));
 assert.equal(byTeam.get('Mozdulj SE').identityStatus,'review_alias');
 assert.equal(byTeam.get('MTK').identityStatus,'review_alias');
 assert.equal(byTeam.get('MTK').historicalTeam,'MTK Budapest');
 assert.equal(byTeam.get('Mozdulj SE').historicalTeam,'Mozdulj');
});
test('Saved historical comparables are byte-for-byte reproducible',()=>{
 const computed=build();
 const saved=JSON.parse(fs.readFileSync(path.join(ROOT,'data/competition-strength/women1_2026_27_historical_lookback.json')));
 assert.deepEqual(computed,saved);
});
test('Every supported historical alias is explicitly allowlisted; no fuzzy matching',()=>{
 const d=build(), permitted=new Set(Object.keys(RECONCILIATION));
 for(const row of d.teams)assert.ok(permitted.has(row.currentTeam));
 for(const row of d.teams.filter(x=>x.historicalTeam)){
  assert.equal(typeof row.historicalOfficialPlace,'number');
  assert.equal(typeof row.historicalWins,'number');
  assert.equal(typeof row.historicalExperimentalElo,'number');
 }
});