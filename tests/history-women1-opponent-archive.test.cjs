'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {audit}=require('../scripts/history/validate-women1-opponent-archive.cjs');
const l=name=>JSON.parse(fs.readFileSync(path.join(__dirname,'../data/competition-history/'+name),'utf8'));
const league=l('women1_2025_26_official_league_snapshot.json');
const opponents=l('women1_2025_26_opponent_protocols.json');
const beacPilot=l('women1_2025_26_beac_roster_pilot.json');
const beacRemaining=l('women1_2025_26_beac_remaining_protocols.json');

test('official 2025/26 women I results and source-linked roster lists cross-check to 129 fixtures',()=>{
 const r=audit(league,opponents,beacPilot,beacRemaining);
 assert.equal(r.ok,true,JSON.stringify(r.errors));
 assert.equal(r.fixturesWithOfficialResults,129);
 assert.equal(r.opponentsChecked,107);
 assert.equal(r.opponentOfficialProtocolScores,104);
 assert.equal(r.opponentsFullRosters,100);
 assert.equal(r.officialBeacMatches,22);
 assert.equal(r.beacMatchSheetsWithRoster,21);
 assert.equal(r.matchesWithSomeVerifiedRoster,121);
 assert.equal(r.leagueMatchesWithoutVerifiedRoster,8);
});

test('player IDs are evidence of nomination, not on-court skill or full season registration',()=>{
 const r=audit(league,opponents,beacPilot,beacRemaining);
 assert.equal(r.opponentPlayerCodesObserved,166);
 assert.equal(r.beacPlayerCodesObserved,15);
 assert.equal(r.officialPlayerCodesObserved,181);
 assert.equal(r.officialNominationEntriesObserved,2098);
 assert.deepEqual(r.beacAndOpponentCodeOverlap,[]);
 assert.equal(r.completenessIsOfficialSeasonRegistration,false);
 assert.equal(r.participationIsActualCourtTime,false);
 assert.equal(r.publishedStrengthRatingAllowed,false);
 assert.equal(r.modelCalibrationAllowed,false);
});

test('seven exception sheets cannot be treated as full verified two-team rosters',()=>{
 const r=audit(league,opponents,beacPilot,beacRemaining);
 assert.equal(r.opponentMissingRosters.length,7);
 assert.deepEqual(r.opponentMissingRosters.map(x=>x.code).sort(),
   ['2443','2667','3053','4071','7354','7777','7822']);
 assert.equal(r.beacMatchWithoutRoster,'7803');
});

test('tampering with a player identity, source URL or score fails closed',()=>{
 const x=structuredClone(opponents);
 const m=x.results.find(y=>y.officialFullMatchRosterVerified);
 m.rosterTeams[0].players[0].code='not-a-code';
 assert.equal(audit(league,x,beacPilot,beacRemaining).ok,false);
 const y=structuredClone(opponents);
 y.results[0].officialSource=y.results[0].officialSource.replace('p_evad_kod=2025','p_evad_kod=2024');
 assert.equal(audit(league,y,beacPilot,beacRemaining).ok,false);
 const z=structuredClone(opponents);
 z.results[0].homeSets=9;
 assert.equal(audit(league,z,beacPilot,beacRemaining).ok,false);
});
