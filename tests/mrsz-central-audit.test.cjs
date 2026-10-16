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
vm.runInContext(source+'\nthis.auditModel=ccMrszAuditModel_;this.auditHtml=ccMrszAuditHtml_;this.auditFilter=ccMrszAuditFilterModel_;this.auditResults=ccMrszAuditResultsHtml_;this.auditCount=ccMrszAuditCountText_;this.selectAudit=(type,query,league="all")=>{ccMrszAuditType_=type;ccMrszAuditQuery_=query;ccMrszAuditLeague_=league;};',context);
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
 assert.deepEqual(Array.from(results,x=>x.score).sort(),['3–0','3–1']);
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
 assert.ok(matches.includes("$('#ccMrszAuditResults')?.addEventListener('click'"));
 assert.ok(matches.includes("$('#ccMrszAuditLeague')?.addEventListener('change'"));
 assert.ok(matches.includes("$('#ccMrszAuditType')?.addEventListener('change'"));
 assert.ok(matches.includes("$('#ccMrszAuditSearch')?.addEventListener('input'"));
 assert.ok(matches.includes("ccMatchesAuditOpen_=false;"));
 assert.ok(matches.includes('ccSetLeagueContext_(league)'));
});
test('When archived snapshot fails to load, the audit cannot claim clean results',()=>{
 Object.assign(store,{loaded:false,error:null,tables:[],matches:[],fixtures:[]});
 assert.ok(context.auditHtml().includes('betöltése'));
 Object.assign(store,{loaded:true,error:'Forrás nem érhető el'});
 assert.ok(context.auditHtml().includes('Forrás nem érhető el'));
});

test('Issue type filtering separates match, schedule, table and reconciliation findings',()=>{
 const all={groups:[
  {league:leagueA,coverage:'MRSZ mentett',items:[
   {type:'Mérkőzés',name:'MTK kék – RKSK',reason:'Eltérő végeredmények',date:'2026-10-13',score:'3–1'},
   {type:'Tabella',name:'Közgáz',reason:'M ≠ GY + V',date:'',score:''},
   {type:'Egyeztetés',name:'MTK kék',reason:'Szettmérleg nem egyezik',date:'',score:''}]},
  {league:leagueB,coverage:'BRSZ mentett',items:[
   {type:'Menetrend',name:'BEAC – BEAC',reason:'Nem megerősített menetrend',date:'',score:''},
   {type:'Mérkőzés',name:'BEAC – UTE Pink',reason:'Hibás játszmaeredmény',date:'2026-10-15',score:'3–0'}]}
 ],issues:5};
 for(const [type,number] of [['all',5],['Mérkőzés',2],['Menetrend',1],['Tabella',1],['Egyeztetés',1]]){
  const result=context.auditFilter(all,{type});
  assert.equal(result.issues,number,type);
  assert.equal(result.total,5);
  assert.ok(Array.from(result.groups,g=>g.items).flat().every(item=>type==='all'||item.type===type));
 }
 const other=context.auditFilter(all,{type:'invalid'});
 assert.equal(other.selected,'all');
 assert.equal(other.issues,5);
 assert.equal(all.groups[0].items.length,3,'stored audit model stays unchanged');
});
test('Search is case- and accent-insensitive and matches clubs, opponents, leagues and reasons',()=>{
 const model={groups:[{league:'Női Budapest II. osztály',coverage:'Mentett',items:[
  {type:'Mérkőzés',name:'Közgáz – UTE U-20 Pink',reason:'Érvénytelen játszmaeredmény',date:'2026-10-16',score:'3–0'},
  {type:'Tabella',name:'MTK kék',reason:'Győzelem + vereség eltér',date:'',score:''}]},
  {league:'Férfi Budapest I. osztály',coverage:'Mentett',items:[
  {type:'Menetrend',name:'BEAC – BEAC',reason:'Nem megerősített',date:'',score:''}]}],issues:3};
 const matches=context.auditFilter(model,{query:'KOZGAZ   uTe'});
 assert.equal(matches.issues,1);
 assert.equal(matches.groups[0].items[0].name,'Közgáz – UTE U-20 Pink');
 assert.equal(context.auditFilter(model,{query:'ERVENYTELEN'}).issues,1);
 assert.equal(context.auditFilter(model,{query:'ferfi budapest'}).issues,1);
 assert.equal(context.auditFilter(model,{query:'GYŐZELEM'}).issues,1);
 assert.equal(context.auditFilter(model,{type:'Tabella',query:'UTE'}).issues,0);
 assert.equal(context.auditFilter(model,{query:'does not exist'}).groups.length,0);
});
test('Filtered counts, empty states and escaped search input stay accurate',()=>{
 run([tableA],[game]);
 context.selectAudit('Egyeztetés','');
 let html=context.auditHtml();
 assert.ok(html.includes('1 / 1 ellenőrzendő bejegyzés'));
 assert.ok(html.includes('id="ccMrszAuditType"'));
 assert.ok(html.includes('id="ccMrszAuditSearch"'));
 assert.match(html, /<option value="Egyeztetés"\s+selected\s*>Számszaki eltérések<\/option>/);
 context.selectAudit('Mérkőzés','');
 html=context.auditHtml();
 assert.ok(html.includes('0 / 1 ellenőrzendő bejegyzés'));
 assert.ok(html.includes('Nincs találat a megadott szűrésre vagy keresésre'));
 assert.ok(!html.includes('Bajnokság megnyitása'));
 context.selectAudit('all','<img src=x>');
 html=context.auditHtml();
 assert.ok(html.includes('&lt;img src=x&gt;'));
 assert.ok(!html.includes('<img src=x>'));
 assert.ok(html.includes('0 / 1 ellenőrzendő bejegyzés'));
 context.selectAudit('all','');
 const full=context.auditHtml();
 assert.ok(full.includes('Bajnokság megnyitása'));
});
test('Search input updates only the list and count, preserving focus and controls',()=>{
 const render=cut('  function renderCompetitionMatchCards_(','  function renderEventList(');
 const refresh=cut('  function ccRefreshMrszAuditList_(','  function ccMrszPhotoResultsByLeagueHtml_(');
 assert.ok(render.includes('ccMrszAuditQuery_=event.target.value;'));
 assert.ok(render.includes("ccMrszAuditType_=text(event.target.value)||'all'"));
 assert.ok(refresh.includes('results.innerHTML=ccMrszAuditResultsHtml_(filtered)'));
 assert.ok(refresh.includes('count.textContent=ccMrszAuditCountText_(filtered)'));
 assert.ok(!refresh.includes('ccMrszAuditHtml_()'), 'do not rerender and blur the search input on each keystroke');
});

