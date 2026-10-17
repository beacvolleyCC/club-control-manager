'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {audit}=require('../scripts/history/audit-beac-full-season-rosters.cjs');
const load=name=>JSON.parse(fs.readFileSync(path.join(__dirname,'../data/competition-history/'+name),'utf8'));
const league=load('women1_2025_26_official_league_snapshot.json');
const pilot=load('women1_2025_26_beac_roster_pilot.json');
const rest=load('women1_2025_26_beac_remaining_protocols.json');
test('full BEAC season has 22 official results and 21 official player ID lists',()=>{
 const a=audit(league,pilot,rest);
 assert.equal(a.ok,true,JSON.stringify(a.errors));
 assert.equal(a.fixtures,22);
 assert.equal(a.checkedProtocols,22);
 assert.equal(a.withPlayerRows,21);
 assert.deepEqual(a.withoutPlayerRows,['7803']);
 assert.equal(a.uniquePlayerCodes,15);
 assert.equal(a.totalMatchNominations,213);
});
test('individual totals count nominations not actual court time or played sets',()=>{
 const a=audit(league,pilot,rest);
 assert.equal(a.players.length,15);
 assert.equal(a.players.reduce((s,p)=>s+p.nominatedMatches,0),213);
 for(const p of a.players){
   assert.equal(p.confirmedPlayedSets,null);
   assert.equal(p.minutesPlayed,null);
   assert.equal(p.strengthRating,null);
 }
 assert.equal(a.fullSeasonRegistrationVerified,false);
 assert.equal(a.individualCourtTimeVerified,false);
 assert.equal(a.strengthRatingsEnabled,false);
});
test('same player ID with conflicting name rejects the aggregate',()=>{
 const x=structuredClone(rest);
 const p=x.results.find(m=>m.officialBeacRosterVerified&&m.beacPlayers.length);
 p.beacPlayers[0].name='Teljesen Más Nevű';
 assert.equal(audit(league,pilot,x).ok,false);
});
test('duplicate match or wrongly accepted empty score sheet rejects aggregate',()=>{
 const x=structuredClone(rest);
 x.results[0].matchCode=pilot.results[0].matchCode;
 assert.equal(audit(league,pilot,x).ok,false);
 const y=structuredClone(rest);
 y.results.find(m=>m.matchCode==='7803').officialBeacRosterVerified=true;
 assert.equal(audit(league,pilot,y).ok,false);
});
