import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import handler from '../vnext/mass-gateway/src/worker.mjs';

globalThis.crypto ??= webcrypto;
const ORIGIN='https://cc-player-test-beac.elteroplabda.workers.dev';
const URL='https://gateway-test.example.invalid/api/mass/v1/';
const SECRET='dev-only-placeholder-key-not-an-api-secret';
const PROOF_SECRET='test-only-hmac-proof-secret-64-chars-very-long-abcdef1234567890';
function environment(overrides={}){
 return {
  TEST_ONLY:'true',SUPABASE_URL:'https://szzoubvhlwnojtzqjebc.supabase.co',
  SUPABASE_TEST_SECRET_KEY:'sb_secret_FAKE_TEST_ONLY_NEVER_VALID',
  ALLOWED_ORIGIN:ORIGIN,TURNSTILE_EXPECTED_HOSTNAME:'cc-player-test-beac.elteroplabda.workers.dev',
  TURNSTILE_SECRET:'TEST_FAKE_SECRET_KEY',EMAIL_PROOF_SECRET:PROOF_SECRET,
  PUBLIC_WRITES_ENABLED:'false',EMAIL_VERIFICATION_ENABLED:'false',
  IP_LIMITER:{limit:async()=>({success:true})},
  IDENTITY_LIMITER:{limit:async()=>({success:true})},
  ...overrides
 };
}
function req(endpoint,payload,headers={}){
 return new Request(URL+endpoint,{
  method:'POST',
  headers:{Origin:ORIGIN,'CF-Connecting-IP':'203.0.113.42','Content-Type':'application/json',...headers},
  body:JSON.stringify(payload)
 });
}
const challenge='a-valid-turnstile-test-token';
function turnstileOk(){return Response.json({success:true,hostname:'cc-player-test-beac.elteroplabda.workers.dev',action:'mass_v1'});}
function mockFetch(fn){const old=globalThis.fetch;globalThis.fetch=fn;return()=>{globalThis.fetch=old;};}
function enc(bytes){return Buffer.from(bytes).toString('base64url');}
async function proof(email){
 const payload=enc(Buffer.from(JSON.stringify({aud:'cc-mass-test',scope:'mass',email,exp:Date.now()+5*60*1000})));
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(PROOF_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const sig=new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(payload)));
 return payload+'.'+enc(sig);
}
const book=(more={})=>({turnstileToken:challenge,eventId:'cc-test-event',
 name:'Minta Foglaló',email:'example@cc-test.invalid',emailProof:'bad-proof',...more});
const enabled=()=>environment({PUBLIC_WRITES_ENABLED:'true',EMAIL_VERIFICATION_ENABLED:'true'});
async function body(response){return response.json();}

