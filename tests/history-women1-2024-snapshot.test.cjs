'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {audit}=require('../scripts/history/audit-women1-2024-snapshot.cjs');
const d=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/competition-history/women1_2024_25_official_league_snapshot.json'),'utf8'));
test('official 2024/25 women I league 13 teams and 155 results reconcile to the standings',()=>{
 const a=audit(d);
 assert.equal(a.ok,true,JSON.stringify(a.errors));
 assert.equal(a.teams,13);
 assert.equal(a.indexMatchCodes,157);
 assert.equal(a.uniqueHomeAwayPairings,156);
 assert.equal(a.scoredMatches,155);
 assert.deepEqual(a.unscoredCodes.sort(),['2782','9925']);
 assert.equal(a.beacPlace,5);
 assert.deepEqual(a.beac.played,24);
 assert.deepEqual(a.beac.wins,13);
 assert.deepEqual(a.beac.losses,11);
 assert.equal(a.allStandingsRowsReconciled,true);
});
test('repeated DKLSN–Mozdulj unscored entry is not a second played match',()=>{
 const a=audit(d);
 assert.deepEqual(a.repeatedPairing,[{pair:'DKLSN::Mozdulj',codes:['2250','2782']}]);
 assert.equal(a.officialPlayerCodesCovered,0);
 assert.equal(a.publishRatings,false);
});
test('score manipulation or source season tampering fails closed',()=>{
 const x=structuredClone(d);
 x.matches.find(m=>m.code==='2250').awaySets=2;
 assert.equal(audit(x).ok,false);
 const y=structuredClone(d);
 y.matches[0].sourcePath=y.matches[0].sourcePath.replace('p_evad_kod=2024','p_evad_kod=2025');
 assert.equal(audit(y).ok,false);
});
