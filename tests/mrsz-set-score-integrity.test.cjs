'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const app=fs.readFileSync('app.js','utf8');
const start=app.indexOf('  function ccMrszSetScoreIssue_(');
const end=app.indexOf('  function ccMatchScoreboardHtml_(',start);
assert.ok(start>0&&end>start,'saved set-point validator must be present');
const issue=new Function('text',app.slice(start,end)+';return ccMrszSetScoreIssue_;')(x=>String(x??'').trim());
const base={homeSets:3,awaySets:1,setScores:[
 {home:25,away:19},{home:18,away:25},{home:25,away:21},{home:28,away:26}
]};
test('Complete official match set scores agree with a 3-1 result',()=>{
 assert.equal(issue(base),'');
 assert.equal(issue({...base,homeSets:3,awaySets:0,setScores:[
  {home:25,away:18},{home:25,away:16},{home:25,away:22}]}),'');
 assert.equal(issue({homeSets:3,awaySets:2,setScores:[
  {home:25,away:21},{home:22,away:25},{home:23,away:25},{home:26,away:24},{home:15,away:13}]}),'');
});
test('Partial or missing set-point list cannot be assumed inconsistent',()=>{
 assert.equal(issue({homeSets:3,awaySets:1,setScores:base.setScores.slice(0,1)}),'');
 assert.equal(issue({homeSets:3,awaySets:0,setScores:[]}), '');
 assert.equal(issue({homeSets:3,awaySets:0}), '');
 assert.equal(issue({homeSets:null,awaySets:null,setScores:[{home:25,away:19}]}),'');
});
test('Full list contradicting match set winners is reviewable, not accepted',()=>{
 assert.match(issue({...base,setScores:[
  {home:25,away:19},{home:25,away:18},{home:25,away:20},{home:20,away:25}]}),/sorrendje/);
 assert.match(issue({...base,setScores:[
  {home:25,away:19},{home:25,away:18},{home:20,away:25},{home:20,away:25}]}),/nem egyeznek/);
});
test('Saved set scores reject ties, fractions, impossible margins and short non-deciding sets',()=>{
 for(const bad of [{home:25,away:25},{home:24,away:23},{home:23,away:18},{home:25,away:24},{home:23.5,away:21},{home:-1,away:25},{home:25,away:null}]){
  const v=issue({...base,setScores:[bad,...base.setScores.slice(1)]});
  assert.ok(v,'Expected issue for '+JSON.stringify(bad));
 }
});
test('Fifth set accepts 15-13 but rejects 14-13',()=>{
 const setScores=[
 {home:25,away:21},{home:22,away:25},{home:23,away:25},{home:26,away:24},{home:14,away:13}];
 assert.match(issue({homeSets:3,awaySets:2,setScores}),/nem lehet befejezett/);
});
test('More recorded sets than the official match score always requires review',()=>{
 assert.match(issue({homeSets:3,awaySets:0,setScores:base.setScores}),/Több szettpontszám/);
});
test('Cross-view safeguards use the same validator before publishing unverified saved scores',()=>{
 const saved=app.slice(app.indexOf('  function ccSavedLeagueResults_('),app.indexOf('  function ccSavedLeagueResultsHtml_('));
 const review=app.slice(app.indexOf('  function ccMrszMatchReviewReason_('),app.indexOf('  let ccLeagueMatchScope_'));
 const scoreboard=app.slice(app.indexOf('  function ccMatchScoreboardHtml_('),app.indexOf('  function ccMrszMergedLeagueMatches_('));
 assert.ok(saved.includes('if(ccMrszSetScoreIssue_(m))continue;'));
 assert.ok(review.includes('const setIssue=ccMrszSetScoreIssue_(match)'));
 assert.ok(scoreboard.includes('setIssue=hasScore?ccMrszSetScoreIssue_(m)'));
});
