import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 TEST_ORIGIN,TestAccessError,createTestAuthSession,readTestRpc,readTestManagerModules,readTestLegacyList,testManagerWindow,testManagerMassWindow,readTestMassEventDetail,readTestMassWaitlistSummary,readTestMassPasses,testCurrentBudapestMonth
} from '../frontend-next/shared/test-rpc.js';
const response=(payload,status=200)=>({ok:status>=200&&status<300,status,json:async()=>payload});
test('TEST auth sends OTP without registering unknown users and retains JWT only in memory',async()=>{
 const seen=[];
 const model=createTestAuthSession({request:async(url,init)=>{
  seen.push({url,method:init.method,headers:init.headers,body:JSON.parse(init.body)});
  if(url.endsWith('/otp'))return response({});
  if(url.endsWith('/verify'))return response({access_token:'jwt-fixture',expires_in:240});
  throw new Error('Unexpected network call');
 }});
 assert.equal(await model.requestCode(' qa@example.com '),true);
 const session=await model.verifyCode('qa@example.com','123456');
 assert.equal(session.accessToken,'jwt-fixture');
 assert.equal(seen.length,2);
 assert.ok(seen.every(x=>x.url.startsWith(TEST_ORIGIN+'/auth/v1/')&&x.method==='POST'));
 assert.equal(seen[0].body.create_user,false);
 assert.equal(seen[1].body.type,'email');
 model.clear();assert.equal(model.current(),null);
});
test('late verify response cannot revive a signed-out session',async()=>{
 let finish;
 const request=async(url)=>{
  if(url.endsWith('/verify'))return new Promise(resolve=>finish=resolve);
  return response({});
 };
 const model=createTestAuthSession({request});
 const pending=model.verifyCode('qa@example.com','123456');
 model.clear();
 finish(response({access_token:'stale',expires_in:300}));
 assert.equal(await pending,null);assert.equal(model.current(),null);
});
test('expired access is rejected before readout and never persisted',async()=>{
 let now=100000;
 const model=createTestAuthSession({clock:()=>now,request:async()=>response({access_token:'fixture',expires_in:60})});
 assert.ok(await model.verifyCode('qa@example.com','123456'));
 now+=46000;assert.equal(model.current(),null);
 for(const path of ['../frontend-next/shared/test-rpc.js','../frontend-next/shared/test-auth-ui.js']){
  const code=readFileSync(new URL(path,import.meta.url),'utf8');
  assert.doesNotMatch(code,/localStorage|sessionStorage|indexedDB|document\.cookie|service_role/);
 }
});
test('RPC allowlist and fixed TEST origin prohibit writes, anonymous reads and schema drift',async()=>{
 const calls=[];
 const request=async(url,init)=>{calls.push({url,init});return response({schemaVersion:1,trainings:[],matches:[],players:[]})};
 const session={accessToken:'jwt-fixture',expiresAt:999999};
 await readTestRpc(session,'cc_v2_manager_read_v1',testManagerWindow(),{request});
 assert.equal(calls.length,1);
 assert.equal(calls[0].url,TEST_ORIGIN+'/rest/v1/rpc/cc_v2_manager_read_v1');
 assert.match(calls[0].init.headers.Authorization,/^Bearer /);
 await assert.rejects(readTestRpc(session,'cc_v2_manager_mass_booking_write_v1',{}, {request}),/read-only/);
 await assert.rejects(readTestRpc({},'cc_v2_player_read_v1',{}, {request}),/belépés/);
 assert.equal(calls.length,1);
 await assert.rejects(readTestRpc(session,'cc_v2_player_read_v1',{}, {request:async()=>response({schemaVersion:2})}),/Ismeretlen V2/);
 await assert.rejects(readTestRpc(session,'cc_v2_player_read_v1',{}, {request:async()=>response({message:'no'},403)}),e=>e instanceof TestAccessError&&e.status===403);
});
test('Manager read window is ISO UTC and has bounded horizon',()=>{
 const range=testManagerWindow(()=>new Date('2026-11-10T11:00:00Z'));
 assert.ok(Date.parse(range.p_from)<Date.parse(range.p_to));
 assert.ok(Date.parse(range.p_to)-Date.parse(range.p_from)<200*86400000);
 assert.equal(range.p_team_id,null);
});


