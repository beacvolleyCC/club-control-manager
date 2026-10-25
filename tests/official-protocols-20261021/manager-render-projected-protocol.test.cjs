'use strict';
// Executes against the EXACT jsonb payload exported from the disposable PG17
// canonical view after applying the two official protocol overlays. It does
// not use fabricated fixtures, Supabase credentials or a production database.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=process.env.CC_PROTOCOL_CANONICAL_JSON_FILE;
assert.ok(path,'CC_PROTOCOL_CANONICAL_JSON_FILE must point to PG17 projection output');
const projected=JSON.parse(fs.readFileSync(path,'utf8'));
assert.equal(projected.length,2,'exactly two new protocol overlays; no duplicates');
const byCode=new Map(projected.map(x=>[String(x.matchCode),x]));
assert.deepEqual([...byCode.keys()].sort(),['2686','2700']);
const app=fs.readFileSync(process.env.CC_MANAGER_APP_FILE||'app.js','utf8');
const a=app.indexOf('  function ccMrszProfileUrl_(');
const b=app.indexOf('  function ccOpenMrszProtocol_(',a);
assert.ok(a>=0&&b>a,'Manager user-facing protocol renderer must exist');
const escape=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const ctx={
 text:s=>String(s??''),
 esc:escape,
 URL,
 ccMrszLocalKickoff_:s=>({date:String(s||'').slice(0,10),time:String(s||'').slice(11,16)})
};
vm.createContext(ctx);
vm.runInContext(app.slice(a,b)+'\nthis.qaHtml=ccMrszProtocolHtml_;',ctx);
// The real Manager match detail is wired to mouse/touch click plus keyboard.
const ui={opened:0,errors:[],cards:[],body:{innerHTML:''},title:{textContent:''},eyebrow:{textContent:''},
 dialog:{handlers:{},classList:{add(){},remove(){}},addEventListener(type,fn){this.handlers[type]=fn}}};
const widgets={'#entityDialog':ui.dialog,'#entityDialogBody':ui.body,
 '#entityDialogTitle':ui.title,'#entityDialogEyebrow':ui.eyebrow};
ctx.$=(selector)=>widgets[selector]||null;
ctx.$$=(selector)=>selector==='#viewContent [data-cc-mrsz-protocol]'?ui.cards:[];
ctx.ccMrszPhotoState_={canonicalMatches:projected,matches:[]};
ctx.ccOpenDialogStable_=()=>{ui.opened++};
ctx.status=(text,level)=>{ui.errors.push({text,level})};
ctx.ccBindSourceMatchEdit_=()=>{};
const openBegin=app.indexOf('  function ccOpenMrszProtocol_(');
const openEnd=app.indexOf('  // A saved federation/screenshot key is mandatory.',openBegin);
assert.ok(openBegin>=0&&openEnd>openBegin,'Manager click/keyboard binder missing');
vm.runInContext(app.slice(openBegin,openEnd)+
 '\nthis.qaOpen=ccOpenMrszProtocol_;this.qaBind=ccBindMrszProtocol_;',ctx);
