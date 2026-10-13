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
const state={eventRosterCache:new Map()};
const esc=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const players=[
 {playerId:'a',name:'Feladó A',position:'Feladó',status:'going',jerseyNo:3},
 {playerId:'b',name:'Center B',position:'Center',status:'not_going',jerseyNo:8},
 {playerId:'c',name:'Szélső C',position:'Szélső ütő',status:'unknown',jerseyNo:5},
 {playerId:'d',name:'Átló D',position:'Átló',status:'going'},
 {playerId:'e',name:'Liberó E',position:'Liberó',status:'not_going'},
 {playerId:'f',name:'Más <script>X</script>',position:null,status:null}
];
const ctx={
 Set,Map,state,text:x=>String(x??''),esc,
 enrichPlayer_:p=>p,avatarHtml:()=>'<span class="cc-avatar">A</span>',
 medicalState_:()=>({cls:'valid',label:'Érvényes'}),fmtDate:()=> '2027.01.01',
 ccPositionKey_:p=>({'Feladó':'f','Center':'c','Szélső ütő':'sz','Átló':'a','Liberó':'l'})[p]||'?',
 ccEventCardHtml_:()=>'<button data-event-id="test">Meccs vagy edzés</button>',
 ccEventCanEdit_:()=>true,eventStart:()=>new Date('2026-01-01T00:00:00Z'),
 findEventById:id=>({id,status:'active'}),configured:()=>true,
 ccBindCompetitionRoster_:()=>{},loadEventRoster:async()=>players,
 CSS:{escape:s=>s},document:{querySelector:()=>null,querySelectorAll:()=>[]}
};
vm.createContext(ctx);
vm.runInContext(rowSource+'\n'+rosterSource+'\nthis.qa={html:ccTrainingInlineRosterHtml_,row:ccCompactRosterRowHtml_,preview:ccRosterPreviewState_,item:ccCompetitionEventWithRosterHtml_,toggle:ccToggleTrainingInlineRoster_};',ctx);
test('three RSVP states and all positions present in compact group',()=>{
 const html=ctx.qa.html(players,'event-1',true,true);
 for(const label of ['Feladók','Centerek','Szélsők','Átlók','Liberók','Egyéb / nincs poszt'])assert.ok(html.includes(label),label);
 for(const v of ['going','not-going','none'])assert.ok(html.includes('cc-compact-roster-row '+v),v);
 for(const att of ['cc-compact-roster-avatar','cc-compact-roster-jersey','cc-compact-roster-identity','cc-compact-roster-medical','cc-compact-roster-presence','cc-compact-roster-open'])assert.ok(html.includes(att),att);
 assert.ok(!html.includes('cc-player-wide-card'),'full player cards are not used in roster');
});
test('RSVP previews are visual only; recorded attendance overrides preview',()=>{
 assert.equal(ctx.qa.preview({status:'going'}).state,'yes');
 assert.equal(ctx.qa.preview({status:'not_going'}).state,'no');
 assert.equal(ctx.qa.preview({status:'unknown'}).state,'none');
 assert.equal(ctx.qa.preview({status:'going'}).confirmed,false);
 assert.equal(ctx.qa.preview({status:'going',attendanceStatus:'absent'}).state,'no');
 assert.equal(ctx.qa.preview({status:'going',attendanceStatus:'absent'}).confirmed,true);
 assert.equal(ctx.qa.preview({status:'not_going',attendanceStatus:'present'}).state,'yes');
 assert.equal(ctx.qa.preview({status:'not_going',attendanceStatus:'present'}).confirmed,true);
 const html=ctx.qa.row(players[0],'event-1',true,true);
 assert.ok(html.includes('data-slider-unconfirmed="1"'));
 assert.ok(html.includes('RSVP alapján'));
});
test('pre-event attendance slider cannot be edited',()=>{
 const html=ctx.qa.row(players[0],'event-1',true,false);
 assert.ok(html.includes('data-slider-disabled="1"'));
 assert.match(html,/disabled>✓/);
});
test('profile triangle opens a separate button and names are escaped',()=>{
 const html=ctx.qa.row(players[5],'event-1',true,true);
 assert.ok(html.includes('data-roster-profile-open="f"'));
 assert.ok(html.includes('cc-compact-roster-open'));
 assert.ok(html.includes('&lt;script&gt;'));
 assert.ok(!html.includes('<script>'));
});
test('training and match cards show only the Névsor label',()=>{
 for(const kind of ['training','match']){
   const html=ctx.qa.item({id:'event-1'},kind);
   assert.ok(html.includes('data-event-id="test"'));
   assert.ok(html.includes('data-training-roster-toggle="event-1"'));
   assert.ok(html.includes('>Névsor</span>'));
   assert.ok(!html.includes('Névsor ·'));
   assert.ok(html.includes('aria-expanded="false"'));
 }
});
test('foldout loads force-fresh roster without mutation',async()=>{
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
 assert.ok(holder.innerHTML.includes('Feladók'));
 await ctx.qa.toggle(id,button);
 assert.equal(holder.hidden,true);assert.equal(button.attrs['aria-expanded'],'false');
 assert.equal(reads,1);
});
test('css has explicit RSVP and medical color states and dense mobile layout',()=>{
 for(const v of ['going','not-going','none'])assert.ok(css.includes('.cc-compact-roster-row.'+v),v);
 for(const v of ['valid','expiring','expired','missing'])assert.ok(css.includes('.cc-compact-roster-medical.'+v),v);
 assert.ok(css.includes('.cc-compact-roster-presence .cc-player-grid-slider'));
 assert.ok(css.includes('.cc-match-card-panel .cc-training-roster-item'));
});
test('legacy attendance clear falls back to server-accepted clear string',()=>{
 assert.ok(source.includes("p_status:dbStatus??'clear'"));
 assert.ok(source.includes("next!==cur||slider.dataset.sliderUnconfirmed==='1'"));
});
