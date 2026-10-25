'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const app=fs.readFileSync('app.js','utf8');
const w1='Női Budapest I. osztály';
const w2='Női Budapest II. osztály – B csoport';
const menB='Férfi Budapest I. osztály – B csoport';
const menA='Férfi Budapest I. osztály – A csoport';
const start=app.indexOf('  function ccMrszMergedLeagueMatches_(');
const end=app.indexOf('  // An unscored BEAC–BEAC',start);
assert.ok(start>0 && end>start);
const matches=[
 {matchId:'11111111-1111-4111-8111-111111111111',sourceKey:'userofficial:bb1',season:'2026/27',competitionLabel:w1,startsAt:'2026-11-10T19:30:00',homeName:'MTK Budapest',awayName:'BEAC',homeSets:null,awaySets:null,status:'scheduled'},
 {matchId:'22222222-2222-4222-8222-222222222222',sourceKey:'userofficial:bb2b',season:'2026/27',competitionLabel:w2,startsAt:'2026-11-17T19:30:00',homeName:'BEAC II.',awayName:'MTK Budapest kék',homeSets:null,awaySets:null,status:'scheduled'},
 {matchId:'33333333-3333-4333-8333-333333333333',sourceKey:'mrsz:2026/27:protocol:2699',season:'2026/27',competitionLabel:menB,startsAt:'2026-10-19T19:30:00',homeName:'BEAC',awayName:'PDSE',homeSets:3,awaySets:0,setScores:[{home:25,away:19},{home:25,away:20},{home:25,away:17}],status:'played'},
 {matchId:'44444444-4444-4444-8444-444444444444',sourceKey:'userofficial:menA',season:'2026/27',competitionLabel:menA,startsAt:'2026-11-01T20:00:00',homeName:'MAFC-Kármán',awayName:'Ráckeve',status:'scheduled',homeSets:null,awaySets:null}
];
const state={
 ccMrszPhotoState_:{canonicalMatches:matches,fixtures:[{competitionLabel:w1,startsAt:'2026-10-31T19:30:00',homeName:'BEAC',awayName:'RETIRED_PLACEHOLDER'}],matches:[{competitionLabel:menB,startsAt:'2026-10-12T19:30:00',homeName:'BEAC',awayName:'PDSE',homeSets:null,awaySets:null}],tables:[],loaded:true},
 text:x=>String(x??'').trim(),
 ccManagerMatchVisualSort_:(a,b)=>String(a.startsAt).localeCompare(String(b.startsAt))
};
vm.createContext(state);
vm.runInContext(app.slice(start,end)+'\nthis.qaMerged=ccMrszMergedLeagueMatches_;',state);
test('canonical user-confirmed fixtures override stale historical imports without changing IDs',()=>{
 for(const group of [w1,w2,menB,menA]){
  const actual=state.qaMerged(group);
  assert.equal(actual.length,1);
  assert.equal(actual[0].sourceKey,matches.find(m=>m.competitionLabel===group).sourceKey);
  assert.equal(actual[0].matchId,matches.find(m=>m.competitionLabel===group).matchId);
 }
 assert.equal(state.qaMerged(w1)[0].homeName,'MTK Budapest');
 assert.equal(state.qaMerged(w2)[0].awayName,'MTK Budapest kék');
 assert.equal(state.qaMerged(menB)[0].homeSets,3);
 assert.equal(state.qaMerged(menB)[0].startsAt,'2026-10-19T19:30:00');
 assert.ok(!state.qaMerged(w1).some(x=>x.awayName==='RETIRED_PLACEHOLDER'));
 assert.equal(state.ccMrszPhotoState_.fixtures.length,1,'legacy data remains read-only');
});
test('canonical lists have strictly separate season/league/team source identities',()=>{
 const all=[...new Set(matches.map(m=>m.competitionLabel))];
 assert.equal(all.length,4);
 assert.notEqual(state.qaMerged(w1)[0].sourceKey,state.qaMerged(w2)[0].sourceKey);
 assert.notEqual(state.qaMerged(w2)[0].matchId,state.qaMerged(menB)[0].matchId);
 assert.equal(matches.every(m=>m.season==='2026/27'),true);
});
const mstart=app.indexOf('  function ccLeagueMatchesContextHtml_(){');
const mend=app.indexOf('  function renderCompetitionMatchCards_(){',mstart);
assert.ok(mstart>0&&mend>mstart);
const matchContext=vm.createContext({
 ccMrszPhotoState_:{loaded:true,error:''},
 ccMatchesDefaultLeague_:()=>w1,
 teamFilterIds_:()=>[],
 ccLeagueContextSelectHtml_:league=>'<select>'+league+'</select>',
 esc:x=>String(x??''),
 text:x=>String(x??'')
});
vm.runInContext(`
let ccMatchesSelectedGroup_='';
let ccLeagueMatchScope_='beac';
function ccMrszLeagueFixturePanelHtml_(league){
 return '<article data-league="'+league+'" data-scope="'+ccLeagueMatchScope_+'">Fixture</article>';
}
`+app.slice(mstart,mend)+`
this.qaPage=ccLeagueMatchesContextHtml_;
this.qaScope=x=>{ccLeagueMatchScope_=x};
this.qaGetScope=()=>ccLeagueMatchScope_;
`,matchContext);
test('all-three-team Manager match page starts on BEAC but can show ALL fixtures',()=>{
 const first=matchContext.qaPage();
 assert.equal((first.match(/data-league=/g)||[]).length,4,'Four league contexts remain available for BEAC teams');
 assert.ok(!first.includes('data-scope="all"'));
 assert.equal(matchContext.qaGetScope(),'beac');
 matchContext.qaScope('all');
 const second=matchContext.qaPage();
 assert.equal((second.match(/data-scope="all"/g)||[]).length,4);
 assert.equal(matchContext.qaGetScope(),'all','rerender must not reset the manually selected scope');
 matchContext.qaScope('beac');
 assert.equal((matchContext.qaPage().match(/data-scope="beac"/g)||[]).length,4);
});
test('match page never passes forcing onlyBeac:true to clickable filter panels',()=>{
 const segment=app.slice(mstart,mend);
 assert.ok(segment.includes('ccMrszLeagueFixturePanelHtml_(league)'));
 assert.ok(!segment.includes('{onlyBeac:true}'));
 assert.ok(!segment.includes('ccLeagueMatchScope_=\'beac\';'));
 assert.match(app,/ccLeagueMatchScope_=button\.dataset\.leagueMatchScope==='all'\?'all':'beac';\s*renderCompetitionMatchCards_\(\)/);
});


test('Manager official report keeps mobile close/header sticky and roster swipe-enabled',()=>{
 const css=fs.readFileSync('styles.css','utf8');
 assert.match(css,/#entityDialog\.cc-protocol-dialog \.entity-dialog-card>\.dialog-head\s*\{\s*position:sticky;/);
 assert.match(css,/#entityDialog\.cc-protocol-dialog \.cc-protocol-table-scroll\s*\{[\s\S]*?overflow-x:auto;/);
 assert.match(css,/#entityDialog\.cc-protocol-dialog \.cc-protocol-team table\s*\{min-width:370px\}/);
});
