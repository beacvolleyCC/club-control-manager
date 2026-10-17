'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {compareOfficialMatchLists}=require('../scripts/history/compare-official-rosters.cjs');
const old=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/competition-history/women1_2025_26_official_m2446.json'),'utf8'));
const oldTeam='Budapesti Egyetemi Atlétikai Club';
const currentTeam='BEAC';
const current={teams:[{name:currentTeam,players:[
 {code:'27892',name:'Albert Anna'},{code:'31475',name:'Petri Zsófia'},
 {code:'32910',name:'Iglói Nóra'},{code:'37523',name:'Szalontai Rebeka'},
 {code:'42988',name:'Imre Eszter'},{code:'51046',name:'Kolba Kata'},
 {code:'54846',name:'Pásztor Dorina'},{code:'99991',name:'Teszt Új Játékos'}
]}]};

test('recorded 2025/26 official match has verified result and 21 unique player codes',()=>{
 assert.equal(old.schemaVersion,1);
 assert.equal(old.source,'official_mrsz');
 assert.equal(old.sourceMatchCode,'2446');
 assert.deepEqual(old.match.setScores,[[25,17],[25,21],[25,23]]);
 assert.equal(old.match.homeSets,3);
 assert.equal(old.match.awaySets,0);
 assert.deepEqual(old.teams.map(t=>t.players.length),[10,11]);
 assert.equal(new Set(old.teams.flatMap(t=>t.players.map(p=>p.code))).size,21);
});

test('seven 2025/26 MRSZ codes recur in selected 2026/27 saved match; not roster retention',()=>{
 const r=compareOfficialMatchLists(old,current,oldTeam,currentTeam);
 assert.equal(r.previousMatchNominations,10);
 assert.equal(r.currentMatchNominations,8);
 assert.deepEqual(r.verifiedCodeAndNameMatches.map(x=>x.code).sort(),
  ['27892','31475','32910','37523','42988','51046','54846']);
 assert.equal(r.previousSeasonRosterRetentionPercent,null);
 assert.equal(r.individualPlayingTimeVerified,false);
 assert.equal(r.strengthRatingAllowed,false);
});

test('same code and a different name requires human review',()=>{
 const input=structuredClone(current);
 input.teams[0].players[0].name='Another Player';
 const r=compareOfficialMatchLists(old,input,oldTeam,currentTeam);
 assert.equal(r.verifiedCodeAndNameMatches.length,6);
 assert.equal(r.codeNameConflicts.length,1);
});

test('duplicate or missing codes must not be linked',()=>{
 const input=structuredClone(current);
 input.teams[0].players[0].code='31475';
 assert.throws(()=>compareOfficialMatchLists(old,input,oldTeam,currentTeam),/duplicate/);
 const bad=structuredClone(current);
 bad.teams[0].players[0].code='';
 assert.throws(()=>compareOfficialMatchLists(old,bad,oldTeam,currentTeam),/Missing/);
});
