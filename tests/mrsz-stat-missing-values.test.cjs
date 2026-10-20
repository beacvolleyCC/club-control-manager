'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const js=fs.readFileSync('app.js','utf8');
const slice=(a,b)=>{
 const start=js.indexOf(a),end=js.indexOf(b,start);
 assert.ok(start>=0&&end>start,'Missing production helpers: '+a);
 return js.slice(start,end);
};
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const helpers=new Function('esc',slice('  function ccMrszStatNumber_(','  // One source/coverage vocabulary')+
 ';return {number:ccMrszStatNumber_,position:ccMrszStatPosition_,pair:ccMrszStatPair_,ratio:ccMrszStatRatio_,issue:ccMrszRecordIssue_,recordNumber:ccMrszRecordNumber_,recordPair:ccMrszRecordPair_,notice:ccMrszRecordNoticeHtml_};')(esc);
const coverage=new Function(slice('  function ccMrszCoverageLabel_(','  function ccVerifiedSnapshotStatsHtml_(')+';return ccMrszCoverageLabel_;')();
test('Missing, negative, fractional and malformed numbers never become false zeros',()=>{
 for(const value of [null,undefined,'',' ',NaN,Infinity,-1,-0.5,1.4,'N/A'])
  assert.equal(helpers.number(value),'–',String(value));
 for(const value of [0,'0',' 0 '])assert.equal(helpers.number(value),'0');
 assert.equal(helpers.number(3),'3');
});
test('Missing half-pair is unknown, not a synthetic 0–0 record',()=>{
 assert.equal(helpers.pair(null,0),'–');
 assert.equal(helpers.pair(2,undefined),'–');
 assert.equal(helpers.pair(0,0),'0–0');
 assert.equal(helpers.pair(7,4),'7–4');
 assert.equal(helpers.pair(2,-1),'–');
});
test('Ratios are based on valid explicit counts and retain mathematically valid zero',()=>{
 assert.equal(helpers.ratio(null,2),'–');
 assert.equal(helpers.ratio(2,null),'–');
 assert.equal(helpers.ratio(0,0),'–');
 assert.equal(helpers.ratio(0,2),'0.000');
 assert.equal(helpers.ratio(6,0),'∞');
 assert.equal(helpers.ratio(7,4),'1.750');
});
test('Unverified or partial MRSZ table positions must remain unavailable',()=>{
 assert.equal(helpers.position(1,{partial:true}),'–');
 assert.equal(helpers.position(1,{rows:[]}), '–');
 assert.equal(helpers.position(null,{partial:false}), '–');
 assert.equal(helpers.position(0,{partial:false}), '–');
 assert.equal(helpers.position(2,{partial:false}), '2');
 assert.equal(helpers.position(2,null), '2');
});
const makePhoto=new Function('text','esc','num','msLogoHtml_','ccMrszCoverageLabel_','ccMrszStatNumber_','ccMrszStatPosition_','ccMrszStatPair_','ccMrszStatRatio_','ccMrszRecordNumber_','ccMrszRecordNoticeHtml_',
 slice('  function ccMrszMainPhotoTableHtml_(','  // League fixture cards')+';return ccMrszMainPhotoTableHtml_;')(
 x=>String(x??''),esc,x=>Number(x)||0,()=>'',coverage,helpers.number,helpers.position,helpers.pair,helpers.ratio,helpers.recordNumber,helpers.notice);
