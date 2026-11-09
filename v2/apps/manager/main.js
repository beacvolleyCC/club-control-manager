// Deliberately isolated demo. Never silently connect to LIVE or TEST databases.
import { teams, players, events } from './fixtures.js';
const byId = id => document.getElementById(id);
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date = value => value && !Number.isNaN(new Date(value).getTime()) ? new Intl.DateTimeFormat('hu-HU',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Budapest'}).format(new Date(value)) : 'Nincs időpont';
function row(title,detail,tag){return '<div class="entry"><div><strong>'+esc(title)+'</strong><small>'+esc(detail)+'</small></div><span class="tag">'+esc(tag)+'</span></div>'}
let liveTestData=null;
let testSessionActive=false;
const safeTime=value=>value&&Number.isFinite(Date.parse(value))?Date.parse(value):null;
function render(){
 const sourceTeams=liveTestData?.teams??(testSessionActive?[]:teams);
 const sourceEvents=liveTestData?.events??(testSessionActive?[]:events);
 const sourcePlayers=liveTestData?.players??(testSessionActive?[]:players);
 const selected=byId('teamFilter').value;
 const period=byId('periodFilter').value,chosenDay=byId('dateFilter').value,sort=byId('sortFilter').value;
 const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Budapest',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const dayOf=e=>safeTime(e.startsAt)!==null?new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Budapest',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(e.startsAt)):'';
 const visible=sourceEvents.filter(e=>(selected==='all'||e.teamId===selected)&&(!chosenDay||dayOf(e)===chosenDay)&&(period==='all'||(period==='past'?dayOf(e)!==''&&dayOf(e)<today:dayOf(e)!==''&&dayOf(e)>=today))).sort((a,b)=>{const direction=sort==='oldest'?1:sort==='recent'?-1:period==='past'?-1:1;return direction*((safeTime(a.startsAt)??Number.MAX_SAFE_INTEGER)-(safeTime(b.startsAt)??Number.MAX_SAFE_INTEGER));});
 byId('stats').innerHTML=[['Események',visible.length],['Játékosok',sourcePlayers.filter(p=>selected==='all'||p.teamId===selected).length],['Csapatok',selected==='all'?sourceTeams.length:sourceTeams.filter(t=>t.id===selected).length]].map(([k,v])=>'<div class="stat"><span>'+esc(k)+'</span><strong>'+v+'</strong></div>').join('');
 byId('stats').hidden=false;
 byId('eventList').innerHTML=visible.map(e=>row(e.name+' · '+date(e.startsAt),e.venue||'Helyszín nincs megadva',sourceTeams.find(t=>t.id===e.teamId)?.name||'–')).join('')||'<p class="empty">Nincs esemény a szűrésben.</p>';
 byId('playerList').innerHTML=sourcePlayers.filter(p=>selected==='all'||p.teamId===selected).map(p=>row(p.name,p.position,sourceTeams.find(t=>t.id===p.teamId)?.name||'–')).join('')||'<p class="empty">Nincs megjeleníthető játékos.</p>';
 byId('teamList').innerHTML=sourceTeams.filter(t=>selected==='all'||t.id===selected).map(t=>row(t.name,liveTestData?'TEST adat':t.area==='competition'?'Versenysport':'Tömegsport',t.id)).join('')||'<p class="empty">Nincs megjeleníthető csapat.</p>';
}
function updateTeamFilter(){const selected=byId('teamFilter').value;const source=liveTestData?.teams??(testSessionActive?[]:teams);byId('teamFilter').innerHTML='<option value="all">Összes csapat</option>'+source.map(t=>'<option value="'+esc(t.id)+'">'+esc(t.name)+'</option>').join('');if(source.some(t=>t.id===selected))byId('teamFilter').value=selected;else byId('teamFilter').value='all';}
updateTeamFilter();
byId('teamFilter').addEventListener('change',render);


render();

window.addEventListener('cc:v2-test-data',event=>{
 const payload=event.detail;
 if(!payload||!Array.isArray(payload.teams)||!Array.isArray(payload.events)||!Array.isArray(payload.players))return;
 testSessionActive=true;
 liveTestData={teams:payload.teams.map(t=>({id:String(t.id),name:String(t.name||'Csapat')})),events:payload.events.map(e=>({id:String(e.eventId),teamId:String(e.teamId||''),name:String(e.title||'Esemény'),startsAt:e.startsAt,venue:String(e.venue||'')})),players:payload.players.map(p=>({id:String(p.playerId),name:String(p.displayName||p.name||'Játékos'),position:String(p.position||'–'),teamId:String(p.teamId||'')}))};
 
 
 byId('testDataMode').textContent='TEST ADATOK · csak olvasás';
 updateTeamFilter();render();
});
window.addEventListener('cc:v2-test-clear',()=>{
 liveTestData=null;testSessionActive=false;byId('testDataMode').textContent='DEMO ADATOK';
 byId('playerList').innerHTML=players.map(p=>row(p.name,p.position,teams.find(t=>t.id===p.teamId)?.name||'–')).join('');
 byId('teamList').innerHTML=teams.map(t=>row(t.name,t.area==='competition'?'Versenysport':'Tömegsport',t.id)).join('');
 updateTeamFilter();render();
});

// V2 shell navigation – preview only, no database writes.
byId('headerDate').textContent=new Intl.DateTimeFormat('hu-HU',{dateStyle:'long',timeZone:'Europe/Budapest'}).format(new Date());
byId('filterToggle').addEventListener('click',()=>{const panel=byId('filterPanel');panel.hidden=!panel.hidden;byId('filterToggle').setAttribute('aria-expanded',String(!panel.hidden));});
for(const id of ['periodFilter','dateFilter','sortFilter'])byId(id).addEventListener('change',render);
// Creating events requires an explicit, verified write permission contract. The preview is read-only.
byId('newEvent').hidden=true;
byId('closeNewEvent').addEventListener('click',()=>{byId('newEventPanel').hidden=true;});
// Never infer Settings permission from a successful Manager read RPC.
byId('settingsNav').hidden=true;

let activeTestRequest=null;
window.addEventListener('cc:v2-authenticated-test-session',async event=>{
 testSessionActive=true;liveTestData=null;updateTeamFilter();render();byId('testDataMode').textContent='TEST BETÖLTÉS';
 activeTestRequest?.abort();
 const controller=new AbortController();
 activeTestRequest=controller;
 try{
  const {loadManagerTestPreview}=await import('./test-rpc-bridge.js');
  await loadManagerTestPreview(event.detail,{signal:controller.signal});
 }catch(error){
  if(controller.signal.aborted)return;
  liveTestData=null;testSessionActive=true;updateTeamFilter();render();
  byId('testDataMode').textContent='TEST API HIBA · nincs adat';
  console.error('V2 TEST preview load failed:',error);
 }
});
window.addEventListener('cc:v2-authenticated-test-signout',()=>{
 activeTestRequest?.abort();
 window.dispatchEvent(new Event('cc:v2-test-clear'));
});
