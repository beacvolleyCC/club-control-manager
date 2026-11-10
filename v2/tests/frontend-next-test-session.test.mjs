import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 TEST_ORIGIN,TestAccessError,createTestAuthSession,readTestRpc,testManagerWindow
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
