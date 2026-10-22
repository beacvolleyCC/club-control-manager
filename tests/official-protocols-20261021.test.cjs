'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=JSON.parse(fs.readFileSync('data/competition/2026-27/official-protocols-20261021.json','utf8'));
const items=source.matches;
const byCode=Object.fromEntries(items.map(x=>[x.data.matchCode,x]));
test('two explicitly coded 2026/27 MRSZ protocols, unique source keys',()=>{
 assert.equal(source.deployment,'staged_only');
 assert.deepEqual(items.map(x=>x.data.matchCode).sort((a,b)=>a-b),[2686,2700]);
 assert.equal(new Set(items.map(x=>x.sourceKey)).size,2);
 for(const item of items){
  const m=item.data;
  assert.equal(item.sourceKey,'mrsz:2026/27:protocol:'+m.matchCode);
  assert.equal(m.season,'2026/27');
  assert.equal(m.status,'played');
  assert.equal(m.source,'mrsz_official_protocol_pdf');
  assert.ok(!m.protocolUrl,'External live URL must not be guessed or asserted verified');
  assert.match(item.fileSha256,/^[a-f0-9]{64}$/);
  assert.ok(m.canonicalFixtureSourceKey);
  assert.equal(m.canonicalFixtureSourceKey,item.canonicalFixtureSourceKey);
  assert.equal(m.setScores.length,m.homeSets+m.awaySets);
  assert.equal(m.homeSets,3);
  assert.ok(m.awaySets===1||m.awaySets===2);
  assert.ok(m.startsAt.includes('+02:00'));
  const wins=m.setScores.reduce((a,v)=>(a[0]+(v.home>v.away),a[1]+(v.away>v.home),a),[0,0]);
  assert.deepEqual(wins,[m.homeSets,m.awaySets]);
  for(let j=0;j<m.setScores.length;j++){
   const v=m.setScores[j],last=j===4,winning=Math.max(v.home,v.away),losing=Math.min(v.home,v.away);
   assert.equal(v.set,j+1);
   assert.ok(winning>= (last?15:25) && winning-losing>=2);
   assert.ok(Number.isInteger(v.home)&&Number.isInteger(v.away));
  }
 }
});
test('2686: MTK – Panorama score, court and all roster annotations',()=>{
 const a=byCode[2686],m=a.data;
 assert.equal(m.homeName,'MTK Budapest');assert.equal(m.awayName,'Panoráma SE');
 assert.equal(m.canonicalFixtureSourceKey,'20261001:fixture:39');
 assert.equal(m.startsAt,'2026-10-21T21:00:00+02:00');
 assert.equal(m.homeSourceTeamId,'1092');assert.equal(m.awaySourceTeamId,'753');
 assert.equal(m.homeSets,3);assert.equal(m.awaySets,1);
 assert.deepEqual(m.setScores.map(x=>[x.home,x.away]),[[25,20],[25,9],[20,25],[25,15]]);
 assert.equal(m.rosters.home.length,12);assert.equal(m.rosters.away.length,7);
 assert.equal(m.rosters.home.find(x=>x.name==='PUSKÁS IVETT').designation,null,'No fabricated participation for unmarked player');
 assert.deepEqual(m.rosters.home.filter(x=>x.captain).map(x=>x.registrationId),[21303]);
 assert.deepEqual(m.rosters.away.filter(x=>x.captain).map(x=>x.registrationId),[23161]);
 assert.deepEqual(m.rosters.home.filter(x=>x.libero).map(x=>x.registrationId),[21482]);
 assert.equal(m.referee.registrationId,27000);
});
test('2700: Mozdulj – MAFC five sets, bench/no appearance and officiating',()=>{
 const a=byCode[2700],m=a.data;
 assert.equal(m.homeName,'Mozdulj SE');assert.equal(m.awayName,'MAFC-Vásárhelyi');
 assert.equal(m.canonicalFixtureSourceKey,'brsz:2026/27:menB:userofficial:01');
 assert.equal(m.startsAt,'2026-10-21T20:00:00+02:00');
 assert.equal(m.homeSourceTeamId,'1213');assert.equal(m.awaySourceTeamId,'45');
 assert.deepEqual(m.setScores.map(x=>[x.home,x.away]),[[25,18],[25,23],[21,25],[18,25],[15,11]]);
 assert.equal(m.rosters.home.length,10);assert.equal(m.rosters.away.length,9);
 assert.deepEqual(m.rosters.home.filter(x=>x.designation===null).map(x=>x.registrationId),[61342,76211]);
 assert.deepEqual(m.rosters.home.filter(x=>x.captain).map(x=>x.registrationId),[77930]);
 assert.deepEqual(m.rosters.away.filter(x=>x.captain).map(x=>x.registrationId),[23320]);
 assert.deepEqual(m.rosters.home.filter(x=>x.libero).map(x=>x.registrationId),[75203]);
 assert.deepEqual(m.rosters.away.filter(x=>x.libero).map(x=>x.registrationId),[22046]);
 assert.equal(m.referee.registrationId,42098);
});
test('Both protocols preserve official player IDs and six starters per side',()=>{
 let players=0;const seen=new Set();
 for(const v of items){
  for(const side of ['home','away']){
   const roster=v.data.rosters[side];players+=roster.length;
   assert.equal(roster.filter(x=>x.designation==='K').length,6);
   const codes=new Set(roster.map(x=>x.registrationId));
   assert.equal(codes.size,roster.length,'a person listed twice in one match side');
   for(const x of roster){
    assert.match(x.name,/^[^<>]+$/);
    assert.ok(Number.isInteger(x.jersey)&&x.jersey>0&&x.jersey<100);
    assert.ok(Number.isInteger(x.registrationId)&&x.registrationId>10000);
    assert.ok(x.designation===null||['K','Cs'].includes(x.designation));
    if(x.libero)assert.equal(x.libero,'L1');
   }
  }
  assert.equal(v.data.rosters.home.filter(x=>x.captain).length,1);
  assert.equal(v.data.rosters.away.filter(x=>x.captain).length,1);
  assert.ok(!seen.has(v.sourceKey));
  seen.add(v.sourceKey);
 }
 assert.equal(players,38);
});
test('Staging cannot silently touch Player events, bookings or canonical match sources',()=>{
 const raw=fs.readFileSync('data/competition/2026-27/official-protocols-20261021.json','utf8');
 assert.doesNotMatch(raw,/\"linked_event_id\"|\"player_id\"|\"notify\"|\"availability\"/);
 assert.match(raw,/staged_only/);
});
