'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const app=fs.readFileSync('app.js','utf8');
function section(start,end){
 const i=app.indexOf(start),j=app.indexOf(end,i+start.length);
 assert.ok(i>=0&&j>i,'Missing Manager section: '+start);
 return app.slice(i,j);
}
test('Manager lookup resolves user legacy source identity without confusing seasons',()=>{
 const legacy={_ccSourceSystem:'user',_ccSourceKey:'ui20261018:menB:beac:pdse:1',
   season:'2026/27',homeName:'BEAC',awayName:'PDSE'};
 const fakeOther={...legacy,season:'2025/26'};
 const photo={cc:1,_ccSourceSystem:'mrsz',_ccSourceKey:'mrsz:2026/27:protocol:2700',season:'2026/27'};
 const ctx=vm.createContext({
  ccMrszPhotoState_:{userMatches:[legacy,fakeOther],fixtures:[],matches:[photo]},
  ccBrszEffectiveMatches_:[],text:v=>String(v??'')
 });
 vm.runInContext(section('function ccMatchSourceId_(','function ccCanEditLeagueSource_('),ctx);
 const id=ctx.ccMatchSourceId_(legacy);
 assert.equal(id.system,'user');assert.equal(id.key,legacy._ccSourceKey);
 assert.equal(ctx.ccMatchSourceFind_(id),legacy);
 assert.equal(ctx.ccMatchSourceFind_({...id,season:'2025/26'}),fakeOther);
 assert.equal(ctx.ccMatchSourceFind_({...id,system:'mrsz'}),undefined);
 assert.equal(ctx.ccMatchSourceFind_(ctx.ccMatchSourceId_(photo)),photo);
});
test('Canonical season remains authoritative when stale 300-row user import exists',()=>{
 const group='Férfi Budapest I. osztály – B csoport';
 const canonical={competitionLabel:group,matchId:'CANONICAL-2686',status:'played',
   sourceKey:'20261001:fixture:39',homeName:'MTK',awayName:'Panoráma SE',homeSets:3,awaySets:1};
 const ctx=vm.createContext({
  ccMrszPhotoState_:{canonicalMatches:[canonical,...Array.from({length:297},(_,i)=>({
    competitionLabel:'other',matchId:'fixture-'+i
  }))],userMatches:Array.from({length:300},(_,i)=>({
    competitionLabel:group,homeSets:0,awaySets:3,sourceMatchKey:'ui20261018:'+i
  }))},
  text:v=>String(v??''),ccManagerMatchVisualSort_:()=>0,
  Array,Date,Math,JSON
 });
 vm.runInContext(section('function ccMrszMergedLeagueMatches_(',
  '// An unscored BEAC–BEAC record'),ctx);
 const merged=ctx.ccMrszMergedLeagueMatches_(group);
 assert.equal(merged.length,1);
 assert.equal(merged[0].matchId,canonical.matchId);
 assert.deepEqual([merged[0].homeSets,merged[0].awaySets],[3,1]);
 assert.equal(merged[0].isPhoto,true);
});
test('Legacy league context must not claim a hardcoded 300/8 result snapshot is authoritative',()=>{
 const merged=section('function ccMrszMergedLeagueMatches_(',
  '// An unscored BEAC–BEAC record');
 assert.ok(merged.indexOf('ccMrszPhotoState_.canonicalMatches')<
   merged.indexOf('ccMrszPhotoState_.userMatches'));
 assert.ok(!merged.includes('all.length!==300'));
});
