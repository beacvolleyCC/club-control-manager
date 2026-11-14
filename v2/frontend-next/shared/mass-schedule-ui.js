/**
 * Shared, read-only mass-sport timetable UI.
 * Both the standalone web entry point and Player V2 mount this exact widget.
 * No player records, pass details, signup writes, or privileged calls.
 */
import {readPublicMassSchedule} from './mass-schedule.js';
import {createTestI18n} from './i18n-test-loader.js';

const label={
 hu:{title:'Tömegsportos edzések',intro:'A weboldal és a Player azonos TEST menetrendet olvas. A foglalás itt még nincs bekötve.',date:'Dátum',time:'Időpont',level:'Szint',court:'Pálya',free:'Szabad hely',waiting:'Várólista',open:'Jelentkezés elérhető',closed:'Jelentkezés nem elérhető',queue:'Várólista elérhető',empty:'Nincs meghirdetett edzés ebben az időszakban.',error:'A TEST menetrend most nem tölthető be.',reload:'Frissítés',test:'Külön TEST előnézet'},
 en:{title:'Recreational training',intro:'The website and Player use the same TEST timetable. Booking is not connected yet.',date:'Date',time:'Time',level:'Level',court:'Court',free:'Places available',waiting:'Waiting list',open:'Booking available',closed:'Booking unavailable',queue:'Join waiting list',empty:'No sessions published for this period.',error:'The TEST timetable is temporarily unavailable.',reload:'Refresh',test:'Isolated TEST preview'}
};
const el=(tag,content,className)=>{const node=document.createElement(tag);if(content!==undefined)node.textContent=String(content);if(className)node.className=className;return node;};

export function mountPublicMassSchedule(root,{read=readPublicMassSchedule}={}){
 if(!root)throw Error('CC_MASS_MISSING_MOUNT');
 const locale=createTestI18n();
 const area=el('section',undefined,'mass-public-schedule');
 const top=el('div',undefined,'mass-public-header'),heading=el('h2'),help=el('p');
 const controls=el('div',undefined,'mass-public-controls'),pick=el('select');
 pick.setAttribute('aria-label','Language / Nyelv');
 for(const [key,name] of [['hu','Magyar'],['en','English']]){const opt=el('option',name);opt.value=key;pick.append(opt)}
 const update=el('button');update.type='button';
 const status=el('p',undefined,'mass-public-status');status.setAttribute('role','status');
 const list=el('div',undefined,'mass-public-list');
 controls.append(pick,update);top.append(heading,controls);area.append(top,help,status,list);root.replaceChildren(area);
 let sequence=0,controller=null,events=[],pending=false,problem=false;
 function draw(){
  const base=label[locale.getLanguage()==='en'?'en':'hu'];
  const tr=new Proxy(base,{get(fallback,key){
   if(typeof key!=='string')return undefined;
   const token='mass.schedule.'+key,translated=locale.t(token);
   return translated===token?fallback[key]:translated;
  }});
  heading.textContent=tr.title;help.textContent=tr.intro;update.textContent=tr.reload;
  status.textContent=pending?'…':problem?tr.error:tr.test;
  list.replaceChildren();
  if(pending||problem)return;
  if(!events.length){list.append(el('p',tr.empty));return}
  for(const event of events){
   const item=el('article',undefined,'mass-public-event');
   const title=el('h3',[event.date,event.startTime?.slice(0,5)].filter(Boolean).join(' · '));
   const meta=el('p',[event.level,event.court].filter(Boolean).join(' · '));
   const summary=el('p',tr.free+': '+locale.number(event.remaining)+' / '+locale.number(event.capacity)+' · '+tr.waiting+': '+locale.number(event.waitlistCount));
   const state=el('p',event.bookingOpen?tr.open:event.waitlistOpen?tr.queue:tr.closed);
   item.append(title,meta,summary,state);list.append(item);
  }
 }
 async function reload(){
  const own=++sequence;
  controller?.abort();controller=new AbortController();
  pending=true;problem=false;draw();
  try{const incoming=await read({signal:controller.signal});if(own!==sequence)return;events=incoming;problem=false}
  catch{if(own!==sequence)return;events=[];problem=true}
  finally{if(own===sequence){pending=false;draw()}}
 }
 pick.addEventListener('change',()=>{locale.setLanguage(pick.value);void locale.refresh(pick.value).then(()=>{if(root.isConnected)draw()});draw()});
 update.addEventListener('click',reload);
 void reload();
 return {reload,dispose:()=>{sequence++;controller?.abort();locale.cancelPending()}};
}
