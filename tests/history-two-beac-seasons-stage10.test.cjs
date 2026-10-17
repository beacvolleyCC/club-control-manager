'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {audit}=require('../scripts/history/audit-two-beac-seasons-stage10.cjs');
const l=n=>JSON.parse(fs.readFileSync(path.join(__dirname,'../data/competition-history/'+n),'utf8'));
const input=[
 'women1_2024_25_official_league_snapshot.json',
 'women1_2024_25_beac_protocols_stage10.json',
 'women1_2025_26_official_league_snapshot.json',
 'women1_2025_26_beac_roster_pilot.json',
 'women1_2025_26_beac_remaining_protocols.json',
 'women1_2025_26_recovered_protocols_stage10.json',
 'women1_2025_26_opponent_protocols.json'
].map(l);
test('both years official BEAC MRSZ nomination lists are validated by source IDs',()=>{
 const a=audit(...input);
 assert.equal(a.ok,true,JSON.stringify(a.errors));
 assert.equal(a.oldBeacMatchSheets,24);
 assert.equal(a.oldBeacOfficialPlayerCodes,16);
 assert.equal(a.oldBeacNominations,280);
 assert.equal(a.newBeacMatchSheets,22);
 assert.equal(a.newBeacOfficialPlayerCodes,15);
 assert.equal(a.newBeacNominations,225);
 assert.equal(a.crossSeasonCodeMatches,5);
 assert.equal(a.observedDistinctBeacCodesAcrossBothSeasons,26);
});
test('restored league has 128 of 129 result-bearing matches with source-linked player lists',()=>{
 const a=audit(...input);
 assert.equal(a.womanI2025VerifiedRosterBearingFixtures,128);
 assert.equal(a.womanI2025WithScoredResults,129);
 assert.deepEqual(a.womanI2025MissingRosterCodes,['4071']);
 assert.equal(a.rosterRetentionPercentage,null);
 assert.equal(a.individualStrengthRating,null);
 assert.equal(a.individualPlayedSetsVerified,false);
});
test('cross-season identity is based on official code and unambiguous name',()=>{
 const a=audit(...input);
 assert.deepEqual(a.crossSeasonPlayers.map(p=>p.code),['21243','23656','27101','32910','37523']);
 assert.ok(a.crossSeasonPlayers.every(x=>x.crossSeasonIdentity==='same_official_mrsz_code_and_name'));
});
test('tampering MRSZ season source or identity fails closed',()=>{
 const x=structuredClone(input);
 x[1].results[0].officialListHomeSets=9;
 assert.equal(audit(...x).ok,false);
 const y=structuredClone(input);
 y[5].results.find(x=>x.code==='4071').twoCompleteRostersById=true;
 assert.equal(audit(...y).ok,false);
 const z=structuredClone(input);
 z[1].results[0].rosterTeams.find(x=>x.name==='BEAC').players[0].code='bad';
 assert.equal(audit(...z).ok,false);
});
