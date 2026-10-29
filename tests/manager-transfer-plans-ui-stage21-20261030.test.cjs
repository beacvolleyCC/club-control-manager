'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
const from=(a,b)=>{const i=source.indexOf(a),j=source.indexOf(b,i+a.length);assert.ok(i>=0&&j>i,'missing boundary '+a);return source.slice(i,j);};
const funcs=from('  function isTestPlayer_(p){','  function playerAvatarHtml_(p){')
  +from('  function ccPlayerTransferErrorText_(err){','  function openPlayerDetail(id){');
const loadSource=from('  async function loadTransferPlans_(){','  async function loadManagerMedicalAppointments(){');
const player={playerId:'member-1',teamId:'team-A',teamName:'Régi',hasAccount:true,name:'Sima Játékos'};
const plan={planId:'plan-1',playerId:player.playerId,sourceTeamId:'team-A',sourceTeamName:'Régi',targetTeamId:'team-B',targetTeamName:'Új',effectiveOn:'2026-11-06',status:'pending'};
function harness(pending=[]){
 const dom={
  '#savePlayerTransferPlanBtn':{disabled:false},
  '#cancelPlayerTransferPlanBtn':{disabled:false,dataset:{planId:'plan-1'}},
  '#transferPlanTeam':{value:'team-B'},
  '#transferPlanDate':{value:'2026-11-06'},
  '#transferPlanFeedback':{hidden:true,textContent:''}
 };
 const calls=[],statuses=[],views=[];
 const state={teams:[{id:'team-A',name:'Régi',active:true},{id:'team-B',name:'Új',active:true}],transferPlans:pending,transferPlansLoadError:''};
 const ctx={
  state, text:x=>String(x==null?'':x).trim(),esc:x=>String(x),
  localDateKey:()=> '2026-10-30',canAnyAction:()=>true,
  $:k=>dom[k],rpc:async(name,args)=>{calls.push({name,args});return name==='cc_manager_player_transfer_plan_list_v1'?[]:{ok:true}},
  renderPlayers:()=>views.push('render'),openPlayerDetail:()=>views.push('detail'),
  status:(s,type)=>statuses.push({s,type}),console:{warn:()=>{},error:()=>{}}
 };
 const api=vm.runInNewContext(funcs+'\n'+loadSource+
    '\n({playerTransferHtml_,playerTransferPlanHtml_,ccPendingTransferPlan_,ccSavePlayerTransferPlan_,ccCancelPlayerTransferPlan_,ccPlayerTransferErrorText_,ccDatePlusDays_,loadTransferPlans_,loadPlayers})',ctx);
 return{api,state,dom,calls,statuses,views,ctx};
}
test('plan date calculation is stable across month-end and DST',()=>{
 const {api}=harness();
 assert.equal(api.ccDatePlusDays_('2026-10-30',1),'2026-10-31');
 assert.equal(api.ccDatePlusDays_('2026-10-30',2),'2026-11-01');
 assert.equal(api.ccDatePlusDays_('2026-12-31',1),'2027-01-01');
});
test('without pending plan UI offers future date and a clear manual-action note',()=>{
 const {api}=harness();
 const html=api.playerTransferHtml_(player);
 assert.match(html,/managerPlayerTransferPlanForm/);
 assert.match(html,/transferPlanDate" type="date" value="2026-10-31" min="2026-10-31"/);
 assert.match(html,/nem vált csapatot automatikusan/);
 assert.match(html,/savePlayerTransferPlanBtn/);
 assert.doesNotMatch(html,/cancelPlayerTransferPlanBtn/);
});
test('pending plan shows old and new teams and cancel, not duplicate create form',()=>{
 const {api}=harness([plan]);
 const html=api.playerTransferHtml_(player);
 assert.match(html,/Előjegyzett csapatváltás/);
 assert.match(html,/Régi → Új/);
 assert.match(html,/2026-11-06/);
 assert.match(html,/cancelPlayerTransferPlanBtn/);
 assert.doesNotMatch(html,/managerPlayerTransferPlanForm/);
});
test('overdue plan explicitly says no automatic execution',()=>{
 const {api}=harness([{...plan,effectiveOn:'2026-10-29'}]);
 const html=api.playerTransferHtml_(player);
 assert.match(html,/NEM történt meg automatikusan/);
});
test('plan load failure refuses form and displays error',()=>{
 const h=harness();h.state.transferPlansLoadError='Nem sikerült betölteni';
 const html=h.api.playerTransferHtml_(player);
 assert.match(html,/Nem sikerült betölteni/);
 assert.doesNotMatch(html,/managerPlayerTransferPlanForm/);
});
test('valid create calls Stage20 RPC and refreshes pending list without changing membership',async()=>{
 const h=harness();
 await h.api.ccSavePlayerTransferPlan_(player);
 assert.equal(h.calls[0].name,'cc_manager_player_transfer_plan_v1');
 assert.equal(h.calls[0].args.p_player_id,'member-1');
 assert.equal(h.calls[0].args.p_team_id,'team-B');
 assert.equal(h.calls[0].args.p_effective_on,'2026-11-06');
 assert.equal(h.calls[1].name,'cc_manager_player_transfer_plan_list_v1');
 assert.deepEqual(h.views,['render','detail']);
 assert.equal(h.dom['#savePlayerTransferPlanBtn'].disabled,false);
 assert.ok(!h.calls.some(x=>x.name==='cc_manager_player_transfer_v1'));
});
test('invalid same team, stale and excess future dates never invoke RPC',async()=>{
 const h=harness();
 h.dom['#transferPlanTeam'].value='team-A';
 await h.api.ccSavePlayerTransferPlan_(player);
 assert.equal(h.calls.length,0);
 h.dom['#transferPlanTeam'].value='team-B';
 h.dom['#transferPlanDate'].value='2026-10-30';
 await h.api.ccSavePlayerTransferPlan_(player);
 assert.equal(h.calls.length,0);
 h.dom['#transferPlanDate'].value='2030-10-30';
 await h.api.ccSavePlayerTransferPlan_(player);
 assert.equal(h.calls.length,0);
});
test('client denies creating a second pending plan before API request',async()=>{
 const h=harness([plan]);
 await h.api.ccSavePlayerTransferPlan_(player);
 assert.equal(h.calls.length,0);
 assert.match(h.dom['#transferPlanFeedback'].textContent,/Már van függő/);
});
test('cancel current player plan uses exact plan ID and refreshes',async()=>{
 const h=harness([plan]);
 await h.api.ccCancelPlayerTransferPlan_(player);
 assert.equal(h.calls[0].name,'cc_manager_player_transfer_plan_cancel_v1');
 assert.equal(h.calls[0].args.p_plan_id,'plan-1');
 assert.equal(h.calls[1].name,'cc_manager_player_transfer_plan_list_v1');
 assert.equal(h.dom['#cancelPlayerTransferPlanBtn'].disabled,false);
 assert.deepEqual(h.views,['render','detail']);
});
test('cancel cannot submit a stale or another player plan ID',async()=>{
 const h=harness([plan]);h.dom['#cancelPlayerTransferPlanBtn'].dataset.planId='someone-else';
 await h.api.ccCancelPlayerTransferPlan_(player);
 assert.equal(h.calls.length,0);
 assert.match(h.statuses.at(-1).s,/megváltoztak/);
});
test('backend error map reports future RSVP conflict in Hungarian',async()=>{
 const h=harness();
 h.ctx.rpc=async()=>{throw new Error('PLAN_FUTURE_GOING_RSVP_REVIEW_REQUIRED')};
 await h.api.ccSavePlayerTransferPlan_(player);
 assert.match(h.dom['#transferPlanFeedback'].textContent,/Jövök választ/);
 assert.equal(h.dom['#savePlayerTransferPlanBtn'].disabled,false);
});
test('double submit while awaiting server creates exactly one plan',async()=>{
 const h=harness();let release;
 h.ctx.rpc=async(name,args)=>{h.calls.push({name,args});if(name==='cc_manager_player_transfer_plan_v1')await new Promise(r=>{release=r});return[]};
 const first=h.api.ccSavePlayerTransferPlan_(player);
 assert.equal(h.dom['#savePlayerTransferPlanBtn'].disabled,true);
 const second=h.api.ccSavePlayerTransferPlan_(player);
 assert.equal(h.calls.length,1);release();await Promise.all([first,second]);
 assert.equal(h.calls.filter(x=>x.name==='cc_manager_player_transfer_plan_v1').length,1);
});
test('double click cancel while awaiting server cancels once',async()=>{
 const h=harness([plan]);let release;
 h.ctx.rpc=async(name,args)=>{h.calls.push({name,args});if(name==='cc_manager_player_transfer_plan_cancel_v1')await new Promise(r=>{release=r});return[]};
 const first=h.api.ccCancelPlayerTransferPlan_(player);
 assert.equal(h.dom['#cancelPlayerTransferPlanBtn'].disabled,true);
 const second=h.api.ccCancelPlayerTransferPlan_(player);
 assert.equal(h.calls.length,1);release();await Promise.all([first,second]);
 assert.equal(h.calls.filter(x=>x.name==='cc_manager_player_transfer_plan_cancel_v1').length,1);
});
test('list RPC failure clears stale plans and disables creation',async()=>{
 const h=harness([plan]);h.ctx.rpc=async()=>{throw new Error('connection down')};
 await h.api.loadTransferPlans_();
 assert.equal(h.state.transferPlans.length,0);
 assert.match(h.state.transferPlansLoadError,/nem tölthetők be/);
 const html=h.api.playerTransferHtml_(player);
 assert.doesNotMatch(html,/managerPlayerTransferPlanForm/);
});
test('TEST-only API usage and branch shell never invokes automatic plan executor',()=>{
 assert.equal((source.match(/rpc\('cc_manager_player_transfer_plan_v1'/g)||[]).length,1);
 assert.equal((source.match(/rpc\('cc_manager_player_transfer_plan_cancel_v1'/g)||[]).length,1);
 assert.equal((source.match(/rpc\('cc_manager_player_transfer_plan_list_v1'/g)||[]).length,1);
 assert.doesNotMatch(funcs,/cc_manager_player_transfer_plan_apply|cc_manager_transfer_plan_cron/);
 assert.match(source,/STAGING_REF==='szzoubvhlwnojtzqjebc'/);
});
