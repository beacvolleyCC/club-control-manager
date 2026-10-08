/* Run: node tests/volleyball-setter-ui.test.cjs */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const listeners={},store=new Map(),confirmations=[];
const host={isConnected:true,innerHTML:'',contains:()=>true,
  addEventListener:(name,handler)=>{listeners[name]=handler},
  querySelectorAll:()=>[],
  querySelector:selector=>{
    const lineup=selector.match(/data-vb-lineup="(\d)-(\d)"/);
    if(lineup)return {value:String(Number(lineup[2])+(lineup[1]==='0'?0:6))};
    if(selector.includes('data-vb-setter="0"'))return {value:'1'};
    if(selector.includes('data-vb-setter="1"'))return {value:'4'};
    if(selector==='[data-vb-first-serve]')return {value:'0'};
    if(selector==='[data-vb-subjersey]')return {value:'22'};
    if(selector==='[data-vb-subout]')return {textContent:''};
    return null;
  }};
const window={confirm:message=>{confirmations.push(message);return true},setInterval:()=>1};
const localStorage={getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value)};
const document={body:{classList:{add(){},remove(){}},appendChild(){}},createElement:()=>({}),fullscreenElement:null};
const context={window,document,localStorage,console,setInterval:()=>1,Date,JSON,Number,Array,Math,String,Set};
vm.runInNewContext(read('volleyball-core.js'),context);
vm.runInNewContext(read('volleyball-ui.js'),context);
window.CCManagerVolleyball.mount(host,()=>{});
const model=()=>JSON.parse(store.get('cc-manager-volleyball-match-v2')||'{}');
const active=()=>model().courts[0].active;
const click=action=>listeners.click({target:{closest:query=>query==='[data-vb-action]'?{dataset:{vbAction:action}}:null}});
assert.match(host.innerHTML,/data-vb-setter="0"/);
assert.match(host.innerHTML,/data-vb-setter="1"/);
click('start-set');
assert.equal(active().setterStarts[0],1);
assert.equal(active().setterStarts[1],4);
assert.match(host.innerHTML,/cc-vb-setterstrip/);
assert.match(host.innerHTML,/P1/);
assert.match(host.innerHTML,/data-vb-action="minus-0"/);
assert.match(host.innerHTML,/data-vb-action="point-0"/);
click('point-0');
assert.equal(active().points[0],1);
click('minus-0');
assert.equal(active().points[0],0);
assert.equal(active().rallies.length,0);
click('point-0');click('point-1');
assert.equal(active().rotations[1],1);
assert.match(host.innerHTML,/P3/);
click('substitute');
assert.equal(active().setterPlayers[0],'22');
assert.match(host.innerHTML,/Feladó: #22/);
assert.ok(confirmations.some(t=>t.includes('feladó megjelölése')));
console.log('PASS volleyball setter UI: start positions, live P status, plus/minus, substitution dialog and status');
