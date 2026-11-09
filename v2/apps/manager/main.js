// Deliberately isolated demo. Never silently connect to LIVE or TEST databases.
import { teams, players, events } from './fixtures.js';
const byId = id => document.getElementById(id);
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date = value => value && !Number.isNaN(new Date(value).getTime()) ? new Intl.DateTimeFormat('hu-HU',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Budapest'}).format(new Date(value)) : 'Nincs időpont';
function row(title,detail,tag){return '<div class="entry"><div><strong>'+esc(title)+'</strong><small>'+esc(detail)+'</small></div><span class="tag">'+esc(tag)+'</span></div>'}
let liveTestData=null;
function render(){
 const sourceTeams=liveTestData?.teams??teams;
 const sourceEvents=liveTestData?.events??events;
 const sourcePlayers=liveTestData?[]:players;
 const selected=byId('teamFilter').value;
 const period=byId('periodFilter').value,chosenDay=byId('dateFilter').value,sort=byId('sortFilter').value;
 const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Budapest',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const dayOf=e=>e.startsAt?new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Budapest',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(e.startsAt)):'';
 const visible=sourceEvents.filter(e=>(selected==='all'||e.teamId===selected)&&(!chosenDay||dayOf(e)===chosenDay)&&(period==='all'||(period==='past'?dayOf(e)<today:dayOf(e)>=today))).sort((a,b)=>(sort==='oldest'?1:-1)*(new Date(a.startsAt)-new Date(b.startsAt)));
 byId('stats').innerHTML=[['Edzések',visible.length],['Játékosok',liveTestData?liveTestData.players.length:sourcePlayers.length],['Csapatok',sourceTeams.length]].map(([k,v])=>'<div class="stat"><span>'+esc(k)+'</span><strong>'+v+'</strong></div>').join('');
 byId('eventList').innerHTML=visible.map(e=>row(e.name+' · '+date(e.startsAt),e.venue||'Helyszín nincs megadva',sourceTeams.find(t=>t.id===e.teamId)?.name||'–')).join('')||'<p class="empty">Nincs edzés a szűrésben.</p>';
}
function updateTeamFilter(){const selected=byId('teamFilter').value;const source=liveTestData?.teams??teams;byId('teamFilter').innerHTML='<option value="all">Összes csapat</option>'+source.map(t=>'<option value="'+esc(t.id)+'">'+esc(t.name)+'</option>').join('');if(source.some(t=>t.id===selected))byId('teamFilter').value=selected;}
updateTeamFilter();
byId('teamFilter').addEventListener('change',render);
byId('playerList').innerHTML=players.map(p=>row(p.name,p.position,teams.find(t=>t.id===p.teamId)?.name||'–')).join('');
byId('teamList').innerHTML=teams.map(t=>row(t.name,t.area==='competition'?'Versenysport':'Tömegsport',t.id)).join('');
render();

window.addEventListener('cc:v2-test-data',event=>{
 const payload=event.detail;
 if(!payload||!Array.isArray(payload.teams)||!Array.isArray(payload.events)||!Array.isArray(payload.players))return;
 liveTestData={teams:payload.teams.map(t=>({id:String(t.id),name:String(t.name||'Csapat')})),events:payload.events.map(e=>({id:String(e.eventId),teamId:String(e.teamId||''),name:String(e.title||'Esemény'),startsAt:e.startsAt,venue:String(e.venue||'')})),players:payload.players.map(p=>({id:String(p.playerId),name:String(p.displayName||p.name||'Játékos'),position:String(p.position||'–'),teamId:String(p.teamId||'')}))};
 byId('playerList').innerHTML=liveTestData.players.map(p=>row(p.name,p.position,liveTestData.teams.find(t=>t.id===p.teamId)?.name||'–')).join('')||'<p class="empty">Nincs hozzáférhető játékos.</p>';
 byId('teamList').innerHTML=liveTestData.teams.map(t=>row(t.name,'TEST adat',t.id)).join('');
 byId('testDataMode').textContent='TEST ADATOK · csak olvasás';
 updateTeamFilter();render();
});
window.addEventListener('cc:v2-test-clear',()=>{
 liveTestData=null;byId('testDataMode').textContent='DEMO ADATOK';
 byId('playerList').innerHTML=players.map(p=>row(p.name,p.position,teams.find(t=>t.id===p.teamId)?.name||'–')).join('');
 byId('teamList').innerHTML=teams.map(t=>row(t.name,t.area==='competition'?'Versenysport':'Tömegsport',t.id)).join('');
 updateTeamFilter();render();
});

// V2 shell navigation – preview only, no database writes.
byId('headerDate').textContent=new Intl.DateTimeFormat('hu-HU',{dateStyle:'long',timeZone:'Europe/Budapest'}).format(new Date());
byId('filterToggle').addEventListener('click',()=>{const panel=byId('filterPanel');panel.hidden=!panel.hidden;byId('filterToggle').setAttribute('aria-expanded',String(!panel.hidden));});
for(const id of ['periodFilter','dateFilter','sortFilter'])byId(id).addEventListener('change',render);
byId('newEvent').addEventListener('click',()=>{byId('newEventPanel').hidden=false;byId('newEventPanel').scrollIntoView({behavior:'smooth'});});
byId('closeNewEvent').addEventListener('click',()=>{byId('newEventPanel').hidden=true;});
byId('settingsNav').addEventListener('click',()=>{const panel=byId('settingsPanel');panel.hidden=!panel.hidden;if(!panel.hidden)panel.scrollIntoView({behavior:'smooth'});});

let activeTestRequest=null;
window.addEventListener('cc:v2-authenticated-test-session',async event=>{
 activeTestRequest?.abort();
 const controller=new AbortController();
 activeTestRequest=controller;
 try{
  const {loadManagerTestPreview}=await import('./test-rpc-bridge.js');
  await loadManagerTestPreview(event.detail,{signal:controller.signal});
 }catch(error){
  if(controller.signal.aborted)return;
  byId('testDataMode').textContent='TEST API HIBA · DEMO';
  console.error('V2 TEST preview load failed:',error);
 }
});
window.addEventListener('cc:v2-authenticated-test-signout',()=>{
 activeTestRequest?.abort();
 window.dispatchEvent(new Event('cc:v2-test-clear'));
});
