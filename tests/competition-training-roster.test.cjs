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
  text:x=>String(x??'').trim(),esc,
  enrichPlayer_:p=>p,avatarHtml:()=>'<span class="cc-avatar">A</span>',
  initials:x=>String(x??'').split(/\s+/).filter(Boolean).slice(0,2).map(v=>v[0]).join('')||'?',
  medicalState_:()=>({cls:'valid',label:'Érvényes'}),fmtDate:()=> '2027.01.01',
  ccEventCardHtml_:()=>'<button data-event-id="test">Esemény</button>',
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
test('small foldout has jersey numbers + slider + profile triangle but no avatar, player name or position',()=>{
  const html=ctx.qa.small(players,'ev',true,true);
  for(const cls of ['cc-inline-player-number','cc-compact-roster-presence','cc-compact-roster-open'])assert.ok(html.includes(cls));
  assert.ok(html.includes('#3')&&html.includes('#11'));
  assert.ok(!html.includes('cc-compact-roster-avatar'));
  assert.ok(!html.includes('cc-compact-roster-identity'));
  assert.ok(!html.includes('cc-compact-roster-heading'));
  assert.ok(!html.includes('Feladók'));
  assert.ok(!html.includes('Jövő Három</strong>'),'full player name should not be visibly rendered');
  assert.ok(html.includes('title="Jövő Három"'),'names remain accessible on hover');
  assert.ok(html.includes('data-roster-profile-open="g3"'));
});
test('RSVP tint is green, red, dark grey and unknown comes last',()=>{
  const html=ctx.qa.small(players,'ev',true,true);
  for(const v of ['going','not-going','none'])assert.ok(html.includes('cc-inline-player '+v));
  assert.ok(css.includes('.cc-inline-player.going{background:#dff1e5'));
  assert.ok(css.includes('.cc-inline-player.not-going{background:#f9dfe0'));
  assert.ok(css.includes('.cc-inline-player.none{background:#424950'));
  assert.ok(css.includes('.cc-compact-roster-row.none{background:#424950'));
});
test('missing jersey falls back to initials; no unsafe HTML from player name',()=>{
  const html=ctx.qa.small(players,'ev',true,true);
  assert.ok(html.includes('title="Nincs mezszám &lt;script&gt;X&lt;/script&gt;"'));
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
    assert.ok(html.includes('data-event-id="test"'));
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
  ctx.loadEventRoster=async(_id,opts)=>{reads++;assert.equal(opts.force,true);return players};
  ctx.ccBindCompetitionRoster_=()=>bound++;
  await ctx.qa.toggle(id,button);
  assert.equal(holder.hidden,false);
  assert.equal(button.attrs['aria-expanded'],'true');
  assert.equal(reads,1);assert.equal(bound,1);
  assert.ok(holder.innerHTML.includes('#3'));
  assert.ok(!holder.innerHTML.includes('Feladók'));
  await ctx.qa.toggle(id,button);
  assert.equal(holder.hidden,true);assert.equal(button.attrs['aria-expanded'],'false');
  assert.equal(reads,1);
});
test('slider centered via true center column, on small screens as well',()=>{
  assert.ok(css.includes('.cc-inline-player{'));
  assert.ok(css.includes('grid-template-columns:minmax(0,1fr) 136px minmax(0,1fr)'));
  assert.ok(css.includes('.cc-compact-roster-list .cc-compact-roster-row{'));
  assert.ok(css.includes('minmax(135px,170px) minmax(0,1fr)'));
  assert.ok(css.includes('grid-template-rows:auto auto'));
  assert.ok(css.includes('.cc-compact-roster-list .cc-compact-roster-presence{grid-column:2'));
});