const row={teamName:'MTK',position:1,played:1,wins:1,losses:0,tablePoints:3,setsFor:3,setsAgainst:0,pointsFor:null,pointsAgainst:55};
test('Meccsek saved table displays genuine zero, unknown points and a defined set ratio',()=>{
 const html=makePhoto({partial:false,competitionLabel:'Liga A',rows:[row]});
 assert.ok(html.includes('<b>1</b>'));
 assert.ok(html.includes('<td>0</td>'));
 assert.ok(html.includes('<td>∞</td>'));
 assert.ok(html.includes('<td>–</td>'));
 assert.ok(!html.includes('0–55'));
});
test('Meccsek partial table shows no unverified ranking but keeps actual result counts',()=>{
 const html=makePhoto({partial:true,competitionLabel:'Liga A',rows:[row]});
 assert.ok(html.includes('Részleges, rögzített eredmények'));
 assert.ok(html.includes('<td><b>–</b></td>'));
 assert.ok(html.includes('<td>0</td>'));
 assert.ok(!html.includes('<td><b>1</b></td>'));
});
const makeOverview=new Function('ccOverviewStandingsModel_','teamById','text','esc','msLogoHtml_','ccMrszStatNumber_','ccMrszStatPosition_','ccMrszStatPair_','ccMrszStatRatio_','ccMrszRecordNumber_','ccMrszRecordNoticeHtml_',
 slice('  function standingsCard_(','  function ccOpenStandingsContext_(')+';return standingsCard_;')(
 ()=>({rows:[{...row,sourceTeamId:'x'}],group:'Liga A',source:coverage({partial:true}),snapshot:{partial:true}}),
 ()=>({name:'Női I',color:'#000'}),x=>String(x??''),esc,()=>'',helpers.number,helpers.position,helpers.pair,helpers.ratio,helpers.recordNumber,helpers.notice);
test('Áttekintő displays list index but never fabricates official ranking or missing points',()=>{
 const html=makeOverview('1');
 assert.ok(html.includes('Listasorszám, nem helyezés'));
 assert.ok(html.includes('<b>1</b>'));
 assert.ok(html.includes('Frissítve: 2026.10.14.'));
 assert.ok(html.includes('0</td>'));
 assert.ok(html.includes('<td>–</td>'));
});
test('Standalone standings and auxiliary men-group table apply the same missing-number helpers',()=>{
 const standings=slice('  function renderManagerStandings_(','  function eventPlace(');
 const men=slice('  function ccMrszMenGroupTableHtml_(','  function ccMrszMenGroupSwitcherHtml_(');
 for(const name of ['ccMrszStatNumber_','ccMrszStatPosition_','ccMrszStatPair_','ccMrszStatRatio_'])
  assert.ok(standings.includes(name),name);
 assert.ok(men.includes('ccMrszStatNumber_'));
 assert.ok(men.includes('ccMrszStatPosition_'));
 assert.ok(standings.includes('showPhoto?photo:null'));
});


test('Played equals wins plus losses only when all saved counters exist',()=>{
 const consistent={played:5,wins:3,losses:2};
 assert.equal(helpers.issue(consistent),'');
 assert.equal(helpers.recordPair(consistent),'3–2');
 assert.equal(helpers.recordNumber(consistent,'wins'),'3');
 assert.equal(helpers.issue({played:0,wins:0,losses:0}),'');
 for(const incomplete of [{played:null,wins:1,losses:0},{played:2,wins:2,losses:null},{played:2,wins:1,losses:undefined},{played:'',wins:1,losses:1}])
  assert.equal(helpers.issue(incomplete),'',JSON.stringify(incomplete));
});
test('Arithmetic mismatch hides win/loss balance, keeps original played count and explains why',()=>{
 const corrupted={played:4,wins:2,losses:1};
 assert.match(helpers.issue(corrupted),/Lejátszott mérkőzés: 4; győzelem \+ vereség: 3/);
 assert.equal(helpers.recordNumber(corrupted,'played'),'4');
 assert.equal(helpers.recordNumber(corrupted,'wins'),'–');
 assert.equal(helpers.recordNumber(corrupted,'losses'),'–');
 assert.equal(helpers.recordPair(corrupted),'–');
 assert.ok(helpers.notice(corrupted).includes('Ellenőrzendő · M ≠ GY + V'));
 assert.ok(!helpers.notice({played:3,wins:2,losses:1}));
 assert.deepEqual(corrupted,{played:4,wins:2,losses:1},'source record remains unchanged');
});
test('Meccsek table flags contradiction instead of displaying a fictitious winning record',()=>{
 const html=makePhoto({partial:false,competitionLabel:'Liga A',rows:[{...row,played:4,wins:2,losses:1}]});
 assert.match(html,/Ellenőrzendő · M ≠ GY \+ V/);
 assert.ok(html.includes('<td>4</td><td>–</td><td>–</td>'),html);
 assert.ok(!html.includes('<td>2</td><td>1</td>'));
});
