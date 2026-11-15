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
 assert.ok(cards.includes('Hely</th>'));
 assert.ok(!cards.includes('Hely*</th>'));
 assert.ok(!cards.includes("r.position)+'.*'"));
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

test('aggregate Meccsek league label and color use current configured team colors',()=>{
 const fun=slice('  function ccMatchLeagueTheme_(', '  function ccLeagueMatchesContextHtml_(');
 const ctx={
   text:x=>String(x??''),
   state:{teams:[
      {id:'10000000-0000-4000-8000-000000000001',color:'#A06A31'},
      {id:'10000000-0000-4000-8000-000000000002',color:'#FFF100'},
      {id:'10000000-0000-4000-8000-000000000003',color:'#3262B0'}]}
 };
 vm.createContext(ctx);vm.runInContext(fun+'\nthis.get=ccMatchLeagueTheme_;',ctx);
 const w1=ctx.get('Női Budapest I. osztály');
 const w2=ctx.get('Női Budapest II. osztály – B csoport');
 const mA=ctx.get('Férfi Budapest I. osztály – A csoport');
 const mB=ctx.get('Férfi Budapest I. osztály – B csoport');
 assert.deepEqual([w1.short,w2.short,mA.short,mB.short],['Női I.','Női II/B','Férfi I/A','Férfi I/B']);
 assert.equal(w1.color,'#A06A31');
 assert.equal(w2.color,'#FFF100');
 assert.equal(mA.color,'#3262B0');
 assert.equal(mB.color,'#3262B0');
 assert.equal(ctx.get('Nem létező bajnokság'),null);
 ctx.state.teams[0].color='red;background:url(https://unsafe)';
 assert.equal(ctx.get('Női Budapest I. osztály').color,'#B76508','Reject malformed color input');
});
test('league coloring is restricted to aggregate Meccsek, preserving team-specific cards',()=>{
 const context=slice('  function ccLeagueMatchesContextHtml_()', '  function renderCompetitionMatchCards_()');
 assert.ok(context.includes('const allTeams=selectedTeamIds.length===0&&!ccMatchesSelectedGroup_'));
 assert.ok(context.includes('categoryAccent:allTeams'));
 assert.ok(context.includes('Női Budapest II. osztály – B csoport'));
 const panel=slice('  function ccMrszLeagueFixturePanelHtml_(', '  // Read-only cross-league audit');
 assert.ok(panel.includes('options.categoryAccent?ccMatchLeagueTheme_(group):null'));
 assert.ok(panel.includes('categoryTheme:leagueTheme'));
 assert.ok(panel.includes('cc-match-league-accent'));
 assert.ok(!panel.includes('state.teams.filter('));
});

test('Manager Overview and full standings read the current form without replacing displayed table ranks',()=>{
 const standings=slice('  function standingsCard_(', '  function ccOpenStandingsContext_(');
 const manager=slice('  function renderManagerStandings_()', '  function eventPlace(');
 assert.ok(standings.includes('ccStandingsTeamInnerHtml_(data.group,r)'));
 assert.ok(standings.includes('ccMrszStatPosition_(r.position,data.snapshot)'));
 assert.ok(manager.includes('ccStandingsTeamInnerHtml_(group,r)'));
 assert.ok(manager.includes('ccManagerCanonicalProvisionalRows_(group)'));
 const helpers=slice('  function ccCurrentStandingsFormParts_(', '  // Check only explicitly saved set points.');
 assert.ok(helpers.includes('ccFormCardTeam_(league,name)'));
 assert.ok(helpers.includes('Aktuális csapatforma, nem helyezésváltozás'));
 assert.ok(helpers.includes('cc-standings-dots'));
 assert.ok(helpers.includes("slice(-5)"));
 assert.ok(!helpers.includes('standingsForContext_'));
});
test('Manager standings form is league-specific and leaves missing teams without invented arrows',()=>{
 const sources=slice('  function ccFormCardTeam_(', '  // Check only explicitly saved set points.');
 const ctx={
  text:x=>String(x??''),esc:x=>String(x??''),
  ccMrszNormPairName_:x=>String(x??'').toLowerCase().replace(/[^a-z0-9]/g,''),
  ccMrszPhotoState_:{canonicalFormCards:[
   {competitionLabel:'Női Budapest I. osztály',teamName:'BEAC',rank:3,lastFive:['W','L','W'],trend:'up'},
   {competitionLabel:'Női Budapest II. osztály – B csoport',teamName:'BEAC II.',rank:1,lastFive:['L'],trend:'down'}
  ]},
  msLogoHtml_:(id,n)=>'<img alt="'+n+'">',
  ccMrszRecordNoticeHtml_:()=>''
 };
 vm.createContext(ctx);
 vm.runInContext(sources+'\nthis.parts=ccCurrentStandingsFormParts_;this.cell=ccStandingsTeamInnerHtml_;',ctx);
 const row={teamName:'BEAC',sourceTeamId:'123'};
 const parts=ctx.parts('Női Budapest I. osztály','BEAC');
 assert.ok(parts.arrow.includes('cc-standings-form-arrow up'));
 assert.equal((parts.dots.match(/cc-form-dot /g)||[]).length,3);
 const cell=ctx.cell('Női Budapest I. osztály',row);
 assert.ok(cell.indexOf('cc-standings-form-arrow')<cell.indexOf('<strong>BEAC</strong>'));
 assert.ok(cell.indexOf('<strong>BEAC</strong>')<cell.indexOf('cc-standings-dots'));
 assert.ok(!cell.includes('3.</span>'),'Rank must stay in the existing first column');
 assert.ok(!ctx.parts('Férfi Budapest I. osztály – B csoport','BEAC').arrow);
 assert.ok(!ctx.cell('Férfi Budapest I. osztály – B csoport',row).includes('cc-standings-dots'));
});
