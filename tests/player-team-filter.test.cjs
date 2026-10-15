/* Player team filters: exercise actual roster rows and grouped output.
 * Run: node tests/player-team-filter.test.cjs
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const src=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
const css=fs.readFileSync(path.join(__dirname,'..','styles.css'),'utf8');
function extract(first,next){
  const from=src.indexOf('  function '+first+'(');
  const end=src.indexOf('  function '+next+'(',from);
  assert.ok(from>=0&&end>from,'Missing function boundaries for '+first);
  return src.slice(from,end);
}
// Exercise actual application functions against synthetic player records.
// The fixture includes a secondary-team membership and an unassigned player.
const teamA={id:'team-a',legacyTeamId:'old-a',name:'BEAC Női I.',active:true};
const teamB={id:'team-b',legacyTeamId:'old-b',name:'BEAC Női II.',active:true};
const teamC={id:'team-c',legacyTeamId:'old-c',name:'BEAC Férfi',active:true};
const state={
  teams:[teamA,teamB,teamC],
  teamFilters:{players:[]},playerSearch:'',playerMedical:'all',
  playerListMode:'all',playerSort:'name',playerSortDir:'asc',
  players:[
    {playerId:'p1',name:'Anna',teamId:teamA.id,teamName:teamA.name,medical:'valid'},
    {playerId:'p2',name:'Bori',teamId:teamB.id,teamName:teamB.name,medical:'valid'},
    {playerId:'p3',name:'Csaba',teamId:teamC.id,teamName:teamC.name,medical:'expired'},
    {playerId:'p4',name:'Dora',teamId:teamA.id,teamName:teamA.name,memberships:[{teamId:teamB.id,teamName:teamB.name}],medical:'valid'},
    {playerId:'p5',name:'Eszter',teamId:'',teamName:'',medical:'valid'}
  ]
};
const funcCode=extract('teamFilterIds_','teamFilterMatch_')+
  extract('playerMatchesTeamFilter_','playerMetaPills_')+
  extract('playerGroupedListHtml_','playerTeamTabs_');
const helpers=new Function('state','text','teamById','medicalFilterMatch_','comparePlayerSort_','playerLegacyRow_','emptyInline','esc',funcCode+
  ';return {playerRows,playerGroupedListHtml_,playerMatchesTeamFilter_};')(
  state, x=>String(x??''), id=>state.teams.find(t=>t.id===id)||null,
  p=>state.playerMedical==='all'||p.medical===state.playerMedical,
  (a,b)=>a.name.localeCompare(b.name,'hu'),
  p=>'<i data-player-id="'+p.playerId+'"></i>',
  value=>'<em>'+value+'</em>',x=>String(x??'')
);
function selected(ids,expected){
  state.teamFilters.players=ids;
  const actual=helpers.playerRows().map(p=>p.playerId);
  assert.deepEqual(actual,expected,'Selected teams '+JSON.stringify(ids));
}
selected([teamA.id],['p1','p4']);
selected([teamB.id],['p2','p4']);
selected([teamC.id],['p3']);
selected([teamA.id,teamB.id],['p1','p2','p4']);
selected([],['p1','p2','p3','p4','p5']);
state.teamFilters.players=[teamA.id,teamB.id];
state.playerMedical='valid';state.playerSearch='dor';
assert.deepEqual(helpers.playerRows().map(p=>p.playerId),['p4'],
  'Search and medical filter compose with team selection');
state.playerSearch='';state.playerMedical='all';
state.teamFilters.players=[teamB.id];state.playerListMode='grouped';
const grouped=helpers.playerGroupedListHtml_(helpers.playerRows());
assert.ok(grouped.includes('data-player-id="p2"'),'Primary B player rendered');
assert.ok(grouped.includes('data-player-id="p4"'),'Secondary B player rendered in B-only grouped view');
assert.equal((grouped.match(/data-player-id="p4"/g)||[]).length,1,'No duplicate secondary-team card');
state.teamFilters.players=[teamA.id,teamB.id];
const both=helpers.playerGroupedListHtml_(helpers.playerRows());
assert.equal((both.match(/data-player-id="p4"/g)||[]).length,1,'No duplicated card in grouped multiselect');
// A scrollable horizontal chip tab container must not clip the absolute dropdown.
assert.match(css,/\.legacy-player-team-tabs\.multi\s*\{[^}]*overflow\s*:\s*visible\s*;?/s,
  'Dropdown wrapper allows team selection menu to escape');
console.log('PASS Manager player-team filters: single/multi/all, search, medical, grouped, dropdown');
