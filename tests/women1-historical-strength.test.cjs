const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {buildAll,season,SOURCES}=require('../scripts/history/build-women1-elo.cjs');
const repo=path.resolve(__dirname,'..');
test('two seasons reproduce official MRSZ standings and 284 scored matches',()=>{
 const data=buildAll();
 assert.equal(data.seasons['2024/25'].officialRecordedMatches,155);
 assert.equal(data.seasons['2025/26'].officialRecordedMatches,129);
 assert.equal(data.seasons['2024/25'].teamCount,13);
 assert.equal(data.seasons['2025/26'].teamCount,12);
});
test('season-specific Elo must remain explicitly non-official and non-predictive',()=>{
 const data=buildAll();
 assert.equal(data.officialRanking,false);
 assert.equal(data.currentSeasonStrength,false);
 assert.equal(data.predictiveCalibration,false);
 assert.equal(data.initialRating,1500);
 assert.equal(data.kFactor,24);
});
test('every result is independently reproducible from checked-in official MRSZ data',()=>{
 const generated=buildAll();
 const committed=JSON.parse(fs.readFileSync(path.join(repo,'data/competition-strength/women1_2024_2026_elo_experimental.json'),'utf8'));
 assert.deepEqual(generated,committed);
});
test('altered result data fails official standings integrity validation',()=>{
 const original=JSON.parse(fs.readFileSync(path.join(repo,SOURCES[1].file),'utf8'));
 const game=original.matches.find(m=>m.status==='scored');
 game.homeSets=game.homeSets===3?0:3;
 assert.throws(()=>season(original,SOURCES[1]),/Official standings mismatch|Invalid set score/);
});
