// Opt-in authenticated TEST bridge. Demo stays default until the host auth flow supplies a session.
// No credentials are persisted. No direct table access, no writes, no LIVE fallback.
const HOST='szzoubvhlwnojtzqjebc.supabase.co';
const toDate=(date)=>new Date(date).toISOString();
function sessionOrigin(s){
 const u=new URL(s.url);
 if(u.protocol!=='https:'||u.hostname!==HOST||u.port||u.username||u.password||u.search||u.hash||!s.publishableKey||!s.accessToken)
  throw new Error('Isolated TEST session required');
 return u.origin;
}
export async function loadManagerTestPreview(session,{signal}={}){
 const origin=sessionOrigin(session);
 const now=new Date();
 const from=new Date(now);from.setUTCDate(from.getUTCDate()-30);
 const to=new Date(now);to.setUTCDate(to.getUTCDate()+120);
 const response=await fetch(origin+'/rest/v1/rpc/cc_v2_manager_read_v1',{
  method:'POST',signal,cache:'no-store',
  headers:{apikey:session.publishableKey,Authorization:'Bearer '+session.accessToken,'Content-Type':'application/json'},
  body:JSON.stringify({p_from:toDate(from),p_to:toDate(to),p_team_id:null,p_player_query:''})
 });
 if(!response.ok)throw new Error('TEST Manager access denied ('+response.status+')');
 const data=await response.json();
 if(data?.schemaVersion!==1||!Array.isArray(data.trainings)||!Array.isArray(data.matches)||!Array.isArray(data.players))
  throw new Error('Unexpected TEST Manager API response');
 const events=[...data.trainings,...data.matches];
 const teamMap=new Map();
 for(const e of events)if(e.teamId)teamMap.set(String(e.teamId),{id:String(e.teamId),name:String(e.teamName||'Csapat')});
 const normalized={
  teams:[...teamMap.values()],
  events:events.map(e=>({eventId:e.eventId,teamId:e.teamId,title:e.title||e.eventType,startsAt:e.startsAt,venue:e.venue||''})),
  players:data.players.map(p=>({playerId:p.playerId??p.id,displayName:p.displayName??p.name,position:p.position,teamId:p.teamId}))
 };
 window.dispatchEvent(new CustomEvent('cc:v2-test-data',{detail:normalized}));
 return normalized;
}
