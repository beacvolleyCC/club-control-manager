'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const js=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
const text=x=>String(x??'').trim();
const section=(from,to)=>{
  const a=js.indexOf(from),b=js.indexOf(to,a);
  assert.ok(a>=0&&b>a,'Missing production function: '+from);
  return js.slice(a,b);
};
const norm=new Function('text',section('  function ccMrszNormPairName_(','  function ccMrszLocalKickoff_(')+';return ccMrszNormPairName_;')(text);
const setIssue=new Function('text',section('  function ccMrszSetScoreIssue_(','  function ccMatchScoreboardHtml_(')+';return ccMrszSetScoreIssue_;')(text);
const results=new Function('text','ccMrszNormPairName_','ccMrszSetScoreIssue_',section('  function ccSavedLeagueResults_(','  function ccSavedLeagueResultsHtml_(')+';return ccSavedLeagueResults_;')(text,norm,setIssue);
const rank=new Function('text','ccMrszNormPairName_','ccMrszPhotoState_',section('  function ccMatchScoreboardRank_(','  function ccMatchScoreboardHtml_(')+';return ccMatchScoreboardRank_;')(text,norm,{
 tables:[{competitionLabel:'Liga A',partial:false,rows:[{teamName:'Kandó Sport Klub',position:2},{teamName:'Kandó SK',position:3}]},
 {competitionLabel:'Liga B',partial:false,rows:[{teamName:'Kandó Sport Klub',position:4}]}]
});
const photoRows=(snapshot,contextLeague,canonical=[])=>new Function('text','ccMrszNormPairName_','msRows_','msData_','ccIsBeacLeagueTeam_',
 section('  function ccStandingsPhotoTeamRows_(','  function ccMrszLeagueFixturePanelHtml_(')+';return ccStandingsPhotoTeamRows_;')(
 text,norm,()=>canonical,()=>({competitionLabel:contextLeague}),name=>norm(name)==='beac'
)(snapshot);
test('Known full-name aliases match without dropping team qualifiers',()=>{
 for(const [a,b] of [
  ['Kandó Sport Klub','Kandó SK'],
  ['Semmelweis Egyetem','Semmelweis Egyetem Sport Klub'],
  ['MTK kék','MTK Budapest kék'],
  ['MTK','MTK Budapest'],
  ['BEAC II.','Budapesti Egyetemi Atlétikai Club II.']
 ])assert.equal(norm(a),norm(b),a+' / '+b);
});
test('Distinct reserve, youth and colored teams never collapse to their parent club',()=>{
 for(const [a,b] of [
  ['Kandó Sport Klub','Kandó Sport Klub II.'],
  ['Semmelweis Egyetem','Semmelweis Egyetem U20'],
  ['MTK Budapest','MTK Budapest U20 Pink'],
  ['MTK Budapest','MTK Budapest kék'],
  ['MTK Budapest kék','MTK Budapest kék U20'],
  ['BEAC','BEAC II.'],
  ['Közgáz női','Közgáz férfi'],
  ['Ráckeve','Ráckeve II']
 ])assert.notEqual(norm(a),norm(b),a+' / '+b);
});
test('Result attribution skips scored youth match for a parent club',()=>{
 const base={competitionLabel:'Liga A',startsAt:'2026-10-13T19:30:00+02:00',homeName:'Kandó Sport Klub II.',awayName:'Ráckeve',homeSets:3,awaySets:1};
 const team={teamName:'Kandó Sport Klub'};
 assert.deepEqual(results(team,'Liga A',[base],[team,{teamName:'Kandó Sport Klub II.'}]),[]);
 const youth={teamName:'Kandó Sport Klub II.'};
 const actual=results(youth,'Liga A',[base],[team,youth,{teamName:'Ráckeve'}]);
 assert.equal(actual.length,1);
 assert.equal(actual[0].score,'3–1');
});
test('League results only match exact known saved MTK blue variant',()=>{
 const blue={teamName:'MTK Budapest kék'},plain={teamName:'MTK Budapest'};
 const base={competitionLabel:'Liga B',startsAt:'2026-10-13T19:30:00+02:00',homeName:'MTK kék',awayName:'Ráckeve',homeSets:3,awaySets:0};
 assert.equal(results(blue,'Liga B',[base],[blue,plain,{teamName:'Ráckeve'}]).length,1);
 assert.equal(results(plain,'Liga B',[base],[blue,plain]).length,0);
});
test('Ambiguous rank aliases never select the first row by accident',()=>{
 assert.equal(rank('Liga A','Kandó Sport Klub'),null);
 assert.equal(rank('Liga B','Kandó Sport Klub'),4);
 assert.equal(rank('Liga B','Kandó Sport Klub II.'),null);
});
test('Fallback snapshot identifiers are league-specific, not photo-0 across leagues',()=>{
 const a=photoRows({competitionLabel:'Liga A',rows:[{teamName:'Kandó Sport Klub'}]},'Unrelated league',[{teamName:'Kandó Sport Klub',sourceTeamId:'wrong'}]);
 const b=photoRows({competitionLabel:'Liga B',rows:[{teamName:'Kandó Sport Klub'}]},'Unrelated league',[{teamName:'Kandó Sport Klub',sourceTeamId:'wrong'}]);
 assert.ok(a[0].sourceTeamId.startsWith('photo-'));
 assert.notEqual(a[0].sourceTeamId,b[0].sourceTeamId);
 assert.notEqual(a[0].sourceTeamId,'wrong');
});
test('Canonical source IDs are accepted only from the same league and with unique aliases',()=>{
 const source={competitionLabel:'Liga A',rows:[{teamName:'MTK Budapest'}]};
 const same=photoRows(source,'Liga A',[{teamName:'MTK',sourceTeamId:'123'}]);
 assert.equal(same[0].sourceTeamId,'123');
 const other=photoRows(source,'Liga B',[{teamName:'MTK',sourceTeamId:'123'}]);
 assert.notEqual(other[0].sourceTeamId,'123');
 const ambiguous=photoRows(source,'Liga A',[{teamName:'MTK',sourceTeamId:'1'},{teamName:'MTK Budapest',sourceTeamId:'2'}]);
 assert.ok(ambiguous[0].sourceTeamId.startsWith('photo-'));
});
test('Existing snapshot-provided federation ID is retained',()=>{
 const rows=photoRows({competitionLabel:'Liga A',rows:[{teamName:'MTK Budapest',sourceTeamId:'federation-id'}]},'Liga B',[]);
 assert.equal(rows[0].sourceTeamId,'federation-id');
});
