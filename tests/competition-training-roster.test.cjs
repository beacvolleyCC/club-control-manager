const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('app.js','utf8');
const css=fs.readFileSync('styles.css','utf8');
const begin=source.indexOf('// Competition training inline roster; RSVP only');
const end=source.indexOf('  function renderCompetitionTrainingCards_()',begin);
assert.ok(begin>0&&end>begin,'inline roster helper block exists');
const rosterSource=source.slice(begin,end);
const state={eventRosterCache:new Map()};
const ctx={
  Set,Map,state,
  text:x=>String(x??''),
  esc:x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])),
  enrichPlayer_:p=>p,ccPositionKey_:p=>({
    'Feladó':'f','Center':'c','Szélső ütő':'sz','Átló':'a','Liberó':'l'
  })[p]||'?',
  ccEventCardHtml_:()=>'<button data-event-id="test">Edzés</button>',
  CSS:{escape:s=>s},
  configured:()=>true,
  loadEventRoster:async()=>[],
  document:{querySelector:()=>null,querySelectorAll:()=>[]}
};
vm.createContext(ctx);
vm.runInContext(rosterSource+'\nthis.qa={html:ccTrainingInlineRosterHtml_,item:ccCompetitionTrainingWithRosterHtml_,toggle:ccToggleTrainingInlineRoster_};',ctx);
const players=[
 {name:'Feladó A',position:'Feladó',status:'going',jerseyNo:3},
 {name:'Center B',position:'Center',status:'not_going',jerseyNo:8},
 {name:'Szélső C',position:'Szélső ütő',status:'unknown',jerseyNo:5},
 {name:'Átló D',position:'Átló',status:'going'},
 {name:'Liberó E',position:'Liberó',status:'not_going'},
 {name:'Más <script>X</script>',position:null,status:null}
];
test('all three RSVP statuses render and sort in position groups',()=>{
 const html=ctx.qa.html(players);
 for(const label of ['Feladók','Centerek','Szélsők','Átlók','Liberók','Egyéb / nincs poszt'])assert.ok(html.includes(label),label);
 for(const tone of ['going','not-going','none'])assert.ok(html.includes('cc-training-rsvp-player '+tone),tone);
 for(const label of ['Jövök','Nem jövök','Nincs válasz'])assert.ok(html.includes(label),label);
 assert.ok(html.includes('2</b> Jövök'));
 assert.ok(html.includes('2</b> Nem jövök'));
 assert.ok(html.includes('2</b> Nincs válasz'));
});
test('names and numbers are escaped, not executable markup',()=>{
 const html=ctx.qa.html(players);
 assert.ok(html.includes('&lt;script&gt;'));
 assert.ok(!html.includes('<script>'));
});
test('card and roster toggle are separate interactive controls',()=>{
 const html=ctx.qa.item({id:'event-1'});
 assert.ok(html.includes('data-event-id="test"'));
 assert.ok(html.includes('data-training-roster-toggle="event-1"'));
 assert.ok(html.includes('data-training-roster-holder="event-1"'));
 assert.ok(html.includes('aria-expanded="false"'));
});
test('load roster on open, preserve open state and close without mutating RSVP',async()=>{
 const id='event-2',holder={hidden:true,innerHTML:''};
 const button={expanded:'',setAttribute(_k,v){this.expanded=v},classList:{toggle(){}}};
 let reads=0,wasForce=false;
 ctx.document.querySelector=()=>holder;
 ctx.loadEventRoster=async(_id,opts)=>{reads++;wasForce=opts.force;return players};
 await ctx.qa.toggle(id,button);
 assert.equal(holder.hidden,false);
 assert.equal(button.expanded,'true');
 assert.equal(reads,1);
 assert.equal(wasForce,true);
 assert.ok(holder.innerHTML.includes('Feladók'));
 await ctx.qa.toggle(id,button);
 assert.equal(holder.hidden,true);
 assert.equal(button.expanded,'false');
 assert.equal(reads,1);
});
test('CSS provides separate green, red, grey roster treatments',()=>{
 for(const v of ['going','not-going','none']){
   assert.ok(css.includes('.cc-training-rsvp-player.'+v),v);
   assert.ok(css.includes('.cc-training-roster-count.'+v),v);
 }
 assert.ok(css.includes('.cc-training-inline-roster[hidden]'));
});
