import test from 'node:test';
import assert from 'node:assert/strict';
import {loadManagerTestPreview} from '../apps/manager/test-rpc-bridge.js';
import {loadPlayerTestPreview} from '../apps/player/test-rpc-bridge.js';

const session={url:'https://szzoubvhlwnojtzqjebc.supabase.co',publishableKey:'test-public-key',accessToken:'test-jwt'};
function mockWindow(){
 const events=[];
 const old=globalThis.window;
 globalThis.window={dispatchEvent(event){events.push(event)}};
 return {events,restore(){globalThis.window=old}};
}
function withFetch(fn){
 const old=globalThis.fetch;
 globalThis.fetch=fn;
 return ()=>{globalThis.fetch=old};
}
test('Manager TEST bridge maps permission-filtered events and players',async()=>{
 const w=mockWindow();
 const restore=withFetch(async(url,init)=>{
  assert.match(url,/szzoubvhlwnojtzqjebc\.supabase\.co\/rest\/v1\/rpc\/cc_v2_manager_read_v1$/);
  assert.equal(init.method,'POST');
  assert.equal(init.headers.Authorization,'Bearer test-jwt');
  return {ok:true,json:async()=>({schemaVersion:1,trainings:[{eventId:'e1',teamId:'t1',teamName:'BEAC',title:'Edzés',startsAt:'2026-11-10T18:00:00Z'}],matches:[],players:[{playerId:'p1',displayName:'Teszt',teamId:'t1'}]})};
 });
 try{
  const data=await loadManagerTestPreview(session);
  assert.equal(data.events.length,1);
  assert.equal(data.players[0].id,'p1');
  assert.equal(w.events.length,1);
  assert.equal(w.events[0].type,'cc:v2-test-data');
 }finally{restore();w.restore()}
});
test('Player TEST bridge maps own events without direct table reads',async()=>{
 const w=mockWindow();
 const restore=withFetch(async(url,init)=>{
  assert.match(url,/\/rpc\/cc_v2_player_read_v1$/);
  assert.equal(JSON.parse(init.body).p_notification_limit,50);
  return {ok:true,json:async()=>({schemaVersion:1,bootstrap:{events:[{eventId:'e2',title:'Edzés',startsAt:'2026-11-10T18:00:00Z',teamName:'BEAC'}]},notifications:[]})};
 });
 try{
  assert.equal(await loadPlayerTestPreview(session),1);
  assert.equal(w.events[0].detail.events[0].id,'e2');
 }finally{restore();w.restore()}
});
test('Both TEST bridges reject LIVE hosts before any request',async()=>{
 const restore=withFetch(()=>{throw new Error('fetch must not be called')});
 const live={...session,url:'https://snqsxlyhontaepembaic.supabase.co'};
 try{
  await assert.rejects(loadManagerTestPreview(live),/TEST session required/);
  await assert.rejects(loadPlayerTestPreview(live),/TEST session required/);
 }finally{restore()}
});
test('Both TEST bridges reject malformed response versions',async()=>{
 const w=mockWindow();
 const restore=withFetch(async()=>({ok:true,json:async()=>({schemaVersion:2,trainings:[],matches:[],players:[],bootstrap:{events:[]}})}));
 try{
  await assert.rejects(loadManagerTestPreview(session),/Unexpected TEST Manager API response/);
  await assert.rejects(loadPlayerTestPreview(session),/Unexpected TEST Player API response/);
 }finally{restore();w.restore()}
});
