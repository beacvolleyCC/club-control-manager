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
 const state={managerStandingsContext:opts.team||'',teams:[{id:'10000000-0000-4000-8000-000000000001',name:'BEAC Női 1',active:true},{id:'10000000-0000-4000-8000-000000000002',name:'BEAC Női 2',active:true},{id:'10000000-0000-4000-8000-000000000003',name:'BEAC Férfi',active:true}]};
 const selection=opts.selected||'';
 const photo={loaded:opts.loaded!==false,error:opts.error||'',
  tables:[{competitionLabel:menA,rows:[{teamName:'MAFC-Kármán',position:1}]},
          {competitionLabel:womenB,rows:[{teamName:'MTK Budapest kék',position:1}]}]};
 const ctx={rows:[],table:[],fixture:[]};
 const api=new Function('teamFilterIds_','text','state','ccMrszMenGroup_','ccCurrentLeague_','ccMrszPhotoState_',
   'ccLeagueContextSelectHtml_','esc','ccMrszMainPhotoTableHtml_','ccMrszLeagueFixturePanelHtml_','ccMrszCoverageLabel_',
   'let ccMatchesSelectedGroup_="";let ccLeagueMatchScope_="beac";'+code+';return {ccMatchesDefaultLeague_,ccLeagueMatchesContextHtml_,ccMatchesTeamSelectHtml_};')(
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
test('default selected BEAC team determines league until a separate explicit match-page selection',()=>{
 const h=harness({selected:menA,team:'10000000-0000-4000-8000-000000000003',
  selectedTeamIds:['10000000-0000-4000-8000-000000000003']});
 const html=h.ccLeagueMatchesContextHtml_();
 assert.deepEqual(h.ctx.table,[]);
 assert.deepEqual(h.ctx.fixture,[menB],'matches follow the BEAC team context instead of the previously selected league');
 assert.ok(html.includes('FIXTURE:'+menB));
 assert.ok(!html.includes('TABLE:'));
 assert.ok(html.includes('ccLeagueContextSelect'),'Admin may select other league groups explicitly');
});
test('matches team picker has one selector and supports all three BEAC teams',()=>{
 const h=harness({selectedTeamIds:['10000000-0000-4000-8000-000000000002']});
 const html=h.ccMatchesTeamSelectHtml_();
 assert.ok(html.includes('id="ccMatchTeamSelect"'));
 assert.ok(html.includes('BEAC Női 1'));
 assert.ok(html.includes('BEAC Női 2'));
 assert.ok(html.includes('BEAC Férfi'));
 assert.equal((html.match(/<select/g)||[]).length,1);
});
test('missing photo snapshots show a neutral source state, without leaking another standings table',()=>{
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
 assert.ok(rendered.includes("ccMatchesTeamSelectHtml_()"));
 assert.ok(rendered.includes("id=\"ccMatchesAuditToggle\""));
 assert.ok(rendered.includes("id=\"ccMatchesOpenStandings\""));
 assert.ok(rendered.includes("ccBindMrszProtocol_()"));
 assert.ok(rendered.includes("setRoute('competition','standings')"));
 assert.ok(!rendered.includes('cc-mrsz-audit-tabs'));
 assert.ok(rendered.includes("data-league-match-scope"));
 assert.ok(rendered.includes("ccCompetitionEventWithRosterHtml_(e,'match')"));
 assert.ok(rendered.includes("bindEventDetailActions()"));
 assert.ok(!rendered.includes("standingsSection_('events')"));
 assert.ok(!rendered.includes('ccLeagueFixturePanelHtml_()'));
 assert.ok(!rendered.includes('ccLeagueGroupSelect'));
});
test('one shared scope and result provenance are visible in league scoreboard builder',()=>{
 assert.ok(source.includes("ccLeagueMatchScope_=button.dataset.leagueMatchScope==='all'?'all':'beac'"));
 assert.ok(source.includes("meta:'',"));
 assert.ok(source.includes('const hasBeac=matches'));
 assert.ok(source.includes("const scope=options.onlyBeac?'beac':options.forceAll?'all':hasBeac?ccLeagueMatchScope_:'all'"),'BEAC-only match pages must not reveal unrelated fixtures');
 assert.ok(source.includes('const reason=ccMrszMatchReviewReason_(m,tableRows,table?.partial===false,conflicts)'));
 assert.ok(source.includes("const noTableNote='';"));
});

test('standings and matches offer league filtering without duplicating the standings table',()=>{
 const st=source.slice(source.indexOf('  function renderManagerStandings_()'),source.indexOf('  function eventPlace('));
 assert.ok(st.includes('ccLeagueContextSelectHtml_(group)'));
 assert.ok(!st.includes('id="msContextSelect"'));
 assert.ok(!st.includes('id="msTeamSelect"'));
 assert.ok(st.includes("ccLeagueMatchScope_=button.dataset.leagueMatchScope==='all'?'all':'beac';renderManagerStandings_()"));
 const matches=source.slice(source.indexOf('  function renderCompetitionMatchCards_()'),source.indexOf('  function renderEventList('));
 assert.ok(matches.includes("ccLeagueMatchScope_=button.dataset.leagueMatchScope==='all'?'all':'beac'"));
});
test('protocol binds via multiple-element selector, not a single-element query',()=>{
 const begin=source.indexOf('  function ccBindMrszProtocol_()');
 const end=source.indexOf('  function ccMrszMergedLeagueMatches_',begin);
 const code=source.slice(begin,end);
 assert.ok(code.includes("$$('#viewContent [data-cc-mrsz-protocol]')"));
 assert.ok(code.includes("event.key==='Enter'"));
 assert.ok(code.includes("event.key===' '"));
 assert.ok(code.includes("event.target.closest('a,button,select,input')"));
});

test('full standings never narrow to a hidden persisted player selection',()=>{
 const st=source.slice(source.indexOf('  function renderManagerStandings_()'),source.indexOf('  function eventPlace('));
 assert.ok(st.includes('const selected=msSelectedRow_(rows);'), 'clicked overview team row can focus statistics without hiding league rows');
 assert.ok(st.includes('const displayRows=rows;'));
 assert.ok(!st.includes('const selected=rows.length?msSelectedRow_'));
});

test('BEAC event-id roster precedes read-only federation fixtures on match page',()=>{
 const section=source.slice(source.indexOf('  function renderCompetitionMatchCards_()'),source.indexOf('  function renderEventList('));
 assert.ok(section.indexOf("ccCompetitionEventWithRosterHtml_(e,'match')")<section.indexOf('ccLeagueMatchesContextHtml_()'));
 assert.ok(section.includes('ccBindTrainingRosterToggles_()'));
 assert.ok(source.includes("await loadEventRoster(id)"));
 assert.ok(source.includes('data-training-roster-toggle='));
});
