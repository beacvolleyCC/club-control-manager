'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const js=fs.readFileSync('app.js','utf8');
const labels=[
 ['Férfi Budapest I. osztály – A csoport',42,2],
 ['Férfi Budapest I. osztály – B csoport',42,1],
 ['Női Budapest I. osztály',131,5],
 ['Női Budapest II. osztály – A csoport',42,0],
 ['Női Budapest II. osztály – B csoport',43,0]
];
function imported(){
 const rows=[];
 labels.forEach(([competitionLabel,count,results],group)=>{
  for(let i=0;i<count;i++){
   const result=i<results,key='ui20261018:test:'+group+':'+i;
   rows.push({competitionLabel,season:'2026/27',sourceMatchKey:key,_ccSourceKey:key,
     _ccSourceSystem:'user',_ccUserSupplied:true,_ccSourceKind:result?'result':'fixture',
     homeName:'HOME '+group+' '+i,awayName:'AWAY '+group+' '+i,
     startsAt:result?'2026-10-13':'2026-11-04T20:00:00',
     homeSets:result?3:null,awaySets:result?1:null});
  }
 });
 const match=rows.find(x=>x.competitionLabel===labels[1][0]&&x._ccSourceKind==='fixture');
 match.sourceMatchKey='ui20261018:menB:beac:pdse:1';match._ccSourceKey=match.sourceMatchKey;
 match.homeName='BEAC';match.awayName='PDSE';match.startsAt='2026-10-19T19:30:00';
 // Mirror LIVE RPC: one men B and four women II/A postponed fixtures have null startsAt.
 const undated=[...rows.filter(r=>r.competitionLabel===labels[1][0]&&r._ccSourceKind==='fixture').slice(-1),
  ...rows.filter(r=>r.competitionLabel===labels[3][0]&&r._ccSourceKind==='fixture').slice(-4)];
 for(const r of undated){r.startsAt=null;r.status='postponed';}
 return rows;
}
function cut(start,end){
 const a=js.indexOf(start),b=js.indexOf(end,a+start.length);
 assert.ok(a>=0&&b>a,'Missing Manager function '+start);
 return js.slice(a,b);
}
const ctx=vm.createContext({Intl,Date,Array,Object,Set,Map,Number,String,
 text:x=>String(x??'').trim(),
 ccMrszPhotoState_:{fixtures:[],matches:[],tables:[],userMatches:[]},
 ccBrszEffectiveMatches_:[]});
vm.runInContext(cut('function ccMrszNormPairName_(', 'function ccMrszLocalKickoff_('),ctx);
vm.runInContext(cut('function ccMrszLocalKickoff_(', '// One display for linked Manager events'),ctx);
vm.runInContext(cut('function ccMatchSourceId_(', 'function ccCanEditLeagueSource_('),ctx);
vm.runInContext(cut('const CC_MANAGER_KNOWN_DATE_MOVES_', '// An unscored BEAC'),ctx);
const group=labels[1][0];
test('All 300 source rows in 5 leagues pass the complete-season gate',()=>{
 const rows=imported();
 assert.equal(rows.length,300);
 assert.equal(ctx.ccManagerCompleteUserSchedule_(rows),true);
 assert.equal(ctx.ccManagerCompleteUserSchedule_(rows.slice(0,140)),false);
 const old=imported();old[2]._ccSourceSystem='brsz';
 assert.equal(ctx.ccManagerCompleteUserSchedule_(old),false);
 const invalid=imported();const postponed=invalid.find(x=>x.status==='postponed');
 assert.ok(postponed);postponed.status='scheduled';
 assert.equal(ctx.ccManagerCompleteUserSchedule_(invalid),false,'Undated scheduled match must fail closed');
});
test('The entire men B group shows 42 fixtures/results, not the old duplicate PDSE',()=>{
 const rows=imported(),legacy={competitionLabel:group,homeName:'BEAC',awayName:'PDSE',
 startsAt:'2026-10-12T19:30:00',homeSets:null,awaySets:null};
 ctx.ccMrszPhotoState_={userMatches:rows,fixtures:[legacy],matches:[],tables:[]};
 ctx.ccBrszEffectiveMatches_=[legacy];
 const selected=ctx.ccMrszMergedLeagueMatches_(group);
 assert.equal(selected.length,42);
 assert.ok(selected.some(m=>m.homeName==='BEAC'&&m.awayName==='PDSE'&&
  ctx.ccMrszLocalKickoff_(m.startsAt).date==='2026-10-19'));
 assert.ok(!selected.some(m=>m.homeName==='BEAC'&&m.awayName==='PDSE'&&
  ctx.ccMrszLocalKickoff_(m.startsAt).date==='2026-10-12'));
});
test('Manager editable identity stays exact for user imported fixtures',()=>{
 const selected=ctx.ccMrszMergedLeagueMatches_(group);
 const m=selected.find(x=>x.homeName==='BEAC'&&x.awayName==='PDSE');
 const id=ctx.ccMatchSourceId_(m);
 assert.equal(id.system,'user');
 assert.equal(id.season,'2026/27');
 assert.equal(id.key,'ui20261018:menB:beac:pdse:1');
 const found=ctx.ccMatchSourceFind_(id);
 assert.ok(found);
 assert.equal(found.sourceMatchKey,id.key);
});
test('An MRSZ score and protocol for same fixture are preserved',()=>{
 const rows=imported(),fixture=rows.find(x=>x.competitionLabel===group&&x._ccSourceKind==='fixture');
 const match={competitionLabel:group,homeName:fixture.homeName,awayName:fixture.awayName,
  startsAt:fixture.startsAt,homeSets:3,awaySets:1,matchCode:'999',
  protocol:{teams:[{name:fixture.homeName,players:[]},{name:fixture.awayName,players:[]}]}};
 ctx.ccMrszPhotoState_={userMatches:rows,fixtures:[],matches:[match],tables:[]};
 ctx.ccBrszEffectiveMatches_=[];
 const list=ctx.ccMrszMergedLeagueMatches_(group);
 assert.equal(list.length,42);
 assert.ok(list.some(m=>m.matchCode==='999'&&m.isPhoto));
});
test('Conflicting result scores receive explicit review flag',()=>{
 const rows=imported(),m=rows.find(x=>x.competitionLabel===group&&x._ccSourceKind==='result');
 ctx.ccMrszPhotoState_={userMatches:rows,fixtures:[],matches:[{
  competitionLabel:group,homeName:m.homeName,awayName:m.awayName,
  startsAt:m.startsAt,homeSets:0,awaySets:3}],tables:[]};
 const list=ctx.ccMrszMergedLeagueMatches_(group);
 assert.ok(list.some(x=>x.__ccResultConflict));
 assert.ok(js.includes('Eltérő mentett eredmények – ellenőrizendő'));
});
test('Incomplete import falls back to pre-existing league fixtures',()=>{
 const legacy={competitionLabel:group,homeName:'BEAC',awayName:'PDSE',
 startsAt:'2026-10-12T19:30:00',homeSets:null,awaySets:null};
 ctx.ccMrszPhotoState_={userMatches:imported().slice(0,40),fixtures:[legacy],matches:[],tables:[]};
 ctx.ccBrszEffectiveMatches_=[];
 const list=ctx.ccMrszMergedLeagueMatches_(group);
 assert.equal(list.length,1);
 assert.equal(ctx.ccMrszLocalKickoff_(list[0].startsAt).date,'2026-10-12');
});
