import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createCalendarHandler } from '../supabase/functions/cc-calendar/handler.mjs';

const secret='1'.repeat(64);
const endpoint='https://example.supabase.co/functions/v1/cc-calendar';
const event={id:'12345678-aaaa-4bbb-8ccc-123456789abc',
  title:'BEAC röplabda',type:'training',start:'2026-10-29T18:00:00+01:00',
  end:'2026-10-29T20:00:00+01:00',status:'active',
  updatedAt:'2026-10-22T12:00:00Z'};
const request=(url,method='GET')=>new Request(url,{method});
const data=(events=[event])=>({data:{events},error:null});
const successful=()=>{
 const calls=[];
 const handle=createCalendarHandler({rpc:async (name,args)=>{
   calls.push({name,args});return data();
 }});
 return {handle,calls};
};

test('success validates token hash, ICS, response privacy headers',async()=>{
 const {handle,calls}=successful();
 const r=await handle(request(endpoint+'?token='+secret));
 assert.equal(r.status,200);
 assert.match(r.headers.get('content-type'),/text\/calendar/);
 assert.match(r.headers.get('cache-control'),/no-store/);
 assert.equal(r.headers.get('referrer-policy'),'no-referrer');
 assert.equal(r.headers.get('x-robots-tag'),'noindex, noarchive');
 assert.equal(calls.length,1);
 assert.equal(calls[0].name,'cc_calendar_feed_read_v1');
 assert.equal(calls[0].args.p_token_sha256,createHash('sha256').update(secret).digest('hex'));
 const s=await r.text();
 assert.match(s,/BEGIN:VCALENDAR\r\n/);
 assert.match(s,/UID:12345678-aaaa-4bbb-8ccc-123456789abc@club-control\.beac/);
 assert.ok(!s.includes(secret));
});

test('anonymous Apple HEAD request still checks authorization, never returns body',async()=>{
 const {handle,calls}=successful();
 const res=await handle(request(endpoint+'?token='+secret,'HEAD'));
 assert.equal(res.status,200);
 assert.equal(await res.text(),'');
 assert.equal(calls.length,1);
});

test('invalid, missing, duplicate, upper-case and malformed tokens are rejected without RPC',async()=>{
 const {handle,calls}=successful();
 const bad=[endpoint,endpoint+'?token=',endpoint+'?token=abc',
  endpoint+'?token='+secret+'&token='+secret,endpoint+'?token='+secret.toUpperCase(),
  endpoint+'?token=../etc/passwd',endpoint+'?token='+secret+'0'];
 for(const url of bad){
   const r=await handle(request(url));
   assert.equal(r.status,404,url);
   assert.match(r.headers.get('cache-control'),/no-store/);
 }
 assert.equal(calls.length,0);
});

test('revoked, wrong-team or unknown token represented by null gives indistinguishable 404',async()=>{
 const handle=createCalendarHandler({rpc:async()=>({data:null,error:null})});
 const res=await handle(request(endpoint+'?token='+secret));
 assert.equal(res.status,404);
 assert.equal(await res.text(),'Not found');
 assert.ok(!res.headers.get('location'));
});

test('backend failure and unavailable credentials give 503 without leaking secrets',async()=>{
 for(const client of [null,{rpc:async()=>({data:null,error:{message:'SECRET_TOKEN'}})},
   {rpc:async()=>{throw Error('private server error')}}]){
   const res=await createCalendarHandler(client)(request(endpoint+'?token='+secret));
   assert.equal(res.status,503);
   assert.ok(!(await res.text()).includes(secret));
   assert.ok(!(await res.text()).includes('SECRET_TOKEN'));
 }
});

test('method rejection cannot invoke RPC',async()=>{
 const {handle,calls}=successful();
 const r=await handle(request(endpoint+'?token='+secret,'POST'));
 assert.equal(r.status,405);
 assert.equal(r.headers.get('allow'),'GET, HEAD');
 assert.equal(calls.length,0);
});

test('no calendar records is a valid empty subscription, not an authorization bypass',async()=>{
 const handle=createCalendarHandler({rpc:async()=>data([])});
 const res=await handle(request(endpoint+'?token='+secret));
 assert.equal(res.status,200);
 assert.ok((await res.text()).includes('END:VCALENDAR'));
});
