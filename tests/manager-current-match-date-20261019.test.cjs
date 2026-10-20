'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const js=fs.readFileSync('app.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const cut=(start,end)=>{
 const a=js.indexOf(start),b=js.indexOf(end,a+start.length);
 assert.ok(a>=0&&b>a,'Missing function range: '+start);
 return js.slice(a,b);
};
const ctx=vm.createContext({Intl,Date,Map,Object,Number,String,Array,
 text:value=>String(value??'').trim(),
 ccBrszEffectiveMatches_:[],ccManagerVerifiedOfficialReport_:()=>null,
 ccMrszPhotoState_:{matches:[],fixtures:[],tables:[],userMatches:[]}});
vm.runInContext(cut('function ccMrszNormPairName_(', 'function ccMrszLocalKickoff_('),ctx);
vm.runInContext(cut('function ccMrszLocalKickoff_(', '// One display for linked Manager events'),ctx);
vm.runInContext(cut('const CC_MANAGER_KNOWN_DATE_MOVES_', '// An unscored BEAC'),ctx);
const group='Férfi Budapest I. osztály – B csoport';
const oldMatch={competitionLabel:group,startsAt:'2026-10-12T19:30:00',homeName:'BEAC',awayName:'PDSE',homeSets:null,awaySets:null};
const imported={competitionLabel:group,startsAt:'2026-10-19T19:30:00',homeName:'BEAC',awayName:'PDSE',
 sourceMatchKey:'ui20261018:menB:beac:pdse:1',_ccUserSupplied:true,season:'2026/27',homeSets:null,awaySets:null};
test('Manager shows confirmed BEAC–PDSE on Oct 19 only once, not Oct 12',()=>{
 ctx.ccMrszPhotoState_={matches:[],fixtures:[oldMatch],userMatches:[imported]};
 ctx.ccBrszEffectiveMatches_=[oldMatch];
 const out=ctx.ccMrszMergedLeagueMatches_(group);
 assert.equal(out.length,1);
 assert.equal(ctx.ccMrszLocalKickoff_(out[0].startsAt).date,'2026-10-19');
});
test('Old results are never silently discarded by a later date move',()=>{
 ctx.ccMrszPhotoState_.matches=[{...oldMatch,homeSets:3,awaySets:1}];
 const out=ctx.ccMrszMergedLeagueMatches_(group);
 assert.equal(out.length,2);
 assert.ok(out.some(m=>m.homeSets===3));
});
test("Today's fixture sorts ahead of both future and past match rows",()=>{
 const entries=['2026-10-11T19:30:00','2026-10-21T19:30:00','2026-10-19T19:30:00']
  .map(startsAt=>({startsAt,homeName:'X'}));
 const days=entries.sort((a,b)=>ctx.ccManagerMatchVisualSort_(a,b,'2026-10-19'))
  .map(m=>m.startsAt.slice(0,10));
 assert.deepEqual(days,['2026-10-19','2026-10-21','2026-10-11']);
});
test('No cross-league or uncertain team pair can be substituted',()=>{
 const wrong={...imported,awayName:'MAFC-Schönherz'};
 assert.equal(ctx.ccManagerKnownMovedFixture_(wrong,group),null);
});
test('Manager PWA cache includes verified matches update',()=>{
 assert.ok(html.includes('app.js?v=20261020-mrsz-reports-v66'));
 assert.ok(sw.includes('cc-manager-20261020-mrsz-reports-v66'));
});
