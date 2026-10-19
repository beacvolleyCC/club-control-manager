const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const js=fs.readFileSync('app.js','utf8');
const first=js.indexOf('  const ccWomenHistoryState_=');
const last=js.indexOf('  function renderModule(){',first);
assert.ok(first>0&&last>first,'Historical screen fragment exists');
const component=js.slice(first,last);
const payload=JSON.parse(fs.readFileSync('data/competition-strength/women1_2026_27_historical_lookback.json','utf8'));
function fakeRender(data=payload){
 const host={innerHTML:''},ctx={
   document:null,Promise,Number,Array,Set,Object,Intl,Date,
   text:v=>String(v??'').trim(),
   esc:v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])),
   ccRouteIs_:()=>true,
   $:key=>key==='#viewContent'?host:null,
   fetch:async()=>({ok:true,json:async()=>data})
 };
 vm.createContext(ctx);
 vm.runInContext(component+'\nthis.qa={load:ccLoadWomenHistory_,render:ccRenderWomenHistory_,state:ccWomenHistoryState_};',ctx);
 return{ctx,host,qa:ctx.qa};
}
test('historical team screen loads fixed read-only source and clearly states past season',async()=>{
 const model=fakeRender();
 await model.qa.load();
 assert.ok(model.host.innerHTML.includes('2025/26-os bajnoki mérleg'));
 assert.ok(model.host.innerHTML.includes('Nem a jelenlegi erősorrend'));
 assert.ok(model.host.innerHTML.includes('BEAC'));
 assert.ok(model.host.innerHTML.includes('1663,8')||model.host.innerHTML.includes('1 663,8'));
});
test('uncertain aliases and teams lacking prior women I season are never disguised',async()=>{
 const model=fakeRender();
 await model.qa.load();
 assert.ok(model.host.innerHTML.includes('Névkapcsolat ellenőrzendő'));
 assert.ok(model.host.innerHTML.includes('Nincs előző I. osztályú adat'));
 assert.ok(model.host.innerHTML.includes('Semmelweis Egyetem'));
 assert.ok(model.host.innerHTML.includes('Óbudai Egyetem-Kandó SC'));
});
test('invalid or current-season-valued source is rejected before rendering',async()=>{
 const bad=JSON.parse(JSON.stringify(payload));
 bad.teams[0].currentStrengthRating=1740;
 const model=fakeRender(bad);
 await model.qa.load();
 assert.ok(model.qa.state.error.includes('ellenőrzése sikertelen'));
 assert.ok(!model.host.innerHTML.includes('1 740'));
});
test('women I historical screen is fetch-only and has no RSVP/event writes',()=>{
 assert.ok(component.includes("fetch('./data/competition-strength/women1_2026_27_historical_lookback.json'"));
 assert.ok(!component.includes("rpc("));
 assert.ok(!component.includes("update("));
 assert.ok(!component.includes("insert("));
 assert.ok(!component.includes('meeting_at'));
 assert.ok(js.includes("if(state.area==='competition'&&m==='history'){ccRenderWomenHistory_();return}"));
 assert.ok(js.includes("module==='history'"));
});
