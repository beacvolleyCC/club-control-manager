// Club Control mass gateway / TEST ONLY. NOT deployed, public writes OFF by default.
// A separate Worker: never import into Manager/Player static bundles.
const DB_ORIGIN='https://szzoubvhlwnojtzqjebc.supabase.co';
const RPCS=Object.freeze({
 book:'cc_vnext_mass_public_book_v1',
 wait:'cc_vnext_mass_public_wait_v1',
 cancel:'cc_vnext_mass_public_cancel_v1',
 decide:'cc_vnext_mass_public_decide_v1',
 emailStart:'cc_vnext_mass_email_start_v1',
 emailVerify:'cc_vnext_mass_email_verify_v1'
});
const encoder=new TextEncoder();
function json(data,status=200,origin=''){
  const headers={'Content-Type':'application/json; charset=utf-8',
    'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',
    'Referrer-Policy':'no-referrer','Cross-Origin-Resource-Policy':'same-site'};
  if(origin){headers['Access-Control-Allow-Origin']=origin;headers['Vary']='Origin';}
  return new Response(JSON.stringify(data),{status,headers});
}
function fail(code,status,origin){return json({ok:false,code},status,origin);}
function safeOrigin(request,env){
  const allowed=String(env.ALLOWED_ORIGIN||'');
  return /^https:\/\/[-a-z0-9.]+$/i.test(allowed)&&request.headers.get('Origin')===allowed?allowed:'';
}
function configReady(env){
  return env.TEST_ONLY==='true' &&
    env.SUPABASE_URL===DB_ORIGIN &&
    typeof env.SUPABASE_TEST_SECRET_KEY==='string' &&
    env.SUPABASE_TEST_SECRET_KEY.startsWith('sb_secret_') &&
    typeof env.TURNSTILE_SECRET==='string' && env.TURNSTILE_SECRET.length>10 &&
    typeof env.TURNSTILE_EXPECTED_HOSTNAME==='string' && env.TURNSTILE_EXPECTED_HOSTNAME.length>3 &&
    typeof env.EMAIL_PROOF_SECRET==='string' && env.EMAIL_PROOF_SECRET.length>=32 &&
    env.IP_LIMITER?.limit && env.IDENTITY_LIMITER?.limit;
}
async function hashText(s){
 const digest=new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(s)));
 return 'sha256:'+Array.from(digest,x=>x.toString(16).padStart(2,'0')).join('');
}
function randomToken(){
 const bytes=new Uint8Array(32);crypto.getRandomValues(bytes);
 return Array.from(bytes,x=>x.toString(16).padStart(2,'0')).join('');
}
function toBytes64url(v){
 if(!/^[A-Za-z0-9_-]+$/.test(v)||v.length>1800)throw Error('bad-base64');
 const base=v.replace(/-/g,'+').replace(/_/g,'/');
 const binary=atob(base+'='.repeat((4-base.length%4)%4));
 return Uint8Array.from(binary,c=>c.charCodeAt(0));
}

