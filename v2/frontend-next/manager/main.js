// Independent Manager V2 read-only TEST shell. No direct table access, no writes.
import {mountTestAuth} from '../shared/test-auth-ui.js';
import {readTestManagerModules} from '../shared/test-rpc.js';
const $=id=>document.getElementById(id);
const nav=$('managerNav'),heading=$('pageTitle'),view=$('view'),menu=$('menuToggle'),status=$('dataStatus');
const pages={
 overview:['Áttekintés','Jogosultság szerint visszaadott események és játékosok'],
 trainings:['Edzések','A jogosult edzések listája'],
 matches:['Meccsek','Saját csapatok meccseseményei, külön jegyzőkönyv-bekötés nélkül'],
 players:['Sportolók','A jogosult csapatok sportolói'],
 teams:['Csapatok','A csapatmodulhoz engedélyezett csapatok']
};
let data=null,available={},mode='signed-out',failure='',controller=null,requestVersion=0;
const make=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=String(text);if(cls)e.className=cls;return e};
const safeDate=value=>value&&Number.isFinite(Date.parse(value))?new Intl.DateTimeFormat('hu-HU',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Budapest'}).format(new Date(value)):'Nincs időpont';
function clearRead(){requestVersion++;controller?.abort();controller=null;data=null;available={};mode='signed-out';failure='';render()}
async function login(session){
 const version=++requestVersion;controller?.abort();controller=new AbortController();data=null;mode='loading';failure='';render();
 try{
  const payload=await readTestManagerModules(session,{signal:controller.signal});
  if(requestVersion!==version||controller.signal.aborted)return;
  if(!Object.values(payload.available).some(Boolean))throw new Error('Ehhez a fiókhoz nincs elérhető Manager modul.');
  data=payload.data;available=payload.available;
  mode='ready';
 }catch(error){
  if(requestVersion!==version||controller.signal.aborted)return;
  data=null;available={};failure=error.message||'TEST API hiba';mode='error';
 }finally{if(requestVersion===version)render()}
}
mountTestAuth($('testAuthMount'),{onLogin:login,onLogout:clearRead});
function item(title,detail,tag){
 const row=make('div',undefined,'v2-record');
 const left=make('div');left.append(make('strong',title),make('small',detail));
 row.append(left,make('span',tag,'v2-record-tag'));return row;
}
function panel(title,description){
 const section=make('section',undefined,'cc-card v2-panel');section.append(make('h2',title));
 if(description)section.append(make('p',description,'cc-muted'));return section;
}
function eventPanel(title,rows){
 const section=panel(title,rows.length+' megjeleníthető TEST esemény');
 const list=make('div',undefined,'v2-record-list');
 for(const e of [...rows].sort((a,b)=>(Date.parse(a.startsAt)||0)-(Date.parse(b.startsAt)||0)).slice(0,100))
  list.append(item(e.title||e.eventType||'Esemény',safeDate(e.startsAt)+' · '+(e.venue||'Helyszín nincs megadva')+' · '+(e.teamName||'–'),e.status||'Aktív'));
 if(!rows.length)list.append(make('p','Nincs megjeleníthető adat a lekért időszakban.','cc-muted'));
 section.append(list);return section;
}
function playersPanel(rows){
 const section=panel('Sportolók',rows.length+' jogosultság szerint lekért játékos');
 const list=make('div',undefined,'v2-record-list');
 for(const p of rows.slice(0,150))list.append(item(
  p.displayName||p.name||'Játékos',
  (p.teamName||'Nincs csapat')+' · '+(p.position||'Poszt nincs megadva'),
  p.jerseyNo===null||p.jerseyNo===undefined?'–':'#'+p.jerseyNo
 ));
 if(!rows.length)list.append(make('p','Nincs jogosult játékosadat.','cc-muted'));
 section.append(list);return section;
}
function teamsPanel(){
 const section=panel('Csapatok',data.teams.length+' engedélyezetten visszaadott TEST csapat');
 const list=make('div',undefined,'v2-record-list');
 for(const team of data.teams.slice().sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'hu'))){
  list.append(item(team.name||'Csapat',team.season||'Szezon nincs megadva',
   team.playerCount===undefined?'TEST':String(team.playerCount)+' játékos'));
 }
 if(!data.teams.length)list.append(make('p','Nincs megjeleníthető csapat.','cc-muted'));
 section.append(list);return section;
}
function render(){
 for(const link of nav.querySelectorAll('a[data-view]')){
  const allowed=Object.hasOwn(pages,link.dataset.view)&&(link.dataset.view==='overview'||(mode==='ready'&&available[link.dataset.view]===true));
  link.hidden=!allowed;
 }
 const requested=location.hash.slice(1);
 const key=Object.hasOwn(pages,requested)&&(!nav.querySelector('[data-view="'+requested+'"]')?.hidden)?requested:'overview';
 for(const link of nav.querySelectorAll('a')){if(link.dataset.view===key)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current')}
 const [title,description]=pages[key];heading.textContent=title;view.replaceChildren();
 if(mode!=='ready'){
  status.textContent=mode==='loading'?'TEST betöltés…':mode==='error'?'TEST hozzáférés sikertelen':'TEST belépés szükséges';
  const info=panel(mode==='loading'?'Adatok betöltése…':mode==='error'?'TEST hozzáférés nem igazolt':'A Manager adatai védettek',
   mode==='loading'?'Hitelesített RPC lekérés folyamatban.':mode==='error'?failure:'Jelentkezz be egy TEST Manager-fiókkal. A menüpontok és adatok csak érvényes jogosultság után jelennek meg.');
  view.append(info);
 }else{
  status.textContent='Hitelesített TEST · csak olvasás';
  if(key==='overview'){
   const cards=make('div',undefined,'v2-stats');
   for(const [key,label,count] of [['trainings','Edzések',data.trainings.length],['matches','Meccsek',data.matches.length],['players','Játékosok',data.players.length],['teams','Csapatok',data.teams.length]]){
    if(!available[key])continue;
    const card=panel(label);card.append(make('strong',count,'v2-big-number'));cards.append(card);
   }
   view.append(cards);
   if(available.trainings||available.matches)view.append(eventPanel('Engedélyezett események',[
    ...(available.trainings?data.trainings:[]),...(available.matches?data.matches:[])
   ]));
   if(available.players&&!available.trainings&&!available.matches)view.append(playersPanel(data.players));
   if(available.teams&&!available.trainings&&!available.matches&&!available.players)view.append(teamsPanel());
  }else if(key==='trainings')view.append(eventPanel(title,data.trainings));
  else if(key==='matches'){view.append(eventPanel(title,data.matches));
   view.append(panel('Jegyzőkönyv későbbi modulban','A TEST meccsesemények nem azonosak automatikusan a szövetségi eredmény- és jegyzőkönyvforrással. Kitalált összekötést nem használunk.'))}
  else if(key==='players')view.append(playersPanel(data.players));
  else if(key==='teams')view.append(teamsPanel());
 }
 nav.classList.remove('open');menu.setAttribute('aria-expanded','false');
}
menu.addEventListener('click',()=>{const opened=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(opened))});
window.addEventListener('hashchange',render);
render();
