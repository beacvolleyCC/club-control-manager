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
  ccMrszPhotoState_:{matches,fixtures},ccManagerVerifiedOfficialReport_:()=>null};
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
 assert.ok(!html.includes('data-league-match-scope="beac"'));
 assert.ok(html.includes('1 / 1 meccs'));
 assert.ok(!html.includes('Összes bajnoki meccs'));
 assert.ok(html.includes('cc-match-scoreboard'),'without BEAC the full group is shown');
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
 assert.ok(render.includes('const rawRows=canonicalPartial?canonicalRows:showPhoto?ccStandingsPhotoTeamRows_'));
 assert.ok(render.includes('const rows=canonicalPartial||showPhoto||hasRealRank?rawRows:'));
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
 assert.match(html,/styles[.]css[?]v=[a-z0-9-]+/i);
 const appVersion=html.match(/app[.]js[?]v=([a-z0-9-]+)/i)?.[1];
 const swVersion=sw.match(/const CACHE='cc-manager-([a-z0-9-]+)'/i)?.[1];
 assert.ok(appVersion,'Manager JS must be cache-versioned');
 assert.equal(swVersion,appVersion,'PWA shell and JS cache revisions must match');
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
  assert.ok(html.includes('1 / 1 meccs'),'groups without BEAC show the full schedule');
  assert.ok(!html.includes('data-league-match-scope="beac"'));
  assert.ok(!html.includes('cc-match-scoreboard is-upcoming'),'unverified self fixture is not an ordinary match');
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
  assert.ok(!html.includes('teljes tabella nélkül'), 'source-coverage boilerplate does not clutter the match page');
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
  assert.ok(!html.includes('Jegyzőkönyv ↗'));
  assert.ok(html.includes('data-cc-mrsz-protocol="2330"'));
  const detail=vm.runInContext('ccMrszProtocolHtml_',ctx)(match);
  assert.ok(detail.includes('Imre Eszter'));
  assert.ok(!detail.includes('>Kezdő</span>'));
  assert.ok(!detail.includes('nem élő'));
  assert.ok(!detail.includes('MRSZ-jegyzőkönyvadatok'));
  assert.ok(detail.includes('is-captain'));
  assert.ok(detail.includes('>C</span>'));
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

test('Manager protocol role badges are concise and link checks remain independent',()=>{
 const badges=vm.runInContext('ccMrszProtocolBadgesHtml_',ctx)({designation:'CS',captain:true,libero:'L1'});
 assert.ok(badges.includes('sub-in'));
 assert.ok(badges.includes('sub-out'));
 assert.ok(badges.includes('>C</span>'));
 assert.ok(badges.includes('>L1</span>'));
 assert.ok(!badges.includes('>Csere</span>'));
});


test('Kandó Sport Club is the same team as Óbudai Egyetem-Kandó SC, but not Kandó II',()=>{
 const normalize=vm.runInContext('ccMrszNormPairName_',ctx);
 assert.equal(normalize('Kandó Sport Club'),normalize('Óbudai Egyetem-Kandó SC'));
 assert.notEqual(normalize('Kandó II'),normalize('Óbudai Egyetem-Kandó SC'));
 assert.equal(normalize('BTDSE Taksony'),normalize('Brózik Tibor Taksonyi Diáksport Egyesület'));
});
test('Men A October 14 Kandó–Taksony fixture and uploaded match merge into one',()=>{
 const label='Férfi Budapest I. osztály – A csoport';
 const fixture={competitionLabel:label,startsAt:'2026-10-14T18:30:00',homeName:'Óbudai Egyetem-Kandó SC',
  awayName:'BTDSE Taksony',homeSets:null,awaySets:null};
 const played={competitionLabel:label,startsAt:'2026-10-14T18:30:00+02:00',homeName:'Kandó Sport Club',
  awayName:'Brózik Tibor Taksonyi Diáksport Egyesület',homeSets:3,awaySets:1};
 fixtures.push(fixture);matches.push(played);
 try{
  const list=ctx.qa.merge(label).filter(m=>m.startsAt.startsWith('2026-10-14'));
  assert.equal(list.length,1);
  assert.equal(list[0].homeSets,3);
 }finally{fixtures.pop();matches.pop();}
});
test('Women I October 13 Kandó–Ráckeve fixture and score merge into one',()=>{
 const label='Női Budapest I. osztály';
 const fixture={competitionLabel:label,startsAt:'2026-10-13T20:30:00',homeName:'Óbudai Egyetem-Kandó SC',
  awayName:'Ráckeve',homeSets:null,awaySets:null};
 const played={competitionLabel:label,startsAt:'2026-10-13T20:30:00+02:00',homeName:'Kandó Sport Club',
  awayName:'Ráckeve',homeSets:3,awaySets:0};
 fixtures.push(fixture);matches.push(played);
 try{
  const list=ctx.qa.merge(label).filter(m=>m.startsAt.startsWith('2026-10-13T20:30'));
  assert.equal(list.length,1);
  assert.equal(list[0].homeSets,3);
 }finally{fixtures.pop();matches.pop();}
});
test('Manager protocol uses bold starter and dash where source has no court-entry status',()=>{
 const render=vm.runInContext('ccMrszProtocolTeamHtml_',ctx);
 const html=render({name:'BEAC',players:[{number:1,name:'Player A',designation:'K'},
  {number:2,name:'Player B',designation:'CS'},
  {number:3,name:'Player C'},
  {number:4,name:'Player D',captain:true},
  {number:5,name:'Player E',libero:'L2'}]});
 assert.ok(html.includes('<strong class="cc-protocol-starter">'));
 assert.ok(html.includes('is-no-entry'));
 assert.ok(html.includes('is-subs'));
 assert.ok(html.includes('>C</span>'));
 assert.ok(html.includes('>L2</span>'));
});

