'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path='data/competition/2026-27/';
const review=JSON.parse(fs.readFileSync(path+'official-identity-review-20261023.json','utf8'));
const baseline=JSON.parse(fs.readFileSync(path+'canonical-legacy-five-league-audit-20261023.json','utf8'));
const protocols=JSON.parse(fs.readFileSync(path+'official-protocols-20261021.json','utf8'));
const sql=fs.readFileSync('sql/audit_official_identity_release_gate_20261023.sql','utf8');
const leagueNames={
 menA:'Férfi Budapest I. osztály – A csoport',
 menB:'Férfi Budapest I. osztály – B csoport',
 womenI:'Női Budapest I. osztály',
 womenIIA:'Női Budapest II. osztály – A csoport',
 womenIIB:'Női Budapest II. osztály – B csoport'
};
test('All 11 historical candidates are unique and never authorize any LIVE alias',()=>{
 assert.equal(review.liveWritesAllowed,false);
 assert.equal(review.verifiedAutoAliases,0);
 assert.equal(review.reviewedRecords.length,11);
 assert.equal(new Set(review.reviewedRecords.map(r=>r.legacySourceKey)).size,11);
 assert.deepEqual(review.reviewedRecords.map(r=>r.legacySourceKey).sort(),
  baseline.reviewRecords.map(r=>r.legacyKey).sort());
 for(const r of review.reviewedRecords){
  assert.equal(r.season,'2026/27');
  assert.equal(r.competitionLabel,leagueNames[r.legacyLeagueKey]);
  assert.equal(r.allowAutomaticCanonicalWrite,false);
  assert.equal(r.isVerifiedAutoAlias,false);
  assert.equal(r.manualApproval,'required');
  assert.equal(r.canonicalMatchId===null,r.canonicalSourceKey===null);
  if(r.canonicalSourceKey){
   assert.match(r.canonicalMatchId,/^[0-9a-f-]{36}$/);
   assert.match(r.canonicalHomeTeamId,/^\d+$/);
   assert.match(r.canonicalAwayTeamId,/^\d+$/);
  }
 }
});
test('The 2 uploaded official PDFs corroborate only their OWN gender/division fixtures',()=>{
 const verified=review.reviewedRecords.filter(r=>r.evidenceStatus==='source_supported_by_uploaded_pdf');
 assert.equal(verified.length,2);
 assert.deepEqual(verified.map(x=>x.originalProtocolMatchCode).sort(),[2686,2700]);
 for(const row of verified){
  const source=protocols.matches.find(x=>x.data.matchCode===row.originalProtocolMatchCode);
  assert.ok(source,'Missing uploaded source');
  assert.equal(row.originalProtocolSource,source.sourceKey);
  assert.equal(row.canonicalSourceKey,source.canonicalFixtureSourceKey);
  assert.equal(row.originalProtocolPdfSha256,source.fileSha256);
  assert.equal(row.competitionLabel,source.data.competitionLabel);
  assert.equal(row.canonicalHomeTeamId,source.data.homeSourceTeamId);
  assert.equal(row.canonicalAwayTeamId,source.data.awaySourceTeamId);
  assert.equal(row.canonicalKickoff,source.data.startsAt.slice(0,19).replace('T',' '));
  assert.match(row.originalProtocolPdfSha256,/^[0-9a-f]{64}$/);
  assert.equal(row.legacyDay,'2026-10-28');
 }
 assert.equal(verified.find(x=>x.originalProtocolMatchCode===2686).legacyLeagueKey,'womenI');
 assert.equal(verified.find(x=>x.originalProtocolMatchCode===2700).legacyLeagueKey,'menB');
});
test('No source-evidence contamination across the five competition groups',()=>{
 for(const row of review.reviewedRecords){
  assert.equal(row.competitionLabel,leagueNames[row.legacyLeagueKey]);
  if(row.legacyLeagueKey.startsWith('women'))assert.ok(row.competitionLabel.startsWith('Női'));
  if(row.legacyLeagueKey.startsWith('men'))assert.ok(row.competitionLabel.startsWith('Férfi'));
  if(row.legacyLeagueKey==='womenIIA')assert.match(row.competitionLabel,/A csoport$/);
  if(row.legacyLeagueKey==='womenIIB')assert.match(row.competitionLabel,/B csoport$/);
 }
 const pair=[
 {season:'2026/27',league:'menB',team:'BEAC',opponent:'Mozdulj SE'},
 {season:'2026/27',league:'womenI',team:'BEAC',opponent:'Mozdulj SE'},
 {season:'2026/27',league:'womenIIA',team:'Budapest Bunnies',opponent:'BDTSE Taksony'},
 {season:'2026/27',league:'womenIIB',team:'Budapest Bunnies',opponent:'BDTSE Taksony'},
 {season:'2025/26',league:'menB',team:'BEAC',opponent:'Mozdulj SE'}
 ];
 const compound=p=>[p.season,leagueNames[p.league],p.team,p.opponent].join('|');
 assert.equal(new Set(pair.map(compound)).size,5);
});
test('Postponed/no-date evidence is not a new fixture time',()=>{
 const rows=review.reviewedRecords.filter(r=>r.evidenceStatus==='undated_postponement_hold');
 assert.equal(rows.length,4);
 for(const r of rows){
  assert.equal(r.legacyLeagueKey,'womenIIA');
  assert.equal(r.legacyDay,null);
  assert.equal(r.canonicalKickoff,null);
  assert.equal(r.legacyStatus,'postponed');
  assert.equal(r.canonicalStatus,'postponed');
 }
});
test('MTK kék–RKSK Nov24 cannot be conflated with October 13 official forfeit #2337',()=>{
 const r=review.reviewedRecords.find(x=>x.evidenceStatus==='possible_distinct_return_fixture_hold');
 assert.ok(r);
 assert.equal(r.legacyLeagueKey,'womenIIB');
 assert.equal(r.legacyDay,'2026-11-24');
 assert.equal(r.canonicalKickoff,'2026-10-13 18:20:00');
 assert.equal(r.canonicalSourceKey,'mrsz:2026/27:protocol:2337');
 assert.equal(r.originalProtocolMatchCode,null);
 assert.equal(r.allowAutomaticCanonicalWrite,false);
});
test('Unverified self-fixture has no assigned canonical UUID or official squad IDs',()=>{
 const r=review.reviewedRecords.find(x=>x.evidenceStatus==='unverified_self_fixture_hold');
 assert.ok(r);
 assert.equal(r.legacyHome,'BEAC');
 assert.equal(r.legacyAway,'BEAC');
 assert.equal(r.legacyLeagueKey,'womenI');
 assert.equal(r.canonicalSourceKey,null);
 assert.equal(r.canonicalMatchId,null);
 assert.equal(r.canonicalHomeTeamId,null);
});
test('Live read-only gate demands full competition, both source team IDs and stable match UUID',()=>{
 const uncommented=sql.replace(/^\s*--.*$/gm,'');
 assert.ok(uncommented.trim().startsWith('WITH expected'));
 assert.match(uncommented,/c\.competition_label=CASE e\.league/);
 assert.match(uncommented,/c\.home_source_team_id=e\.h_id/);
 assert.match(uncommented,/c\.away_source_team_id=e\.a_id/);
 assert.match(uncommented,/c\.match_id::text=e\.uuid/);
 assert.match(uncommented,/c\.season='2026\/27'/);
 assert.match(uncommented,/c\.kickoff_local::text IS NOT DISTINCT FROM e\.kickoff/);
 assert.match(uncommented,/private\.cc_competition_team_key_v1\(c\.home_name\)/);
 assert.match(uncommented,/private\.cc_competition_team_key_v1\(c\.away_name\)/);
 assert.doesNotMatch(uncommented,/\b(?:INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TRUNCATE|GRANT|REVOKE)\b/i);
 for(const r of review.reviewedRecords){
  assert.ok(sql.includes("'"+r.legacySourceKey+"'"));
  if(r.canonicalMatchId)assert.ok(sql.includes("'"+r.canonicalMatchId+"'"));
 }
});
