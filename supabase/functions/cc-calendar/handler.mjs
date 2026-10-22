// Pure HTTP layer: accepts a service-role RPC client, never a user-supplied database key.
// Safe for offline tests. A URL token is a bearer secret: do not log request.url.
import { buildIcs } from './ics.mjs';
const utf8 = new TextEncoder();
const common = {
  'Cache-Control': 'private, no-store, max-age=0',
  'Pragma': 'no-cache',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex, noarchive'
};
const notFound=()=>new Response('Not found', {status:404,headers:common});
const unavailable=()=>new Response('Unavailable',{status:503,headers:common});
export function createCalendarHandler(serviceClient) {
  return async function handleCalendar(req) {
    if (req.method!=='GET' && req.method!=='HEAD') {
      return new Response(null,{status:405,headers:{...common,Allow:'GET, HEAD'}});
    }
    if (!serviceClient || typeof serviceClient.rpc!=='function') return unavailable();
    let tokens;
    try { tokens = new URL(req.url).searchParams.getAll('token'); }
    catch { return notFound(); }
    // Reject multiple tokens, malformed secrets, and all unrecognized parameters.
    if(tokens.length!==1 || !/^[a-f0-9]{64}$/.test(tokens[0]))return notFound();
    let hash;
    try {
      const digest=await crypto.subtle.digest('SHA-256',utf8.encode(tokens[0]));
      hash=Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,'0')).join('');
    } catch { return unavailable(); }
    try {
      const {data,error}=await serviceClient.rpc('cc_calendar_feed_read_v1',{p_token_sha256:hash});
      if(error)return unavailable();
      if(!data||!Array.isArray(data.events))return notFound();
      const headers={...common,'Content-Type':'text/calendar; charset=utf-8','Content-Disposition':'inline'};
      if(req.method==='HEAD')return new Response(null,{status:200,headers});
      return new Response(buildIcs(data.events),{status:200,headers});
    }catch { return unavailable(); }
  };
}
