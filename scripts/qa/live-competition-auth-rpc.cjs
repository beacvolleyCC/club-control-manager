'use strict';
// Club Control 2026/27: staging-only, real-JWT, HTTP GET-only RPC acceptance.
// Never submit a user JWT/password through GitHub, a PR, screenshots or chat.
// Node 22. No service-role keys. Does not log tokens, bodies or athlete records.
// IMPORTANT: a Manager GET may bind an unbound auth_user_id and INSERT an audit log.
// GET is NOT equivalent to a transaction marked READ ONLY. Never target production.
const assert=require('node:assert/strict');

const MANAGER='cc_manager_competition_mrsz_snapshot_v2';
const PLAYER='cc_player_competition_mrsz_snapshot_v2';
// Explicitly block the known Club Control LIVE environment, even if mislabeled staging.
const LIVE_PROJECT_REF='snqsxlyhontaepembaic';
const REQUIRED=[
 'CC_TEST_MANAGER_ALLOWED_JWT','CC_TEST_MANAGER_DENIED_JWT',
 'CC_TEST_PLAYER_ALLOWED_JWT','CC_TEST_PLAYER_INACTIVE_JWT',
 'CC_TEST_PLAYER_EXPIRED_MEMBERSHIP_JWT','CC_TEST_PLAYER_OUTSIDER_JWT'
];
const CASES=[
 ['anonymous manager',MANAGER,null,false],
 ['anonymous player',PLAYER,null,false],
 ['manager allowed',MANAGER,'CC_TEST_MANAGER_ALLOWED_JWT',true],
 ['manager denied',MANAGER,'CC_TEST_MANAGER_DENIED_JWT',false],
 ['player active',PLAYER,'CC_TEST_PLAYER_ALLOWED_JWT',true],
 ['player inactive',PLAYER,'CC_TEST_PLAYER_INACTIVE_JWT',false],
 ['player expired membership',PLAYER,'CC_TEST_PLAYER_EXPIRED_MEMBERSHIP_JWT',false],
 ['player outsider',PLAYER,'CC_TEST_PLAYER_OUTSIDER_JWT',false]
];
function config(env) {
 const ref=String(env.CC_TEST_PROJECT_REF||'');
 if(!/^[a-z0-9]{16,30}$/.test(ref))throw Error('CC_TEST_PROJECT_REF missing/invalid');
 const url=String(env.CC_TEST_SUPABASE_URL||'');
 if(url!==`https://${ref}.supabase.co`)throw Error('Endpoint must exactly match selected Supabase project (HTTPS, no path)');
 const apiKey=String(env.CC_TEST_PUBLISHABLE_KEY||'');
 if(!apiKey || apiKey.startsWith('sb_secret_') || apiKey.length>2048)
   throw Error('Missing publishable/legacy anon key; secret key forbidden');
 if(env.CC_TEST_ENV!=='staging')
   throw Error('Live or unrecognized environment blocked: staging-only auth QA');
 if(ref===LIVE_PROJECT_REF)
   throw Error('Known LIVE Supabase project blocked even when labeled staging: Manager RPC can bind an auth account');
 if(env.CC_CONFIRM_LIVE_READONLY==='YES')
   throw Error('A GET request cannot guarantee no database writes: remove the obsolete LIVE flag');
 const tokens={};
 for(const key of REQUIRED){
  const jwt=String(env[key]||'');
  if(jwt.split('.').length!==3 || jwt.length<24)throw Error(`Missing/invalid format: ${key}`);
  tokens[key]=jwt;
 }
 if(new Set(Object.values(tokens)).size!==REQUIRED.length)
   throw Error('All test personas must use distinct access tokens');
 const expectedCount=env.CC_TEST_EXPECT_MATCHES===undefined?298:Number(env.CC_TEST_EXPECT_MATCHES);
 if(!Number.isSafeInteger(expectedCount)||expectedCount<1)throw Error('Invalid CC_TEST_EXPECT_MATCHES');
 return {url,apiKey,tokens,expectedCount};
}
async function requestSnapshot(fetchImpl,c,rpc,token) {
 if(rpc!==MANAGER && rpc!==PLAYER)throw Error('Unapproved RPC');
 const headers={apikey:c.apiKey,Accept:'application/json'};
 if(token)headers.Authorization=`Bearer ${token}`;
 const response=await fetchImpl(`${c.url}/rest/v1/rpc/${rpc}`,{
  method:'GET',headers,redirect:'error',
  signal:AbortSignal.timeout(20000)
 });
 const status=response.status;
 if(!response.ok)return {status,allowed:false,valid:false};
 let value;
 try{value=await response.json()}catch{return {status,allowed:true,valid:false}};
 const valid=Boolean(value&&value.ok===true &&
   Array.isArray(value.canonicalMatches) &&
   value.canonicalMatches.length===c.expectedCount &&
   new Set(value.canonicalMatches.map(m=>m.matchId)).size===c.expectedCount &&
   value.canonicalMatches.every(m=>m.matchId && m.sourceKey && m.competitionLabel));
 return {status,allowed:true,valid};
}
async function run(env,fetchImpl=fetch,logger=console.log) {
 const c=config(env);let successful=0;
 for(const [name,rpc,persona,shouldAllow] of CASES) {
  const result=await requestSnapshot(fetchImpl,c,rpc,persona?c.tokens[persona]:null);
  if(shouldAllow){
   assert.equal(result.status,200,`${name}: allowed read must return HTTP 200; got ${result.status}`);
   assert.equal(result.valid,true,`${name}: canonical payload shape/count/IDs are invalid`);
  }else{
   assert.ok(result.status===401||result.status===403,
     `${name}: denied actor must receive 401 or 403; got ${result.status}`);
  }
  successful++;
  logger(`PASS: ${name} — HTTP ${result.status}`);
 }
 logger(`PASS: ${successful} staging GET-only role checks; no results or credentials printed`);
 return successful;
}
module.exports={config,requestSnapshot,run,MANAGER,PLAYER,CASES};
if(require.main===module) {
 run(process.env).catch(err=>{
  // Never emit fetch exceptions: URLs and implementation details may include secrets.
  const safe=String(err&&err.message||'QA failed')
    .replace(/Bearer\s+\S+/gi,'Bearer [REDACTED]');
  console.error('FAIL: '+safe.slice(0,250));process.exitCode=1;
 });
}
