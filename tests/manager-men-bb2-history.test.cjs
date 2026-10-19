const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const data=JSON.parse(fs.readFileSync('data/competition-strength/men-bb2_202627_historical_coverage.json','utf8'));
const js=fs.readFileSync('app.js','utf8');
const start=js.indexOf('  const ccWomenHistoryState_='),end=js.indexOf('  function renderModule(){',start);
assert.ok(start>=0&&end>start);
const source=js.slice(start,end);
function runner(input=data,team='womenIIB'){
 const host={innerHTML:''};
 const context={
   document:null,Promise,Array,Object,Intl,Date,Set,Number,
   text:x=>String(x??'').trim(),
   esc:x=>String(x??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])),
   ccRouteIs_:()=>true,
   $:key=>key==='#viewContent'?host:null,
   fetch:async()=>({ok:true,json:async()=>input})
 };
 vm.createContext(context);
 vm.runInContext(source+'\nthis.__h={load:ccLoadOtherHistory_,render:ccRenderOtherHistory_,state:ccClubHistoryState_};',context);
 context.__h.state.selected=team;
 return {host,...context.__h};
}
test('Partial women II A 2025/26 samples show as non-official research, never as full BB2 standings',async()=>{
 const r=runner();await r.load();
 assert.ok(r.host.innerHTML.includes('Női BB2'));
 assert.ok(r.host.innerHTML.includes('A csoport'));
 assert.ok(r.host.innerHTML.includes('8 mérkőzés'));
 assert.ok(r.host.innerHTML.includes('másodlagos forrás'));
 assert.ok(r.host.innerHTML.includes('nincs becsült Elo'));
});
test('Men result unknown and two PDSE team ids require review',async()=>{
 const r=runner(data,'menB');await r.load();
 assert.ok(r.host.innerHTML.includes('Férfi'));
 assert.ok(r.host.innerHTML.includes('1091, 1214'));
 assert.ok(r.host.innerHTML.includes('Mozdulj SE'));
 assert.ok(r.host.innerHTML.includes('nincs becsült Elo'));
 assert.ok(!r.host.innerHTML.includes('8 mérkőzés'));
});
test('No invented current strength, full historical record or Elo in either team',()=>{
 assert.equal(data.teams.length,2);
 for(const row of data.teams){
  assert.equal(row.historicalStanding,null);
  assert.equal(row.historicalTotalPlayed,null);
  assert.equal(row.historicalTotalWins,null);
  assert.equal(row.historicalTotalLosses,null);
  assert.equal(row.historicalElo,null);
  assert.equal(row.currentStrengthRating,null);
  assert.equal(row.currentOpponents.length,7);
 }
});
test('Every sample uses the checked secondary source and valid 3-set win score',()=>{
 const team=data.teams.find(x=>x.key==='womenIIB');
 assert.equal(team.candidateHistoricalResults.length,8);
 assert.equal(new Set(team.candidateHistoricalResults.map(m=>m.date+'|'+m.home+'|'+m.away)).size,8);
 for(const row of team.candidateHistoricalResults){
  assert.equal(row.sourceReliability,'secondary_aggregation_unverified');
  assert.ok(row.sourceURL.startsWith('https://'));
  assert.equal(Math.max(row.homeSets,row.awaySets),3);
  assert.ok(Math.min(row.homeSets,row.awaySets)>=0&&Math.min(row.homeSets,row.awaySets)<=2);
 }
});
test('Invalid current rating is rejected and has no way to write events or attendance',async()=>{
 const bad=JSON.parse(JSON.stringify(data));bad.teams[0].currentStrengthRating=1600;
 const r=runner(bad);await r.load();
 assert.ok(r.state.error.includes('ellenőrzése sikertelen'));
 assert.ok(!r.host.innerHTML.includes('1600'));
 assert.ok(!source.includes('rpc('));
 assert.ok(!source.includes('insert('));
 assert.ok(!source.includes('update('));
});