function base64url(bytes){
 let binary='';for(const b of bytes)binary+=String.fromCharCode(b);
 return btoa(binary).replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=+$/,'');
}
function otpCode(){
 // Uniform 8-digit code via rejection sampling, not Math.random().
 const bound=Math.floor(2**32/100000000)*100000000;
 let v;do{v=crypto.getRandomValues(new Uint32Array(1))[0];}while(v>=bound);
 return String(v%100000000).padStart(8,'0');
}
async function otpHash(email,code,env){
 const key=await crypto.subtle.importKey('raw',encoder.encode(env.EMAIL_OTP_PEPPER),
  {name:'HMAC',hash:'SHA-256'},false,['sign']);
 const signed=new Uint8Array(await crypto.subtle.sign('HMAC',key,
  encoder.encode('cc-mass-otp:'+email+':'+code)));
 return 'sha256:'+Array.from(signed,x=>x.toString(16).padStart(2,'0')).join('');
}
async function issueProof(email,env){
 const body=base64url(encoder.encode(JSON.stringify({
  aud:'cc-mass-test',scope:'mass',email,exp:Date.now()+10*60*1000
 })));
 const key=await crypto.subtle.importKey('raw',encoder.encode(env.EMAIL_PROOF_SECRET),
  {name:'HMAC',hash:'SHA-256'},false,['sign']);
 const signature=new Uint8Array(await crypto.subtle.sign('HMAC',key,encoder.encode(body)));
 return body+'.'+base64url(signature);
}
function otpReady(env,email){
 return env.EMAIL_VERIFICATION_ENABLED==='true'&&env.EMAIL_DELIVERY_ENABLED==='true'&&
  typeof env.EMAIL_OTP_PEPPER==='string'&&env.EMAIL_OTP_PEPPER.length>=32&&
  typeof env.RESEND_TEST_API_KEY==='string'&&env.RESEND_TEST_API_KEY.startsWith('re_')&&
  typeof env.TEST_EMAIL_FROM==='string'&&env.TEST_EMAIL_FROM.includes('@')&&
  typeof env.TEST_ALLOWED_EMAIL==='string'&&email===env.TEST_ALLOWED_EMAIL.trim().toLowerCase();
}
async function sendTestOtp(email,code,env){
 const response=await fetch('https://api.resend.com/emails',{
  method:'POST',headers:{Authorization:'Bearer '+env.RESEND_TEST_API_KEY,
  'Content-Type':'application/json'},
  body:JSON.stringify({from:env.TEST_EMAIL_FROM,to:[email],
  subject:'Club Control TEST – e-mail ellenőrzés',
  text:'Az ellenőrző kód: '+code+'\\nA kód 5 percig érvényes. Nem éles foglalás.'}),
  signal:AbortSignal.timeout(8000)
 });
 if(!response.ok)throw Error('MAIL_PROVIDER_REJECTED');
}