test('one denied Manager module never blocks an authorized module or reveals data',async()=>{
 const calls=[];
 const session={accessToken:'jwt-fixture'};
 const request=async(url,init)=>{
  const rpc=url.split('/').pop(),args=JSON.parse(init.body);
  calls.push({rpc,args,method:init.method,authorization:init.headers.Authorization});
  if(rpc==='cc_manager_events_v1'){
   assert.deepEqual(Object.keys(args).sort(),['p_from','p_kind','p_team_id','p_to'].sort());
   return args.p_kind==='training'?response([{eventId:'safe-training',title:'Edzés'}]):response({message:'not authorized'},403);
  }
  if(rpc==='cc_manager_players_v2'){
   assert.deepEqual(args,{p_team_id:null,p_query:''});
   return response([]);
  }
  if(rpc==='cc_manager_teams_v1'){
   assert.deepEqual(args,{});
   return response({message:'not authorized'},403);
  }
  if(rpc==='cc_v2_manager_mass_read_v1'){
   assert.deepEqual(Object.keys(args).sort(),['p_from','p_to']);
   assert.match(args.p_from,/^\d{4}-\d{2}-\d{2}$/);
   return response({schemaVersion:1,trainings:[{eventId:'mass-safe',level:'Kezdő'}]});
  }
  if(rpc==='cc_v2_manager_mass_passes_read_v1'){
   assert.deepEqual(args,{p_query:'',p_month:'2026-11'});
   return response({schemaVersion:1,passes:[{passNumber:'TEST-B1',validMonth:'2026-11'}]});
  }
  throw new Error('Unexpected RPC '+rpc);
 };
 const {data,available,errors}=await readTestManagerModules(session,{request,clock:()=>new Date('2026-11-10T11:00:00Z')});
 assert.deepEqual(available,{trainings:true,matches:false,players:true,teams:false,massTrainings:true,massPasses:true});
 assert.equal(data.trainings[0].eventId,'safe-training');
 assert.equal(data.massTrainings[0].eventId,'mass-safe');
 assert.equal(data.massPasses[0].passNumber,'TEST-B1');
 assert.deepEqual(data.matches,[]);
 assert.deepEqual(data.players,[]);
 assert.deepEqual(data.teams,[]);
 assert.equal(errors.matches,'Nincs jogosultság.');
 assert.equal(calls.length,6);
 assert.ok(calls.every(x=>x.method==='POST'&&x.authorization==='Bearer jwt-fixture'));
});

test('empty authorized list is not confused with access denied, malformed data fails closed',async()=>{
 const request=async(url,init)=>{
  const rpc=url.split('/').pop(),args=JSON.parse(init.body);
  if(rpc==='cc_manager_events_v1')return response([]);
  if(rpc==='cc_manager_players_v2')return response({unexpected:'not-array'});
  return response({message:'no access'},403);
 };
 const {data,available,errors}=await readTestManagerModules({accessToken:'test'}, {request});
 assert.equal(available.trainings,true);
 assert.equal(available.matches,true);
 assert.equal(available.players,false);
 assert.equal(available.teams,false);
 assert.deepEqual(data.players,[]);
 assert.equal(errors.players,'A modul adatai nem tölthetők be.');
 await assert.rejects(readTestLegacyList({accessToken:'test'},'cc_v2_manager_mass_booking_write_v1',{}, {request}),/read-only/);
});

test('all Manager modules denied leaves no visible data and aborted request cannot publish results',async()=>{
 const request=async()=>response({message:'forbidden'},403);
 const denied=await readTestManagerModules({accessToken:'test'}, {request});
 assert.ok(Object.values(denied.available).every(value=>value===false));
 assert.ok(Object.values(denied.data).every(value=>Array.isArray(value)&&value.length===0));
 const controller=new AbortController();controller.abort();
 await assert.rejects(readTestManagerModules({accessToken:'test'}, {request,signal:controller.signal}),/cancelled/);
});

test('Budapest mass dates use calendar days, never full timestamp arguments',()=>{
 const range=testManagerMassWindow(()=>new Date('2026-11-10T23:30:00Z'));
 assert.match(range.p_from,/^\d{4}-\d{2}-\d{2}$/);
 assert.match(range.p_to,/^\d{4}-\d{2}-\d{2}$/);
 assert.equal(Math.round((Date.parse(range.p_to)-Date.parse(range.p_from))/86400000),165);
});


