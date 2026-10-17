'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {evaluate}=require('../scripts/history/roster-evidence-audit.cjs');
const sample=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/competition-history/beac_women1_roster_evidence_2024_2026.json'),'utf8'));

test('BEAC community cohorts remain candidate-only with no official rating',()=>{
 const report=evaluate(sample);
 assert.equal(report.valid,true,JSON.stringify(report.errors));
 assert.deepEqual(report.cohorts.map(x=>[x.season,x.listedPlayers]),[
  ['2024/25',3],['2025/26',15],['2026/27',2]]);
 assert.equal(report.cohorts[0].reportedPlacement,5);
 assert.equal(report.cohorts[1].reportedPlacement,2);
 assert.equal(report.eligibleForTeamStrength,false);
 assert.equal(report.eligibleForPlayerRating,false);
 assert.equal(report.confirmedOfficialPlayerAppearances,0);
});

test('2024/25 -> 2025/26 has one community-profile repeat but no roster retention percent',()=>{
 const {comparisons}=evaluate(sample);
 const x=comparisons.find(c=>c.earlier==='2024/25');
 assert.deepEqual(x.matchedCommunityProfiles,[{name:'Nóra Iglói',communityProfileId:'77091'}]);
 assert.equal(x.rosterRetentionPercent,null);
 assert.equal(x.officialPlayerMatches,0);
 assert.equal(x.ratingAllowed,false);
});

test('2026/27 two-name community roster cannot establish continuity',()=>{
 const x=evaluate(sample).comparisons.find(c=>c.later==='2026/27');
 assert.equal(x.laterListed,2);
 assert.equal(x.rosterRetentionPercent,null);
 assert.equal(x.matchedCommunityProfiles.length,0);
});

test('Anna Albert MAFC-ÉPK to BEAC is explicitly an unverified transfer candidate',()=>{
 const report=evaluate(sample),t=report.candidateTransfers[0];
 assert.equal(t.name,'Anna Albert');
 assert.equal(t.fromTeam,'MAFC-ÉPK');
 assert.equal(t.toTeam,'BEAC');
 assert.equal(t.reportedMrszPersonId,'27892');
 assert.equal(t.officialIdVerified,false);
});

test('never accept fabricated complete-roster, MRSZ IDs, match participation or standings verification',()=>{
 const x=structuredClone(sample);
 x.seasons[1].rosterComplete=true;
 x.seasons[1].roster[0].playedSets=25;
 x.qualityGate.federationStandingsVerified=true;
 x.historicalTransferCandidates[0].officialProfileContentVerified=true;
 const r=evaluate(x);
 assert.equal(r.valid,false);
 for(const fragment of ['full roster','player ID / playing time','official verification','NOT official player verification']){
   assert.ok(r.errors.some(e=>e.includes(fragment)),fragment);
 }
});
test('names with no common community profile ID do not count as confirmed cross-year players',()=>{
 const x=structuredClone(sample);
 x.seasons[2].roster.push({name:'Nóra Iglói',role:'Libero'});
 const result=evaluate(x).comparisons.find(v=>v.later==='2026/27');
 assert.ok(result.sameNameHints.includes('Nóra Iglói'));
 assert.equal(result.matchedCommunityProfiles.length,0);
 assert.equal(result.rosterRetentionPercent,null);
});

test('2025/26 team list compared with 2026/27 exposes only four literal club/team-name hints',()=>{
 const t=evaluate(sample).teamIdentity;
 assert.equal(t.historicalCommunityTeams,12);
 assert.equal(t.currentSavedTeams,12);
 assert.deepEqual(t.sameNormalizedNameHints,['BEAC','MAFC-ÉPK','Mozdulj SE','Panoráma SE']);
 assert.ok(t.unmatchedCurrentNames.includes('MTK'));
 assert.ok(t.unmatchedCurrentNames.includes('Emericus SE'));
 assert.equal(t.officialTeamIdentityLinks,0);
 assert.equal(t.automaticAliasMerges,0);
 assert.equal(t.verifiedTeamRetentionPercent,null);
});
test('II. teams and similar club names are never silently mapped to first squads',()=>{
 const x=structuredClone(sample);
 x.leagueTeamCandidates.riskExamples[0].verified=true;
 const result=evaluate(x);
 assert.equal(result.valid,false);
 assert.ok(result.errors.some(e=>e.includes('Unsafe historical club/team identity merge')));
});
