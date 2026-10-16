/* Exercise the actual Manager league/match-panel helpers with isolated data. */
'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync('app.js','utf8');
const women='Női Budapest I. osztály',womenB='Női Budapest II. osztály – B csoport';
const menA='Férfi Budapest I. osztály – A csoport',menB='Férfi Budapest I. osztály – B csoport';
const start=source.indexOf('  function ccMatchesDefaultLeague_()');
const stop=source.indexOf('  function renderCompetitionMatchCards_()',start);
assert.ok(start>0&&stop>start,'Unified Manager match-page helpers must exist');
const code=source.slice(start,stop);
function harness(opts={}){
 const state={managerStandingsContext:opts.team||''};
 const selection=opts.selected||'';
 const photo={loaded:opts.loaded!==false,error:opts.error||'',
  tables:[{competitionLabel:menA,rows:[{teamName:'MAFC-Kármán',position:1}]},
          {competitionLabel:womenB,rows:[{teamName:'MTK Budapest kék',position:1}]}]};
 const ctx={rows:[],table:[],fixture:[]};
 const api=new Function('teamFilterIds_','text','state','ccMrszMenGroup_','ccCurrentLeague_','ccMrszPhotoState_',
   'ccLeagueContextSelectHtml_','esc','ccMrszMainPhotoTableHtml_','ccMrszLeagueFixturePanelHtml_','ccMrszCoverageLabel_',
   code+';return {ccMatchesDefaultLeague_,ccLeagueMatchesContextHtml_};')(
   ()=>opts.selectedTeamIds||[],x=>String(x??''),state,opts.menGroup||'B',
   fallback=>selection||fallback,photo,label=>'<select id="ccLeagueContextSelect"><option>'+label+'</option></select>',
   x=>String(x??''),t=>{ctx.table.push(t.competitionLabel);return '<article class="ms-standings-card">TABLE:'+t.competitionLabel+'</article>'},
   group=>{ctx.fixture.push(group);return '<article class="ms-match-panel">FIXTURE:'+group+'</article>';},
   snapshot=>snapshot?'MRSZ · mentett tabella':'MRSZ · Nincs mentett tabella');
 return {...api,ctx,state};
}
test('default context follows a single BEAC team, without guessing group membership',()=>{
 assert.equal(harness().ccMatchesDefaultLeague_(),women);
 assert.equal(harness({selectedTeamIds:['10000000-0000-4000-8000-000000000002']}).ccMatchesDefaultLeague_(),womenB);
 assert.equal(harness({team:'10000000-0000-4000-8000-000000000003'}).ccMatchesDefaultLeague_(),menB);
 assert.equal(harness({team:'10000000-0000-4000-8000-000000000003',menGroup:'A'}).ccMatchesDefaultLeague_(),menA);
});
test('a selected external league updates the only table and fixture context together',()=>{
 const h=harness({selected:menA});
 const html=h.ccLeagueMatchesContextHtml_();
 assert.deepEqual(h.ctx.table,[menA]);
 assert.deepEqual(h.ctx.fixture,[menA]);
 assert.ok(html.includes('TABLE:'+menA));
 assert.ok(html.includes('FIXTURE:'+menA));
 assert.ok(!html.includes('FIXTURE:'+womenB));
});
test('missing official standings never fall back to another competition',()=>{
 const h=harness({selected:menB});
 const html=h.ccLeagueMatchesContextHtml_();
 assert.deepEqual(h.ctx.table,[]);
 assert.deepEqual(h.ctx.fixture,[menB]);
 assert.ok(html.includes('Nincs mentett tabella'));
 assert.ok(!html.includes('TABLE:'+menA));
});
test('missing snapshot and read errors do not manufacture fixtures or results',()=>{
 for(const options of [{loaded:false},{error:'TEMPORARY_ERROR'}]){
  const h=harness(options);
  const html=h.ccLeagueMatchesContextHtml_();
  assert.deepEqual(h.ctx.table,[]);
  assert.deepEqual(h.ctx.fixture,[]);
  assert.ok(html.includes(options.error||'betöltése'));
 }
});
test('match-page markup retains real BEAC roster while dropping parallel league panels',()=>{
 const begin=source.indexOf('  function renderCompetitionMatchCards_()');
 const end=source.indexOf('  function renderEventList(',begin);
 const rendered=source.slice(begin,end);
 assert.ok(rendered.includes('ccLeagueMatchesContextHtml_()'));
 assert.ok(rendered.includes("ccSetLeagueContext_(e.target.value)"));
 assert.ok(rendered.includes("data-league-match-scope"));
 assert.ok(rendered.includes("ccCompetitionEventWithRosterHtml_(e,'match')"));
 assert.ok(rendered.includes("bindEventDetailActions()"));
 assert.ok(!rendered.includes("standingsSection_('events')"));
 assert.ok(!rendered.includes('ccLeagueFixturePanelHtml_()'));
 assert.ok(!rendered.includes('ccLeagueGroupSelect'));
});
test('one shared scope and result provenance are visible in league scoreboard builder',()=>{
 assert.ok(source.includes("ccLeagueMatchScope_=button.dataset.leagueMatchScope==='all'?'all':'beac'"));
 assert.ok(source.includes("meta:m.isPhoto?(table&&table.partial!==true?'2026.10.14-i mentett eredmény'"));
 assert.ok(source.includes("m.isFixture?'2026.10.01-i mentett kiírás'"));
 assert.ok(source.includes('const reason=ccMrszMatchReviewReason_(m,tableRows,!!table&&table.partial!==true,conflicts)'));
});
