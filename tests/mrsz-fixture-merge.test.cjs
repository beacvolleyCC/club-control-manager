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
const ctx={URL,text,esc,num:x=>Number(x)||0,msLogoHtml_:()=>'<span class="standing-logo-text">TEAM</span>',
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
 assert.ok(!html.includes('cc-match-scoreboard'),'no BEAC player in sample league fixtures');
});
test('full-league selection restores the original match-card layout with results',()=>{
 ctx.qa.setScope('all');
 const html=ctx.qa.html('Női Budapest I. osztály');
 assert.ok(html.includes('ms-panel ms-match-panel'));
 assert.ok(html.includes('cc-match-scoreboard'));
 assert.ok(html.includes('standing-logo-text'));
 assert.ok(html.includes('3–1'));
 assert.ok(html.includes('cc-scoreboard-set-results'));
 assert.ok(html.includes('25:16'));
 assert.ok(!html.includes('Szettek:'));
 assert.ok(!html.includes('Végeredmény'));
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
 assert.ok(css.includes('@media(max-width:700px){'));
 assert.ok(css.includes('.cc-scoreboard-set-results{'));
 assert.ok(css.includes('  .cc-scoreboard-set-results{font-size:9px}'));
 assert.ok(css.includes('  .cc-scoreboard-set-results{font-size:8px;line-height:1.35}'));
 assert.ok(!css.includes('.cc-scoreboard-sets{'));

});

test('PWA cache and HTML assets are versioned for the mobile match-row fix',()=>{
 const html=fs.readFileSync('index.html','utf8');
 const sw=fs.readFileSync('sw.js','utf8');
 assert.ok(html.includes('styles.css?v=20261017-matches-ui-v47'));
 assert.ok(html.includes('app.js?v=20261017-matches-ui-v47'));
 assert.ok(sw.includes("cc-manager-20261017-matches-ui-v47"));
});

test('official UTC kickoff is shown in Budapest time and merged into local-day fixture',()=>{
 const league='Női Budapest I. osztály';
 const fixture={competitionLabel:league,startsAt:'2026-10-16T19:30:00',homeName:'BEAC',awayName:'MAFC-ÉPK',homeSets:null,awaySets:null};
 const official={...fixture,startsAt:'2026-10-16T17:30:00+00:00'};
 fixtures.push(fixture);
 try{
  const merged=ctx.qa.merge(league,[official]);
  assert.equal(merged.filter(x=>x.homeName==='BEAC'&&x.awayName==='MAFC-ÉPK').length,1);
  const html=ctx.qa.html(league,[official]);
  assert.ok(html.includes('19:30'));
  assert.ok(!html.includes('17:30'));
  assert.equal(vm.runInContext("ccMrszLocalKickoff_('2026-11-01T23:30:00+00:00').date",ctx),'2026-11-02');
 }finally{fixtures.pop();}
});

test('changing Manager context resets BEAC-only scope except for men A',()=>{
 const begin=js.indexOf('  function msBind_(){');
 const end=js.indexOf('  function renderManagerStandings_()',begin);
 assert.ok(begin>0&&end>begin);
 const handlers={};
 const localState={managerStandingsContext:'',managerStandingsTeam:'',managerStandingsMatchScope:'all',managerLeagueInsights:{}};
 const ctx={state:localState,text:x=>String(x??''),localStorage:{setItem(){}},$:(selector)=>selector==='#msContextSelect'?{addEventListener:(type,fn)=>handlers.context=fn}:{addEventListener(){}},$$:()=>[],renderManagerStandings_:()=>{},ccClearLeagueContext_:()=>{},ccSetLeagueContext_:()=>{},msSetTeam_:()=>{}};
 vm.createContext(ctx);
 vm.runInContext("let ccMrszMenGroup_='A';let ccLeagueMatchScope_='all';"+js.slice(begin,end)+"\nthis.qa={bind:msBind_,getScope:()=>ccLeagueMatchScope_};",ctx);
 ctx.qa.bind();
 handlers.context({target:{value:'10000000-0000-4000-8000-000000000001'}});
 assert.equal(ctx.qa.getScope(),'beac');
 assert.equal(localState.managerStandingsMatchScope,'beac');
 handlers.context({target:{value:'10000000-0000-4000-8000-000000000003'}});
 assert.equal(ctx.qa.getScope(),'all');
 assert.equal(localState.managerStandingsMatchScope,'all');
});

