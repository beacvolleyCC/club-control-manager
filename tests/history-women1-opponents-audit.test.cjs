'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {selectOpponents,choosePilot,checkSource,audit}=require('../scripts/history/audit-women1-opponents.cjs');
const full=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/competition-history/women1_2025_26_official_league_snapshot.json'),'utf8'));

test('audit scope exactly 107 official non-BEAC results and covers 11 other teams',()=>{
 const selected=selectOpponents(full),pilot=choosePilot(selected);
 assert.equal(selected.length,107);
 assert.equal(new Set(selected.map(m=>m.code)).size,107);
 assert.equal(new Set(selected.flatMap(m=>[m.home,m.away])).size,11);
 assert.equal(pilot.length,6);
 assert.equal(new Set(pilot.flatMap(m=>[m.home,m.away])).size,11);
 assert.ok(selected.every(m=>m.home!=='BEAC'&&m.away!=='BEAC'));
 assert.ok(selected.every(m=>m.url.includes('p_verseny_al_kod=93')&&m.url.includes('p_evad_kod=2025')));
});
test('tampered source URL and wrong season are not retrieved',()=>{
 const x=structuredClone(full);
 x.matches.find(m=>m.code==='2424').sourcePath='/pr_a/010/009/p_009.asp?p_merkozes_kod=2424&p_evad_kod=2024&p_verseny_al_kod=93';
 assert.throws(()=>selectOpponents(x),/Untrusted/);
 const y=structuredClone(full);y.sourceSeason='2024/25';
 assert.throws(()=>selectOpponents(y),/Unverified/);
});
test('both exact official team identities and a valid result are mandatory for roster acceptance',()=>{
 const m=selectOpponents(full).find(x=>x.home==='Közgáz SC'&&x.away==='KRE SC');
 const p={status:'verified_official_score',date:m.date,home:'Közgáz női',away:'Károli Gáspár Református Egyetem Sport Club',
  homeSets:m.homeSets,awaySets:m.awaySets,validRosterRows:2,teams:[
   {name:'Közgáz női',players:[{code:'27109',name:'TEST ANNA',designation:'K',shirt:2}]},
   {name:'Károli Gáspár Református Egyetem Sport Club',players:[{code:'39289',name:'TEST ZSÓFIA',designation:'K',shirt:4}]}
  ]};
 assert.equal(checkSource(m,p,200).officialFullMatchRosterVerified,true);
 assert.equal(checkSource(m,{...p,away:'KRE SC'},200).officialFullMatchRosterVerified,false);
 assert.equal(checkSource(m,{...p,awaySets:3},200).officialFullMatchRosterVerified,false);
 assert.equal(checkSource(m,{...p,date:'2026-10-10'},200).officialFullMatchRosterVerified,false);
 assert.equal(checkSource(m,{...p,teams:[p.teams[0],{name:p.away,players:[]}]},200).officialFullMatchRosterVerified,false);
});
test('empty sheets and HTTP failures are separately retained as missing, never made-up players',()=>{
 const m=selectOpponents(full)[0];
 const empty=checkSource(m,{status:'empty_official_sheet'},200);
 assert.equal(empty.officialFullMatchRosterVerified,false);
 assert.deepEqual(empty.rosterTeams,[]);
 const forbidden=checkSource(m,null,403);
 const result=audit([empty,forbidden]);
 assert.equal(result.incompleteProtocols.length,2);
 assert.equal(result.officialFullRosters,0);
 assert.equal(result.eligibleForIndividualRating,false);
 assert.equal(result.eligibleForTeamRating,false);
});
test('same federation player code assigned to conflicting names is flagged within a team',()=>{
 const m=selectOpponents(full)[0];
 const copy=code=>({code,date:m.date,officialFullMatchRosterVerified:true,officialScoreVerified:true,rosterTeams:[
  {officialName:'Közgáz női',players:[{code:'27892',name:code==='A'?'KISS ANNA':'NAGY ANNA'}]}
 ]});
 const r=audit([copy('A'),copy('B')]);
 assert.equal(r.nameIdentityConflicts.length,1);
});
