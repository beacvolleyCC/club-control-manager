'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const api=require('../match-sheet-api.js');
const id='30000000-0000-4000-8000-000000000006';
const at='2026-11-06T12:00:00.000Z';
test('read uses correct RPC',async()=>{
 const calls=[];const db={rpc:async(name,args)=>{calls.push([name,args]);return {data:{eventId:id,sheet:null,roster:[],sets:[]},error:null}}};
 const result=await api.read(db,id);assert.equal(result.eventId,id);assert.deepEqual(calls,[['cc_manager_match_sheet_read_v1',{p_event_id:id}]]);
});
test('save, roster, sets preserve optimistic lock timestamp',async()=>{
 const calls=[];const db={rpc:async(name,args)=>{calls.push([name,args]);return {data:{ok:true,updatedAt:at},error:null}}};
 await api.save(db,id,{matchStatus:'draft'});
 await api.saveRoster(db,id,[{side:'home',playerName:'QA'}],at);
 await api.saveSets(db,id,[{setNo:1,homePoints:25,awayPoints:20}],at);
 assert.deepEqual(calls.map(c=>c[0]),['cc_manager_match_sheet_save_v1','cc_manager_match_sheet_roster_save_v1','cc_manager_match_sheet_sets_save_v1']);
 assert.equal(calls[0][1].p_expected_updated_at,null);
 assert.equal(calls[1][1].p_expected_updated_at,at);
 assert.equal(calls[2][1].p_expected_updated_at,at);
});
test('RPC errors are not swallowed',async()=>{
 const db={rpc:async()=>({data:null,error:{code:'40001',message:'MATCH_SHEET_CONFLICT'}})};
 await assert.rejects(()=>api.saveSets(db,id,[],at),e=>e.code==='40001');
});
test('invalid input rejected before RPC',async()=>{
 const db={rpc:async()=>{throw Error('must not call')}};
 await assert.rejects(()=>api.read(db,'bad-id'),/Invalid event ID/);
 await assert.rejects(()=>api.saveRoster(db,id,{},at),/Roster must be an array/);
 await assert.rejects(()=>api.saveSets(db,id,[],'bad'),/updatedAt timestamp/);
});
