'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const input='data/competition/2026-27/canonical-legacy-five-league-audit-20261023.json';
const snapshot=JSON.parse(fs.readFileSync(input,'utf8'));
const sql=fs.readFileSync('sql/audit_five_league_canonical_versus_user_20261022.sql','utf8');
const classes=new Map(snapshot.classSummary.map(x=>[x.review_class,Number(x.n)]));
const leagues=new Map(snapshot.leagueSummary.map(x=>[x.league_key,x]));
const category=(name)=>classes.get(name)||0;

test('Read-only five-league source snapshot has pinned 300/298 identities',()=>{
 assert.equal(snapshot.status,'audit_only_no_automatic_canonical_alias');
 assert.equal(snapshot.legacyTotal,300);
 assert.equal(snapshot.canonicalTotal,298);
 assert.equal(snapshot.canonicalUnmatchedByDay,9);
 assert.equal(snapshot.capturedOn,'2026-10-23');
 assert.equal(snapshot.leagueSummary.length,5);
 assert.deepEqual(Object.fromEntries([...leagues].map(([key,val])=>[key,[val.legacy_rows,val.same_day]])),
   {menA:[42,41],menB:[42,40],womenI:[131,129],womenIIA:[42,37],womenIIB:[43,42]});
 assert.equal([...leagues.values()].reduce((n,v)=>n+v.legacy_rows,0),snapshot.legacyTotal);
 assert.equal([...leagues.values()].reduce((n,v)=>n+v.same_day,0),289);
});
test('All 300 fixture classifications account for 281 exact + 8 played without clock + 11 review',()=>{
 assert.equal([...classes.values()].reduce((a,b)=>a+b,0),300);
 assert.equal(category('MATCHED_EXACT'),281);
 assert.equal(category('MATCHED_RESULT_NO_TIME'),8);
 assert.equal(category('DIFFERENT_DAY_REVIEW'),4);
 assert.equal(category('POSTPONED_UNDATED_BOTH'),4);
 assert.equal(category('POSTPONED_RESCHEDULED_REVIEW'),1);
 assert.equal(category('EXTRA_LEGACY_PAIR_REVIEW'),1);
 assert.equal(category('UNVERIFIED_SELF_FIXTURE'),1);
 assert.equal(snapshot.reviewRecords.length,11);
 assert.equal(snapshot.legacyResultConflicts.length,0);
});
test('All eleven review records are unique, categorized and NEVER approved automatic aliases',()=>{
 const seen=new Set();
 const allowed=new Set(['DIFFERENT_DAY_REVIEW','POSTPONED_UNDATED_BOTH','POSTPONED_RESCHEDULED_REVIEW','EXTRA_LEGACY_PAIR_REVIEW','UNVERIFIED_SELF_FIXTURE']);
 const classSeen=new Map();
 for(const row of snapshot.reviewRecords){
  assert.match(row.legacyKey,/^ui20261018:/);
  assert.ok(!seen.has(row.legacyKey),'duplicate legacy source key');
  seen.add(row.legacyKey);
  assert.ok(allowed.has(row.classification));
  classSeen.set(row.classification,(classSeen.get(row.classification)||0)+1);
  if(row.classification==='UNVERIFIED_SELF_FIXTURE'){
   assert.equal(row.candidateSource,null);
   assert.equal(row.candidateMatchId,null);
   assert.equal(row.pairCount,0);
  }else{
   assert.equal(row.pairCount,1);
   assert.ok(row.candidateSource && row.candidateMatchId);
  }
 }
 for(const kind of allowed)assert.equal(classSeen.get(kind),category(kind));
});
test('Changed dates are review-only and distinct from cancelled/postponed cases',()=>{
 const rows=snapshot.reviewRecords.filter(r=>r.classification==='DIFFERENT_DAY_REVIEW');
 assert.equal(rows.length,4);
 for(const r of rows){
  assert.ok(r.legacyDay);
  assert.ok(r.candidateKickoffLocal);
  assert.notEqual(r.legacyDay,String(r.candidateKickoffLocal).slice(0,10));
  assert.equal(r.otherLegacySameDay,0);
 }
 const special=snapshot.reviewRecords.find(r=>r.classification==='POSTPONED_RESCHEDULED_REVIEW');
 assert.equal(special.legacyDay,null);
 assert.equal(special.legacyStatus,'postponed');
 assert.ok(special.candidateKickoffLocal);
 assert.ok(special.candidateSource.includes('menB'));
});
test('Four undated postponements are not fabricated calendar slots',()=>{
 const rows=snapshot.reviewRecords.filter(r=>r.classification==='POSTPONED_UNDATED_BOTH');
 assert.equal(rows.length,4);
 assert.ok(rows.every(r=>r.league==='womenIIA'));
 for(const r of rows){
  assert.equal(r.legacyDay,null);
  assert.equal(r.candidateKickoffLocal,null);
  assert.equal(r.legacyStatus,'postponed');
  assert.equal(r.candidateStatus,'postponed');
 }
});
test('The two surplus legacy fixture candidates remain blocked from auto-merge or deletion',()=>{
 const self=snapshot.reviewRecords.find(r=>r.classification==='UNVERIFIED_SELF_FIXTURE');
 assert.equal(self.home,'BEAC');assert.equal(self.away,'BEAC');
 const extra=snapshot.reviewRecords.find(r=>r.classification==='EXTRA_LEGACY_PAIR_REVIEW');
 assert.ok(extra.legacyKey.includes('mtkkek:rkskfelnottnoi:2'));
 assert.ok(extra.otherLegacySameDay>0);
 assert.equal(extra.candidateStatus,'played');
});
test('Five same-day legacy schedule statuses have already been superseded by official results',()=>{
 assert.equal(snapshot.staleLegacyFixtureStatus.length,5);
 const unique=new Set();
 for(const row of snapshot.staleLegacyFixtureStatus){
  assert.ok(!unique.has(row.legacyKey));unique.add(row.legacyKey);
  assert.equal(row.canonicalStatus,'played');
  assert.ok(row.candidate.startsWith('mrsz:2026/27:protocol:'));
  assert.equal(Math.max(...row.canonicalScore),3);
 }
});
test('SQL reuses the canonical team normalizer but never writes, approves, or merges matches',()=>{
 const source=sql.replace(/^\s*--.*$/gm,'');
 assert.match(source,/private\.cc_competition_team_key_v1/);
 assert.match(source,/private\.cc_canonical_competition_matches_v1/);
 assert.match(source,/public\.cc_competition_user_schedule_v1/);
 assert.match(source,/other_legacy_on_candidate_day/);
 assert.match(source,/staleLegacyFixtureStatus/);
 assert.match(source,/legacyResultConflicts/);
 assert.doesNotMatch(source,/\b(?:UPDATE|DELETE|INSERT|ALTER|DROP|TRUNCATE|GRANT|CREATE)\b/i);
 assert.doesNotMatch(source,/\bpg_sleep\b/i);
 assert.ok(source.trim().startsWith('WITH legacy AS'));
});


