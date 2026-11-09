import {events,teams} from '../manager/fixtures.js';
const root=document.getElementById('schedule');
const date=new Intl.DateTimeFormat('hu-HU',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Budapest'});
function render(items,test=false){
 root.replaceChildren();
 for(const event of [...items].sort((a,b)=>Date.parse(a.startsAt)-Date.parse(b.startsAt))){
  const row=document.createElement('div');row.className='entry';
  const info=document.createElement('div');const title=document.createElement('strong');title.textContent=event.name;
  const detail=document.createElement('small');detail.textContent=date.format(new Date(event.startsAt))+' · '+(event.venue||'Helyszín nincs megadva');
  info.append(title,detail);const team=document.createElement('span');team.className='tag';
  team.textContent=test?event.teamName:(teams.find(t=>t.id===event.teamId)?.name??'–');
  row.append(info,team);root.append(row);
 }
 if(!items.length){const empty=document.createElement('p');empty.textContent='Nincs megjeleníthető edzés.';root.append(empty);}
}
render(events);
let controller=null;
window.addEventListener('cc:v2-player-test-data',event=>{
 if(Array.isArray(event.detail?.events)){render(event.detail.events,true);document.getElementById('playerDataMode').textContent='TEST ADATOK · csak olvasás';}
});
window.addEventListener('cc:v2-authenticated-test-session',async event=>{
 controller?.abort();controller=new AbortController();
 const current=controller;
 try{
  const {loadPlayerTestPreview}=await import('./test-rpc-bridge.js');
  await loadPlayerTestPreview(event.detail,{signal:current.signal});
 }catch(error){
  if(current.signal.aborted)return;
  render(events);
  document.getElementById('playerDataMode').textContent='TEST API HIBA · DEMO';
  console.error('V2 Player TEST preview failed:',error);
 }
});
window.addEventListener('cc:v2-authenticated-test-signout',()=>{
 controller?.abort();render(events);document.getElementById('playerDataMode').textContent='DEMO ADATOK';
});