const expected=[
 {code:'2686',league:'Női Budapest I. osztály',source:'20261001:fixture:39',
  uuid:'04eaceee-57e2-7563-a618-beb933c0ffc0',home:'MTK Budapest',away:'Panoráma SE',
  final:[3,1],sets:[[25,20],[25,9],[20,25],[25,15]],roster:[12,7],
  staff:[1,1],officials:2,points:[95,69],liberos:1,unmarked:1,
  markers:['HERR ZSUZSANNA','SELMECZI VANDA','KISS VIRÁG BARBARA','PUSKÁS IVETT']},
 {code:'2700',league:'Férfi Budapest I. osztály – B csoport',
  source:'brsz:2026/27:menB:userofficial:01',
  uuid:'25a14406-2887-62fc-086c-ad770d160a6b',home:'Mozdulj SE',away:'MAFC-Vásárhelyi',
  final:[3,2],sets:[[25,18],[25,23],[21,25],[18,25],[15,11]],roster:[10,9],
  staff:[1,0],officials:1,points:[104,102],liberos:2,unmarked:2,
  markers:['VIG DIÁNA','STARK SÁNDOR','BALÁZSI KRISZTIÁN','RAB LEVENTE RÓBERT']}
];
for(const e of expected)test('Manager exact DB projection + in-app protocol '+e.code,()=>{
 const m=byCode.get(e.code);
 assert.ok(m,'Missing match code '+e.code);
 assert.equal(m.season,'2026/27');
 assert.equal(m.competitionLabel,e.league);
 assert.equal(m.sourceKey,e.source);
 assert.equal(m.matchId,e.uuid,'stable canonical match identity');
 assert.equal(m.homeName,e.home);
 assert.equal(m.awayName,e.away);
 assert.equal(m.status,'played');
 assert.deepEqual([m.homeSets,m.awaySets],e.final);
 assert.deepEqual(m.setScores.map(x=>[x.home,x.away]),e.sets);
 assert.equal(m.startsAt.slice(0,16),e.code==='2686'?'2026-10-21T21:00':'2026-10-21T20:00');
 const sides=m.protocol?.teams||[];
 assert.equal(sides.length,2,'Manager in-app protocol shape');
 assert.deepEqual(sides.map(t=>t.players?.length),e.roster);
 assert.deepEqual(sides.map(t=>t.staff?.length),e.staff);
 assert.equal(m.protocol?.officials?.length,e.officials);
 const allPlayers=sides.flatMap(t=>t.players);
 assert.equal(allPlayers.filter(p=>p.captain===true).length,2);
 assert.equal(allPlayers.filter(p=>p.libero).length,e.liberos);
 assert.equal(allPlayers.filter(p=>!p.designation).length,e.unmarked);
 assert.ok(allPlayers.every(p=>p.code&&p.number&&p.name));
 const points=e.sets.reduce((acc,score)=>[acc[0]+score[0],acc[1]+score[1]],[0,0]);
 assert.deepEqual(points,e.points);
 const html=ctx.qaHtml(m);
 assert.ok(html.includes('Mérkőzéskód: '+e.code));
 assert.ok(html.includes(e.home));
 assert.ok(html.includes(e.away));
 for(const person of e.markers)assert.ok(html.includes(person),person);
 assert.ok(html.includes('aria-label="Kapitány"'));
 assert.ok(html.includes('aria-label="Libero"'));
 assert.ok(html.includes('aria-label="Csere"'));
 assert.ok(html.includes('Nincs pályára lépési jelölés'));
 assert.ok(html.includes('2026-10-21'),'original official local date');
 assert.ok(!html.includes('Eredeti Hunvolley-jegyzőkönyv ↗'),'unverified URL must not be invented');
 assert.ok(!m.protocol?.sourceUrl);
});
test('No cross-league score leakage or duplicate historical fixture',()=>{
 assert.equal(projected.length,2);
 assert.notEqual(byCode.get('2686').competitionLabel,byCode.get('2700').competitionLabel);
 assert.notEqual(byCode.get('2686').matchId,byCode.get('2700').matchId);
 assert.ok(projected.every(m=>!String(m.sourceKey).startsWith('mrsz:2026/27:protocol:')));
 assert.equal(projected.reduce((sum,m)=>sum+m.protocol.teams.reduce((n,t)=>n+t.players.length,0),0),38);
});

test('Manager touch/click and keyboard report opens the right in-app PDF, suppresses nested edit clicks',()=>{
 const handlers={};
 const card={
  dataset:{ccMrszProtocol:'2686',ccMrszProtocolLeague:'Női Budapest I. osztály'},
  addEventListener(type,fn){handlers[type]=fn}
 };
 ui.cards=[card];
 ctx.qaBind();
 assert.equal(typeof handlers.click,'function');
 assert.equal(typeof handlers.keydown,'function');
 let before=ui.opened;
 const normal={closest:()=>null},nested={closest:()=>({tagName:'BUTTON'})};
 handlers.click({target:normal});
 assert.equal(ui.opened,before+1);
 assert.ok(ui.body.innerHTML.includes('Mérkőzéskód: 2686'));
 assert.ok(ui.title.textContent.includes('MTK Budapest'));
 before=ui.opened;
 handlers.click({target:nested});
 assert.equal(ui.opened,before,'nested edit/button controls do not open a protocol');
 let prevented=0;
 for(const key of ['Enter',' ']){
  handlers.keydown({key,target:normal,preventDefault(){prevented++}});
 }
 assert.equal(ui.opened,before+2);
 assert.equal(prevented,2);
 handlers.keydown({key:'Escape',target:normal,preventDefault(){prevented++}});
 handlers.keydown({key:'Enter',target:nested,preventDefault(){prevented++}});
 assert.equal(ui.opened,before+2);
 assert.equal(prevented,2);
 ui.cards=[];
});
test('Manager report refuses wrong league, duplicate match-code collision and absent canonical result',()=>{
 const before=ui.opened;
 ctx.qaOpen('2686','Női Budapest II. osztály – B csoport');
 assert.equal(ui.opened,before);
 const double={...byCode.get('2686'),matchId:'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'};
 ctx.ccMrszPhotoState_.canonicalMatches.push(double);
 ctx.qaOpen('2686','Női Budapest I. osztály');
 assert.equal(ui.opened,before,'ambiguous canonical match number must not silently select a row');
 ctx.ccMrszPhotoState_.canonicalMatches.pop();
 const existing=ctx.ccMrszPhotoState_.canonicalMatches;
 try{
  ctx.ccMrszPhotoState_.canonicalMatches=[];
  ctx.ccMrszPhotoState_.matches=[];
  ctx.qaOpen('2686','Női Budapest I. osztály');
  assert.equal(ui.opened,before,'a schedule without protocol data is not a report');
 }finally{ctx.ccMrszPhotoState_.canonicalMatches=existing}
 assert.ok(ui.errors.length>=3);
});
