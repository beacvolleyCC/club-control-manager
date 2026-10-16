'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const app=fs.readFileSync('app.js','utf8');
const cut=(a,b)=>{
 const start=app.indexOf(a),end=app.indexOf(b,start);
 assert.ok(start>=0&&end>start,'Cannot locate '+a);
 return app.slice(start,end);
};
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store={tables:[],matches:[],fixtures:[],loaded:true,error:null};
const context={text:x=>String(x??'').trim(),esc,num:x=>Number(x)||0,ccMrszPhotoState_:store,msLogoHtml_:()=>''};
vm.createContext(context);
const source=cut('  function ccSavedLeagueResults_(','  function ccSavedLeagueResultsHtml_(')
 +cut('  function ccMrszStatNumber_(','  // One source/coverage vocabulary')
 +cut('  function ccMrszCoverageLabel_(','  function ccMrszSavedResultsCrosscheckHtml_(')
 +cut('  function ccMrszSetScoreIssue_(','  function ccMatchScoreboardHtml_(')
 +cut('  function ccMrszNormPairName_(','  function ccMrszPhotoResultsByLeagueHtml_(');
vm.runInContext(source+'\nthis.auditModel=ccMrszAuditModel_;this.auditHtml=ccMrszAuditHtml_;',context);
const leagueA='Női Budapest II. osztály – B csoport',leagueB='Férfi Budapest I. osztály – B csoport';
const tableA={competitionLabel:leagueA,partial:false,rows:[
 {teamName:'MTK kék',played:1,wins:1,losses:0,setsFor:3,setsAgainst:1},
 {teamName:'RKSK felnőtt női',played:1,wins:0,losses:1,setsFor:0,setsAgainst:3}
]};
const game={competitionLabel:leagueA,startsAt:'2026-10-13T18:20:00+02:00',
 homeName:'MTK kék',awayName:'RKSK felnőtt női',homeSets:3,awaySets:0};
const run=(tables,matches,fixtures=[])=>{
 Object.assign(store,{tables,matches,fixtures,loaded:true,error:null});
 return context.auditModel();
};
const flatten=model=>model.groups.flatMap(x=>x.items.map(y=>({...y,league:x.league})));
test('An MRSZ result incompatible with full archived sets is included in a single league audit',()=>{
 const model=run([tableA],[game]);
 const issues=flatten(model);
 assert.equal(model.groups.length,1);
 assert.equal(issues.filter(x=>x.type==='Egyeztetés').length,1);
 assert.match(issues[0].reason,/Szettmérleg: tabella 3–1, mentett eredmények 3–0/);
 assert.equal(model.issues,1);
 assert.match(context.auditHtml(),/Adatellenőrzés/);
 assert.match(context.auditHtml(),/Bajnokság megnyitása/);
 assert.match(context.auditHtml(),/Mentett MRSZ-tabella/);
});
test('Team played/win/loss contradiction is reported as a standings issue',()=>{
 const changed={...tableA,rows:[{teamName:'MTK kék',played:4,wins:2,losses:1}]};
 const model=run([changed],[]);
 const items=flatten(model);
 assert.equal(items.length,1);
 assert.equal(items[0].type,'Tabella');
 assert.match(items[0].reason,/győzelem \+ vereség: 3/);
 assert.equal(items[0].name,'MTK kék');
});
test('Distinct conflicting saved scores are kept individually as review items without duplicate clones',()=>{
 const other={...game,homeSets:3,awaySets:1};
 const model=run([tableA],[game,{...game},other]);
 const items=flatten(model);
 const results=items.filter(x=>x.type==='Mérkőzés');
 assert.equal(results.length,2);
 assert.ok(results.every(x=>x.reason==='Eltérő mentett végeredmények'));
 assert.deepEqual(results.map(x=>x.score).sort(),['3–0','3–1']);
});
test('BRSZ self-fixtures and MRSZ source issues are grouped by competition across all leagues',()=>{
 const special={competitionLabel:leagueB,startsAt:'2026-10-25T19:30:00+01:00',homeName:'BEAC',awayName:'BEAC',
 homeSets:null,awaySets:null};
 const badSet={...game,homeSets:3,awaySets:1,setScores:[
  {home:25,away:17},{home:25,away:16},{home:25,away:15},{home:20,away:25}]};
 const model=run([tableA],[badSet],[special]);
 assert.equal(model.groups.length,2);
 assert.ok(flatten(model).some(x=>x.reason.includes('BEAC–BEAC')));
 assert.ok(flatten(model).some(x=>x.reason.includes('sorrendje')));
 assert.equal(model.groups.find(x=>x.league===leagueB).coverage,'Nincs mentett MRSZ-tabella · nem élő adat');
});
test('Partial or absent saved results are not falsely described as numeric inconsistencies',()=>{
 const partial={...tableA,partial:true};
 const model=run([partial],[game]);
 assert.equal(model.issues,0);
 const html=context.auditHtml();
 assert.ok(html.includes('nincs kimutatott ellentmondás'));
 assert.ok(html.includes('nem igazolja az adatok teljességét'));
 assert.ok(!html.includes('3–1, mentett eredmények 3–0'));
 const noSource=run([],[]);
 assert.equal(noSource.issues,0);
});
test('Source count shortfall or team identity mismatch does not create a false crosscheck mismatch',()=>{
 const rows=[{teamName:'MTK kék',played:2,wins:2,losses:0,setsFor:6,setsAgainst:2},{teamName:'RKSK felnőtt női',played:2,wins:0,losses:2,setsFor:0,setsAgainst:6}];
 assert.equal(run([{...tableA,rows}],[game]).issues,0);
 const unknown={...game,awayName:'Ismeretlen'};
 const model=run([tableA],[unknown]);
 assert.equal(flatten(model).filter(x=>x.type==='Mérkőzés').length,1);
 assert.equal(flatten(model).filter(x=>x.type==='Egyeztetés').length,0);
});
test('Review HTML escapes untrusted saved names, reasons and competition labels',()=>{
 const bad='<img src=x onerror=alert(1)>';
 run([tableA],[{...game,awayName:bad}]);
 const html=context.auditHtml();
 assert.ok(html.includes('&lt;img'));
 assert.ok(!html.includes('<img'));
 assert.ok(html.includes('data-cc-audit-league='));
});
test('Audit is view-only and the Meccsek route exposes tab switching and league navigation',()=>{
 const base=[{...game}],table={...tableA,rows:tableA.rows.map(r=>({...r}))};
 const before=JSON.stringify({base,table});
 run([table],base);
 context.auditHtml();
 assert.equal(JSON.stringify({base,table}),before);
 const matches=cut('  function renderCompetitionMatchCards_(','  function renderEventList(');
 assert.ok(matches.includes('data-cc-audit-view="audit"'));
 assert.ok(matches.includes("ccMatchesAuditOpen_?ccMrszAuditHtml_():''"));
 assert.ok(matches.includes("document.querySelectorAll('[data-cc-audit-league]')"));
 assert.ok(matches.includes("ccMatchesAuditOpen_=false;"));
 assert.ok(matches.includes('ccSetLeagueContext_(league)'));
});
test('When archived snapshot fails to load, the audit cannot claim clean results',()=>{
 Object.assign(store,{loaded:false,error:null,tables:[],matches:[],fixtures:[]});
 assert.ok(context.auditHtml().includes('betöltése'));
 Object.assign(store,{loaded:true,error:'Forrás nem érhető el'});
 assert.ok(context.auditHtml().includes('Forrás nem érhető el'));
});
