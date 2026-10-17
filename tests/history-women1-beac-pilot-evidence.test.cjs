'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const load=p=>JSON.parse(fs.readFileSync(path.join(__dirname,'../data/competition-history/'+p),'utf8'));
const pilot=load('women1_2025_26_beac_roster_pilot.json'),league=load('women1_2025_26_official_league_snapshot.json');
test('five real official MRSZ BEAC protocols are linked to source-index known fixture IDs',()=>{
 const codes=pilot.results.map(r=>r.matchCode);
 assert.deepEqual(codes,['2446','3290','6083','7756','8851']);
 assert.equal(pilot.confirmedMatches,5);
 assert.equal(pilot.matchesWithBeacCodes,5);
 const fixtures=new Map(league.matches.map(m=>[m.code,m]));
 for(const p of pilot.results){
  const m=fixtures.get(p.matchCode);
  assert.ok(m);
  assert.equal(p.date,m.date);
  assert.equal(p.home,m.home);
  assert.equal(p.away,m.away);
  assert.equal(p.homeSets,m.homeSets);
  assert.equal(p.awaySets,m.awaySets);
  assert.equal(p.resultComparedWithIndex,true);
  assert.equal(new Set(p.beacPlayerCodes).size,p.beacPlayerCodes.length);
  assert.ok(p.beacPlayerCodes.length>=1);
  assert.ok(p.sourceUrl.includes('p_merkozes_kod='+p.matchCode));
 }
});
test('14 distinct MRSZ BEAC player codes reflect five match nominations only',()=>{
 const ids=new Set(pilot.results.flatMap(m=>m.beacPlayerCodes));
 assert.equal(ids.size,14);
 assert.equal(pilot.uniqueBeacPlayerCodes,14);
 assert.equal(pilot.seasonRosterComplete,false);
 assert.equal(pilot.individualPlayedSetsVerified,false);
 assert.equal(pilot.allowedToCalculateRosterRetention,false);
 assert.equal(pilot.allowedToRatePlayers,false);
});
