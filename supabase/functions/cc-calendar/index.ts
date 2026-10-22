// CC private subscribed calendar — development only, NOT deployed.
// Gateway JWT verification must be disabled for Apple subscription GETs.
// Security is the 256-bit bearer token + hashed, revoked and scope-gated RPC.
import { createClient } from "npm:@supabase/supabase-js@2.116.0";
const url = Deno.env.get("SUPABASE_URL") ?? "";
const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const admin = url && key ? createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}}) : null;
import { buildIcs } from './ics.mjs';
const enc = new TextEncoder();
const headers = {
  'content-type':'text/calendar; charset=utf-8',
  'cache-control':'private, no-store, max-age=0',
  'x-content-type-options':'nosniff',
  'referrer-policy':'no-referrer',
  'content-disposition':'inline'
};
const failure=()=>new Response('Not found',{status:404,headers:{'cache-control':'no-store','referrer-policy':'no-referrer'}});
Deno.serve(async(req:Request)=>{
  if(req.method!=="GET")return new Response(null,{status:405,headers:{allow:"GET","cache-control":"no-store"}});
  if(!admin)return new Response("Unavailable",{status:503,headers:{"cache-control":"no-store"}});
  let token:string|null=null;
  try{token=new URL(req.url).searchParams.get("token");}catch{return failure();}
  if(!token||!/^[0-9a-f]{64}$/.test(token))return failure();
  const digest=await crypto.subtle.digest("SHA-256",enc.encode(token));
  const hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,"0")).join("");
  // Never log the URL, raw token, token hash, or details of rejected requests.
  const {data,error}=await admin.rpc("cc_calendar_feed_read_v1",{p_token_sha256:hash});
  if(error)return new Response("Unavailable",{status:503,headers:{"cache-control":"no-store"}});
  if(!data || !Array.isArray(data.events))return failure();
  return new Response(buildIcs(data.events),{status:200,headers});
});
