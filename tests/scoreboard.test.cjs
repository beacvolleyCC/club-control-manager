/* Run: node tests/scoreboard.test.cjs */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'..','scoreboard.js'),'utf8');
const cache=new Map();
const listeners={};
const root={
  isConnected:true,innerHTML:'',
  contains:()=>true,
  querySelectorAll:()=>[],
  querySelector:()=>null,
  addEventListener:(event,callback)=>{listeners[event]=callback}
};
const localStorage={
  getItem:key=>cache.get(key)??null,
  setItem:(key,value)=>cache.set(key,value)
};
const mockWindow={setInterval:()=>1,confirm:()=>true,location:{hash:''}};
const document={body:{classList:{add(){},remove(){}}}};
vm.runInNewContext(source,{window:mockWindow,document,localStorage,console,Date});
mockWindow.CCManagerScoreboard.mount(root);
const read=()=>JSON.parse(cache.get('cc-manager-training-scoreboard-v1')||'null');
const act=(action,id='1')=>listeners.click({target:{closest:()=>({dataset:{ccAction:action,id}})}});
assert.equal((root.innerHTML.match(/cc-counter-court panel/g)||[]).length,1,'one court by default');
act('plus-0');act('plus-1');
assert.deepEqual(Array.from(read().courts[0].points),[1,1]);
act('undo');
assert.deepEqual(Array.from(read().courts[0].points),[1,0],'undo a point');
act('add');
assert.equal(read().courts.length,2,'second court is optional');
act('plus-0','2');
assert.deepEqual(Array.from(read().courts[1].points),[1,0],'courts stay independent');
act('preset-5');
assert.equal(read().courts[0].timer.durationMs,300000);
act('timer-toggle');
assert.equal(read().courts[0].timer.running,true);
act('timer-toggle');
assert.equal(read().courts[0].timer.running,false);
act('add');
assert.equal(read().courts.length,3);
act('remove','3');
assert.equal(read().courts.length,2);
act('reset-score');
for(let i=0;i<25;i++)act('plus-0');
assert.deepEqual(Array.from(read().courts[0].sets),[1,0],'automatic set transition');
assert.deepEqual(Array.from(read().courts[0].points),[0,0]);
for(let i=0;i<25;i++)act('plus-0');
assert.equal(read().courts[0].finished,true,'2 sets wins best-of-3');
act('undo');
assert.equal(read().courts[0].finished,false,'undo reverses match end');
assert.equal(read().courts[0].points[0],24);
act('reset-score');
for(let i=0;i<24;i++)act('plus-0');
for(let i=0;i<24;i++)act('plus-1');
act('plus-0');
assert.equal(read().courts[0].sets[0],0,'win by two enforced');
act('plus-0');
assert.equal(read().courts[0].sets[0],1,'deuce resolved at 26–24');
console.log('PASS scoreboard: one court default, optional second court, scoring, undo, timer, set and deuce');
