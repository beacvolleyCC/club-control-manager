'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {selectBeacPilot,classify}=require('../scripts/history/probe-women1-beac-protocols.cjs');
const snap=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/competition-history/women1_2025_26_official_league_snapshot.json'),'utf8'));
test('pilot is sampled from exactly five explicit 2025/26 BEAC match IDs',()=>{
 const matches=selectBeacPilot(snap);
 assert.deepEqual(matches.map(m=>m.code),['2446','3290','6083','7756','8851']);
 assert.ok(matches.every(m=>m.url.startsWith('https://www.hunvolley.info/pr_a/010/009/p_009.asp?')));
});
test('wrong season and fabricated match codes are rejected',()=>{
 const x=structuredClone(snap);x.sourceSeason='2024/25';
 assert.throws(()=>selectBeacPilot(x));
 const bad=structuredClone(snap);bad.matches.find(x=>x.code==='2446').sourcePath='/pr_a/010/009/p_009.asp?p_evad_kod=2025&p_merkozes_kod=1&p_verseny_al_kod=93';
 assert.throws(()=>selectBeacPilot(bad));
});
test('a blank or unviewable match never becomes verified player participation',()=>{
 const m=selectBeacPilot(snap)[0];
 const x=classify(m,403,null);
 assert.equal(x.beacPlayerCount,0);
 assert.equal(x.resultMatchesIndex,false);
 assert.equal(x.totalOfficialPlayerRows,0);
});
