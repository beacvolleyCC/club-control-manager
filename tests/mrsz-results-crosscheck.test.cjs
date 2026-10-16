'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync('app.js','utf8');
const span=(a,b)=>{
 const from=src.indexOf(a),to=src.indexOf(b,from);
 assert.ok(from>=0&&to>from,'Production function missing: '+a);
 return src.slice(from,to);
};
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const common=new Function('esc',span('  function ccMrszStatNumber_(','  // One source/coverage vocabulary')+
  ';return {number:ccMrszStatNumber_,pair:ccMrszStatPair_,recordPair:ccMrszRecordPair_};')(esc);
const compare=new Function('text','esc','ccMrszStatNumber_','ccMrszStatPair_','ccMrszRecordPair_',
 span('  function ccMrszSavedResultsCrosscheckHtml_(','  function ccVerifiedSnapshotStatsHtml_(')+
 ';return ccMrszSavedResultsCrosscheckHtml_;')(
 x=>String(x??'').trim(),esc,common.number,common.pair,common.recordPair);
const full={partial:false},partial={partial:true},unknown={rows:[]};
const rows={played:2,wins:2,losses:0,setsFor:6,setsAgainst:1};
const saved=[{score:'3–0',opponent:'RKSK'},{score:'3–1',opponent:'MTK'}];
test('Saved result sets are compared only on complete table when match counts coincide',()=>{
 const html=compare(rows,full,saved);
 assert.ok(html.includes('2/2 mérkőzés'));
 assert.ok(html.includes('Az összevethető számszaki adatok egyeznek.'));
 assert.ok(html.includes('nem igazolja a lista teljességét'));
 assert.ok(!html.includes('Ellenőrzendő'));
});
test('Mismatched set totals are flagged without replacing the source table or inventing a winner',()=>{
 const row={...rows,setsFor:7};
 const html=compare(row,full,saved);
 assert.ok(html.includes('Ellenőrzendő'));
 assert.ok(html.includes('szettmérleg: tabella 7–1, mentett eredmények 6–1'));
 assert.equal(row.setsFor,7);
 assert.equal(row.wins,2);
 assert.ok(!html.includes('Az összevethető számszaki adatok egyeznek.'));
});
test('Matches versus standings win/loss differences are independently noted',()=>{
 const row={...rows,wins:1,losses:1};
 const html=compare(row,full,saved);
 assert.ok(html.includes('Ellenőrzendő'));
 assert.ok(html.includes('mérleg: tabella 1–1, mentett eredmények 2–0'));
 assert.ok(!html.includes('szettmérleg: tabella'));
});
test('Incomplete match list never creates a false set-total discrepancy',()=>{
 const row={...rows,setsFor:12,setsAgainst:9,wins:1,losses:1};
 const html=compare(row,full,saved.slice(0,1));
 assert.ok(html.includes('1/2 mérkőzés'));
 assert.ok(html.includes('nem vethetők össze'));
 assert.ok(!html.includes('Ellenőrzendő'));
 assert.ok(!html.includes('mentett eredmények 3–0'));
});
test('More saved matches than table play count is reported only as insufficient coverage',()=>{
 const html=compare({...rows,played:1},full,saved);
 assert.ok(html.includes('2/1 mérkőzés'));
 assert.ok(html.includes('nem vethetők össze'));
 assert.ok(!html.includes('Ellenőrzendő'));
});
test('Partial or unknown snapshot completeness never triggers cross-source arithmetic claims',()=>{
 assert.equal(compare(rows,partial,saved),'');
 assert.equal(compare(rows,unknown,saved),'');
 assert.equal(compare(rows,null,saved),'');
});
test('Missing played, no matches, or malformed recorded scores cannot create mismatch claims',()=>{
 assert.equal(compare({...rows,played:null},full,saved),'');
 assert.equal(compare({played:0},full,[]),'');
 assert.equal(compare(rows,full,null),'');
 const html=compare(rows,full,[{score:'3–0'},{score:'<script>alert(1)</script>'}]);
 assert.ok(html.includes('nem értelmezhető'));
 assert.ok(!html.includes('<script>'));
 assert.ok(!html.includes('Ellenőrzendő'));
});
test('When set totals are missing but win/loss balance exists, compare only the available part',()=>{
 const html=compare({...rows,setsFor:null,setsAgainst:null},full,saved);
 assert.ok(html.includes('Az összevethető számszaki adatok egyeznek'));
 assert.ok(!html.includes('Ellenőrzendő'));
});
test('Cross-check is appended to the selected team stats, never injected into synthetic form',()=>{
 const section=span('  function ccVerifiedSnapshotStatsHtml_(','  function renderManagerStandings_(');
 assert.ok(section.includes('ccMrszSavedResultsCrosscheckHtml_(row,snapshot,recorded)'));
 assert.ok(!section.includes('Legjobb forma'));
 assert.ok(src.includes('ms-recorded-audit'));
});
