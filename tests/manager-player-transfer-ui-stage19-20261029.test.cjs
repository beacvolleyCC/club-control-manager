'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const src=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
const from=(a,b)=>{const i=src.indexOf(a),j=src.indexOf(b,i+a.length);assert.ok(i>=0&&j>i,'Cannot locate '+a);return src.slice(i,j);};
const source=from('  function isTestPlayer_(p){','  function playerAvatarHtml_(p){')
  +from('  function ccPlayerTransferErrorText_(err){','  function openPlayerDetail(id){');
const TEST_ID='1e8ae2fc-9f5b-4272-a809-b6bb779970bd';
const other='20000000-0000-4000-8000-000000000001';
function harness(){
  const dom={
    '#savePlayerTransferBtn':{disabled:false},
    '#transferPlayerFeedback':{hidden:true,textContent:''},
    '#transferPlayerTeam':{value:'team-B'},
    '#transferPlayerDate':{value:'2026-10-29'}
  };
  const actions=[],rpcCalls=[];
  const context={
    text:x=>String(x==null?'':x).trim(),esc:x=>String(x),state:{teams:[{id:'team-A',name:'Régi csapat',active:true},{id:'team-B',name:'Új csapat',active:true}]},
    localDateKey:()=> '2026-10-29',
    $:selector=>dom[selector],canAnyAction:()=>true,
    rpc:async(name,args)=>{rpcCalls.push({name,args});},
    loadPlayers:async()=>{},loadTeams:async()=>{},
    renderPlayers:()=>actions.push('render'),openPlayerDetail:()=>actions.push('detail'),
    status:(msg,kind)=>actions.push([msg,kind]),
    console:{error:()=>{}}
  };
  const api=vm.runInNewContext(source+'\n({isTestPlayer_,playerTransferHtml_,ccPlayerTransferErrorText_,savePlayerTransfer_})',context);
  return {api,dom,actions,rpcCalls,context};
}
test('only the designated, linked TEST athlete is routed through immediate reassignment',()=>{
  const {api}=harness();
  assert.equal(api.isTestPlayer_({playerId:TEST_ID,name:'Club Control TEST',hasAccount:true}),true);
  assert.equal(api.isTestPlayer_({playerId:other,name:'Club Control TEST',hasAccount:true}),false);
  assert.equal(api.isTestPlayer_({playerId:TEST_ID,name:'Club Control TEST',hasAccount:false}),false);
  assert.equal(api.isTestPlayer_({playerId:TEST_ID,name:'Genuine athlete',hasAccount:true}),false);
});
test('regular athlete UI shows only the current Budapest date and transparent RSVP warning',()=>{
  const {api}=harness();
  const html=api.playerTransferHtml_({playerId:other,teamId:'team-A',teamName:'Régi csapat',name:'Player One'});
  assert.match(html,/value="2026-10-29" min="2026-10-29" max="2026-10-29" required/);
  assert.match(html,/már Jövök választ adtak/);
  assert.match(html,/transferPlayerFeedback/);
  assert.match(html,/savePlayerTransferBtn/);
  assert.doesNotMatch(html,/Azonnali áthelyezés/);
});
test('designated test player has instant-transfer form without date',()=>{
  const {api}=harness();
  const html=api.playerTransferHtml_({playerId:TEST_ID,teamId:'team-A',name:'Club Control TEST',hasAccount:true});
  assert.match(html,/Azonnali áthelyezés/);
  assert.doesNotMatch(html,/transferPlayerDate/);
  assert.match(html,/a korábbi előzmények és a jelentkezések nem változnak/);
});
test('known Supabase validation codes produce actionable Hungarian guidance',()=>{
  const {api}=harness();
  assert.match(api.ccPlayerTransferErrorText_({message:'TRANSFER_FUTURE_OLD_TEAM_GOING_RSVPS_REVIEW_REQUIRED'}),/Jövök jelentkezése/);
  assert.match(api.ccPlayerTransferErrorText_({message:'REASSIGN_DESIGNATED_TEST_ONLY'}),/kizárólag/);
  assert.match(api.ccPlayerTransferErrorText_({message:'TRANSFER_BOTH_TEAMS_EDIT_REQUIRED'}),/mindkét csapat/);
  assert.match(api.ccPlayerTransferErrorText_({message:'TRANSFER_DATE_MUST_BE_TODAY'}),/mai napra/);
});
test('client blocks stale date before invoking regular RPC',async()=>{
  const h=harness();h.dom['#transferPlayerDate'].value='2026-10-30';
  await h.api.savePlayerTransfer_({playerId:other,teamId:'team-A',name:'Player One'});
  assert.equal(h.rpcCalls.length,0);
  assert.equal(h.dom['#savePlayerTransferBtn'].disabled,false);
  assert.match(h.dom['#transferPlayerFeedback'].textContent,/csak a mai napra/);
});
test('valid regular transfer invokes exact Stage17 RPC with date and refreshes view',async()=>{
  const h=harness();
  await h.api.savePlayerTransfer_({playerId:other,teamId:'team-A',name:'Player One'});
  assert.deepEqual(h.rpcCalls.map(x=>x.name),['cc_manager_player_transfer_v1']);
  assert.equal(h.rpcCalls[0].args.p_starts_on,'2026-10-29');
  assert.equal(h.dom['#savePlayerTransferBtn'].disabled,false);
  assert.equal(h.dom['#transferPlayerFeedback'].hidden,true);
  assert.deepEqual(h.actions.filter(x=>typeof x==='string'),['render','detail']);
});
test('test player invokes Stage18 RPC and keeps date out of payload',async()=>{
  const h=harness();
  await h.api.savePlayerTransfer_({playerId:TEST_ID,teamId:'team-A',name:'Club Control TEST',hasAccount:true});
  assert.deepEqual(h.rpcCalls.map(x=>x.name),['cc_manager_test_player_reassign_v1']);
  assert.ok(!Object.hasOwn(h.rpcCalls[0].args,'p_starts_on'));
});
test('failed transfer shows persistent inline message, and unlocks submit',async()=>{
  const h=harness();
  h.context.rpc=async()=>{throw new Error('TRANSFER_FUTURE_OLD_TEAM_GOING_RSVPS_REVIEW_REQUIRED')};
  await h.api.savePlayerTransfer_({playerId:other,teamId:'team-A',name:'Player One'});
  assert.equal(h.dom['#savePlayerTransferBtn'].disabled,false);
  assert.equal(h.dom['#transferPlayerFeedback'].hidden,false);
  assert.match(h.dom['#transferPlayerFeedback'].textContent,/Jövök jelentkezése/);
});
test('same source and target team cannot submit a transfer',async()=>{
  const h=harness();
  h.dom['#transferPlayerTeam'].value='team-A';
  await h.api.savePlayerTransfer_({playerId:other,teamId:'team-A',name:'Player One'});
  assert.equal(h.rpcCalls.length,0);
  assert.match(h.dom['#transferPlayerFeedback'].textContent,/már ebben a csapatban/);
});
test('test source strictly isolated and changes only Manager TEST app',()=>{
  assert.match(src,/STAGING_REF==='szzoubvhlwnojtzqjebc'/);
  assert.doesNotMatch(source,/snqsxlyhontaepembaic|sb_secret_|service_role/);
  assert.equal((src.match(/rpc\('cc_manager_player_transfer_v1'/g)||[]).length,1);
  assert.equal((src.match(/rpc\('cc_manager_test_player_reassign_v1'/g)||[]).length,1);
});
