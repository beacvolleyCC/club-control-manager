// Player V2 preview: opt-in, authenticated, TEST-only, read-only.
const TEST_HOST='szzoubvhlwnojtzqjebc.supabase.co';
function testOrigin(session){
 const u=new URL(session.url);
 if(u.protocol!=='https:'||u.hostname!==TEST_HOST||u.username||u.password||u.port||u.search||u.hash||!session.publishableKey||!session.accessToken)
  throw new Error('Isolated authenticated TEST session required');
 return u.origin;
}
export async function loadPlayerTestPreview(session,{signal}={}){
 const origin=testOrigin(session);
 const response=await fetch(origin+'/rest/v1/rpc/cc_v2_player_read_v1',{
  method:'POST',signal,cache:'no-store',
  headers:{apikey:session.publishableKey,Authorization:'Bearer '+session.accessToken,'Content-Type':'application/json',Accept:'application/json'},
  body:JSON.stringify({p_notification_limit:50})
 });
 if(!response.ok)throw new Error('TEST Player access denied ('+response.status+')');
 const data=await response.json();
 if(signal?.aborted)throw new DOMException('TEST request cancelled','AbortError');
 if(data?.schemaVersion!==1||!data.bootstrap||!Array.isArray(data.bootstrap.events))
  throw new Error('Unexpected TEST Player API response');
 const events=data.bootstrap.events.map(e=>({
  id:String(e.eventId??e.id??''),name:String(e.title??e.name??'Edzés'),
  startsAt:e.startsAt??e.starts_at,venue:String(e.venue??e.court??''),
  teamName:String(e.teamName??e.team_name??'–')
 })).filter(e=>e.id&&e.startsAt&&!Number.isNaN(Date.parse(e.startsAt)));
 window.dispatchEvent(new CustomEvent('cc:v2-player-test-data',{detail:{events}}));
 return events.length;
}
