'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {select2024Beac,select2025Exceptions,verifyRecord}=require('../scripts/history/audit-stage10-beac-and-exceptions.cjs');
const l=name=>JSON.parse(fs.readFileSync(path.join(__dirname,'../data/competition-history/'+name),'utf8'));
const y24=l('women1_2024_25_official_league_snapshot.json'),y25=l('women1_2025_26_official_league_snapshot.json');
test('2024/25 includes 24 distinct BEAC fixture IDs from official league index',()=>{
 const rows=select2024Beac(y24);
 assert.equal(rows.length,24);
 assert.ok(rows.every(m=>m.status==='scored'&&m.season==='2024'));
 assert.ok(rows.every(m=>m.url.includes('p_verseny_al_kod=72')&&m.url.includes('p_evad_kod=2024')));
});
test('2025/26 exceptions are exactly original eight official match codes',()=>{
 const rows=select2025Exceptions(l('women1_2025_26_opponent_protocols.json'),
  l('women1_2025_26_beac_remaining_protocols.json'),y25);
 assert.deepEqual(rows.map(m=>m.code).sort(),['2443','2667','3053','4071','7354','7777','7803','7822']);
});
test('correct MRSZ ID-bearing BEAC roster can be trusted with K/CS null',()=>{
 const match=select2024Beac(y24).find(m=>m.home==='BEAC');
 const expected={status:'verified_official_score',date:match.date,home:'BEAC',away:'MTK Budapest',
  homeSets:match.homeSets,awaySets:match.awaySets,
  twoRosterListsVerified:true,
  teams:[{name:'BEAC',rosterComplete:true,players:[{code:'27892',name:'ALBERT ANNA',shirt:16,designation:null}]},
    {name:'MTK Budapest',rosterComplete:true,players:[{code:'21301',name:'JUHOS ROZÁLIA',shirt:1,designation:'CS'}]}],
  warnings:[],errors:[]};
 // Opponent mismatches are not accepted just because a player ID looks valid.
 const wrong=verifyRecord(match,expected,200);
 if(match.away!=='MTK Budapest')assert.equal(wrong.twoCompleteRostersById,false);
 const right={...expected,home:'BEAC',away:require('../scripts/history/audit-women1-2024-snapshot.cjs').ALIASES[match.away]};
 right.teams=[right.teams[0],{...right.teams[1],name:right.away}];
 const out=verifyRecord(match,right,200);
 assert.equal(out.beacRosterVerified,true);
 assert.equal(out.rosterTeams[0].players[0].designation,null);
});
test('an unscored official protocol may retain separately attributed player evidence',()=>{
 const match=select2025Exceptions(l('women1_2025_26_opponent_protocols.json'),
  l('women1_2025_26_beac_remaining_protocols.json'),y25).find(m=>m.code==='2443');
 const result=verifyRecord(match,{status:'no_verified_protocol_score',date:match.date,
  home:'Mozdulj',away:'Ráckeve',scoreVerified:false,twoRosterListsVerified:true,
  teams:[{name:'Mozdulj',rosterComplete:true,players:[{code:'68634',name:'TARR GLÓRIA',designation:null}]},
   {name:'Ráckeve',rosterComplete:true,players:[{code:'25038',name:'MOLNÁR NIKOLETTA',designation:null}]}],
  warnings:[],errors:[]},200);
 assert.equal(result.officialScoreAndBothRosters,false);
 assert.equal(result.twoCompleteRostersById,true);
 assert.equal(result.protocolScoreAgrees,false);
});
