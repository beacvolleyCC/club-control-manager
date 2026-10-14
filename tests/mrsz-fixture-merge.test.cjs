const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const js=fs.readFileSync('app.js','utf8');
const start=js.indexOf('  function ccMrszNormPairName_(');
const end=js.indexOf('  function ccMrszPhotoResultsByLeagueHtml_(',start);
assert.ok(start>0&&end>start);
const fixtures=[
{competitionLabel:'Női Budapest I. osztály',startsAt:'2026-10-13T19:30:00',homeName:'Semmelweis Egyetem',awayName:'Emericus SE',homeSets:null,awaySets:null},
{competitionLabel:'Női Budapest II. osztály – B csoport',startsAt:'2026-10-13T18:20:00',homeName:'MTK kék',awayName:'RKSK felnőtt női',homeSets:null,awaySets:null},
{competitionLabel:'Férfi Budapest I. osztály – A csoport',startsAt:'2026-10-13T19:00:00',homeName:'MAFC-Kármán',awayName:'Ráckeve',homeSets:null,awaySets:null},
{competitionLabel:'Férfi Budapest I. osztály – B csoport',startsAt:'2026-10-15T20:00:00',homeName:'BEAC',awayName:'PDSE',homeSets:null,awaySets:null}
];
const matches=[
{competitionLabel:'Női Budapest I. osztály',startsAt:'2026-10-13T19:30:00+02:00',homeName:'Semmelweis Egyetem Sport Klub',awayName:'EMERICUS SE',homeSets:3,awaySets:1,setScores:[{home:25,away:16}]},
{competitionLabel:'Női Budapest II. osztály – B csoport',startsAt:'2026-10-13T18:20:00+02:00',homeName:'MTK Budapest kék',awayName:'RKSK felnőtt női',homeSets:3,awaySets:0},
{competitionLabel:'Férfi Budapest I. osztály – A csoport',startsAt:'2026-10-13T19:00:00+02:00',homeName:'MAFC-Kármán',awayName:'Ráckeve',homeSets:3,awaySets:0}
];
const text=x=>String(x??''),esc=x=>text(x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const ctx={text,esc,num:x=>Number(x)||0,msLogoHtml_:()=>'<span class="standing-logo-text">TEAM</span>',
  ccMrszPhotoState_:{matches,fixtures}};
vm.createContext(ctx);
vm.runInContext(js.slice(start,end)+'\nthis.qa={merge:ccMrszMergedLeagueMatches_,html:ccMrszLeagueFixturePanelHtml_,setScope:(x)=>{ccLeagueMatchScope_=x}}',ctx);
test('merge BRSZ fixture and MRSZ outcome without double counting 2026-10-13 matches',()=>{
 for(const [league,score] of [['Női Budapest I. osztály',3],['Női Budapest II. osztály – B csoport',3],['Férfi Budapest I. osztály – A csoport',3]]){
  const rows=ctx.qa.merge(league);
  assert.equal(rows.length,1,league);
  assert.equal(rows[0].homeSets,score,league);
 }
});
test('men A/B remain entirely separate and retain upcoming fixtures',()=>{
 const menA=ctx.qa.merge('Férfi Budapest I. osztály – A csoport');
 const menB=ctx.qa.merge('Férfi Budapest I. osztály – B csoport');
 assert.equal(menA.length,1);assert.equal(menB.length,1);
 assert.equal(menA[0].homeName,'MAFC-Kármán');
 assert.equal(menB[0].homeName,'BEAC');
 assert.equal(menB[0].homeSets,null);
});
test('canonical feed results overlay archived fixture, and submitted photo score overlays both',()=>{
 const feed=[{...fixtures[0],homeSets:0,awaySets:0}];
 const rows=ctx.qa.merge('Női Budapest I. osztály',feed);
 assert.equal(rows.length,1);
 assert.equal(rows[0].homeSets,3);
});
test('initial league list defaults to BEAC fixtures and offers full-league switch',()=>{
 const html=ctx.qa.html('Női Budapest I. osztály');
 assert.ok(html.includes('data-league-match-scope="beac"'));
 assert.ok(html.includes('aria-pressed="true"'));
 assert.ok(html.includes('Összes bajnoki meccs'));
 assert.ok(!html.includes('ms-match-row'),'no BEAC player in sample league fixtures');
});
test('full-league selection restores the original match-card layout with results',()=>{
 ctx.qa.setScope('all');
 const html=ctx.qa.html('Női Budapest I. osztály');
 assert.ok(html.includes('ms-panel ms-match-panel'));
 assert.ok(html.includes('ms-match-row'));
 assert.ok(html.includes('standing-logo-text'));
 assert.ok(html.includes('3–1'));
 assert.ok(html.includes('Szettek: 25:16'));
 assert.ok(!html.includes('BEAC</b>'),'unrelated league not in match list');
 ctx.qa.setScope('beac');
});
test('main standings render does not create a second table',()=>{
 const st=js.indexOf('  function renderManagerStandings_()');
 const end=js.indexOf('\n  function ',st+10);
 const render=js.slice(st,end);
 assert.ok(render.includes('const rows=showPhoto?ccStandingsPhotoTeamRows_'));
 assert.ok(!render.includes('ccMrszMainPhotoTableHtml_('));
 assert.ok(!render.includes('.outerHTML=html'));
 assert.ok(render.includes('ccMrszLeagueFixturePanelHtml_'));
});

test('mobile layout keeps set scores readable beneath the match row',()=>{
 const css=fs.readFileSync('styles.css','utf8');
 assert.ok(css.includes('@media(max-width:560px){\n  .cc-mrsz-league-matches .ms-match-place{display:block;grid-column:1/-1;'));
 assert.ok(css.includes('.cc-mrsz-league-matches .ms-match-place small{display:block;font-size:10px;'));
});

test('PWA cache and HTML assets are versioned for the mobile match-row fix',()=>{
 const html=fs.readFileSync('index.html','utf8');
 const sw=fs.readFileSync('sw.js','utf8');
 assert.ok(html.includes('styles.css?v=20261014-single-standings-beac-mobile-v5'));
 assert.ok(html.includes('app.js?v=20261014-single-standings-beac-mobile-v5'));
 assert.ok(sw.includes("cc-manager-20261014-single-standings-beac-mobile-v5"));
});
