/* Club Control Manager TEST: match-sheet RPC adapter. No browser globals or privileged keys. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.CCMatchSheetApi=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const EVENT_ID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  function eventId(value){if(typeof value!=='string'||!EVENT_ID.test(value))throw new TypeError('Invalid event ID');return value}
  function client(supabase){if(!supabase||typeof supabase.rpc!=='function')throw new TypeError('Authenticated Supabase client required');return supabase}
  async function call(supabase,name,args){const {data,error}=await client(supabase).rpc(name,args);if(error)throw error;return typeof data==='string'?JSON.parse(data):data}
  function stamp(value){if(typeof value!=='string'||!Number.isFinite(Date.parse(value)))throw new TypeError('Expected updatedAt timestamp');return value}
  return Object.freeze({
    read:(db,id)=>call(db,'cc_manager_match_sheet_read_v1',{p_event_id:eventId(id)}),
    save:(db,id,payload,expectedUpdatedAt=null)=>{
      if(!payload||Array.isArray(payload)||typeof payload!=='object')throw new TypeError('Invalid sheet payload');
      return call(db,'cc_manager_match_sheet_save_v1',{p_event_id:eventId(id),p_payload:payload,p_expected_updated_at:expectedUpdatedAt===null?null:stamp(expectedUpdatedAt)});
    },
    saveRoster:(db,id,roster,updatedAt)=>{
      if(!Array.isArray(roster))throw new TypeError('Roster must be an array');
      return call(db,'cc_manager_match_sheet_roster_save_v1',{p_event_id:eventId(id),p_roster:roster,p_expected_updated_at:stamp(updatedAt)});
    },
    saveSets:(db,id,sets,updatedAt)=>{
      if(!Array.isArray(sets))throw new TypeError('Sets must be an array');
      return call(db,'cc_manager_match_sheet_sets_save_v1',{p_event_id:eventId(id),p_sets:sets,p_expected_updated_at:stamp(updatedAt)});
    }
  });
});
