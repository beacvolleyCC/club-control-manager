'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {audit,SAME_SEASON_MAP}=require('../scripts/history/audit-official-women1-snapshot.cjs');
const data=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/competition-history/women1_2025_26_official_league_snapshot.json'),'utf8'));
test('2025/26 official source includes all 132 match IDs, 129 scored games and exactly 3 scoreless fixtures',()=>{
 const r=audit(data);
 assert.equal(r.ok,true,JSON.stringify(r.errors));
 assert.equal(r.matchCount,132);
 assert.equal(r.scored,129);
 assert.deepEqual(r.scorelessCodes,['2830','4070','6161']);
 assert.equal(r.teams,12);
 assert.equal(r.rankLeader,'Budapesti Egyetemi Atlétikai Club');
 assert.equal(r.fullFixtureListAvailable,true);
 assert.equal(r.suitableForPlayerStrength,false);
});
test('standings and league source same-season abbreviations reproduce all 12 W/L and set totals',()=>{
 const r=audit(data);
 assert.equal(Object.keys(SAME_SEASON_MAP).length,12);
 assert.equal(r.sameSeasonTeamCrosscheck['Budapesti Egyetemi Atlétikai Club'].w,20);
 assert.equal(r.sameSeasonTeamCrosscheck['Budapesti Egyetemi Atlétikai Club'].l,2);
 assert.equal(r.sameSeasonTeamCrosscheck['Mozdulj'].played,20);
 assert.equal(r.sameSeasonTeamCrosscheck['EMERICUS SE'].played,20);
 assert.equal(r.sameSeasonTeamCrosscheck['Panoráma SE'].played,20);
});
test('bad result or wrong source codes fail closed',()=>{
 const x=structuredClone(data);
 x.matches[0].homeSets=1;
 x.matches[0].sourcePath=x.matches[0].sourcePath.replace('p_verseny_al_kod=93','p_verseny_al_kod=96');
 const r=audit(x);
 assert.equal(r.ok,false);
 assert.ok(r.errors.some(e=>e.includes('Broken official provenance')));
 assert.ok(r.errors.some(e=>e.includes('Invalid scored game')));
});
test('unscored fixtures are never silently scored',()=>{
 const x=structuredClone(data);
 const target=x.matches.find(m=>m.code==='6161');
 target.homeSets=3;target.awaySets=0;
 assert.equal(audit(x).ok,false);
});
test('first vs second squad aliases are not assumed across seasons',()=>{
 assert.equal(SAME_SEASON_MAP['BEAC'],'Budapesti Egyetemi Atlétikai Club');
 assert.equal(SAME_SEASON_MAP['RSZSE'],'Ráckeve');
 assert.equal(SAME_SEASON_MAP['KRE SC'],'Károli Gáspár Református Egyetem Sport Club');
 assert.equal(SAME_SEASON_MAP['MTK Budapest'],'MTK Budapest');
});