async function proofValid(proof,email,env){
 try{
  if(typeof proof!=='string'||proof.length>1800)return false;
  const p=proof.split('.');if(p.length!==2)return false;
  const data=toBytes64url(p[0]);const signature=toBytes64url(p[1]);
  const obj=JSON.parse(new TextDecoder().decode(data));
  const now=Date.now();
  if(obj.aud!=='cc-mass-test'||obj.scope!=='mass'||
    obj.email!==email||typeof obj.exp!=='number'||
    obj.exp<=now||obj.exp>now+10*60*1000)return false;
  const key=await crypto.subtle.importKey('raw',encoder.encode(env.EMAIL_PROOF_SECRET),
   {name:'HMAC',hash:'SHA-256'},false,['verify']);
  return await crypto.subtle.verify('HMAC',key,signature,encoder.encode(p[0]));
 }catch{return false;}
}
async function verifyTurnstile(token,ip,env){
 if(typeof token!=='string'||token.length<10||token.length>2048)return false;
 try{
  const req=new URLSearchParams({secret:env.TURNSTILE_SECRET,response:token,remoteip:ip});
  const res=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{
   method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},
   body:req.toString(),signal:AbortSignal.timeout(7000)
  });
  if(!res.ok)return false;
  const result=await res.json();
  return result.success===true && result.hostname===env.TURNSTILE_EXPECTED_HOSTNAME &&
   result.action==='mass_v1';
 }catch{return false;}
}
async function rpc(op,args,env){
 const response=await fetch(env.SUPABASE_URL+'/rest/v1/rpc/'+RPCS[op],{
  method:'POST',
  headers:{apikey:env.SUPABASE_TEST_SECRET_KEY,'Content-Type':'application/json','Accept':'application/json'},
  body:JSON.stringify(args),signal:AbortSignal.timeout(8000)
 });
 if(!response.ok)throw Error('RPC_REJECTED');
 const data=await response.json();
 if(!data||data.ok!==true)throw Error('RPC_UNSUCCESSFUL');
 return data;
}
function validRawToken(t){return typeof t==='string'&&/^[0-9a-f]{64}$/.test(t);}
function validEvent(s){return typeof s==='string'&&/^[a-z0-9_-]{1,110}$/i.test(s);}
function cleanEmail(s){
 if(typeof s!=='string'||s.length>254)return '';
 const email=s.trim().toLowerCase();
 return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)?email:'';
}
function allowedFields(obj,keys){return Object.keys(obj).every(k=>keys.includes(k));}
async function readBody(request){
 const len=Number(request.headers.get('content-length')||'0');
 if(len>4096||!/^application\/json(?:;|$)/i.test(request.headers.get('content-type')||''))throw Error('BAD_BODY');
 const text=await request.text();if(text.length>4096)throw Error('BAD_BODY');
 const data=JSON.parse(text);
 if(!data||Array.isArray(data)||typeof data!=='object')throw Error('BAD_BODY');
 return data;
}
async function limited(env,ip,route,email){
 const identity=email?await hashText(email):'none';
 const first=await env.IP_LIMITER.limit({key:ip+':'+route});
 if(!first?.success)return false;
 const second=await env.IDENTITY_LIMITER.limit({key:route+':'+identity});
 return second?.success===true;
}
async function perform(route,data,env){
 switch(route){
 case 'emailStart':{
  if(!allowedFields(data,['turnstileToken','email']))throw Error('INVALID_INPUT');
  const email=cleanEmail(data.email);
  if(!email)throw Error('INVALID_INPUT');
  if(!otpReady(env,email))throw Error('EMAIL_SERVICE_DISABLED');
  const code=otpCode();
  const result=await rpc('emailStart',{p_email:email,
   p_code_hash:await otpHash(email,code,env)},env);
  if(!result.accepted)return {data:{ok:true,accepted:false},deliveryQueued:false};
  await sendTestOtp(email,code,env);
  return {data:{ok:true,accepted:true},deliveryQueued:true};
 }
 case 'emailVerify':{
  if(!allowedFields(data,['turnstileToken','email','code']))throw Error('INVALID_INPUT');
  const email=cleanEmail(data.email);
  if(!email||typeof data.code!=='string'||!/^[0-9]{8}$/.test(data.code))
    throw Error('INVALID_INPUT');
  if(!otpReady(env,email))throw Error('EMAIL_SERVICE_DISABLED');
  const result=await rpc('emailVerify',{
   p_email:email,p_code_hash:await otpHash(email,data.code,env)
  },env);
  if(result.verified!==true)throw Error('EMAIL_CODE_INVALID');
  return {data:{ok:true,verified:true},emailProof:await issueProof(email,env)};
 }
 case 'cancel':{
  if(!allowedFields(data,['turnstileToken','token'])||!validRawToken(data.token))throw Error('INVALID_INPUT');
  return {data:await rpc('cancel',{p_cancellation_hash:await hashText(data.token)},env)};
 }
 case 'decide':{
  if(!allowedFields(data,['turnstileToken','offerToken','action'])||
    !validRawToken(data.offerToken)||!['accept','decline'].includes(data.action))throw Error('INVALID_INPUT');
  const rawCancel=data.action==='accept'?randomToken():null;
  const result=await rpc('decide',{
   p_offer_hash:await hashText(data.offerToken),p_action:data.action,
   p_cancellation_hash:rawCancel?await hashText(rawCancel):null
  },env);
  return {data:result,...(rawCancel&&result.accepted===true?{cancellationToken:rawCancel}:{})};
 }
 case 'book':
 case 'wait':{
  if(!allowedFields(data,['turnstileToken','eventId','name','email','passNumber',
    'firstTraining','note','emailProof'])||!validEvent(data.eventId)||
    typeof data.name!=='string'||!data.name.trim()||data.name.length>100||
    (data.passNumber!=null&&(typeof data.passNumber!=='string'||data.passNumber.length>100))||
    (data.note!=null&&(typeof data.note!=='string'||data.note.length>1000))||
    (data.firstTraining!=null&&typeof data.firstTraining!=='boolean'))
    throw Error('INVALID_INPUT');
  const email=cleanEmail(data.email);
  if(!email)throw Error('INVALID_INPUT');
  if(env.EMAIL_VERIFICATION_ENABLED!=='true'||!(await proofValid(data.emailProof,email,env)))
   throw Error('EMAIL_NOT_VERIFIED');
  const person={name:data.name.trim(),email,passNumber:data.passNumber||'',note:data.note||''};
  if(route==='book'){
   person.firstTraining=data.firstTraining===true;
   const rawCancel=randomToken();
   const result=await rpc('book',{p_event_id:data.eventId,p_person:person,
    p_cancellation_hash:await hashText(rawCancel)},env);
   return {data:result,cancellationToken:rawCancel};
  }
  // A one-time first-training queue needs the reserved pass marker until accepted.
  if(data.firstTraining===true)person.passNumber='ELSŐ EDZÉS';
  const result=await rpc('wait',{p_event_id:data.eventId,p_person:person},env);
  return {data:result};
 }
 default:throw Error('UNKNOWN_ROUTE');
 }
}
export default {
 async fetch(request,env){
  const pathname=new URL(request.url).pathname;
  if(request.method==='GET'&&pathname==='/api/mass/v1/health')
   return json({ok:true,service:'cc-mass-gateway-test',
    publicWritesEnabled:false,readyForLive:false});
  if(!pathname.startsWith('/api/mass/v1/'))return fail('NOT_FOUND',404);
  const origin=safeOrigin(request,env);
  if(!origin)return fail('ORIGIN_DENIED',403);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{
    'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'POST, OPTIONS',
    'Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'600','Vary':'Origin'}});
  if(request.method!=='POST')return fail('METHOD_NOT_ALLOWED',405,origin);
  if(env.PUBLIC_WRITES_ENABLED!=='true'||!configReady(env))return fail('GATEWAY_DISABLED',503,origin);
  const route=({
   '/api/mass/v1/book':'book','/api/mass/v1/wait':'wait',
   '/api/mass/v1/email/start':'emailStart',
   '/api/mass/v1/email/verify':'emailVerify',
   '/api/mass/v1/cancel':'cancel','/api/mass/v1/offer/decide':'decide'
  })[pathname];
  if(!route)return fail('NOT_FOUND',404,origin);
  // No IP: fail closed. Do not trust user-controlled X-Forwarded-For.
  const ip=request.headers.get('CF-Connecting-IP');
  if(!ip||ip.length>64)return fail('MISSING_CLIENT_IP',403,origin);
  let input;
  try{input=await readBody(request)}catch{return fail('INVALID_REQUEST',400,origin);}
  const email=['book','wait','emailStart','emailVerify'].includes(route)?cleanEmail(input.email):'';
  try{
   if(!await limited(env,ip,route,email))return fail('RATE_LIMITED',429,origin);
   if(!await verifyTurnstile(input.turnstileToken,ip,env))return fail('BOT_CHECK_FAILED',403,origin);
   const result=await perform(route,input,env);
   return json({ok:true,...result,deliveryQueued:false},200,origin);
  }catch(e){
   if(e.message==='EMAIL_SERVICE_DISABLED')return fail('EMAIL_SERVICE_DISABLED',503,origin);
   if(['INVALID_INPUT','EMAIL_NOT_VERIFIED','EMAIL_CODE_INVALID'].includes(e.message))
    return fail(e.message,422,origin);
   // Never return PostgREST exceptions, token values, secrets or PII.
   return fail('REQUEST_NOT_COMPLETED',409,origin);
  }
 }
};