test('unconfirmed BEAC vs BEAC records are omitted from match cards but listed for Manager review',()=>{
 const group='Férfi Budapest I. osztály – B csoport';
 const unverified=[
  {competitionLabel:group,startsAt:'2027-01-13T20:30:00',homeName:'BEAC',awayName:'BEAC',homeSets:null,awaySets:null},
  {competitionLabel:group,startsAt:'2027-03-04T19:30:00',homeName:'BEAC',awayName:'BEAC',homeSets:null,awaySets:null}
 ];
 fixtures.push(...unverified);
 try{
  const duplicateCanonical={...unverified[0],startsAt:'2027-01-13T19:30:00+00:00'};
  const html=ctx.qa.html(group,[duplicateCanonical]);
  assert.ok(html.includes('2 ellenőrzendő BRSZ-rekord'));
  assert.ok(html.includes('2027-03-04 19:30'));
  assert.ok(html.includes('1 / 1 meccs'));
  const ordinary=html.split('<div class="ms-match-list">')[1].split('</div><details class="cc-mrsz-review-fixtures">')[0];
  assert.ok(!ordinary.includes('2027-01-13'));
  assert.ok(!ordinary.includes('2027-03-04'));
  assert.ok(ordinary.includes('PDSE'));
  const valid={...unverified[1],startsAt:'2027-04-01T19:30:00',homeSets:3,awaySets:1};
  assert.equal(vm.runInContext('ccMrszUnverifiedSelfFixture_',ctx)(valid),false,'scored matches must not be silently suppressed');
 }finally{fixtures.splice(fixtures.length-unverified.length);}
});
test('unconfirmed BEAC vs BEAC record in women I is also omitted',()=>{
 const league='Női Budapest I. osztály',suspect={competitionLabel:league,startsAt:'2026-11-10T19:30:00',homeName:'BEAC',awayName:'BEAC',homeSets:null,awaySets:null};
 fixtures.push(suspect);
 try{
  const html=ctx.qa.html(league);
  assert.ok(html.includes('1 ellenőrzendő BRSZ-rekord'));
  assert.ok(html.includes('0 / 1 meccs'),'all ordinary fixtures are non-BEAC');
  assert.ok(!html.includes('<article class="cc-match-scoreboard'));
 }finally{fixtures.pop();}
});

test('unknown-completeness standings do not falsely reject an otherwise valid archived match',()=>{
 const league='Női Budapest II. osztály – B csoport',old=ctx.ccMrszPhotoState_.tables;
 ctx.ccMrszPhotoState_.tables=[{competitionLabel:league,rows:[{teamName:'MTK kék',position:1}]}];
 ctx.qa.setScope('all');
 try{
  const html=ctx.qa.html(league);
  assert.ok(html.includes('cc-match-scoreboard is-played'), 'do not remove a valid saved score without a verified complete table');
  assert.ok(html.includes('3–0'), 'saved outcome remains visible');
  assert.ok(!html.includes('A csapat nem szerepel a mentett tabellában'), 'unknown table completeness cannot justify identity rejection');
  assert.ok(html.includes('teljes tabella nélkül'), 'source-coverage caution is explicit');
  assert.ok(!html.includes('1. helyen áll'), 'rank is not verified');
 }finally{ctx.ccMrszPhotoState_.tables=old;ctx.qa.setScope('beac');}
});
test('match-card ranks require explicit full standings, not merely missing partial flag',()=>{
 const league='Női Budapest II. osztály – B csoport';
 const old=ctx.ccMrszPhotoState_.tables;
 const base={competitionLabel:league,rows:[{teamName:'MTK kék',position:1},{teamName:'RKSK felnőtt női',position:2}]};
 const rank=vm.runInContext('ccMatchScoreboardRank_',ctx);
 try{
  for(const partial of [undefined,true]){
   ctx.ccMrszPhotoState_.tables=[{...base,partial}];
   assert.equal(rank(league,'MTK kék'),null);
  }
  ctx.ccMrszPhotoState_.tables=[{...base,partial:false}];
  assert.equal(rank(league,'MTK kék'),1);
  assert.equal(rank(league,'RKSK felnőtt női'),2);
  assert.equal(rank('Férfi Budapest I. osztály – A csoport','MTK kék'),null,'league isolation');
 }finally{ctx.ccMrszPhotoState_.tables=old;}
});


test('verified protocol can be opened without changing federation match scorecards or roster actions',()=>{
 const league='Női Budapest I. osztály';
 const match={competitionLabel:league,matchCode:'2330',startsAt:'2026-10-16T19:30:00+02:00',
  homeName:'BEAC',awayName:'MAFC-ÉPK',homeSets:3,awaySets:1,
  setScores:[{home:25,away:21},{home:23,away:25},{home:25,away:18},{home:25,away:13}],
  protocol:{teams:[{name:'BEAC',players:[{number:'1',name:'Imre Eszter',designation:'K',captain:true,code:'42988'}]},
   {name:'MAFC-ÉPK',players:[{number:'5',name:'Stéger Babett',designation:'K'}]}],
   officials:[{role:'I. játékvezető',name:'Juták Lili',code:'30421'}]}};
 matches.push(match);
 ctx.qa.setScope('all');
 try{
  const html=ctx.qa.html(league);
  assert.ok(html.includes('Jegyzőkönyv ↗'));
  assert.ok(html.includes('data-cc-mrsz-protocol="2330"'));
  const detail=vm.runInContext('ccMrszProtocolHtml_',ctx)(match);
  assert.ok(detail.includes('Imre Eszter'));
  assert.ok(detail.includes('Kezdő'));
  assert.ok(detail.includes('Kapitány'));
  assert.ok(detail.includes('Juták Lili'));
  assert.ok(detail.includes('25 : 21'));
  assert.ok(!detail.includes('cc-protocol-person-link'), 'unverified athlete IDs are not guessed as hyperlinks');
 }finally{matches.pop();ctx.qa.setScope('beac');}
});
test('federation person URLs require HTTPS and an approved Hunvolley host',()=>{
 const url=vm.runInContext('ccMrszProfileUrl_',ctx);
 assert.equal(url('https://hunvolley.hu/person?id=123'),'https://hunvolley.hu/person?id=123');
 for(const x of ['http://hunvolley.hu/person','https://hunvolley.hu.evil.net/person',
  'javascript:alert(1)','https://example.com/person',''])assert.equal(url(x),'');
});
