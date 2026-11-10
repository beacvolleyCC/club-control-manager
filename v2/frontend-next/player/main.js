// Independent Player V2. Authenticated TEST-only, read-only RPCs; no RSVP mutation.
import {mountTestAuth} from '../shared/test-auth-ui.js';
import {readTestRpc} from '../shared/test-rpc.js';
const screens={
 home:['Áttekintés','Saját edzések, mérkőzések és értesítések'],
 trainings:['Edzések','Saját csapathoz tartozó edzések'],
 matches:['Meccsek','Csapatesemények; hivatalos jegyzőkönyv külön modul'],
 notifications:['Értesítések','Saját, jogosultsággal lekért értesítések'],
 profile:['Profil','Bejelentkezett sportoló adatai']
};
const $=id=>document.getElementById(id);
const nav=$('playerNav'),root=$('playerView'),title=$('playerTitle'),desc=$('playerDescription'),menu=$('playerMenuToggle'),badge=$('playerDataStatus');
let mode='signed-out',data=null,failure='',controller=null,revision=0;
const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=String(text);if(cls)e.className=cls;return e};
const panel=(heading,help)=>{const box=el('section',undefined,'cc-card player-card');box.append(el('h2',heading));if(help)box.append(el('p',help,'cc-muted'));return box};
function clearData(){revision++;controller?.abort();controller=null;data=null;mode='signed-out';failure='';render()}
async function login(session){
 const own=++revision;controller?.abort();controller=new AbortController();
 data=null;failure='';mode='loading';render();
 try{
  const payload=await readTestRpc(session,'cc_v2_player_read_v1',{p_notification_limit:50},{signal:controller.signal});
  if(revision!==own||controller.signal.aborted)return;
  if(!payload.bootstrap||!Array.isArray(payload.bootstrap.events)||!payload.bootstrap.player||
     !payload.notifications||!Array.isArray(payload.notifications.items))
   throw new Error('Hiányos Player TEST-adat. A felület nem használja.');
  data={bootstrap:payload.bootstrap,notifications:payload.notifications};
  mode='ready';
 }catch(error){
  if(revision!==own||controller.signal.aborted)return;
  data=null;failure=error.message||'TEST adatbetöltési hiba';mode='error';
 }finally{if(revision===own)render()}
}
mountTestAuth($('testAuthMount'),{onLogin:login,onLogout:clearData});
function record(heading,secondary,mark){
 const row=el('div',undefined,'player-record');
 const detail=el('div');detail.append(el('strong',heading),el('small',secondary));
 row.append(detail,el('span',mark,'player-record-tag'));return row;
}
function ownEvents(kind,max=100){
 const events=data?.bootstrap?.events||[];
 return events.filter(e=>e.type===kind).sort((a,b)=>{
  const ka=String(a.dateLabel||'')+' '+String(a.startTime||'');
  const kb=String(b.dateLabel||'')+' '+String(b.startTime||'');
  return ka.localeCompare(kb);
 }).slice(0,max);
}
function eventsPanel(title,kind,max=100){
 const events=ownEvents(kind,max);const box=panel(title,events.length+' jogosultsággal lekért esemény');
 const list=el('div',undefined,'player-record-list');
 for(const event of events){
  const dt=[event.dateLabel,event.day,event.timeLabel].filter(Boolean).join(' · ')||'Nincs időpont';
  const details=[dt,event.venue||'Helyszín nincs megadva'].join(' · ');
  const myStatus=event.myStatus==='yes'?'Jövök':event.myStatus==='no'?'Nem jövök':'Nincs válasz';
  list.append(record(event.title|| (kind==='match'?'Meccs':'Edzés'),details,myStatus));
 }
 if(!events.length)list.append(el('p','Nincs megjeleníthető saját '+(kind==='match'?'mérkőzés.':'edzés.'),'cc-muted'));
 box.append(list);return box;
}
function notificationPanel(limit=50){
 const items=data?.notifications?.items||[];const box=panel('Értesítések',items.length+' elem · csak olvasás');
 const list=el('div',undefined,'player-record-list');
 for(const note of items.slice(0,limit)){
  const when=note.createdAt&&Number.isFinite(Date.parse(note.createdAt))?
   new Intl.DateTimeFormat('hu-HU',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Budapest'}).format(new Date(note.createdAt)):'Időpont nélkül';
  list.append(record(note.title||'Értesítés',(note.body||'')+' · '+when,note.readAt?'Olvasott':'Új'));
 }
 if(!items.length)list.append(el('p','Nincs értesítés.','cc-muted'));
 box.append(list);return box;
}
function profilePanel(){
 const person=data.bootstrap.player,team=data.bootstrap.team||{};
 const box=panel('Saját adatok','A TEST Player RPC azonosította a bejelentkezett sportolót.');
 const list=el('div',undefined,'player-record-list');
 for(const [k,v] of [['Név',person.name],['Csapat',team.teamName||team.name],['Poszt',person.position],
  ['Mezszám',person.jerseyNo],['Igazolási szám',person.licenseNo],['Sportorvosi',person.medicalValidUntil]])
  list.append(record(k,v===null||v===undefined||v===''?'Nincs adat':v,'TEST'));
 box.append(list);return box;
}
function render(){
 for(const a of nav.querySelectorAll('a[data-view]'))a.hidden=!(Object.hasOwn(screens,a.dataset.view)&&(a.dataset.view==='home'||mode==='ready'));
 const req=location.hash.slice(1),active=Object.hasOwn(screens,req)&&!nav.querySelector('[data-view="'+req+'"]')?.hidden?req:'home';
 for(const a of nav.querySelectorAll('a[data-view]')){if(a.dataset.view===active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')}
 const screen=screens[active];title.textContent=screen[0];desc.textContent=screen[1];root.replaceChildren();
 if(mode!=='ready'){
  badge.textContent=mode==='loading'?'TEST betöltés…':mode==='error'?'TEST hozzáférés sikertelen':'TEST belépés szükséges';
  root.append(panel(mode==='loading'?'Adatbetöltés folyamatban':mode==='error'?'TEST adatok nem érhetők el':'Lépj be a TEST-fiókoddal',
   mode==='loading'?'A bejelentkezett felhasználóhoz tartozó adatok lekérése folyamatban.':
   mode==='error'?failure:'Az alkalmazás nem jelenít meg sem játékos-, sem mérkőzésadatokat belépés nélkül. Nincs mentés.'));
 }else{
  badge.textContent='Hitelesített TEST · csak olvasás';
  if(active==='home'){
   const grid=el('div',undefined,'player-grid');
   const info=panel('Saját csapat',data.bootstrap.team?.teamName||'Nincs csapatadat');
   const upcoming=panel('Következő feladatok','Jelenleg az események és értesítések olvashatók; a jelentkezés mentése nincs bekötve.');
   grid.append(info,upcoming);root.append(grid);
   root.append(eventsPanel('Edzések','training',8),eventsPanel('Meccsek','match',6),notificationPanel(3));
  }else if(active==='trainings'){
   root.append(eventsPanel('Edzések','training'));
   root.append(panel('Jelentkezés','A Jövök / Nem jövök itt csak a korábban elmentett státusz. A módosításhoz jogosultságkezelt V2 író RPC szükséges, így jelenleg nincs mentés.'));
  }else if(active==='matches'){
   root.append(eventsPanel('Meccsek','match'));
   root.append(panel('Jegyzőkönyvek','A hivatalos szövetségi mérkőzésekhez való stabil azonosító és a részletes jegyzőkönyv-adatkapcsolat még nem része ennek a TEST előnézetnek.'));
  }else if(active==='notifications')root.append(notificationPanel());
  else if(active==='profile')root.append(profilePanel());
 }
 nav.classList.remove('open');menu.setAttribute('aria-expanded','false');
}
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open))});
window.addEventListener('hashchange',render);
render();
