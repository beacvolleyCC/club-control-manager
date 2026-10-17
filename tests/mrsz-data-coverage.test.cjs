'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const app=fs.readFileSync('app.js','utf8');
const section=(start,end)=>{
 const a=app.indexOf(start),b=app.indexOf(end,a);
 assert.ok(a>=0&&b>a,'Missing production function: '+start);
 return app.slice(a,b);
};
const stats=new Function('esc',section('  function ccMrszStatNumber_(','  // One source/coverage vocabulary')+';return {number:ccMrszStatNumber_,position:ccMrszStatPosition_,pair:ccMrszStatPair_,ratio:ccMrszStatRatio_,recordNumber:ccMrszRecordNumber_,notice:ccMrszRecordNoticeHtml_};')(x=>String(x??''));
const coverage=new Function(section('  function ccMrszCoverageLabel_(','  function ccVerifiedSnapshotStatsHtml_(')+';return ccMrszCoverageLabel_;')();
test('complete and partial saved MRSZ table have separate non-live coverage labels',()=>{
 const complete=coverage({partial:false});
 const partial=coverage({partial:true});
 assert.match(complete,/Mentett MRSZ-tabella \(teljes\)/);
 assert.match(partial,/Részleges, rögzített eredmények/);
 for(const label of [complete,partial]){
  assert.match(label,/MRSZ/);
  assert.match(label,/2026\.10\.14/);
  assert.match(label,/Nem élő adat/);
 }
 assert.notEqual(complete,partial);
});
test('unknown table completeness is never presented as verified complete',()=>{
 const unknown=coverage({rows:[{teamName:'MTK'}]});
 assert.match(unknown,/teljesség nincs jelölve/);
 assert.doesNotMatch(unknown,/\(teljes\)/);
});
test('missing table has an explicit non-live no-table label',()=>{
 const missing=coverage(null);
 assert.match(missing,/Nincs mentett tabella/);
 assert.match(missing,/Nem élő adat/);
 assert.doesNotMatch(missing,/teljes mentett tabella/);
});
test('Manager overview, main standings and matches route use one snapshot coverage source',()=>{
 const overview=section('  function ccOverviewStandingsModel_(','  function standingsLogo_(');
 const standings=section('  function renderManagerStandings_(','  function eventPlace(');
 const matchTable=section('  function ccMrszMainPhotoTableHtml_(','  // League fixture cards');
 const matchPage=section('  function ccLeagueMatchesContextHtml_(','  function renderCompetitionMatchCards_(');
 assert.ok(overview.includes('source:ccMrszCoverageLabel_(snapshot)'));
 assert.ok(standings.includes('ccMrszCoverageLabel_(photo)'));
 assert.ok(standings.includes('ccMrszCoverageLabel_(null)'));
 assert.ok(matchTable.includes('ccMrszCoverageLabel_(table)'));
 assert.ok(!matchPage.includes('ccMrszCoverageLabel_(null)'),'the Meccsek view no longer renders a second standings table');
 assert.ok(matchPage.includes('ccMrszLeagueFixturePanelHtml_'));
});
test('Match-page archived table renders actual shared source label for complete and partial data',()=>{
 const code=section('  function ccMrszMainPhotoTableHtml_(','  // League fixture cards');
 const render=new Function('text','esc','num','msLogoHtml_','ccMrszCoverageLabel_','ccMrszStatNumber_','ccMrszStatPosition_','ccMrszStatPair_','ccMrszStatRatio_','ccMrszRecordNumber_','ccMrszRecordNoticeHtml_',code+';return ccMrszMainPhotoTableHtml_;')(
  x=>String(x??''),x=>String(x??'').replace(/&/g,'&amp;').replace(/</g,'&lt;'),x=>Number(x)||0,()=>'',coverage,stats.number,stats.position,stats.pair,stats.ratio,stats.recordNumber,stats.notice
 );
 for(const partial of [true,false]){
  const html=render({competitionLabel:'Női I. osztály',partial,rows:[{teamName:'MTK',position:1,played:1,wins:1,losses:0,tablePoints:3}]});
  assert.ok(html.includes(coverage({partial})));
  assert.ok(html.includes('Női I. osztály'));
  assert.ok(html.includes('MTK'));
  assert.ok(!html.includes('élő frissítés'));
 }
});
test('BRSZ overview fallback is described as archived data with unknown source date',()=>{
 const overview=section('  function ccOverviewStandingsModel_(','  function standingsLogo_(');
 assert.ok(overview.includes('BRSZ · mentett állás · forrásdátum nem igazolt · nem élő adat'));
 assert.ok(overview.includes('rows.length?'));
 assert.ok(!overview.includes("source:'BRSZ · mentett bajnoki állás'"));
});
test('Matches page no longer calls saved standings current',()=>{
 const matches=section('  function renderCompetitionMatchCards_(','  function renderEventList(');
 assert.ok(matches.includes('Mérkőzések és mentett bajnoki adatok.'));
 assert.ok(!matches.includes('Mérkőzések és aktuális tabella.'));
});
