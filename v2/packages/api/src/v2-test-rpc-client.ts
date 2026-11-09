/** Authenticated V2 RPC transport. Hard-pinned to isolated TEST; never sends writes to LIVE. */
export interface V2TestSession { url:string; publishableKey:string; accessToken:string }
export type V2RpcName =
 | 'cc_v2_manager_read_v1' | 'cc_v2_player_read_v1'
 | 'cc_v2_manager_mass_read_v1' | 'cc_v2_manager_mass_event_detail_v1'
 | 'cc_v2_manager_mass_waitlist_summary_v1' | 'cc_v2_manager_mass_passes_read_v1'
 | 'cc_v2_manager_finance_read_v1' | 'cc_v2_player_finance_read_v1'
 | 'cc_v2_manager_mass_booking_write_v1';
export interface V2Envelope { schemaVersion: number; [key:string]:unknown }
export class V2RpcError extends Error {
 constructor(readonly status:number,readonly code:string,message:string){super(message);this.name='V2RpcError'}
}
export function testRpcOrigin(session:V2TestSession):string {
 const u=new URL(session.url);
 if(u.protocol!=='https:' || u.hostname!=='szzoubvhlwnojtzqjebc.supabase.co' || u.username || u.password || u.port || u.search || u.hash)
  throw new Error('V2 RPC client only accepts the isolated TEST Supabase host');
 if(!session.publishableKey || !session.accessToken) throw new Error('TEST authentication required');
 return u.origin;
}
export async function v2TestRpc<T extends V2Envelope=V2Envelope>(
 session:V2TestSession, name:V2RpcName, args:Record<string,unknown>={},
 signal?:AbortSignal
):Promise<T> {
 const origin=testRpcOrigin(session);
 const response=await fetch(origin+'/rest/v1/rpc/'+name,{
  method:'POST',signal,cache:'no-store',
  headers:{apikey:session.publishableKey,Authorization:'Bearer '+session.accessToken,
   'Content-Type':'application/json',Accept:'application/json'},
  body:JSON.stringify(args)
 });
 if(!response.ok){
  let code='RPC_HTTP_ERROR';let message='TEST RPC failed ('+response.status+')';
  try{const payload:unknown=await response.json();if(payload && typeof payload==='object'){
   const p=payload as Record<string,unknown>;
   if(typeof p.code==='string') code=p.code;
   if(typeof p.message==='string') message=p.message;
  }}catch{/* preserve HTTP error */}
  throw new V2RpcError(response.status,code,message);
 }
 const body:unknown=await response.json();
 if(!body || typeof body!=='object' || Array.isArray(body) || (body as Record<string,unknown>).schemaVersion!==1)
  throw new Error('Unexpected V2 RPC schema version');
 return body as T;
}
export const v2ManagerTest={
 overview:(s:V2TestSession,from:string,to:string,teamId:string|null=null,playerQuery='')=>
  v2TestRpc(s,'cc_v2_manager_read_v1',{p_from:from,p_to:to,p_team_id:teamId,p_player_query:playerQuery}),
 massTrainings:(s:V2TestSession,from:string,to:string)=>
  v2TestRpc(s,'cc_v2_manager_mass_read_v1',{p_from:from,p_to:to}),
 massEvent:(s:V2TestSession,id:string)=>
  v2TestRpc(s,'cc_v2_manager_mass_event_detail_v1',{p_event_id:id}),
 waitlist:(s:V2TestSession,from:string,to:string)=>
  v2TestRpc(s,'cc_v2_manager_mass_waitlist_summary_v1',{p_from:from,p_to:to}),
 passes:(s:V2TestSession,query='',month='')=>
  v2TestRpc(s,'cc_v2_manager_mass_passes_read_v1',{p_query:query,p_month:month}),
 finance:(s:V2TestSession,teamId:string,season:string|null=null)=>
  v2TestRpc(s,'cc_v2_manager_finance_read_v1',{p_team_id:teamId,p_season:season}),
 addBooking:(s:V2TestSession,eventId:string,payload:Record<string,unknown>)=>
  v2TestRpc(s,'cc_v2_manager_mass_booking_write_v1',{p_action:'add',p_id:eventId,p_payload:payload}),
 removeBooking:(s:V2TestSession,bookingId:string)=>
  v2TestRpc(s,'cc_v2_manager_mass_booking_write_v1',{p_action:'remove',p_id:bookingId,p_payload:{}})
};
export const v2PlayerTest={
 bootstrap:(s:V2TestSession,limit=50)=>v2TestRpc(s,'cc_v2_player_read_v1',{p_notification_limit:limit}),
 finance:(s:V2TestSession)=>v2TestRpc(s,'cc_v2_player_finance_read_v1')
};
