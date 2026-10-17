'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const app=fs.readFileSync('app.js','utf8');
const start=app.indexOf('  function ccMrszNormPairName_(');
const end=app.indexOf('  function ccMrszPhotoResultsByLeagueHtml_(',start);
assert.ok(start>0&&end>start);
const league='Női Budapest II. osztály – B csoport';
const result={competitionLabel:league,startsAt:'2026-10-13T18:20:00+02:00',homeName:'MTK Budapest kék',awayName:'RKSK felnőtt női',homeSets:3,awaySets:0};
const fullTable={competitionLabel:league,partial:false,rows:[{teamName:'MTK kék'},{teamName:'RKSK felnőtt női'}]};
const text=x=>String(x??'');
const esc=x=>text(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const data={fixtures:[],matches:[],tables:[]};
const context={text,esc,num:x=>Number(x)||0,msLogoHtml_:()=>'',ccMrszPhotoState_:data};
vm.createContext(context);
vm.runInContext(app.slice(start,end)+'\nthis.qa={html:ccMrszLeagueFixturePanelHtml_,scope:x=>{ccLeagueMatchScope_=x}};',context);
const display=(matches,tables,fixtures=[])=>{
 data.matches=matches;data.tables=tables;data.fixtures=fixtures;context.qa.scope('all');
 return context.qa.html(league);
};
test('Complete table and unique identities keep verified saved result in regular league list',()=>{
 const html=display([result],[fullTable]);
 assert.ok(html.includes('cc-match-scoreboard'));
 assert.ok(html.includes('3–0'));
 assert.ok(!html.includes('ellenőrzendő rekord'));
});
test('Saved result with no matching team is disclosed separately, not in the verified list',()=>{
 const html=display([{...result,awayName:'Nem ismert csapat'}],[fullTable]);
 assert.ok(html.includes('1 ellenőrzendő rekord'));
 assert.ok(html.includes('A csapat nem szerepel a mentett tabellában'));
 assert.ok(html.includes('0 / 0 meccs'));
 assert.ok(!html.includes('cc-match-scoreboard'));
});
test('Incomplete, impossible or self-opponent saved scores are reviewed, never displayed as final',()=>{
 for(const change of [{homeSets:0,awaySets:0},{homeSets:3,awaySets:null},{homeSets:3,awaySets:3},{homeName:'RKSK felnőtt női'}]){
  const html=display([{...result,...change}],[fullTable]);
  assert.ok(html.includes('1 ellenőrzendő rekord'));
  assert.ok(!html.includes('cc-match-scoreboard'));
 }
});
test('Two conflicting saved outcomes are preserved individually for Manager review',()=>{
 const html=display([result,{...result,homeSets:3,awaySets:1}],[fullTable]);
 assert.ok(html.includes('2 ellenőrzendő rekord'),html);
 assert.ok(html.includes('Eltérő mentett végeredmények'));
 assert.ok(html.includes('3–0'));
 assert.ok(html.includes('3–1'));
 assert.ok(!html.includes('cc-match-scoreboard'));
});
test('Unknown league table does not hide otherwise valid saved MRSZ results',()=>{
 const html=display([result],[]);
 assert.ok(html.includes('cc-match-scoreboard'));
 assert.ok(!html.includes('Nincs teljes mentett tabella'),'source explanation stays in Adatellenőrzés');
 assert.ok(html.includes('teljes tabella nélkül'));
 assert.ok(!html.includes('1 ellenőrzendő rekord'));
});
test('Incomplete league table is not used to falsely reject a saved opponent',()=>{
 const html=display([result],[{...fullTable,partial:true,rows:[{teamName:'MTK kék'}]}]);
 assert.ok(html.includes('cc-match-scoreboard'));
 assert.ok(!html.includes('Nincs teljes mentett tabella'),'source explanation stays in Adatellenőrzés');
 assert.ok(!html.includes('A csapat nem szerepel a mentett tabellában'));
});
test('Review rows escape untrusted team names',()=>{
 const html=display([{...result,awayName:'<img src=x onerror=alert(1)>'}],[fullTable]);
 assert.ok(html.includes('&lt;img'));
 assert.ok(!html.includes('<img'));
});
test('Review scope is restricted to the selected league and leaves source records untouched',()=>{
 const original={...result};
 const html=display([result,{...result,competitionLabel:'Másik liga',awayName:'Másik csapat',homeSets:0,awaySets:0}],[fullTable]);
 assert.ok(!html.includes('Másik csapat'));
 assert.deepEqual(result,original);
});
const modelStart=app.indexOf('  function ccSavedLeagueResults_('),modelEnd=app.indexOf('  function ccSavedLeagueResultsHtml_(',modelStart);
const normStart=app.indexOf('  function ccMrszNormPairName_('),normEnd=app.indexOf('  function ccMrszLocalKickoff_(',normStart);
const norm=new Function('text',app.slice(normStart,normEnd)+';return ccMrszNormPairName_;')(text);
const setIssue=new Function('text',app.slice(app.indexOf('  function ccMrszSetScoreIssue_('),app.indexOf('  function ccMatchScoreboardHtml_('))+';return ccMrszSetScoreIssue_;')(text);
const derive=new Function('text','ccMrszNormPairName_','ccMrszSetScoreIssue_',app.slice(modelStart,modelEnd)+';return ccSavedLeagueResults_;')(text,norm,setIssue);
test('Stored result never enters selected-team statistics when opponent is missing or ambiguous in league table',()=>{
 const team={teamName:'MTK kék'},opponent={teamName:'RKSK felnőtt női'};
 assert.equal(derive(team,league,[result],[team,opponent]).length,1);
 assert.equal(derive(team,league,[result],[team]).length,0);
 assert.equal(derive(team,league,[result],[team,opponent,{teamName:'RKSK felnőtt női'}]).length,0);
});
test('Contradictory results with different timezone timestamp spellings cannot enter statistics',()=>{
 const team={teamName:'MTK kék'},opponent={teamName:'RKSK felnőtt női'};
 const conflict={...result,startsAt:'2026-10-13T16:20:00Z',homeSets:3,awaySets:1};
 assert.equal(derive(team,league,[result,conflict],[team,opponent]).length,0);
});


test('Contradictory full set-point list is moved to review, without changing saved final score',()=>{
 const invalid={...result,homeSets:3,awaySets:1,setScores:[
  {home:25,away:18},{home:25,away:19},{home:25,away:21},{home:20,away:25}]};
 const html=display([invalid],[fullTable]);
 assert.ok(html.includes('1 ellenőrzendő rekord'));
 assert.ok(html.includes('Szettadat ellenőrzendő'));
 assert.ok(html.includes('sorrendje'));
 assert.ok(!html.includes('cc-match-scoreboard'));
 assert.equal(invalid.homeSets,3);
 assert.equal(invalid.setScores.length,4);
});
test('Partial saved set-point snapshots remain visible without inventing missing sets',()=>{
 const partial={...result,homeSets:3,awaySets:0,setScores:[{home:25,away:18}]};
 const html=display([partial],[fullTable]);
 assert.ok(html.includes('cc-match-scoreboard'));
 assert.ok(html.includes('25:18'));
 assert.ok(!html.includes('ellenőrzendő rekord'));
});

test('Review panel keeps explicit set coverage for non-set-related issues',()=>{
 const invalidOpponent={...result,awayName:'Nem ismert csapat',setScores:[
  {home:25,away:18},{home:25,away:19},{home:25,away:21}
 ]};
 const html=display([invalidOpponent],[fullTable]);
 assert.ok(html.includes('A csapat nem szerepel a mentett tabellában'));
 assert.ok(html.includes('3/3 szett'));
 assert.ok(html.includes('1 ellenőrzendő rekord'));
 assert.ok(!html.includes('cc-match-scoreboard'));
});