test('manually edited kickoff and team remain one fixture against uncorrected archival sources',()=>{
 const original=fixtures[0];
 const override={...original,source:'brsz',season:'2026/27',_ccManualOverride:true,
  startsAt:'2026-10-17T19:30:00+02:00',homeSets:3,awaySets:2,
  _ccOriginalStartsAt:original.startsAt,
  _ccOriginalHomeName:original.homeName,_ccOriginalAwayName:original.awayName};
 ctx.ccBrszEffectiveMatches_=[override];
 try{
  const rows=ctx.qa.merge('Női Budapest I. osztály');
  assert.equal(rows.length,1);
  assert.equal(rows[0].homeSets,3);
  assert.equal(rows[0].awaySets,2);
  assert.equal(rows[0].startsAt,override.startsAt);
 }finally{ctx.ccBrszEffectiveMatches_=[]}
});
test('manual correction schema is source preserving, manager-gated and auditable',()=>{
 const migration=fs.readFileSync('sql/competition_manual_match_overrides_v1.sql','utf8');
 assert.ok(migration.includes('public.cc_competition_match_overrides_v1'));
 assert.ok(migration.includes('public.cc_competition_match_override_audit_v1'));
 assert.ok(migration.includes("private.cc_manager_require_v1('competition.matches','edit',null)"));
 assert.ok(migration.includes('MATCH_VERSION_CONFLICT'));
 assert.ok(migration.includes("patch='{}'::jsonb"));
 assert.ok(migration.includes('enable row level security'));
 assert.ok(migration.includes("from public, anon, authenticated;"));
 assert.ok(!migration.includes('update public.competition_source_matches set'));
 assert.ok(!migration.includes('update public.cc_competition_mrsz_screenshot_v1 set'));
});

test('Admin match editor has a lazy, protected history read and a reversible audit trail',()=>{
 const history=fs.readFileSync('sql/competition_manual_match_history_v1.sql','utf8');
 assert.ok(history.includes("private.cc_manager_require_v1('competition.matches','edit',null)"));
 assert.ok(history.includes("private.cc_competition_match_source_v1(p_source_system,p_season,p_source_key)"));
 assert.ok(history.includes("a.source_system=p_source_system and a.season=p_season"));
 assert.ok(history.includes('limit 30'));
 assert.ok(history.includes('from public,anon,authenticated'));
 assert.ok(js.includes('cc_manager_competition_match_override_history_v1'));
 assert.ok(js.includes("$('#ccMHistory')?.addEventListener('toggle'"));
 assert.ok(js.includes('ccSourceMatchHistoryHtml_(items)'));
});
test('Manual league match history safely escapes display names and edits',()=>{
 const begin=js.indexOf('  function ccSourceMatchHistoryHtml_(');
 const end=js.indexOf('  function ccOpenSourceMatchEditor_(',begin);
 assert.ok(begin>0&&end>begin);
 const escaping=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const runner=new Function('esc','ccMrszLocalKickoff_',js.slice(begin,end)+';return ccSourceMatchHistoryHtml_;')(
   escaping,x=>({date:String(x||'').slice(0,10),time:String(x||'').slice(11,16)}));
 const rendered=runner([{
  action:'save',happenedAt:'2026-10-18T10:30:00Z',
  actor:'<img src=x onerror=alert(1)>',
  oldPatch:{venue:'Régi csarnok'},
  newPatch:{venue:'<script>alert(1)</script>'}
 }]);
 assert.ok(rendered.includes('&lt;img'));
 assert.ok(rendered.includes('&lt;script&gt;'));
 assert.ok(!rendered.includes('<img'));
 assert.ok(!rendered.includes('<script>'));
 assert.ok(rendered.includes('Kézi módosítás'));
 const restored=runner([{action:'reset',newPatch:{},oldPatch:{venue:'Valami'},actor:'Admin'}]);
 assert.ok(restored.includes('Forrás visszaállítása'));
 assert.ok(runner([]).includes('még nincs kézi módosítás'));
});
