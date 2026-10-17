'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {selectRemaining,assess,summary}=require('../scripts/history/fetch-women1-beac-remaining.cjs');
const snapshot=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/competition-history/women1_2025_26_official_league_snapshot.json'),'utf8'));
test('only 17 remaining known official match codes are selected',()=>{
 const all=selectRemaining(snapshot);
 const pilot=new Set(['2446','3290','6083','7756','8851']);
 assert.equal(all.length,17);
 assert.ok(all.every(m=>!pilot.has(m.code)));
 assert.equal(new Set(all.map(m=>m.code)).size,17);
 assert.ok(all.every(m=>new URL(m.url).hostname==='www.hunvolley.info'));
});
test('tampered match source URL and missing match rows fail closed',()=>{
 const a=structuredClone(snapshot);
 a.matches.find(x=>x.code==='2809').sourcePath='/pr_a/010/009/p_009.asp?p_evad_kod=2025&p_merkozes_kod=9&p_verseny_al_kod=93';
 assert.throws(()=>selectRemaining(a),/Invalid source/);
 const b=structuredClone(snapshot);
 b.matches=b.matches.filter(x=>x.code!=='2809');
 assert.throws(()=>selectRemaining(b),/Expected 22/);
});
test('only matching official scores, season dates and BEAC team sides allow a candidate roster',()=>{
 const m=selectRemaining(snapshot).find(x=>x.home==='BEAC');
 const actual={status:'verified_official_score',date:m.date,home:'Budapesti Egyetemi Atlétikai Club',away:'Opponent',
  homeSets:m.homeSets,awaySets:m.awaySets,validRosterRows:2,
  teams:[{name:'Budapesti Egyetemi Atlétikai Club',players:[{code:'27892',name:'ALBERT ANNA',designation:'K'}]},{name:'Opponent',players:[{code:'98821',name:'TEST ZITA',designation:'CS'}]}]};
 const ok=assess(m,actual);
 assert.equal(ok.officialRosterAccepted,true);
 assert.equal(ok.beacPlayers.length,1);
 assert.equal(ok.beacPlayers[0].code,'27892');
 assert.equal(assess(m,{...actual,date:'2020-10-10'}).officialRosterAccepted,false);
 assert.equal(assess(m,{...actual,homeSets:0,awaySets:3}).officialRosterAccepted,false);
 assert.equal(assess(m,{...actual,teams:[{name:'BEAC II.',players:actual.teams[0].players},actual.teams[1]]}).officialRosterAccepted,false);
 assert.equal(assess(m,{...actual,teams:[{name:actual.home,players:[actual.teams[0].players[0],actual.teams[0].players[0]]},actual.teams[1]]}).officialRosterAccepted,false);
});
test('failed downloads and missing rosters never produce a season retention percentage',()=>{
 const m=selectRemaining(snapshot)[0];
 const rejected=assess(m,{status:'fetch_failed'});
 assert.equal(rejected.officialRosterAccepted,false);
 assert.equal(rejected.beacPlayers.length,0);
 const rpt=summary([rejected]);
 assert.equal(rpt.acceptedProtocols,0);
 assert.equal(rpt.suitableForIndividualStrength,false);
 assert.equal(rpt.playedSetsVerified,false);
 assert.equal(rpt.fullSeasonRegistrationListVerified,false);
});
