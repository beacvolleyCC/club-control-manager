const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('app.js','utf8');
const css=fs.readFileSync('styles.css','utf8');
const begin=source.indexOf('// Competition training inline roster; RSVP only');
const end=source.indexOf('  function renderCompetitionTrainingCards_()',begin);
const miniBegin=source.indexOf('  // RSVP is a visual default, never a persisted presence marking.');
const miniEnd=source.indexOf('  function ccSyncCompetitionRsvpPreview_',miniBegin);
assert.ok(begin>0&&end>begin&&miniBegin>0&&miniEnd>miniBegin);
const rosterSource=source.slice(begin,end),rowSource=source.slice(miniBegin,miniEnd);
const esc=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const players=[
  {playerId:'g11',name:'Jövő Tizenegy',position:'Feladó',status:'going',jerseyNo:11},
  {playerId:'g3',name:'Jövő Három',position:'Center',status:'going',jerseyNo:3},
  {playerId:'n8',name:'Nem jövő Nyolc',position:'Szélső',status:'not_going',jerseyNo:8},
  {playerId:'n2',name:'Nem jövő Kettő',position:'Átló',status:'not_going',jerseyNo:2},
  {playerId:'u5',name:'Nincs válasz Öt',position:'Liberó',status:'unknown',jerseyNo:5},
  {playerId:'u0',name:'Nincs mezszám <script>X</script>',position:null,status:null}
];
const ctx={
  Set,Map,state:{eventRosterCache:new Map()},
  text:x=>String(x??'').trim(),esc,num:x=>Number(x)||0,
  enrichPlayer_:p=>p,avatarHtml:()=>'<span class="cc-avatar">A</span>',
  initials:x=>String(x??'').split(/\s+/).filter(Boolean).slice(0,2).map(v=>v[0]).join('')||'?',
  medicalState_:()=>({cls:'valid',label:'Érvényes'}),fmtDate:()=> '2027.01.01',
  ccEventCardHtml_:()=>'<button data-event-id="test">Esemény</button>',
  eventTeamId:()=> 'team',teamById:()=>({name:'BEAC'}),
  ccEventOpponent_:()=> 'UTE',competitionResultByEvent_:()=>null,
  ccTeamRosterSize_:()=>14,isEventPast:()=>false,
  ccMatchScoreboardHtml_:(_m,o)=>'<button class="cc-match-scoreboard" data-event-id="'+o.eventId+'">Meccs</button>',
  ccEventCanEdit_:()=>true,eventStart:()=>new Date('2026-01-01T00:00:00Z'),
  findEventById:id=>({id,status:'active'}),configured:()=>true,
  ccBindCompetitionRoster_:()=>{},loadEventRoster:async()=>players,
  CSS:{escape:s=>s},document:{querySelector:()=>null,querySelectorAll:()=>[]}
};
vm.createContext(ctx);
vm.runInContext(rowSource+'\n'+rosterSource+'\nthis.qa={order:ccRosterSortedByResponse_,small:ccTrainingInlinePreviewHtml_,detail:ccTrainingInlineRosterHtml_,row:ccCompactRosterRowHtml_,preview:ccRosterPreviewState_,item:ccCompetitionEventWithRosterHtml_,toggle:ccToggleTrainingInlineRoster_};',ctx);
test('RSVP ordering: going first, then not going, then unanswered, jersey numeric ascending',()=>{
  const ids=ctx.qa.order(players).map(p=>p.playerId);
  assert.deepEqual([...ids],['g3','g11','n2','n8','u5','u0']);
  const html=ctx.qa.small(players,'ev',true,true);
  const pos=ids.map(id=>html.indexOf('data-roster-att-slider="'+id+'"'));
  assert.ok(pos.every(n=>n>=0));
  assert.deepEqual(pos,[...pos].sort((a,b)=>a-b));
});
test('small foldout has avatar, visible name, jersey, slider and profile triangle only',()=>{
  const html=ctx.qa.small(players,'ev',true,true);
  for(const cls of ['cc-inline-avatar','cc-inline-name','cc-inline-player-number','cc-compact-roster-presence','cc-compact-roster-open'])assert.ok(html.includes(cls));
  assert.ok(html.includes('#3')&&html.includes('#11'));
  assert.ok(html.includes('Jövő Három</strong>'),'name should be visible beside jersey number');
  assert.ok(!html.includes('cc-compact-roster-medical'));
  assert.ok(!html.includes('cc-compact-roster-source'));
  assert.ok(!html.includes('Feladók'));
  assert.ok(html.includes('data-roster-profile-open="g3"'));
});
test('RSVP tint stays subtle with green, red, neutral and unknown last',()=>{
  const html=ctx.qa.small(players,'ev',true,true);
  for(const v of ['going','not-going','none'])assert.ok(html.includes('cc-inline-player '+v));
  assert.ok(css.includes('.cc-inline-player.going{background:rgba(54,155,94,.07)'));
  assert.ok(css.includes('.cc-inline-player.not-going{background:rgba(200,70,82,.06)'));
  assert.ok(css.includes('.cc-inline-player.none{background:rgba(130,140,150,.07)'));
});
test('missing jersey shows a dash and name remains safely escaped',()=>{
  const html=ctx.qa.small(players,'ev',true,true);
  assert.ok(html.includes('Nincs mezszám &lt;script&gt;X&lt;/script&gt;</strong>'));
  assert.ok(html.includes('title="Mezszám">–</span>'));
  assert.ok(!html.includes('<script>'));
});
test('detailed event still has identifying information, doctor status and editable attendance, no position grouping',()=>{
  const html=ctx.qa.detail(players,'event-1',true,true);
  for(const k of ['cc-compact-roster-avatar','cc-compact-roster-jersey','cc-compact-roster-identity','cc-compact-roster-medical','cc-compact-roster-presence','cc-compact-roster-open'])assert.ok(html.includes(k),k);
  assert.ok(!html.includes('cc-compact-roster-heading'));
  assert.ok(!html.includes('Feladók'));
  assert.ok(html.includes('Jövő Három</strong>'));
  assert.ok(html.indexOf('Jövő Három</strong>')<html.indexOf('Nem jövő Kettő</strong>'));
  assert.ok(html.indexOf('Nem jövő Kettő</strong>')<html.indexOf('Nincs válasz Öt</strong>'));
  assert.ok(!html.includes('<script>'));
});
test('pre-event attendance sliders never persist from RSVP; actual attendance takes precedence',()=>{
  assert.equal(ctx.qa.preview({status:'going'}).state,'yes');
  assert.equal(ctx.qa.preview({status:'not_going'}).state,'no');
  assert.equal(ctx.qa.preview({status:'unknown'}).state,'none');
  assert.equal(ctx.qa.preview({status:'going'}).confirmed,false);
  assert.equal(ctx.qa.preview({status:'going',attendanceStatus:'absent'}).state,'no');
  assert.equal(ctx.qa.preview({status:'going',attendanceStatus:'absent'}).confirmed,true);
  assert.equal(ctx.qa.preview({status:'not_going',attendanceStatus:'present'}).state,'yes');
  const html=ctx.qa.small(players,'event-1',true,false);
  assert.ok(html.includes('data-slider-disabled="1"'));
  assert.ok(html.includes('data-slider-unconfirmed="1"'));
  assert.ok(source.includes("p_status:dbStatus??'clear'"));
});
test('both training and match cards show only Névsor in folded header',()=>{
  for(const kind of ['training','match']){
    const html=ctx.qa.item({id:'event-1'},kind);
    assert.ok(html.includes(kind==='match'?'data-event-id="event-1"':'data-event-id="test"'));
    if(kind==='match')assert.ok(html.includes('cc-match-scoreboard'),'match card uses scoreboard');
    assert.ok(html.includes('data-training-roster-toggle="event-1"'));
    assert.ok(html.includes('>Névsor</span>'));
    assert.ok(!html.includes('Névsor ·'));
  }
});
test('foldout loads current roster from service, on close does not write anything',async()=>{
  const id='event-2',holder={hidden:true,innerHTML:''};
  const button={attrs:{},setAttribute(k,v){this.attrs[k]=v},classList:{toggle(){}}};
  let reads=0,bound=0;
  ctx.document.querySelector=()=>holder;
  ctx.loadEventRoster=async(_id,opts)=>{reads++;assert.equal(opts,undefined);return players};
  ctx.ccBindCompetitionRoster_=()=>bound++;
  await ctx.qa.toggle(id,button);
  assert.equal(holder.hidden,false);
  assert.equal(button.attrs['aria-expanded'],'true');
  assert.equal(reads,1);assert.equal(bound,1);
  assert.ok(holder.innerHTML.includes('#3'));
  assert.ok(holder.innerHTML.includes('Jövő Három</strong>'));
  assert.ok(!holder.innerHTML.includes('Feladók'));
  await ctx.qa.toggle(id,button);
  assert.equal(holder.hidden,true);assert.equal(button.attrs['aria-expanded'],'false');
  assert.equal(reads,1);
});
test('slider centered via true center column, on small screens as well',()=>{
  assert.ok(css.includes('.cc-inline-player{'));
  assert.ok(css.includes('grid-template-columns:minmax(0,1fr) minmax(122px,136px) 28px'));
  assert.ok(css.includes('.cc-compact-roster-list .cc-compact-roster-row{'));
  assert.ok(css.includes('minmax(135px,170px) minmax(0,1fr)'));
  assert.ok(css.includes('grid-template-rows:auto auto'));
  assert.ok(css.includes('.cc-compact-roster-list .cc-compact-roster-presence{grid-column:2'));
});

