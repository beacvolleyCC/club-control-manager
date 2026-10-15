const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const src=fs.readFileSync('app.js','utf8');
const slice=(from,to)=>{
 const s=src.indexOf(from),e=src.indexOf(to,s+from.length);
 assert.ok(s>=0&&e>s,'Missing function boundary '+from+' / '+to);
 return src.slice(s,e);
};
const playersSection=slice('  function playerSortValue_(', '  function playerMetaPills_(');
test('all players filters, selection and sorting persist through rerenders',()=>{
 const view=slice('  function renderPlayers(){','  function playerOverviewHtml_(');
 const actions=slice('  function bindPlayerListActions_(){','  function renderPlayers(){');
 assert.ok(!view.includes("state.playerListMode='all'"));
 for(const id of ['playerListMode','playerSearch','playerSort','playerSortDir','playerMedicalFilter','playerFiltersToggle'])
  assert.ok(view.includes('id="'+id+'"'),id+' missing');
 assert.ok(view.includes("playerGroupedListHtml_(rows)"));
 assert.ok(actions.includes("state.playerListMode=e.target.value==='grouped'"));
 assert.ok(actions.includes("replacement.focus({preventScroll:true})"));
 assert.ok(actions.includes('replacement.setSelectionRange(selectionStart,selectionEnd)'));
 assert.ok(actions.includes("ccRouteIs_('competition','players')"));
});
test('team multiselect preserves state and includes all-teams reset on every interaction',()=>{
 const team=slice('  function teamFilterIds_(', '  function overviewContextTeams_(');
 assert.ok(team.includes("details.isConnected&&state.teamFilterOpen"));
 assert.ok(team.includes("all?.addEventListener('change',()=>{state.teamFilters[scope]=[]"));
 assert.ok(team.includes('items.filter(i=>i.checked).map(i=>i.value)'));
});
test('jersey sort never interprets missing numbers as jersey zero',()=>{
 assert.ok(playersSection.includes("text(p.jerseyNo)!==''"));
});
test('overview and match screens share official archived MRSZ tables, not empty BRSZ placeholders',()=>{
 const model=slice('  function ccOverviewStandingsModel_(', '  function standingsLogo_(');
 const cards=slice('  function standingsCard_(', '  // ---------------------------------------------------------------------------');
 assert.ok(model.includes('ccMrszPhotoState_.tables.find'));
 assert.ok(model.includes('ccStandingsPhotoTeamRows_(snapshot)'));
 assert.ok(model.includes("r.position"));
 assert.ok(model.includes('played>0||points>0'));
 assert.ok(cards.includes('ccOverviewStandingsModel_(contextTeamId)'));
 assert.ok(cards.includes('data-overview-men-group'));
 assert.ok(cards.includes('data-overview-open-standings'));
 assert.ok(cards.includes("contexts.map(standingsCard_)"));
 assert.ok(cards.includes('ccOpenStandingsContext_'));
 assert.ok(cards.includes("setRoute('competition','standings')"));
});
test('overview fetch updates itself when standings snapshot arrives',()=>{
 const loader=slice('  async function ccLoadMrszPhotoSnapshot_(){','  let ccMrszMenGroup_');
 assert.ok(loader.includes("ccRouteIs_('competition','overview')"));
 assert.ok(loader.includes('renderOverview()'));
 const overview=slice('  function renderOverview(){','  function notificationRecipientById(');
 assert.ok(overview.includes('void ccLoadMrszPhotoSnapshot_()'));
});
test('standalone standings honors team filter for photographic league snapshot and never invents alphabetic ranks',()=>{
 const view=slice('  function renderManagerStandings_(){','  function eventPlace(');
 assert.ok(view.includes('const selected=rows.length?msSelectedRow_(rows):null;'));
 assert.ok(view.includes('const displayRows=selected?rows.filter'));
 assert.ok(view.includes('!r.provisionalAlphabetical'));
 const other=slice('  function ccMrszMenGroupTableHtml_(){','  function ccMrszMenGroupSwitcherHtml_');
 assert.ok(other.includes("Number(r.position)>0&&Number(r.played)>0"));
});
test('snapshot choice shows actual known rows and discloses missing male B group',()=>{
 const functions=slice('  function ccOverviewStandingsModel_(', '  function standingsLogo_(');
 const ctx={
 text:x=>String(x??'').trim(),num:x=>Number(x)||0,
 ccMrszMenGroup_:'A',
 ccMrszPhotoState_:{loaded:true,tables:[{competitionLabel:'Férfi Budapest I. osztály – A csoport',rows:[{position:1,teamName:'MAFC',played:1}]}]},
 ccStandingsPhotoTeamRows_:x=>x.rows,
 standingsForContext_:()=>[{teamName:'Férfi csapat',position:null,played:0,tablePoints:0}]
 };
 vm.createContext(ctx);
 vm.runInContext(functions+'\nthis.get=ccOverviewStandingsModel_;',ctx);
 assert.equal(ctx.get('10000000-0000-4000-8000-000000000003').rows.length,1);
 ctx.ccMrszMenGroup_='B';
 assert.equal(ctx.get('10000000-0000-4000-8000-000000000003').rows.length,0);
});
test('match screen binds one selected league table, preserves BEAC event details and overview A/B controls',()=>{
 const match=slice('  function renderCompetitionMatchCards_(){','  function renderEventList(');
 assert.ok(match.includes('ccLeagueMatchesContextHtml_()'));
 assert.ok(!match.includes("standingsSection_('events')"));
 assert.ok(match.includes('bindOverviewStandings_();'));
 const bind=slice('  function bindOverviewStandings_(){','  function standingsSection_(');
 for(const key of ['data-overview-standings-team','data-overview-open-standings','data-overview-men-group'])
   assert.ok(bind.includes(key));
});