test('League selection combines with type and text search without mutating source data',()=>{
 const data={groups:[
  {league:leagueA,coverage:'Mentett',items:[
   {type:'Mérkőzés',name:'MTK – UTE Pink',reason:'Érvénytelen játszma',date:'2026-10-13',score:'3–1'},
   {type:'Tabella',name:'MTK',reason:'M ≠ GY + V',date:'',score:''}]},
  {league:leagueB,coverage:'Mentett',items:[
   {type:'Mérkőzés',name:'BEAC – UTE',reason:'Hibás játszma',date:'2026-10-16',score:'3–0'}]}
 ],issues:3};
 const before=JSON.stringify(data);
 const filtered=context.auditFilter(data,{league:leagueA,type:'Mérkőzés',query:'ute'});
 assert.equal(filtered.selectedLeague,leagueA);
 assert.equal(filtered.issues,1);
 assert.equal(filtered.total,3);
 assert.equal(filtered.groups[0].league,leagueA);
 assert.equal(filtered.groups[0].items[0].name,'MTK – UTE Pink');
 assert.equal(context.auditFilter(data,{league:leagueB,type:'Tabella'}).issues,0);
 assert.equal(context.auditFilter(data,{league:'nincs ilyen'}).issues,3);
 assert.equal(JSON.stringify(data),before);
});
test('League picker, direct issue navigation and return control preserve audit selections',()=>{
 run([tableA],[game]);
 context.selectAudit('Egyeztetés','MTK',leagueA);
 const html=context.auditHtml();
 assert.ok(html.includes('id="ccMrszAuditLeague"'));
 assert.ok(html.includes('<option value="'+leagueA+'" selected>'));
 assert.ok(html.includes('id="ccMrszAuditSearch" type="search" value="MTK"'));
 assert.ok(html.includes('cc-mrsz-audit-open'));
 assert.ok(html.includes('aria-label="Bajnokság megnyitása: MTK kék"'));
 const render=cut('  function renderCompetitionMatchCards_(','  function renderEventList(');
 assert.ok(render.includes('ccMrszAuditReturn_=true;'));
 assert.ok(render.includes('id="ccMrszAuditReturn"'));
 assert.ok(render.includes("$('#ccMrszAuditReturn')?.addEventListener('click'"));
 assert.ok(render.includes('ccMrszAuditReturn_=false;'));
 assert.ok(render.includes('ccLeagueCatalog_().some(group=>group.competitionLabel===league)'));
 assert.ok(render.includes('ccMrszAuditLeague_=text(event.target.value)'));
 assert.ok(render.includes('ccRefreshMrszAuditList_()'));
 assert.ok(html.includes('1 / 1 ellenőrzendő bejegyzés'));
});
test('Untrusted league names are escaped in the picker and item navigation',()=>{
 const malicious='<svg onload=alert(1)>';
 const g={groups:[{league:malicious,coverage:'Mentett',items:[
  {type:'Mérkőzés',name:malicious,reason:malicious,date:'',score:''}]}],issues:1};
 const html=context.auditResults(context.auditFilter(g,{league:malicious}));
 assert.ok(html.includes('&lt;svg'));
 assert.ok(!html.includes('<svg'));
 assert.ok(html.includes('data-cc-audit-league="&lt;svg'));
});
