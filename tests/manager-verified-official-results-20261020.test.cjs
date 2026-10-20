'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const app=fs.readFileSync('app.js','utf8');
const first=app.indexOf('  const CC_MANAGER_OFFICIAL_RESULT_REPORTS_='),last=app.indexOf('  function ccManagerScoreboardCard_(',first);
assert.ok(first>0&&last>first);
const context=vm.createContext({
 text:x=>String(x??'').trim(),
 ccMrszNormPairName_:x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,''),
 ccMrszLocalKickoff_:x=>({date:String(x||'').slice(0,10)}),
 eventType:()=> 'match',
 eventTeamId:()=> '10000000-0000-4000-8000-000000000003',
 ccMrszPhotoState_:{userMatches:[]}
});
vm.runInContext(app.slice(first,last)+';this.qa={verified:ccManagerVerifiedOfficialReport_,own:ccManagerOfficialResultForEvent_};',context);
const result=(which='men')=>which==='men'?{
 sourceMatchKey:'ui20261018:menB:beac:pdse:1',_ccSourceSystem:'user',_ccSourceKind:'result',season:'2026/27',status:'played',
 competitionLabel:'Férfi Budapest I. osztály – B csoport',startsAt:'2026-10-19T19:30:00',homeName:'BEAC',awayName:'PDSE',
 homeSets:3,awaySets:0,setScores:[{home:25,away:18},{home:25,away:23},{home:25,away:20}]
}:{
 sourceMatchKey:'ui20261018:womenI:panoramase:kresc:1',_ccSourceSystem:'user',_ccSourceKind:'result',season:'2026/27',status:'played',
 competitionLabel:'Női Budapest I. osztály',startsAt:'2026-10-19T19:00:00',homeName:'Panoráma SE',awayName:'KRE SC',
 homeSets:0,awaySets:3,setScores:[{home:17,away:25},{home:10,away:25},{home:12,away:25}]
};
test('Only the two exact verified MRSZ scorecards receive official protocol links',()=>{
 assert.match(context.qa.verified(result()).url,/p_merkozes_kod=2699/);
 assert.match(context.qa.verified(result('women')).url,/p_merkozes_kod=2677/);
 const baseline=result();
 for(const variant of [{...baseline,homeSets:0},{...baseline,status:'scheduled'},
   {...baseline,setScores:[{home:25,away:18},{home:25,away:24},{home:25,away:20}]},
   {...baseline,startsAt:'2026-10-12T19:30:00'},{...baseline,sourceMatchKey:'other'}]){
   assert.equal(context.qa.verified(variant),null);
 }
});
test('BEAC event on the real Oct 19 date receives the score, stale Oct 12 match does not',()=>{
 context.ccMrszPhotoState_={userMatches:[result()]};
 const e={id:'actual-uuid',title:'PDSE',startsAt:'2026-10-19T19:30:00'};
 assert.equal(context.qa.own(e).homeSets,3);
 assert.equal(context.qa.own({...e,startsAt:'2026-10-12T19:30:00'}),null);
 assert.equal(context.qa.own({...e,title:'MAFC'}),null);
});
test('Protocol decoration leaves BEAC event UUID and roster load untouched',()=>{
 assert.ok(app.includes("await loadEventRoster(id)"));
 assert.ok(app.includes("ccManagerOfficialResultForEvent_(e)"));
 assert.ok(app.includes("ccManagerVerifiedOfficialReport_(m)"));
});