test('match edits retain event ID and never replace an event with its RSVPs',()=>{
  const start=source.indexOf('  function openCompetitionEventEditor(');
  const end=source.indexOf('  async function ccRosterRsvpWrite_(',start);
  assert.ok(start>0&&end>start);
  const editor=source.slice(start,end);
  const editStart=editor.indexOf('if(e){',editor.indexOf("const notify=$('#ceNotify')"));
  const editEnd=editor.indexOf('}else{',editStart);
  assert.ok(editStart>=0&&editEnd>editStart,'existing-event save branch must exist');
  const existingBranch=editor.slice(editStart,editEnd);
  assert.match(existingBranch,/cc_manager_competition_event_save_v1/);
  assert.ok(existingBranch.includes('p_event_id:text(e.eventId||e.id)'),'preserve the original event UUID');
  assert.ok(existingBranch.includes('p_payload:base'),'update the event instead of recreating it');
  assert.ok(!existingBranch.includes('p_event_id:null'),'never create a replacement match on edit');
  assert.ok(!existingBranch.includes('cc_manager_competition_event_series_create_v1'));
  assert.ok(!existingBranch.includes('delete'),'never delete existing event/RSVP rows during edit');
  assert.ok(editor.includes("rpc('cc_manager_competition_event_cancel_v1'"),'cancellation must retain the event');
  const reload=source.slice(source.indexOf('  async function ccReloadCompetitionAfterWrite_('),start);
  assert.ok(reload.includes('loadRsvpMatrix()'),'refresh actual responses after saving');
  assert.ok(reload.includes('loadCardRsvpMatrix()'),'refresh match counts after saving');
});
test('roster RPC calls deployed v1 directly and reuses inflight/cache',()=>{
  const begin=source.indexOf('  const ccRosterInFlight_=new Map();');
  const end=source.indexOf('  function useDemo()',begin);
  assert.ok(begin>0&&end>begin);
  const part=source.slice(begin,end);
  assert.ok(part.includes("rpc('cc_manager_event_roster_v1'"));
  assert.ok(!part.includes("rpc('cc_manager_event_roster_v2'"));
  assert.ok(part.includes('ccRosterInFlight_.has(id)'));
  assert.ok(part.includes('state.eventRosterCache.has(id)'));
  assert.ok(part.includes('12000'),'pending request has a timeout');
});
test('season-wide position badges never trigger full roster background fetches',()=>{
 assert.ok(source.includes("rpc('cc_manager_competition_position_counts_v1'"));
 assert.ok(!source.includes("rpc('cc_manager_rsvp_matrix_v1',{p_from:from.toISOString(),p_to:to.toISOString(),p_team_id:null});state.cardRsvpMatrix"));
 assert.ok(source.includes('ccSeasonPositionByEvent_'));
 assert.ok(source.includes('async function ccHydrateCardPositions_(){return}'));
});
test('training cards are paged and opened event roster guards against stale async responses',()=>{
  assert.ok(source.includes('let ccTrainingVisibleLimit_=30'));
  assert.ok(source.includes('visibleRows=rows.slice(0,ccTrainingVisibleLimit_)'));
  assert.ok(source.includes("$('#ccTrainingShowMore')?.addEventListener('click'"));
  assert.ok(source.includes('host?.dataset.eventRosterId!==eventId'));
});
test('decline notes are shown under player names in quick and detailed rosters',()=>{
  const decline={...players[2],note:'Munka miatt nem érek oda'};
  const quick=ctx.qa.small([decline],'ev',true,true);
  const full=ctx.qa.detail([decline],'ev',true,true);
  assert.ok(quick.includes('cc-inline-decline-note'));
  assert.ok(quick.includes('Munka miatt nem érek oda'));
  assert.ok(full.includes('cc-detail-decline-note'));
  assert.ok(full.includes('Munka miatt nem érek oda'));
  assert.ok(!ctx.qa.small([{...players[0],note:'Nem jelenhet meg'}],'ev',true,true).includes('Nem jelenhet meg'));
});
test('decline messages are escaped',()=>{
  const html=ctx.qa.small([{...players[2],note:'<img src=x onerror=alert(1)>'}],'ev',true,true);
  assert.ok(html.includes('&lt;img'));
  assert.ok(!html.includes('<img'));
});
