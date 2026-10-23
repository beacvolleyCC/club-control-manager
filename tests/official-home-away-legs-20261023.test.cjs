'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base='data/competition/2026-27/';
const data=JSON.parse(fs.readFileSync(base+'official-leg-review-20261023.json','utf8'));
const review=JSON.parse(fs.readFileSync(base+'official-identity-review-20261023.json','utf8'));
const sql=fs.readFileSync('sql/audit_official_home_away_legs_20261023.sql','utf8');

test('Exactly four 2026/27 pairs, two oriented legs each, fully scoped',()=>{
 assert.equal(data.season,'2026/27');
 assert.equal(data.status,'read_only_review');
 assert.equal(data.automaticAliasApproved,false);
 assert.equal(data.pairs.length,4);
 assert.equal(new Set(data.pairs.map(p=>p.competitionLabel)).size,4);
 const keys=new Set();
 for(const p of data.pairs){
  assert.equal(p.legs.length,2);
  assert.deepEqual(new Set(p.legs.map(l=>l.oriented_leg)),new Set(['home_leg','away_leg']));
  assert.equal(p.legs[0].competition_label,p.competitionLabel);
  assert.equal(p.legs[1].competition_label,p.competitionLabel);
  assert.equal(p.legacy.decision.includes('pending')||p.legacy.decision.includes('not_')||p.legacy.decision.includes('do_not_'),true);
  for(const l of p.legs){
   assert.match(l.match_id,/^[a-f0-9-]{36}$/);
   assert.match(l.home_source_team_id,/^\d+$/);
   assert.match(l.away_source_team_id,/^\d+$/);
   assert.notEqual(l.home_source_team_id,l.away_source_team_id);
   assert.ok(!keys.has(l.source_key),'No duplicate canonical match keys');
   keys.add(l.source_key);
  }
  const first=p.legs[0],second=p.legs[1];
  assert.equal(first.home_source_team_id,second.away_source_team_id);
  assert.equal(first.away_source_team_id,second.home_source_team_id);
 }
});
test('Four first legs refer to exact already reviewed canonical UUIDs',()=>{
 for(const p of data.pairs){
  const home=p.legs.find(x=>x.oriented_leg==='home_leg');
  const inReview=review.reviewedRecords.find(x=>x.canonicalSourceKey===home.source_key);
  assert.ok(inReview,'Expected previously reviewed league-scoped candidate');
  assert.equal(inReview.competitionLabel,p.competitionLabel);
  assert.equal(inReview.canonicalMatchId,home.match_id);
  assert.equal(inReview.canonicalHomeTeamId,home.home_source_team_id);
  assert.equal(inReview.canonicalAwayTeamId,home.away_source_team_id);
  assert.equal(inReview.allowAutomaticCanonicalWrite,false);
 }
});
test('MTK kék–RKSK 2026-11-24 is neither played 2026-10-13 nor 2027-01-11 reversed home',()=>{
 const p=data.pairs.find(x=>x.name==='MTK kék – RKSK felnőtt női');
 assert.ok(p);
 assert.equal(p.competitionLabel,'Női Budapest II. osztály – B csoport');
 assert.equal(p.legacy.oldDate,'2026-11-24');
 const home=p.legs.find(x=>x.oriented_leg==='home_leg');
 const reverse=p.legs.find(x=>x.oriented_leg==='away_leg');
 assert.equal(home.source_key,'mrsz:2026/27:protocol:2337');
 assert.equal(home.kickoff_local,'2026-10-13 18:20:00');
 assert.equal(home.match_status,'played');
 assert.equal(reverse.source_key,'brsz:2026/27:bb2b:userofficial:22');
 assert.equal(reverse.kickoff_local,'2027-01-11 20:00:00');
 assert.equal(reverse.match_status,'scheduled');
 assert.notEqual(home.kickoff_local.slice(0,10),p.legacy.oldDate);
 assert.notEqual(reverse.kickoff_local.slice(0,10),p.legacy.oldDate);
 assert.equal(p.legacy.decision,'possible_distinct_old_fixture_do_not_map_to_oct13_or_jan11');
});
test('Other three mismatched dates remain unverifiable despite two oriented legs',()=>{
 const expected={
  'Dág KSE – KÖZGÁZ':['Férfi Budapest I. osztály – A csoport','2026-11-19','2026-10-15 20:15:00','2027-01-14 19:30:00'],
  'Mozdulj SE – MAFC-Schönherz':['Férfi Budapest I. osztály – B csoport',null,'2027-03-03 20:00:00','2026-12-02 20:30:00'],
  'KEAC – KRE-B':['Női Budapest II. osztály – A csoport','2026-10-28','2026-11-28 11:30:00','2027-01-13 18:00:00']
 };
 for(const p of data.pairs.filter(p=>p.name!=='MTK kék – RKSK felnőtt női')){
  const [league,oldDate,home,away]=expected[p.name];
  assert.equal(p.competitionLabel,league);
  assert.equal(p.legacy.oldDate,oldDate);
  assert.equal(p.legs.find(l=>l.oriented_leg==='home_leg').kickoff_local,home);
  assert.equal(p.legs.find(l=>l.oriented_leg==='away_leg').kickoff_local,away);
 }
});
test('SQL requires exact season, competition, source-team IDs, oriented home and away',()=>{
 const src=sql.replace(/^\s*--.*$/gm,'');
 assert.ok(src.trim().startsWith('WITH pairs'));
 assert.match(src,/c\.season='2026\/27'/);
 assert.match(src,/c\.competition_label=p\.competition_label/);
 assert.match(src,/c\.home_source_team_id=p\.home_id AND c\.away_source_team_id=p\.away_id/);
 assert.match(src,/c\.home_source_team_id=p\.away_id AND c\.away_source_team_id=p\.home_id/);
 assert.doesNotMatch(src,/\b(?:INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TRUNCATE|GRANT)\b/i);
 assert.match(src,/ORDER BY p\.review_label,c\.kickoff_local/);
});
