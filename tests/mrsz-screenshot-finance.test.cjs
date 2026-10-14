const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const src=fs.readFileSync('app.js','utf8'),css=fs.readFileSync('styles.css','utf8');
const esc=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const b=src.indexOf('// Isolated Hunvolley screenshots:'),e=src.indexOf('  function renderCompetitionMatchCards_()',b);
assert.ok(b>0&&e>b);
const data={matches:[{homeName:'A<script>',awayName:'B',competitionLabel:'Férfi A csoport',startsAt:'2026-10-13T19:00:00+02:00',homeSets:3,awaySets:0,setScores:[{home:25,away:20}]}],tables:[{competitionLabel:'Férfi A csoport',rows:[{teamName:'A',position:1,played:1,wins:1,losses:0,tablePoints:2}]}]};
const ctx={text:x=>String(x??''),esc,num:x=>Number(x)||0,standingsForContext_:()=>[],msLogoHtml_:()=>'',rpc:async name=>{assert.equal(name,'cc_manager_competition_mrsz_snapshot_v1');return data},ccRouteIs_:()=>false};
vm.createContext(ctx);
vm.runInContext(src.slice(b,e)+'\nthis.qa={load:ccLoadMrszPhotoSnapshot_,html:ccMrszPhotoPanelHtml_}',ctx);
test('MRSZ result snapshot requests only the authorized read RPC and groups standings',async()=>{
 await ctx.qa.load();
 const html=ctx.qa.html();
 assert.match(html,/Férfi A csoport/);
 assert.match(html,/3:0/);
 assert.match(html,/25:20/);
 assert.match(html,/nem automatikus szinkron/);
 assert.ok(html.includes('&lt;script&gt;')&&!html.includes('<script>'));
});
test('MRSZ source records never update existing BRSZ source',()=>{
 const s=src.slice(b,e);
 assert.ok(!/insert\s+into|update\s+public\.|delete\s+from/i.test(s));
 assert.ok(src.includes("ccMrszPhotoPanelHtml_()"));
 assert.ok(css.includes('.cc-mrsz-photo-match'));
});
test('finance summary is read-only and supports coach, license, online pass separately',()=>{
 const b=src.indexOf('// Read only: reports the existing paid entries'),e=src.indexOf('  function financeCompetitionHtml_()',b);
 assert.ok(b>0&&e>b);
 const c={text:x=>String(x??''),esc,state:{financeData:{players:[{playerId:'a'},{playerId:'b'},{playerId:'a'}]}},
 financeEffective_:(id,type)=>({status:id==='a'&&type==='beac_pass'?'paid':'due'}),
 financeStatus_:f=>f.status};
 vm.createContext(c);
 vm.runInContext(src.slice(b,e)+'\nthis.qa=ccCompetitionFinanceSnapshotHtml_',c);
 const html=c.qa();
 assert.ok(html.includes('1/2'),'duplicates should not overcount');
 assert.match(html,/Edzői díj/);
 assert.match(html,/Versenyengedély/);
 assert.ok(!/update\s+public\.|insert\s+into/i.test(src.slice(b,e)));
});