test('health is safe without secrets and reports no public writes',async()=>{
 const r=await handler.fetch(new Request(URL+'health'),environment());
 assert.equal(r.status,200);
 assert.deepEqual(await body(r),{ok:true,service:'cc-mass-gateway-test',publicWritesEnabled:false,readyForLive:false});
 assert.equal(r.headers.get('Cache-Control'),'no-store');
});
test('POSTs are disabled by default even with valid JSON',async()=>{
 const r=await handler.fetch(req('book',book()),environment());
 assert.equal(r.status,503);
 assert.equal((await body(r)).code,'GATEWAY_DISABLED');
});
test('wrong origin and missing origin fail before any side effect',async()=>{
 const one=await handler.fetch(req('book',book(),{Origin:'https://attacker.example'}),enabled());
 assert.equal(one.status,403);
 const two=await handler.fetch(req('wait',book(),{Origin:''}),enabled());
 assert.equal(two.status,403);
});
test('LIVE DB project and absent rate binding fail closed',async()=>{
 const prod=environment({PUBLIC_WRITES_ENABLED:'true',SUPABASE_URL:'https://prod.supabase.co'});
 assert.equal((await handler.fetch(req('book',book()),prod)).status,503);
 const missing=enabled();delete missing.IDENTITY_LIMITER;
 assert.equal((await handler.fetch(req('book',book()),missing)).status,503);
});
test('unverified mailbox blocks booking even with a valid Turnstile',async()=>{
 const restore=mockFetch(async url=>{
  if(!String(url).includes('siteverify'))throw Error('DB must not be contacted');
  return turnstileOk();
 });
 try{
 const r=await handler.fetch(req('book',book()),enabled());
 assert.equal(r.status,422);
 assert.equal((await body(r)).code,'EMAIL_NOT_VERIFIED');
 }finally{restore();}
});
test('wrong mail identity cannot use a correctly signed email proof',async()=>{
 const restore=mockFetch(async url=>String(url).includes('siteverify')?turnstileOk():Response.json({ok:true}));
 try{
 const r=await handler.fetch(req('book',book({emailProof:await proof('another@cc-test.invalid')})),enabled());
 assert.equal(r.status,422);
 }finally{restore();}
});
test('Turnstile hostname/action mismatch is rejected and DB is not called',async()=>{
 const restore=mockFetch(async url=>{
  assert.match(String(url),/siteverify/);
  return Response.json({success:true,hostname:'evil.example',action:'mass_v1'});
 });
 try{
 const r=await handler.fetch(req('cancel',{turnstileToken:challenge,token:'a'.repeat(64)}),enabled());
 assert.equal(r.status,403);
 assert.equal((await body(r)).code,'BOT_CHECK_FAILED');
 }finally{restore();}
});
test('IP or identity limit rejection precedes bot verification',async()=>{
 const env=enabled();env.IP_LIMITER={limit:async()=>({success:false})};
 const restore=mockFetch(()=>{throw Error('Rate limit should preempt fetch');});
 try{
 const r=await handler.fetch(req('cancel',{turnstileToken:challenge,token:'a'.repeat(64)}),env);
 assert.equal(r.status,429);
 }finally{restore();}
});
test('valid cancellation uses only a SHA256 hash in a secret-key RPC, not the raw token',async()=>{
 const calls=[];
 const restore=mockFetch(async (url,opts)=>{
  calls.push({url:String(url),opts});
  return String(url).includes('siteverify')?turnstileOk():Response.json({ok:true,bookingId:'test-booking',late:false});
 });
 try{
 const r=await handler.fetch(req('cancel',{turnstileToken:challenge,token:'b'.repeat(64)}),enabled());
 assert.equal(r.status,200);
 const d=await body(r);
 assert.equal(d.data.bookingId,'test-booking');
 assert.equal(d.deliveryQueued,false);
 assert.equal(calls.length,2);
 const rpc=calls[1];
 assert.match(rpc.url,/szzoubvhlwnojtzqjebc\.supabase\.co\/rest\/v1\/rpc\/cc_vnext_mass_public_cancel_v1$/);
 assert.equal(rpc.opts.headers.apikey,'sb_secret_FAKE_TEST_ONLY_NEVER_VALID');
 assert.equal(Object.hasOwn(rpc.opts.headers,'Authorization'),false);
 const data=JSON.parse(rpc.opts.body);
 assert.match(data.p_cancellation_hash,/^sha256:[0-9a-f]{64}$/);
 assert.equal(rpc.opts.body.includes('b'.repeat(64)),false);
 }finally{restore();}
});
test('verified email can book via server secret, receives one-time 256-bit cancel token',async()=>{
 const data=book({emailProof:await proof('example@cc-test.invalid')});
 const calls=[];
 const restore=mockFetch(async (url,options)=>{
  if(String(url).includes('siteverify'))return turnstileOk();
  calls.push({url,options});return Response.json({ok:true,bookingId:'test-b',mailQueued:false});
 });
 try{
 const r=await handler.fetch(req('book',data),enabled());
 assert.equal(r.status,200);
 const result=await body(r);
 assert.match(result.cancellationToken,/^[a-f0-9]{64}$/);
 assert.equal(result.deliveryQueued,false);
 assert.equal(calls.length,1);
 const posted=JSON.parse(calls[0].options.body);
 assert.equal(posted.p_person.email,'example@cc-test.invalid');
 assert.equal(posted.p_person.firstTraining,false);
 assert.match(posted.p_cancellation_hash,/^sha256:[0-9a-f]{64}$/);
 assert.equal(calls[0].options.body.includes(result.cancellationToken),false);
 }finally{restore();}
});
test('verified email can queue; first training marker is set only on request',async()=>{
 const calls=[];
 const restore=mockFetch(async(url,opts)=>{
  if(String(url).includes('siteverify'))return turnstileOk();
  calls.push(JSON.parse(opts.body));return Response.json({ok:true,position:1,waitlistId:'wait1'});
 });
 try{
 const r=await handler.fetch(req('wait',book({emailProof:await proof('example@cc-test.invalid'),firstTraining:true})),enabled());
 assert.equal(r.status,200);
 assert.equal(calls[0].p_person.passNumber,'ELSŐ EDZÉS');
 }finally{restore();}
});
test('offer accept generates a distinct 256-bit cancellation token and never exposes secrets in errors',async()=>{
 const calls=[];
 const restore=mockFetch(async(url,opts)=>{
  if(String(url).includes('siteverify'))return turnstileOk();
  calls.push(JSON.parse(opts.body));return Response.json({ok:true,accepted:true,bookingId:'test-offer'});
 });
 try{
 const r=await handler.fetch(req('offer/decide',{
  turnstileToken:challenge,offerToken:'c'.repeat(64),action:'accept'
 }),enabled());
 assert.equal(r.status,200);
 const j=await body(r);
 assert.match(j.cancellationToken,/^[0-9a-f]{64}$/);
 assert.notEqual(j.cancellationToken,'c'.repeat(64));
 assert.match(calls[0].p_offer_hash,/^sha256:[a-f0-9]{64}$/);
 assert.match(calls[0].p_cancellation_hash,/^sha256:[a-f0-9]{64}$/);
 }finally{restore();}
});
test('errors from Supabase never leak internal SQL, API keys or tokens',async()=>{
 const restore=mockFetch(async url=>String(url).includes('siteverify')?turnstileOk():new Response('RLS exception: secret', {status:403}));
 try{
 const r=await handler.fetch(req('cancel',{turnstileToken:challenge,token:'d'.repeat(64)}),enabled());
 assert.equal(r.status,409);
 const t=await r.text();
 assert.equal(t.includes('RLS'),false);
 assert.equal(t.includes('sb_secret'),false);
 assert.equal(t.includes('d'.repeat(64)),false);
 }finally{restore();}
});
