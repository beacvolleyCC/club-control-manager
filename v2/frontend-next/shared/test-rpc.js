/**
 * TEST-only, read-only authentication and RPC transport for the new independent PWAs.
 * Access JWTs stay in memory. The origin and endpoint allowlist cannot be overridden.
 * Protected operations and permissions are enforced by Supabase RPCs, not frontend flags.
 */
export const TEST_ORIGIN='https://szzoubvhlwnojtzqjebc.supabase.co';
// Public/publishable key, not a service_role key; this project is TEST only.
const TEST_PUBLISHABLE_KEY='sb_publishable_1iOpBTxKteHCgJdNyzXQCA_5gxcFWZB';
const ALLOWED_READ_RPC=new Set(['cc_v2_manager_read_v1','cc_v2_player_read_v1']);
const emailValid=value=>typeof value==='string'&&value.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const authHeaders=()=>({apikey:TEST_PUBLISHABLE_KEY,'Content-Type':'application/json',Accept:'application/json'});
export class TestAccessError extends Error{
 constructor(status,message){super(message);this.name='TestAccessError';this.status=status}
}
export function createTestAuthSession({request=fetch,clock=()=>Date.now()}={}){
 let nonce=0,accessToken='',expiresAt=0;
 function clear(){nonce++;accessToken='';expiresAt=0}
 function current(){
  if(accessToken&&clock()>=expiresAt-15000)clear();
  return accessToken?{accessToken,expiresAt}:null;
 }
 async function post(path,payload){
  const response=await request(TEST_ORIGIN+'/auth/v1/'+path,{
   method:'POST',cache:'no-store',headers:authHeaders(),body:JSON.stringify(payload)
  });
  if(!response.ok)throw new TestAccessError(response.status,'TEST belépés sikertelen (HTTP '+response.status+').');
  return response.json();
 }
 async function requestCode(email){
  const clean=String(email||'').trim();
  if(!emailValid(clean))throw new Error('Adj meg egy érvényes email-címet.');
  const own=++nonce;
  await post('otp',{email:clean,create_user:false});
  return own===nonce;
 }
 async function verifyCode(email,code){
  const clean=String(email||'').trim(),otp=String(code||'').trim();
  if(!emailValid(clean)||!/^[0-9]{6,10}$/.test(otp))throw new Error('Email és 6–10 számjegyű TEST kód szükséges.');
  const own=++nonce;
  const payload=await post('verify',{email:clean,token:otp,type:'email'});
  if(own!==nonce)return null;
  const lifetime=Number(payload?.expires_in);
  if(typeof payload?.access_token!=='string'||!payload.access_token||!Number.isFinite(lifetime)||lifetime<=30)
   throw new Error('Érvénytelen vagy lejárt TEST munkamenet.');
  accessToken=payload.access_token;expiresAt=clock()+lifetime*1000;
  return current();
 }
 return Object.freeze({requestCode,verifyCode,current,clear});
}
export async function readTestRpc(session,rpc,args={}, {request=fetch,signal}={}){
 if(!ALLOWED_READ_RPC.has(rpc))throw new Error('Only approved read-only V2 TEST RPCs are available');
 if(!session?.accessToken||typeof session.accessToken!=='string')throw new Error('TEST belépés szükséges.');
 const response=await request(TEST_ORIGIN+'/rest/v1/rpc/'+rpc,{
  method:'POST',signal,cache:'no-store',
  headers:{...authHeaders(),Authorization:'Bearer '+session.accessToken},
  body:JSON.stringify(args)
 });
 if(!response.ok)throw new TestAccessError(response.status,
  (response.status===401||response.status===403)?'Nincs jogosultság a TEST adatokhoz.':'TEST adatbetöltési hiba (HTTP '+response.status+').');
 const payload=await response.json();
 if(!payload||typeof payload!=='object'||Array.isArray(payload)||payload.schemaVersion!==1)
  throw new Error('Ismeretlen V2 TEST API-válasz; az adatok nem jeleníthetők meg.');
 return payload;
}
export function testManagerWindow(clock=()=>new Date()){
 const now=clock(),start=new Date(now),end=new Date(now);
 start.setUTCDate(start.getUTCDate()-45);end.setUTCDate(end.getUTCDate()+120);
 return {p_from:start.toISOString(),p_to:end.toISOString(),p_team_id:null,p_player_query:''};
}
