const test=require('node:test');
const assert=require('node:assert/strict');
const api=require('../match-sheet-api.js');
const id='10000000-0000-4000-8000-000000000001';
const stamp='2026-11-06T10:00:00.000Z';
test('create uses null version',async()=>{
 let args;const db={rpc:async(n,a)=>{args={n,a};return {data:{ok:true},error:null}}};
 await api.save(db,id,{matchStatus:'draft'},null);
 assert.equal(args.n,'cc_manager_match_sheet_save_v1');
 assert.equal(args.a.p_expected_updated_at,null);
});
test('sets save uses dedicated versioned RPC',async()=>{
 let args;const db={rpc:async(n,a)=>{args={n,a};return {data:{ok:true},error:null}}};
 await api.saveSets(db,id,[{setNo:1,homePoints:25,awayPoints:20}],stamp);
 assert.equal(args.n,'cc_manager_match_sheet_sets_save_v1');
 assert.equal(args.a.p_expected_updated_at,stamp);
});
test('roster save uses dedicated versioned RPC',async()=>{
 let args;const db={rpc:async(n,a)=>{args={n,a};return {data:{ok:true},error:null}}};
 await api.saveRoster(db,id,[],stamp);
 assert.equal(args.n,'cc_manager_match_sheet_roster_save_v1');
 assert.equal(args.a.p_expected_updated_at,stamp);
});
