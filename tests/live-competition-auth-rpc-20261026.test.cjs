'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {config,run,requestSnapshot,MANAGER,PLAYER}=require('../scripts/qa/live-competition-auth-rpc.cjs');
const t=(n)=>`${n.toString(36).repeat(28)}.${'b'.repeat(28)}.${'c'.repeat(28)}`;
function makeEnv(){
 return {
 CC_TEST_PROJECT_REF:'ccstagingexample12345',
 CC_TEST_SUPABASE_URL:'https://ccstagingexample12345.supabase.co',
 CC_TEST_PUBLISHABLE_KEY:'sb_publishable_test_not_real',
 CC_TEST_ENV:'staging',CC_TEST_EXPECT_MATCHES:'2',
 CC_TEST_MANAGER_ALLOWED_JWT:t(1),CC_TEST_MANAGER_DENIED_JWT:t(2),
 CC_TEST_PLAYER_ALLOWED_JWT:t(3),CC_TEST_PLAYER_INACTIVE_JWT:t(4),
 CC_TEST_PLAYER_EXPIRED_MEMBERSHIP_JWT:t(5),
 CC_TEST_PLAYER_OUTSIDER_JWT:t(6)
 };
}
const sample={ok:true,canonicalMatches:[
 {matchId:'a',sourceKey:'k1',competitionLabel:'Férfi Budapest I/B'},
 {matchId:'b',sourceKey:'k2',competitionLabel:'Női Budapest I'}
]};
test('staging smoke uses eight exact GET-only RPC calls; no token in result/log',async()=>{
 const env=makeEnv(),allTokens=new Set([
 env.CC_TEST_MANAGER_ALLOWED_JWT,env.CC_TEST_PLAYER_ALLOWED_JWT
 ]);
 const requests=[],lines=[];
 const fakeFetch=async(url,opts)=>{
  requests.push({url,opts});
  const token=opts.headers.Authorization?.slice(7);
  const success=allTokens.has(token);
  return {status:success?200:403,ok:success,json:async()=>sample};
 };
 assert.equal(await run(env,fakeFetch,line=>lines.push(line)),8);
 assert.equal(requests.length,8);
 for(const r of requests){
  assert.equal(r.opts.method,'GET');
  assert.equal(r.opts.redirect,'error');
  assert.equal(r.opts.body,undefined);
  assert.ok(r.url===`${env.CC_TEST_SUPABASE_URL}/rest/v1/rpc/${MANAGER}`||
            r.url===`${env.CC_TEST_SUPABASE_URL}/rest/v1/rpc/${PLAYER}`);
  assert.ok(!r.url.includes('JWT'));
 }
 assert.ok(lines.every(x=>!Object.values(env).some(v=>typeof v==='string'&&v.length>60&&x.includes(v))));
});
test('fail closed when manager access is unexpectedly granted',async()=>{
 const env=makeEnv();
 const fakeFetch=async()=>({status:200,ok:true,json:async()=>sample});
 await assert.rejects(()=>run(env,fakeFetch,()=>{}),/denied actor/);
});
test('fail closed when permitted read returns incomplete canonical data',async()=>{
 const env=makeEnv();
 const fakeFetch=async(url,opts)=>{
  if(!opts.headers.Authorization)return {status:403,ok:false};
  return {status:200,ok:true,json:async()=>({ok:true,canonicalMatches:[sample.canonicalMatches[0]]})};
 };
 await assert.rejects(()=>run(env,fakeFetch,()=>{}),/canonical payload shape/);
});
test('missing, shared or incorrectly scoped credentials stop before networking',async()=>{
 const e=makeEnv();delete e.CC_TEST_PLAYER_INACTIVE_JWT;
 assert.throws(()=>config(e),/Missing\/invalid format/);
 const f=makeEnv();f.CC_TEST_PLAYER_OUTSIDER_JWT=f.CC_TEST_PLAYER_ALLOWED_JWT;
 assert.throws(()=>config(f),/distinct/);
 const g=makeEnv();g.CC_TEST_ENV='production';
 assert.throws(()=>config(g),/staging-only/);
 const live=makeEnv();live.CC_TEST_PROJECT_REF='snqsxlyhontaepembaic';
 live.CC_TEST_SUPABASE_URL='https://snqsxlyhontaepembaic.supabase.co';
 live.CC_CONFIRM_LIVE_READONLY='YES';
 assert.throws(()=>config(live),/LIVE Supabase project blocked/);
 const legacy=makeEnv();legacy.CC_CONFIRM_LIVE_READONLY='YES';
 assert.throws(()=>config(legacy),/GET request cannot guarantee/);
 const h=makeEnv();h.CC_TEST_SUPABASE_URL='https://supabase.example.net';
 assert.throws(()=>config(h),/Endpoint/);
 const i=makeEnv();i.CC_TEST_PUBLISHABLE_KEY='sb_secret_forbidden';
 assert.throws(()=>config(i),/secret key forbidden/);
});
test('unapproved RPC is never queried',async()=>{
 const c=config(makeEnv());let called=false;
 await assert.rejects(()=>requestSnapshot(async()=>{called=true},{...c},'cc_manager_delete_all_v1',null),/Unapproved RPC/);
 assert.equal(called,false);
});

test('known Club Control production is blocked before any fetch, even with staging label',async()=>{
 const env=makeEnv();
 env.CC_TEST_PROJECT_REF='snqsxlyhontaepembaic';
 env.CC_TEST_SUPABASE_URL='https://snqsxlyhontaepembaic.supabase.co';
 let requests=0;
 await assert.rejects(()=>run(env,async()=>{requests++;throw Error('Should not fetch')},()=>{}),
  /LIVE Supabase project blocked/);
 assert.equal(requests,0);
});
