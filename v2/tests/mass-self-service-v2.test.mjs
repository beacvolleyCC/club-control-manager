import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createMassSelfClient} from '../frontend-next/shared/mass-self-client.js';
import {readManagerPassSales,setManagerPassSales} from '../frontend-next/shared/mass-pass-manager.js';

const ok=(p)=>({ok:true,json:async()=>p});
const testSession=()=>createMassSelfClient({request:async(url,opts)=>{
 if(url.endsWith('/otp'))return ok({});
 if(url.endsWith('/verify'))return ok({access_token:'test-jwt',expires_in:300});
 if(url.endsWith('cc_v2_mass_profile_register_v1'))return ok({schemaVersion:1,registered:true});
 if(url.endsWith('cc_v2_mass_self_read_v1'))return ok({schemaVersion:1,domain:'mass',bookings:[],waitlist:[],pass:{}});
 if(url.endsWith('cc_v2_mass_self_book_v1'))return ok({ok:true,schemaVersion:1,bookingId:'qa'});
 if(url.endsWith('cc_v2_mass_self_cancel_v1'))return ok({ok:true,schemaVersion:1});
 throw Error(url);
}});
test('OTP registration uses new-user flow and never persists JWT',async()=>{
 const requests=[];
 const c=createMassSelfClient({request:async(url,opts)=>{
  requests.push({url,opts});
  if(url.endsWith('/otp'))return ok({});
  if(url.endsWith('/verify'))return ok({access_token:'JWT',expires_in:300});
  return ok({schemaVersion:1,registered:true});
 }});
 await c.requestCode(' jane@example.invalid ');
 const s=await c.verifyCode('jane@example.invalid','123456');
 assert.equal(s.accessToken,'JWT');
 assert.equal(JSON.parse(requests[0].opts.body).create_user,true);
 assert.ok(!requests[0].opts.headers.Authorization);
 assert.equal(JSON.parse(requests[1].opts.body).type,'email');
 await c.register('QA Person','Kezdő');
 assert.equal(JSON.parse(requests[2].opts.body).p_name,'QA Person');
 assert.equal(requests[2].opts.headers.Authorization,'Bearer JWT');
 assert.ok(requests.every(r=>r.url.startsWith('https://szzoubvhlwnojtzqjebc.supabase.co')));
 c.signOut();assert.equal(c.current(),null);
 const code=readFileSync(new URL('../frontend-next/shared/mass-self-client.js',import.meta.url),'utf8');
 assert.doesNotMatch(code,/localStorage|sessionStorage|indexedDB|service_role|snqsxlyhontaepembaic/);
});
test('no self-service actions without signed in account',async()=>{
 const c=createMassSelfClient({request:async()=>{throw Error('Should not call remote')}});
 await assert.rejects(c.register('Someone','Kezdő'),/NOT_SIGNED_IN/);
 await assert.rejects(c.book('event','book'),/NOT_SIGNED_IN/);
 await assert.rejects(c.cancel('booking'),/NOT_SIGNED_IN/);
});
test('booking, queue, cancellation use same fixed TEST RPC and bearer token',async()=>{
 const calls=[];
 const c=createMassSelfClient({request:async(url,opts)=>{
  calls.push({url,opts});
  if(url.endsWith('/otp'))return ok({});
  if(url.endsWith('/verify'))return ok({access_token:'jwt',expires_in:300});
  return ok({schemaVersion:1,ok:true});
 }});
 await c.requestCode('test@example.invalid');await c.verifyCode('test@example.invalid','123456');
 await c.book('CC-QA-FUTURE-20261119','book',true);
 await c.book('CC-QA-FUTURE-20261119','wait');
 await c.cancel('QA-B', 'booking');
 await c.cancel('QA-W','waitlist');
 const rpcCalls=calls.slice(2);
 assert.deepEqual(rpcCalls.map(x=>x.url.split('/').at(-1)),[
  'cc_v2_mass_self_book_v1','cc_v2_mass_self_book_v1',
  'cc_v2_mass_self_cancel_v1','cc_v2_mass_self_cancel_v1']);
 assert.ok(rpcCalls.every(x=>x.opts.headers.Authorization==='Bearer jwt'));
 assert.equal(JSON.parse(rpcCalls[0].opts.body).p_claimed_paid,true);
 assert.equal(JSON.parse(rpcCalls[1].opts.body).p_mode,'wait');
});
test('fixed RPC allowlist and strict types refuse arbitrary actions',async()=>{
 const c=testSession();await c.requestCode('tester@example.invalid');await c.verifyCode('tester@example.invalid','123456');
 await assert.rejects(c.book('x','admin'),/INVALID_BOOKING/);
 await assert.rejects(c.cancel('x','admin'),/INVALID_CANCELLATION/);
 await assert.rejects(c.book('', 'book'),/INVALID_BOOKING/);
});
test('manager pass policy RPC is permission-scoped and validates inputs',async()=>{
 const requests=[],request=async(url,opts)=>{requests.push({url,opts});return ok({schemaVersion:1,validMonth:'2026-11',salesState:'unknown'})};
 await readManagerPassSales({accessToken:'admin-jwt'},'2026-11',{request});
 await setManagerPassSales({accessToken:'admin-jwt'}, {month:'2026-11',state:'unavailable',graceUntil:null,reason:'TEST'}, {request});
 assert.ok(requests.every(x=>x.opts.headers.Authorization==='Bearer admin-jwt'));
 assert.deepEqual(requests.map(x=>x.url.split('/').at(-1)),['cc_v2_manager_pass_sales_status_v1','cc_v2_manager_pass_sales_set_v1']);
 await assert.rejects(readManagerPassSales({},'2026-11',{request}),/LOGIN_REQUIRED/);
 assert.throws(()=>setManagerPassSales({accessToken:'jwt'},{month:'2026-11',state:'available',graceUntil:'2027-11-01'},{request}),/POLICY_INVALID/);
});
test('two independent frontends use the same verified self-service component',()=>{
 const web=readFileSync(new URL('../frontend-next/mass/main.js',import.meta.url),'utf8');
 const player=readFileSync(new URL('../frontend-next/player/mass-entry.js',import.meta.url),'utf8');
 const manager=readFileSync(new URL('../frontend-next/manager/main.js',import.meta.url),'utf8');
 for(const src of [web,player])assert.match(src,/mountMassSelfService/);
 assert.match(manager,/mountManagerPassSales/);
 for(const path of ['../frontend-next/mass/index.html','../frontend-next/player/index.html']){
  const html=readFileSync(new URL(path,import.meta.url),'utf8');
  assert.match(html,/id="massSelfMount"/);
 }
});
test('server stays scoped to verified owner and QA workbook with existing booking checks',()=>{
 const sql=readFileSync(new URL('../database/migrations/20261115_cc_v2_mass_self_booking_secure.sql',import.meta.url),'utf8');
 const read=readFileSync(new URL('../database/migrations/20261115_cc_v2_mass_verified_registration_read.sql',import.meta.url),'utf8');
 assert.match(sql,/private\.cc_v2_mass_owner_v1\(\)/);
 assert.match(sql,/public\.cc_vnext_mass_public_book_v1/);
 assert.match(sql,/public\.cc_vnext_mass_public_wait_v1/);
 assert.match(sql,/public\.cc_vnext_mass_public_cancel_v1/);
 assert.match(sql,/CC-QA-SYNTHETIC/);
 assert.match(sql,/MASS_SELF_SANCTION_ACTIVE/);
 assert.match(sql,/MASS_SELF_LEVEL_MISMATCH/);
 assert.match(read,/email_confirmed_at/);
 assert.match(read,/MASS_EXISTING_NAME_NEEDS_MANAGER_CHECK/);
 assert.match(read,/CC-QA-SYNTHETIC/);
 assert.doesNotMatch(sql,/grant execute on function public\.cc_vnext_mass_public_book_v1/);
});
