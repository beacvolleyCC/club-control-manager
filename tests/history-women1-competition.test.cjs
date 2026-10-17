'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {parseRows,parseStandings,dayMarkers}=require('../scripts/history/parse-official-women1-competition.cjs');
const href=code=>'/pr_a/010/009/p_009.asp?p_merkozes_kod='+code+'&p_evad_kod=2025&p_verseny_al_kod=93';
const card=(code,score)=>'<div class="moff" OnClick="oldal_submit_publikus(\''+href(code)+'\');"><table>'+
 '<tr><td class="vw_black_cc_01">19:30</td><td class="vw_black_cr_01">BEAC</td>'+
 (score?'<td><strong>'+score+'</strong></td>':'<td></td>')+
 '<td class="vw_black_cr_01">EMERICUS SE</td></tr></table></div>';
const source='<strong>2025. október 17. péntek</strong>'+card(2446,'3 - 0')+
 '<strong>2026. január 21. szerda</strong>'+card(6161,null);
test('official match cards parse scored and empty results without guessing',()=>{
 const r=parseRows(source);
 assert.equal(r.errors.length,0,JSON.stringify(r.errors));
 assert.equal(r.rows.length,2);
 assert.deepEqual(r.rows[0],{
  code:'2446',date:'2025-10-17',time:'19:30',home:'BEAC',away:'EMERICUS SE',
  homeSets:3,awaySets:0,status:'scored',sourcePath:href(2446)
 });
 assert.equal(r.rows[1].date,'2026-01-21');
 assert.equal(r.rows[1].homeSets,null);
 assert.equal(r.rows[1].status,'unscored');
});
test('other league or season match cards are excluded',()=>{
 const raw=source.replace('p_verseny_al_kod=93','p_verseny_al_kod=96');
 const r=parseRows(raw);
 assert.equal(r.rows.length,1);
 assert.equal(r.rows[0].code,'6161');
});
test('standings missing a full rank set cannot be treated as verified league standings',()=>{
 const sample='TABELLA 1. BEAC 22 20 2 42 62 20 3,100 1917 1652 1,160 MŰSOR, EREDMÉNY';
 const r=parseStandings(sample);
 assert.equal(r.rows.length,1);
 assert.equal(r.rows[0].wins,20);
 assert.equal(r.rows[0].played,22);
 assert.equal(r.valid,false);
});
test('identical responsive copies of one match are deduplicated',()=>{
 const x=parseRows('<strong>2025. október 17. péntek</strong>'+card(2446,'3 - 0')+card(2446,'3 - 0'));
 assert.equal(x.rows.length,1);
 assert.equal(x.repeatedResponsiveCards,1);
 assert.deepEqual(x.errors,[]);
});
