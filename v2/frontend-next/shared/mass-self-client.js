/**
 * Club Control V2 TEST mass-sport self-service.
 * Supabase Auth email OTP; JWT stays in memory; no service-role key, no local storage.
 * The DB owns all access control, capacity, sanctions and pass eligibility.
 */
import {TEST_ORIGIN,TEST_PUBLISHABLE_KEY} from './test-rpc.js';
const headers=()=>({apikey:TEST_PUBLISHABLE_KEY,'Content-Type':'application/json',Accept:'application/json'});
const validEmail=x=>typeof x==='string'&&x.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x);
const POST=async (path,data,{request,token='',signal}={})=>{
 const res=await request(TEST_ORIGIN+path,{
  method:'POST',headers:{...headers(),...(token?{Authorization:'Bearer '+token}:{})},
  cache:'no-store',body:JSON.stringify(data),signal
 });
 if(!res.ok){
  // Do not echo server responses which might contain PII or internal SQL details.
  const error=new Error('MASS_TEST_HTTP_'+res.status);error.status=res.status;throw error;
 }
 return res.json();
};
export function createMassSelfClient({request=fetch,clock=()=>Date.now()}={}){
 let epoch=0,token='',expiresAt=0,email='';
 const current=()=>{
  if(token&&clock()>=expiresAt-15000){token='';expiresAt=0;}
  return token?{accessToken:token,expiresAt,email}:null;
 };
 function signOut(){epoch++;token='';expiresAt=0;email=''}
 async function requestCode(value){
  const clean=String(value||'').trim().toLowerCase();
  if(!validEmail(clean))throw Error('MASS_INVALID_EMAIL');
  const own=++epoch;signOut();const fresh=++epoch;
  await POST('/auth/v1/otp',{email:clean,create_user:true},{request});
  if(fresh!==epoch)return false;
  email=clean;return true;
 }
 async function verifyCode(value,code){
  const clean=String(value||'').trim().toLowerCase();
  if(!validEmail(clean)||!/^[0-9]{6,10}$/.test(String(code||'').trim()))throw Error('MASS_INVALID_OTP');
  const own=++epoch;
  const valueOut=await POST('/auth/v1/verify',{email:clean,token:String(code).trim(),type:'email'},{request});
  if(epoch!==own)return null;
  if(typeof valueOut.access_token!=='string'||!Number.isFinite(valueOut.expires_in)||valueOut.expires_in<30)
   throw Error('MASS_INVALID_SESSION');
  token=valueOut.access_token;expiresAt=clock()+valueOut.expires_in*1000;email=clean;
  return current();
 }
 async function rpc(name,args={},options={}){
  const s=current();if(!s)throw Error('MASS_NOT_SIGNED_IN');
  if(!new Set(['cc_v2_mass_profile_register_v1','cc_v2_mass_self_read_v1',
   'cc_v2_mass_self_book_v1','cc_v2_mass_self_cancel_v1']).has(name))
   throw Error('MASS_RPC_NOT_ALLOWED');
  return POST('/rest/v1/rpc/'+name,args,{request,token:s.accessToken,signal:options.signal});
 }
 function register(name,level){return rpc('cc_v2_mass_profile_register_v1',{p_name:String(name||'').trim(),p_level:level})}
 async function ownData(){
  const value=await rpc('cc_v2_mass_self_read_v1');
  if(value?.schemaVersion!==1||value?.domain!=='mass'||!Array.isArray(value.bookings)||
   !Array.isArray(value.waitlist)||!value.pass||typeof value.pass!=='object')
   throw Error('MASS_INVALID_OWN_DATA');
  return value;
 }
 async function book(eventId,mode,claimedPaid=false){
  if(typeof eventId!=='string'||!eventId||eventId.length>200||
   !['book','wait','first_training'].includes(mode))throw Error('MASS_INVALID_BOOKING');
  return rpc('cc_v2_mass_self_book_v1',{p_event_id:eventId,p_mode:mode,p_claimed_paid:claimedPaid===true});
 }
 async function cancel(id,kind='booking'){
  if(typeof id!=='string'||!id||id.length>200||!['booking','waitlist'].includes(kind))throw Error('MASS_INVALID_CANCELLATION');
  return rpc('cc_v2_mass_self_cancel_v1',{p_booking_id:id,p_kind:kind});
 }
 return Object.freeze({requestCode,verifyCode,register,ownData,book,cancel,current,signOut});
}