test('same home/away names across genders, divisions or A/B groups do not cross-link',()=>{
 // The persistent normalizer identifies a team within its own league.
 // League and season are mandatory components of a fixture identity.
 assert.match(sql,/FROM public\.cc_competition_user_schedule_v1 u WHERE u\.season='2026\/27'/i);
 assert.match(sql,/FROM private\.cc_canonical_competition_matches_v1 c WHERE c\.season='2026\/27'/i);
 const matches=[...sql.matchAll(/(?:x|c)\.competition_label=u\.league/g)].length;
 assert.ok(matches>=2,'Every candidate query must require the same competition');
 assert.match(sql,/u\.league=c\.competition_label/);
 assert.match(sql,/x\.home_key=u\.home_key AND x\.away_key=u\.away_key/);
 assert.match(sql,/c\.home_key=u\.home_key AND c\.away_key=u\.away_key/);
 const leagueMapping=['menA','menB','womenI','womenIIA','womenIIB'];
 for(const league of leagueMapping)assert.match(sql,new RegExp("WHEN '"+league+"' THEN"));
 const sample=[
  {season:'2026/27',league:'Férfi Budapest I. osztály – B csoport',home:'beac',away:'mozdulj'},
  {season:'2026/27',league:'Női Budapest I. osztály',home:'beac',away:'mozdulj'},
  {season:'2026/27',league:'Női Budapest II. osztály – A csoport',home:'beacii',away:'uteu20pink'},
  {season:'2026/27',league:'Női Budapest II. osztály – B csoport',home:'beacii',away:'uteu20pink'},
  {season:'2025/26',league:'Férfi Budapest I. osztály – B csoport',home:'beac',away:'mozdulj'}
 ];
 const key=r=>[r.season,r.league,r.home,r.away].join('|');
 assert.equal(new Set(sample.map(key)).size,sample.length,
  'identical team names must remain different competition identities');
 assert.notEqual(key(sample[0]),key(sample[1]));
 assert.notEqual(key(sample[2]),key(sample[3]));
 assert.notEqual(key(sample[0]),key(sample[4]));
});
