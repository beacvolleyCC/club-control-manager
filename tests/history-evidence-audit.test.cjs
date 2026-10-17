'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const {audit,normalizedName,seasonDateValid,resultValid}=require('../scripts/history/evidence-audit.cjs');
const sample=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/competition-history/women1_2025_26_evidence_sample.json'),'utf8'));

test('source-backed women I sample is intentionally partial and safe for staging only',()=>{
 const report=audit(sample);
 assert.equal(report.ok,true,JSON.stringify(report.errors));
 assert.equal(report.candidateResults,13);
 assert.equal(report.sourceKinds.club_site,4);
 assert.equal(report.sourceKinds.third_party,9);
 assert.equal(report.officiallyVerifiedResults,0);
 assert.equal(report.officialProtocolIndexExamples,1);
 assert.equal(report.namedPlayersWithVerifiedId,0);
 assert.equal(report.completeLeagueResultCoverage,null);
 assert.equal(report.finalStrengthRatingsAllowed,false);
});

test('name matching never conflates MTK Budapest with MTK or BEAC II with BEAC',()=>{
 assert.equal(normalizedName('MAFC-ÉPK'),normalizedName('MAFC ÉPK'));
 assert.notEqual(normalizedName('MTK Budapest'),normalizedName('MTK'));
 assert.notEqual(normalizedName('BEAC'),normalizedName('BEAC II.'));
 const report=audit(sample);
 assert.equal(report.currentTeamsChecked,12);
 assert.ok(report.exactNameCandidateMatches.includes('BEAC'));
 assert.ok(report.exactNameCandidateMatches.includes('MAFC-ÉPK'));
 assert.ok(report.notExactlyNameMatched.includes('MTK'));
 assert.ok(report.notExactlyNameMatched.includes('Óbudai Egyetem-Kandó SC'));
 assert.ok(report.notExactlyNameMatched.includes('Semmelweis Egyetem'));
});

test('source results are valid finished five-set volleyball scores in the selected season',()=>{
 assert.ok(sample.matches.every(resultValid));
 assert.ok(sample.matches.every(m=>seasonDateValid(sample.season,m.date)));
 assert.equal(resultValid({homeSets:0,awaySets:0}),false);
 assert.equal(resultValid({homeSets:2,awaySets:2}),false);
 assert.equal(resultValid({homeSets:3,awaySets:3}),false);
 assert.equal(seasonDateValid('2025/26','2027-02-01'),false);
 assert.equal(seasonDateValid('2025/26','2025-02-01'),false);
});

test('duplicate records, missing source and false official-verified claims are rejected',()=>{
 const x=structuredClone(sample);
 x.matches.push({...x.matches[0]});
 x.matches[1].sourceUrl='';
 x.matches[2].verifiedOfficial=true;
 x.matches[3].homeSets=0;x.matches[3].awaySets=0;
 const report=audit(x);
 assert.equal(report.ok,false);
 assert.ok(report.errors.some(e=>e.includes('duplicate candidate match')));
 assert.ok(report.errors.some(e=>e.includes('no HTTPS source URL')));
 assert.ok(report.errors.some(e=>e.includes('NOT federation verified')));
 assert.ok(report.errors.some(e=>e.includes('invalid best-of-five')));
});

test('federation protocol discovery does not imply a scored match or player appearances',()=>{
 assert.equal(sample.officialProtocolExamples[0].matchCode,'6161');
 assert.equal(sample.officialProtocolExamples[0].scoreVerified,false);
 assert.equal(sample.officialProtocolExamples[0].hasNamedRosterVerified,false);
 assert.equal(sample.officialProtocolExamples[0].playerIdExtracted,false);
 const x=structuredClone(sample);
 x.officialProtocolExamples[0].playerIdExtracted=true;
 assert.equal(audit(x).ok,false);
});

test('same-day matches with different opponents remain distinct',()=>{
 const fixtures=sample.matches.filter(m=>m.date==='2025-11-06');
 assert.equal(fixtures.length,2);
 assert.ok(fixtures.some(m=>m.home==='KRE SC'));
 assert.ok(fixtures.some(m=>m.home==='MAFC-ÉPK'));
});
