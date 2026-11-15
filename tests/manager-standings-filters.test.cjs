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
test('Overview uses the shared LIVE canonical forms and stats, never archived snapshot ranks',()=>{
 const model=slice('  function ccOverviewStandingsModel_(', '  function standingsLogo_(');
 const cards=slice('  function standingsCard_(', '  function ccOpenStandingsContext_(');
 assert.ok(model.includes('canonicalFormCards'));
 assert.ok(model.includes('canonicalTeamStats'));
 assert.ok(model.includes('officialRankVerified:false'));
 assert.ok(!model.includes('ccMrszPhotoState_.tables.find'));
 assert.ok(!model.includes('ccOverviewLeagueInsights_'));
 assert.ok(!model.includes('standingsForContext_'));
 assert.ok(cards.includes('Hely*'));
 assert.ok(cards.includes('Részleges eredményekből számított helyezés'));
 assert.ok(cards.includes('cc-overview-standings-disclaimer'));
 assert.ok(cards.includes('data-overview-men-group'));
 assert.ok(cards.includes('data-overview-open-standings'));
});
test('overview fetch updates itself when standings snapshot arrives',()=>{
 const loader=slice('  async function ccLoadMrszPhotoSnapshot_(){','  let ccMrszMenGroup_');
 assert.ok(loader.includes("ccRouteIs_('competition','overview')"));
 assert.ok(loader.includes('renderOverview()'));
 const overview=slice('  function renderOverview(){','  function notificationRecipientById(');
 assert.ok(overview.includes('void ccLoadMrszPhotoSnapshot_()'));
});
test('standalone standings shows all teams after removing hidden filter and never invents alphabetic ranks',()=>{
 const view=slice('  function renderManagerStandings_(){','  function eventPlace(');
 assert.ok(view.includes('const selected=msSelectedRow_(rows);'), 'selected overview team reveals focused statistics while retaining the full league table');
 assert.ok(view.includes('const displayRows=rows;'));
 assert.ok(view.includes('_ccUnranked:true'), 'unranked roster stays visible with no invented standings counters');
 const other=slice('  function ccMrszMenGroupTableHtml_(){','  function ccMrszMenGroupSwitcherHtml_');
 assert.ok(other.includes("Number(r.position)>0&&Number(r.played)>0"));
});
test('canonical Overview separates mens A/B and BEAC II; zero-result teams never get a position',()=>{
 const f=slice('  function ccOverviewStandingsModel_(', '  function standingsLogo_(');
 const ctx={
  text:x=>String(x??'').trim(),
  ccMrszNormPairName_:n=>String(n??'').toLowerCase().replace(/[^a-z0-9]/g,''),
  ccIsBeacLeagueTeam_:n=>String(n).toLowerCase().startsWith('beac'),
  ccMrszMenGroup_:'B',
  ccMrszPhotoState_:{loaded:true,canonicalMatches:[],canonicalFormCards:[
   {competitionLabel:'Férfi Budapest I. osztály – B csoport',teamKey:'beac',teamName:'BEAC',rank:1,played:3,points:5,won:2,lost:1},
   {competitionLabel:'Férfi Budapest I. osztály – B csoport',teamKey:'pdse',teamName:'PDSE',rank:null,played:0,points:0,won:0,lost:0},
   {competitionLabel:'Férfi Budapest I. osztály – A csoport',teamKey:'mafc',teamName:'MAFC-Kármán',rank:1,played:1,points:2,won:1,lost:0},
   {competitionLabel:'Női Budapest II. osztály – B csoport',teamKey:'beacii',teamName:'BEAC II.',rank:2,played:2,points:4,won:2,lost:0}
  ],canonicalTeamStats:[
   {competitionLabel:'Férfi Budapest I. osztály – B csoport',teamKey:'beac',played:3,wins:2,losses:1,setsFor:7,setsAgainst:3,pointsFor:237,pointsAgainst:218},
   {competitionLabel:'Férfi Budapest I. osztály – B csoport',teamKey:'pdse',played:0,wins:0,losses:0,setsFor:0,setsAgainst:0},
   {competitionLabel:'Női Budapest II. osztály – B csoport',teamKey:'beacii',played:2,wins:2,losses:0,setsFor:6,setsAgainst:0}
  ],tables:[{competitionLabel:'Férfi Budapest I. osztály – B csoport',rows:[{teamName:'BEAC',position:99}]}]}
 };
 vm.createContext(ctx);
 vm.runInContext(f+'\nthis.get=ccOverviewStandingsModel_;',ctx);
 const men=ctx.get('10000000-0000-4000-8000-000000000003');
 assert.equal(men.rows.length,2);
 assert.equal(men.rows[0].teamName,'BEAC');
 assert.equal(men.rows[0].position,1);
 assert.equal(men.rows[0].tablePoints,5);
 assert.equal(men.rows[0].setsFor,7);
 assert.equal(men.rows[0].pointsFor,237);
 assert.equal(men.rows[0].officialRankVerified,false);
 assert.equal(men.rows[1].position,null,'No fake rank before first result');
 assert.ok(men.source.includes('részleges'));
 ctx.ccMrszMenGroup_='A';
 const menA=ctx.get('10000000-0000-4000-8000-000000000003');
 assert.equal(menA.rows.length,1);
 assert.equal(menA.rows[0].teamName,'MAFC-Kármán');
 const womenII=ctx.get('10000000-0000-4000-8000-000000000002');
 assert.equal(womenII.rows.length,1);
 assert.equal(womenII.rows[0].teamName,'BEAC II.');
 assert.equal(womenII.rows[0].tablePoints,4);
 ctx.ccMrszPhotoState_.canonicalFormCards=[];
 const failClosed=ctx.get('10000000-0000-4000-8000-000000000003');
 assert.equal(failClosed.rows.length,0,'Never fall back to stale photo ranks');
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
