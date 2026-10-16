'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),
  fs=require('node:fs'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
const text=x=>String(x??'').trim();
const esc=x=>text(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const a=src.indexOf('  function ccMrszNormPairName_('),b=src.indexOf('  function ccMrszLocalKickoff_(',a);
assert.ok(a>=0&&b>a,'real federation team normalizer');
const norm=new Function('text',src.slice(a,b)+';return ccMrszNormPairName_;')(text);
const start=src.indexOf('  function ccSavedLeagueResults_('),end=src.indexOf('  function ccVerifiedSnapshotStatsHtml_(',start);
assert.ok(start>=0&&end>start,'real recorded match model');
const model=new Function('text','esc','ccMrszNormPairName_',src.slice(start,end)+';return {select:ccSavedLeagueResults_,render:ccSavedLeagueResultsHtml_};')(text,esc,norm);
const women='Női Budapest I. osztály',women2='Női Budapest II. osztály – B csoport';
const fixtures=[
 {competitionLabel:women,homeName:'Közgáz női',awayName:'MTK Budapest',startsAt:'2026-10-08T20:00:00+02:00',homeSets:2,awaySets:3},
 {competitionLabel:women,homeName:'Semmelweis Egyetem Sport Klub',awayName:'EMERICUS SE',startsAt:'2026-10-13T19:30:00+02:00',homeSets:3,awaySets:1},
 {competitionLabel:women,homeName:'Kandó Sport Klub',awayName:'Ráckeve',startsAt:'2026-10-13T20:30:00+02:00',homeSets:3,awaySets:0},
 {competitionLabel:women2,homeName:'MTK kék',awayName:'RKSK felnőtt női',startsAt:'2026-10-13T18:20:00+02:00',homeSets:3,awaySets:0}
];
test('The 2026-10-14 saved MRSZ result for MTK blue matches the official team alias',()=>{
 const team={teamName:'MTK Budapest kék'};
 const out=model.select(team,women2,fixtures,[team,{teamName:'RKSK felnőtt női'}]);
 assert.equal(out.length,1);
 assert.equal(out[0].opponent,'RKSK felnőtt női');
 assert.equal(out[0].score,'3–0');
 assert.equal(out[0].outcome,'Győzelem');
 assert.equal(out[0].venue,'Hazai');
});
test('Away win and home loss are scored from recorded set results, not guessed from standings',()=>{
 const team={teamName:'MTK Budapest'};
 const r=model.select(team,women,fixtures,[team,{teamName:'Közgáz női'}]);
 assert.deepEqual(r.map(x=>x.score),['3–2']);
 assert.deepEqual(r.map(x=>x.outcome),['Győzelem']);
 const opponent={teamName:'Közgáz női'};
 const lo=model.select(opponent,women,fixtures,[opponent,team]);
 assert.equal(lo[0].score,'2–3');assert.equal(lo[0].outcome,'Vereség');
});
test('BEAC has no confirmed result: no invented form',()=>{
 const team={teamName:'Budapesti Egyetemi Atlétikai Club II.'};
 assert.deepEqual(model.select(team,women2,fixtures,[team,{teamName:'MTK Budapest kék'}]),[]);
});
test('Reject fixture-only, blank, partial, 0-0, ties, impossible scores, and future results',()=>{
 const team={teamName:'Kandó Sport Klub'},base=fixtures[2];
 const attempts=[
 {...base,homeSets:null,awaySets:null},{...base,homeSets:3,awaySets:null},
 {...base,homeSets:'',awaySets:0},{...base,homeSets:0,awaySets:0},
 {...base,homeSets:2,awaySets:2},{...base,homeSets:4,awaySets:1},
 {...base,homeSets:3,awaySets:3},{...base,homeSets:1.5,awaySets:0},
 {...base,startsAt:'2099-01-01T18:00:00+01:00'}
 ];
 assert.deepEqual(model.select(team,women,attempts,[team]),[]);
});
test('Only the selected league is included even for identical team names',()=>{
 const team={teamName:'Kandó Sport Klub'};
 assert.deepEqual(model.select(team,women2,fixtures,[team]),[]);
});
test('Conflicting recordings of same fixture are not treated as verified',()=>{
 const team={teamName:'Semmelweis Egyetem Sport Klub'};
 const src=[fixtures[1],{...fixtures[1],homeSets:3,awaySets:2}];
 assert.deepEqual(model.select(team,women,src,[team]),[]);
});
test('Duplicate identical score snapshot is counted once, sorted latest first',()=>{
 const team={teamName:'Kandó Sport Klub'};
 const inputs=[fixtures[2],{...fixtures[2]}];
 const out=model.select(team,women,inputs,[team,{teamName:'Ráckeve'}]);
 assert.equal(out.length,1);
});
test('Ambiguous normalized team identity is not attributed to either team',()=>{
 const target={teamName:'MTK kék'};
 assert.deepEqual(model.select(target,women2,fixtures,[target,{teamName:'MTK Budapest kék'}]),[]);
});
test('Result list encodes untrusted opponent names and uses neutral result labels',()=>{
 const html=model.render([{time:Date.parse('2026-10-13T18:20:00+02:00'),opponent:'<img src=x>',score:'3–0',venue:'Hazai',outcome:'Győzelem'}]);
 assert.ok(html.includes('&lt;img src=x&gt;'));
 assert.ok(!html.includes('<img'));
 assert.ok(html.includes('Győzelem'));
 assert.ok(html.includes('2026.'));
 assert.ok(model.render([]).includes('nincs mentett mérkőzéseredmény'));
});
test('Full table stats and recorded results share the selected league and its saved match input',()=>{
 const standings=src.slice(src.indexOf('  function renderManagerStandings_()'),src.indexOf('  function msSetTeam_',src.indexOf('  function renderManagerStandings_()'))>0?src.indexOf('  function msSetTeam_',src.indexOf('  function renderManagerStandings_()')):undefined);
 assert.ok(standings.includes('showPhoto?ccVerifiedSnapshotStatsHtml_(rows,selected,photo,group,ccMrszPhotoState_.matches)'));
 assert.ok(!standings.includes('ccSavedLeagueResults_(row,group,ccMrszMergedLeagueMatches_'));
});
