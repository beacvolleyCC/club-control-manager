// Independent Manager V2 read-only TEST shell. No direct table access, no writes.
import {mountTestAuth} from '../shared/test-auth-ui.js';
import {readTestManagerModules,readTestMassEventDetail,readTestMassWaitlistSummary,readTestMassPasses,testCurrentBudapestMonth} from '../shared/test-rpc.js';
const $=id=>document.getElementById(id);
const nav=$('managerNav'),heading=$('pageTitle'),view=$('view'),menu=$('menuToggle'),status=$('dataStatus');
const pages={
 overview:['Áttekintés','Jogosultság szerint visszaadott edzések, meccsek és játékosok'],
 massTrainings:['Tömegsport · edzések','Szabad helyek és várólista a jogosult TEST edzésekhez'],
 massPasses:['Tömegsport · bérletek','Csak a jogosult, szűrt bérletek'],
 trainings:['Edzések','A jogosult edzések listája'],
 matches:['Meccsek','Saját csapatok meccseseményei, külön jegyzőkönyv-bekötés nélkül'],
 players:['Sportolók','A jogosult csapatok sportolói'],
 teams:['Csapatok','A csapatmodulhoz engedélyezett csapatok']
};
let data=null,available={},mode='signed-out',failure='',controller=null,requestVersion=0,activeSession=null;
let selectedMassEvent='',massDetail=null,detailState='idle',detailError='',detailRequest=0,detailController=null;
let waitlistTotals=null,waitlistState='idle',waitlistError='',waitlistRequest=0,waitlistController=null;
let passFilter={query:'',month:testCurrentBudapestMonth()},passState='ready',passError='',passRequest=0,passController=null;
const make=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=String(text);if(cls)e.className=cls;return e};
const safeDate=value=>value&&Number.isFinite(Date.parse(value))?new Intl.DateTimeFormat('hu-HU',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Budapest'}).format(new Date(value)):'Nincs időpont';
function clearExtras(){
 detailRequest++;detailController?.abort();detailController=null;selectedMassEvent='';massDetail=null;detailState='idle';detailError='';
 waitlistRequest++;waitlistController?.abort();waitlistController=null;waitlistTotals=null;waitlistState='idle';waitlistError='';
 passRequest++;passController?.abort();passController=null;passFilter={query:'',month:testCurrentBudapestMonth()};passState='ready';passError='';
}
function clearRead(){requestVersion++;controller?.abort();controller=null;activeSession=null;clearExtras();data=null;available={};mode='signed-out';failure='';render()}
async function openMassDetail(id){
 if(!activeSession||mode!=='ready'||!available.massTrainings)return;
 const allowed=new Set(data.massTrainings.map(x=>String(x.eventId??'')));
 if(!allowed.has(String(id)))return;
 const current=++detailRequest;detailController?.abort();detailController=new AbortController();
 selectedMassEvent=String(id);massDetail=null;detailError='';detailState='loading';render();
 try{
  const result=await readTestMassEventDetail(activeSession,id,allowed,{signal:detailController.signal});
  if(current!==detailRequest||detailController.signal.aborted||mode!=='ready')return;
  massDetail=result;detailState='ready';
 }catch(error){
  if(current!==detailRequest||detailController.signal.aborted||mode!=='ready')return;
  massDetail=null;detailState='error';detailError=error.message||'Nem sikerült betölteni az edzés részleteit.';
 }finally{if(current===detailRequest&&mode==='ready')render()}
}
async function loadWaitlistTotals(){
 if(!activeSession||mode!=='ready'||!available.massTrainings)return;
 const current=++waitlistRequest;waitlistController?.abort();waitlistController=new AbortController();
 waitlistTotals=null;waitlistState='loading';waitlistError='';render();
 try{
  const result=await readTestMassWaitlistSummary(activeSession,{signal:waitlistController.signal});
  if(current!==waitlistRequest||waitlistController.signal.aborted||mode!=='ready')return;
  const ids=new Set(data.massTrainings.map(x=>String(x.eventId??'')));
  waitlistTotals=result.filter(x=>ids.has(String(x.eventId??'')));
  waitlistState='ready';
 }catch(error){
  if(current!==waitlistRequest||waitlistController.signal.aborted||mode!=='ready')return;
  waitlistTotals=null;waitlistState='error';waitlistError=error.message||'Várólista hiba';
 }finally{if(current===waitlistRequest&&mode==='ready')render()}
}
async function searchPasses(query,month){
 if(!activeSession||mode!=='ready'||!available.massPasses)return;
 const current=++passRequest;passController?.abort();passController=new AbortController();
 passFilter={query,month};passError='';passState='loading';data.massPasses=[];render();
 try{
  const result=await readTestMassPasses(activeSession,{query,month},{signal:passController.signal});
  if(current!==passRequest||passController.signal.aborted||mode!=='ready')return;
  data.massPasses=result;passState='ready';
 }catch(error){
  if(current!==passRequest||passController.signal.aborted||mode!=='ready')return;
  data.massPasses=[];passState='error';passError=error.message||'Bérletek nem érhetők el.';
  if(error?.status===401||error?.status===403)available.massPasses=false;
 }finally{if(current===passRequest&&mode==='ready')render()}
}
async function login(session){
 const version=++requestVersion;controller?.abort();controller=new AbortController();activeSession=null;clearExtras();data=null;mode='loading';failure='';render();
 try{
  const payload=await readTestManagerModules(session,{signal:controller.signal});
  if(requestVersion!==version||controller.signal.aborted)return;
  if(!Object.values(payload.available).some(Boolean))throw new Error('Ehhez a fiókhoz nincs elérhető Manager modul.');
  data=payload.data;available=payload.available;activeSession=session;
  mode='ready';
 }catch(error){
  if(requestVersion!==version||controller.signal.aborted)return;
  data=null;available={};activeSession=null;failure=error.message||'TEST API hiba';mode='error';
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
function byTimePhase(rows){
 const now=Date.now(),valid=e=>e.startsAt&&Number.isFinite(Date.parse(e.startsAt));
 const future=rows.filter(e=>valid(e)&&Date.parse(e.startsAt)>=now).sort((a,b)=>Date.parse(a.startsAt)-Date.parse(b.startsAt));
 const past=rows.filter(e=>valid(e)&&Date.parse(e.startsAt)<now).sort((a,b)=>Date.parse(b.startsAt)-Date.parse(a.startsAt));
 const undated=rows.filter(e=>!valid(e));
 return [['Közelgő',future],['Elmúlt – legutóbbi elöl',past],['Időpont nélkül',undated]];
}
function eventPanel(title,rows){
 const section=panel(title,rows.length+' megjeleníthető TEST esemény');
 const list=make('div',undefined,'v2-record-list');
 for(const [label,entries] of byTimePhase(rows)){
  if(!entries.length)continue;
  list.append(make('h3',label,'v2-list-heading'));
  for(const e of entries.slice(0,100))list.append(item(
   e.title||e.eventType||'Esemény',
   safeDate(e.startsAt)+' · '+(e.venue||'Helyszín nincs megadva')+' · '+(e.teamName||'–'),
   e.status||'Aktív'
  ));
 }
 if(!rows.length)list.append(make('p','Nincs megjeleníthető adat a lekért időszakban.','cc-muted'));
 section.append(list);return section;
}
function massPanel(){
 const rows=data.massTrainings||[];
 const section=panel('Tömegsport edzések',rows.length+' megjeleníthető TEST edzés · csak olvasás');
 const toolbar=make('div',undefined,'v2-action-bar');
 const summaryButton=make('button','Várólista összesítése','v2-read-button');
 summaryButton.type='button';summaryButton.disabled=waitlistState==='loading';
 summaryButton.addEventListener('click',loadWaitlistTotals);toolbar.append(summaryButton);section.append(toolbar);
 const list=make('div',undefined,'v2-record-list');
 for(const [label,entries] of byTimePhase(rows)){
  if(!entries.length)continue;
  list.append(make('h3',label,'v2-list-heading'));
  for(const e of entries.slice(0,100)){
   const count=v=>v===null||v===undefined||v===''||!Number.isFinite(Number(v))?'–':String(v);
   const entry=item(e.level||'Tömegsport edzés',
    safeDate(e.startsAt)+' · '+(e.court||'Pálya nincs megadva')+
    ' · '+count(e.totalActive)+' jelentkező · '+count(e.waitlistCount)+' várólistán',
    count(e.free)+' / '+count(e.capacity)+' szabad');
   const eventId=String(e.eventId??'');
   if(eventId){
    const open=make('button',selectedMassEvent===eventId?'Részletek megnyitva':'Részletek','v2-read-button');
    open.type='button';open.disabled=detailState==='loading'&&selectedMassEvent===eventId;
    open.setAttribute('aria-expanded',String(selectedMassEvent===eventId));
    open.addEventListener('click',()=>openMassDetail(eventId));entry.append(open);
   }
   list.append(entry);
  }
 }
 if(!rows.length)list.append(make('p','Nincs jogosult tömegsportos edzés a lekért időszakban.','cc-muted'));
 section.append(list);
 if(waitlistState!=='idle')section.append(waitlistPanel());
 if(selectedMassEvent) section.append(massDetailPanel());
 return section;
}
function waitlistPanel(){
 const section=panel('Várólista állapota',waitlistState==='loading'?'A TEST összesítés betöltése folyamatban…':
  waitlistState==='error'?waitlistError:'Csak a jogosult edzéslistában szereplő események összesített darabszámai.');
 if(waitlistState==='ready'){
  const totals=waitlistTotals||[];
  const waiting=totals.reduce((a,e)=>a+(Number(e.waiting)||0),0);
  const offered=totals.reduce((a,e)=>a+(Number(e.offered)||0),0);
  const expired=totals.reduce((a,e)=>a+(Number(e.expired)||0),0);
  section.append(make('p','Várakozik: '+waiting+' · Felajánlott: '+offered+' · Lejárt: '+expired));
  const list=make('div',undefined,'v2-record-list');
  for(const e of totals.filter(e=>(Number(e.waiting)||0)+(Number(e.offered)||0)+(Number(e.expired)||0)>0).slice(0,100)){
   const training=data.massTrainings.find(x=>String(x.eventId)===String(e.eventId));
   list.append(item(training?.level||'Tömegsport edzés',
    safeDate(training?.startsAt)+' · '+(training?.court||'–'),
    String(e.waiting??0)+' várakozik · '+String(e.offered??0)+' ajánlat'));
  }
  if(!list.children.length)list.append(make('p','Nincs aktív várólista a megjelenített TEST edzéseknél.','cc-muted'));
  section.append(list);
 }
 return section;
}
function massDetailPanel(){
 const section=panel('Edzés részletei',selectedMassEvent+' · hitelesített TEST-adatok');
 if(detailState==='loading'){section.append(make('p','Részletek betöltése…','cc-muted'));return section;}
 if(detailState==='error'){section.append(make('p',detailError,'v2-error'));return section;}
 if(detailState!=='ready'||!massDetail)return section;
 const event=massDetail.event||{};
 section.append(make('p',(event.level||'Edzés')+' · '+safeDate(event.startsAt)+
  ' · '+(event.court||'Pálya nincs megadva')+
  ' · férőhely: '+String(event.capacity??'–')));
 function people(title,rows){
  const group=make('section',undefined,'v2-subpanel');
  group.append(make('h3',title+' ('+rows.length+')'));
  const list=make('div',undefined,'v2-record-list');
  for(const p of rows.slice(0,150)){
   const primary=p.name||'Név nélkül';
   const detail=[p.bookingStatus||p.status||'',p.attendance||'',p.passStatus||'',p.submittedAt?safeDate(p.submittedAt):'Dátum nincs megadva'].filter(Boolean).join(' · ');
   list.append(item(primary,detail,p.passNumber||'–'));
  }
  if(!rows.length)list.append(make('p','Nincs megjeleníthető rekord.','cc-muted'));
  group.append(list);section.append(group);
 }
 people('Jelentkezők',massDetail.bookings);
 people('Várólista',massDetail.waitlist);
 return section;
}
function massPassesPanel(){
 const section=panel('Tömegsport bérletek','Csak a jogosult TEST bérletadatok; alapból az aktuális hónap.');
 const form=make('form',undefined,'v2-filter-form');
 const queryLabel=make('label','Keresés');const query=make('input');
 query.type='search';query.maxLength=150;query.value=passFilter.query;query.placeholder='Név, bérletszám vagy termék';queryLabel.append(query);
 const monthLabel=make('label','Hónap');const month=make('input');month.type='month';month.value=passFilter.month;monthLabel.append(month);
 const submit=make('button','Szűrés','v2-read-button');submit.type='submit';submit.disabled=passState==='loading';
 form.append(queryLabel,monthLabel,submit);
 form.addEventListener('submit',event=>{event.preventDefault();searchPasses(query.value.trim(),month.value)});
 section.append(form);
 if(passState==='loading'){section.append(make('p','Bérletek lekérése…','cc-muted'));return section;}
 if(passState==='error'){section.append(make('p',passError,'v2-error'));return section;}
 const rows=data.massPasses||[];
 section.append(make('p',rows.length+' megjeleníthető találat.','cc-muted'));
 const list=make('div',undefined,'v2-record-list');
 for(const p of rows.slice(0,150)){
  const person=p.athleteName||'Nincs név';const title=p.product||p.passGroup||'Bérlet';
  const info=[person,p.passNumber||'',p.validMonth||'',p.purchaseDate?'Vásárlás: '+p.purchaseDate:'Vásárlási dátum nincs megadva'].filter(Boolean).join(' · ');
  list.append(item(title,info,p.currentMonth===true?'Aktuális havi':'Másik hónap'));
 }
 if(!rows.length)list.append(make('p','Nincs bérlet a szűrés alapján.','cc-muted'));
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
   for(const [key,label,count] of [['massTrainings','Tömegsport',data.massTrainings.length],['massPasses','Bérletek',data.massPasses.length],['trainings','Edzések',data.trainings.length],['matches','Meccsek',data.matches.length],['players','Játékosok',data.players.length],['teams','Csapatok',data.teams.length]]){
    if(!available[key])continue;
    const card=panel(label);card.append(make('strong',count,'v2-big-number'));cards.append(card);
   }
   view.append(cards);
   if(available.trainings||available.matches)view.append(eventPanel('Engedélyezett események',[
    ...(available.trainings?data.trainings:[]),...(available.matches?data.matches:[])
   ]));
   if(available.massTrainings)view.append(massPanel());
   if(available.players&&!available.trainings&&!available.matches&&!available.massTrainings)view.append(playersPanel(data.players));
   if(available.teams&&!available.trainings&&!available.matches&&!available.players&&!available.massTrainings)view.append(teamsPanel());
  }else if(key==='massTrainings')view.append(massPanel());
  else if(key==='massPasses')view.append(massPassesPanel());
  else if(key==='trainings')view.append(eventPanel(title,data.trainings));
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
