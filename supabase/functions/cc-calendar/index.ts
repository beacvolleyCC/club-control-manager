// CC private subscribed calendar — development only, NOT deployed.
// Gateway JWT verification must be disabled for Apple subscription GETs.
// Security is the 256-bit bearer token + hashed, revoked and scope-gated RPC.
import { createClient } from "npm:@supabase/supabase-js@2.116.0";
const url = Deno.env.get("SUPABASE_URL") ?? "";
const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const admin = url && key ? createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}}) : null;
const enc = new TextEncoder();
const headers = {
  "content-type":"text/calendar; charset=utf-8",
  "cache-control":"private, no-store, max-age=0",
  "x-content-type-options":"nosniff",
  "referrer-policy":"no-referrer",
  "content-disposition":"inline"
};
const failure=()=>new Response("Not found",{status:404,headers:{"cache-control":"no-store","referrer-policy":"no-referrer"}});
function utc(value:unknown):string|null {
  if(!value) return null;
  const d=new Date(String(value));
  if(!Number.isFinite(d.getTime()))return null;
  return d.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z");
}
function escapeText(v:unknown):string {
  return String(v??"").replace(/\\/g,"\\\\").replace(/\r\n|\r|\n/g,"\\n").replace(/;/g,"\\;").replace(/,/g,"\\,");
}
// Fold on UTF-8 octet boundaries, preserving full Unicode code points.
function fold(line:string):string[] {
  const lines:string[]=[]; let part=""; let count=0;
  for(const ch of line){
    const n=enc.encode(ch).length;
    if(count+n>75){ lines.push(part);part=" ";count=1; }
    part+=ch;count+=n;
  }
  lines.push(part);
  return lines;
}
type CalendarEvent={
  id:string;title:string|null;type:string;start:string;end:string|null;
  venue:string|null;address:string|null;court:string|null;status:string;
  updatedAt:string|null;createdAt:string|null;
};
function buildIcs(events:CalendarEvent[]):string{
  const lines=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Club Control//Private Subscription V1//HU",
    "CALSCALE:GREGORIAN","METHOD:PUBLISH","X-WR-CALNAME:Club Control"];
  for(const e of events){
    const start=utc(e.start);
    if(!start || !/^[a-f0-9-]{36}$/i.test(e.id))continue;
    const modified=utc(e.updatedAt)||utc(e.createdAt)||start;
    const updatedMs=Date.parse(e.updatedAt||e.createdAt||e.start);
    const seq=Number.isFinite(updatedMs)?Math.max(0,Math.floor(updatedMs/1000)):0;
    const location=[e.venue,e.court,e.address].filter(Boolean).join(" · ");
    const props=["BEGIN:VEVENT",`UID:${e.id}@club-control.beac`,`DTSTAMP:${modified}`,
      `LAST-MODIFIED:${modified}`,`SEQUENCE:${seq}`,`DTSTART:${start}`];
    const end=utc(e.end);if(end&&end>start)props.push(`DTEND:${end}`);
    props.push(`SUMMARY:${escapeText(e.title|| (e.type==="match"?"Mérkőzés":"Edzés"))}`);
    if(location)props.push(`LOCATION:${escapeText(location)}`);
    if(e.status==="cancelled")props.push("STATUS:CANCELLED");
    else props.push("STATUS:CONFIRMED");
    props.push("END:VEVENT");
    lines.push(...props);
  }
  lines.push("END:VCALENDAR");
  return lines.flatMap(fold).join("\r\n")+"\r\n";
}
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