test('mass detail enforces event-list membership before making any request',async()=>{
 const session={accessToken:'TEST-token'},allowed=new Set(['evt-01']);let calls=0;
 const request=async(url,init)=>{
  calls++;
  assert.equal(url,TEST_ORIGIN+'/rest/v1/rpc/cc_v2_manager_mass_event_detail_v1');
  assert.deepEqual(JSON.parse(init.body),{p_event_id:'evt-01'});
  return response({schemaVersion:1,externalEventId:'evt-01',
   detail:{event:{eventId:'evt-01',level:'Kezdő'},bookings:[{id:'b1',name:'Teszt Sportoló'}],waitlist:[{id:'w1',status:'VÁRAKOZIK'}]}});
 };
 await assert.rejects(readTestMassEventDetail(session,'other',allowed,{request}),/ismeretlen TEST/);
 await assert.rejects(readTestMassEventDetail(session,'',allowed,{request}),/ismeretlen TEST/);
 assert.equal(calls,0);
 const detail=await readTestMassEventDetail(session,'evt-01',allowed,{request});
 assert.equal(detail.bookings.length,1);
 assert.equal(detail.waitlist.length,1);
 assert.equal(calls,1);
});

test('mass detail mismatch, malformed schema and forbidden access are fail-closed',async()=>{
 const allowed=new Set(['evt-01']),session={accessToken:'TEST-token'};
 const badBody={schemaVersion:1,externalEventId:'evt-99',
  detail:{event:{eventId:'evt-99'},bookings:[],waitlist:[]}};
 await assert.rejects(readTestMassEventDetail(session,'evt-01',allowed,
  {request:async()=>response(badBody)}),/Hibás TEST edzésrészlet/);
 const badArray={schemaVersion:1,externalEventId:'evt-01',
  detail:{event:{eventId:'evt-01'},bookings:null,waitlist:[]}};
 await assert.rejects(readTestMassEventDetail(session,'evt-01',allowed,
  {request:async()=>response(badArray)}),/Hibás TEST edzésrészlet/);
 await assert.rejects(readTestMassEventDetail(session,'evt-01',allowed,
  {request:async()=>response({message:'forbidden'},403)}),
  error=>error instanceof TestAccessError&&error.status===403);
});

test('mass waitlist summary is authorized, date-limited and count-only',async()=>{
 let calls=0;const session={accessToken:'TEST-token'};
 const request=async(url,init)=>{
  calls++;
  assert.equal(url,TEST_ORIGIN+'/rest/v1/rpc/cc_v2_manager_mass_waitlist_summary_v1');
  const args=JSON.parse(init.body);assert.match(args.p_from,/^2026-/);
  return response({schemaVersion:1,events:[{eventId:'evt-01',waiting:2,offered:1,expired:0}]});
 };
 const summary=await readTestMassWaitlistSummary(session,{request,clock:()=>new Date('2026-11-10T08:00:00Z')});
 assert.equal(summary[0].waiting,2);
 assert.equal(calls,1);
 await assert.rejects(readTestMassWaitlistSummary(session,{request:async()=>response({schemaVersion:1,events:null})}),/Hibás TEST várólista/);
});

test('mass passes require valid month and server-confirmed scope',async()=>{
 let calls=0;
 const session={accessToken:'TEST-token'};
 const request=async(url,init)=>{
  calls++;
  assert.equal(url,TEST_ORIGIN+'/rest/v1/rpc/cc_v2_manager_mass_passes_read_v1');
  assert.deepEqual(JSON.parse(init.body),{p_query:'Teszt',p_month:'2026-11'});
  return response({schemaVersion:1,passes:[{product:'Novemberi bérlet',validMonth:'2026-11'}]});
 };
 const rows=await readTestMassPasses(session,{query:'Teszt',month:'2026-11'},{request});
 assert.equal(rows.length,1);
 assert.equal(calls,1);
 await assert.rejects(readTestMassPasses(session,{month:'2026-13'},{request}),/Érvénytelen/);
 await assert.rejects(readTestMassPasses(session,{query:'x'.repeat(151)},{request}),/Érvénytelen/);
 assert.equal(calls,1);
 assert.equal(testCurrentBudapestMonth(()=>new Date('2026-11-30T23:30:00Z')),'2026-12');
});
