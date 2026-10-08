/* Run: node tests/volleyball-ui.test.cjs */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const listeners={},store=new Map(),modal={};
const host={
 isConnected:true,innerHTML:'',contains:()=>true,
 addEventListener:(name,fn)=>{listeners[name]=fn},
 querySelectorAll:()=>[],
 querySelector:selector=>{
  if(selector.startsWith('[data-vb-lineup=')){
   const result=selector.match(/"(\d)-(\d)"/);
   return {value:String(Number(result[2])+(result[1]==='0'?0:6))};
  }
  if(selector==='[data-vb-first-serve]')return {value:'0'};
  if(selector==='[data-vb-statjersey]')return {value:'2'};
  if(selector==='[data-vb-statgrade]')return {value:'kill'};
  return null;
 }
};
const window={confirm:()=>true,setInterval:()=>1};
const document={body:{classList:{add(){},remove(){}},appendChild(){}},createElement:()=>({}),fullscreenElement:null};
const localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)};
const context={window,document,localStorage,console,setInterval:()=>1,Date,JSON,Array,Math,Number,Set,String};
vm.runInNewContext(read('volleyball-core.js'),context);
vm.runInNewContext(read('volleyball-ui.js'),context);
window.CCManagerVolleyball.mount(host,()=>{});
const state=()=>JSON.parse(store.get('cc-manager-volleyball-match-v2')||'null');
const current=()=>state().courts.find(c=>c.id===state().selected);
const click=action=>listeners.click({target:{closest:selector=>selector==='[data-vb-action]'?{dataset:{vbAction:action}}:null}});
const tab=value=>listeners.click({target:{closest:selector=>selector==='[data-vb-tab]'?{dataset:{vbTab:value}}:null}});
const change=(selector,value)=>listeners.change({target:{matches:key=>key===selector,value,dataset:{}}});
assert.ok(host.innerHTML.includes('data-vb-court="1"'));
assert.ok(!host.innerHTML.includes('data-vb-court="2"'),'only one court by default');
assert.ok(host.innerHTML.includes('data-vb-lineup="0-1"'));
click('start-set');assert.equal(current().active.status,'live');
click('point-0');click('point-1');
assert.deepEqual(current().active.points,[1,1]);
assert.equal(current().active.lineups[1][0],'8');
tab('stats');assert.ok(host.innerHTML.includes('data-vb-statjersey'));
change('[data-vb-statskill]','attack');
click('add-stat');
assert.equal(current().active.events.length,1);
assert.equal(current().active.events[0].rallyIndex,2);
tab('analysis');assert.ok(host.innerHTML.includes('Statisztika és elemzés'));
click('add-court');assert.equal(state().courts.length,2);
click('remove-court');assert.equal(state().courts.length,1);
console.log('PASS volleyball UI: one court, lineup start, live rotation, stats, analysis, add/remove');
